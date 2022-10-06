<script setup>
import CardList from "../components/CardList.vue"
import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { useSelectListStore, useFriendListStore, useTokenStore } from "../stores/state";
import { notify } from "@kyvg/vue3-notification";

const tokenStore = useTokenStore();
const token = computed(() => tokenStore.token);

const sexMap = {
  1: "Ж",
  2: "М"
}

const bdateRegex = /(\d+)\.(\d+)\.(\d+)/;

const pholder = ref('Введите ник пользователя');
const title = ref('Список');

const router = useRouter();
const route = useRoute();

const selectListStore = useSelectListStore();
const selectList = computed(() => selectListStore.list);

const friendsListStore = useFriendListStore();

const { friendList, setFriendList } = useFriendListStore();
const inputValue = ref('');

async function getFriends(userId) {
  const params = {
    user_id: userId,
    fields: 'photo_200,followers_count,sex,bdate',
    order: 'name',
    access_token: token.value,
    v: 5.131,

  }

  const { data } = await axios({
    url: 'https://api.vk.com/method/friends.get',
    adapter: jsonpAdapter,
    method: "GET",
    params
  });
  if (data.error) {
    if (data.error.error_msg === "This profile is private") {
      return {
        data: [],
        userId,
      }
    }
    throw new Error(data.error.error_msg);
  }
  return {
    data: data.response.items,
    userId,
  };

}

function saveToLocalStorage(arr) {
  localStorage.setItem('selectList', JSON.stringify(arr));
}

function clearItems() {
  selectListStore.clear();
  saveToLocalStorage(selectList.value);
}

function listFriends() {
  Promise.all(selectListStore.list.map((it) => getFriends(it.id))).then((allFriends) => {
    const idMap = new Map();
    friendsListStore.clear();
    allFriends.forEach(({ data, userId }) => {
      data.forEach((friend) => {
        if (!idMap.has(friend.id)) {
          const bdateMatch = bdateRegex.exec(friend.bdate);
          let age = null;
          if (bdateMatch) {
            const day = Number(bdateMatch[1]);
            const month = Number(bdateMatch[2]);
            const year = Number(bdateMatch[3]);
            const bdate = new Date(year, month, day, 0, 0, 0, 0);
            const today = new Date();
            const diffMs = today - bdate;
            age = Math.floor(diffMs / 31556952000);
          }
          let description = '';
          if (friend.sex) {
            description += `${sexMap[friend.sex]}`;
          }
          if (friend.followers_count) {
            description += `, ${friend.followers_count} друзей`;
          }
          if (age) {
            description += `, ${age} лет`;
          }
          idMap.set(friend.id, {
            name: friend.first_name + ' ' + friend.last_name,
            firstName: friend.first_name,
            id: friend.id,
            description,
            photoMain: friend.photo_200,
            relatedFriends: [userId],
          });
        } else {
          const mapFriend = idMap.get(friend.id);
          mapFriend.relatedFriends.push(userId);
        }
      })
    })
    const result = [];
    for (const friend of idMap.values()) {
      result.push(friend);
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    friendsListStore.set(result);
    router.push('/friends');
  }).catch((e) => {
    notify({
      title: "Error",
      text: e.toString(),
      type: "error",
    });
  });
}

function addNewItem() {
  if (inputValue.value !== '') {
    const params = {
      user_ids: inputValue.value,
      fields: 'photo_200',
      access_token: token.value,
      v: 5.131,
    }
    axios({
      url: 'https://api.vk.com/method/users.get',
      adapter: jsonpAdapter,
      method: "GET",
      params
    }).then(({ data }) => {
      const newItem = {
        name: data.response[0].first_name + ' ' + data.response[0].last_name,
        id: data.response[0].id,
        photoMain: data.response[0].photo_200,
        firstName: data.response[0].first_name,
      }
      selectListStore.push(newItem);
      saveToLocalStorage(selectList.value);
    });
    inputValue.value = '';
  }
}

onMounted(() => {
  const localItems = localStorage.getItem('selectList');
  if (localItems && localItems !== "undefined") {
    selectListStore.set(JSON.parse(localItems));
  }
})

function remove(i) {
  selectListStore.remove(i);
  localStorage.clear()
  localStorage.setItem('selectList', JSON.stringify(selectList.value))
}
</script>

<template>
  <main class="card">
    <h1 v-text="title" class="card center"></h1>

    <template v-if="route.fullPath !== '/friends'">
      <div class="form-control">
        <input type="text" v-bind:placeholder="pholder" v-model="inputValue" v-on:keypress.enter='addNewItem'>
      </div>
      <button class="btn" v-on:click="addNewItem">Добавить</button>
      <button class="btn" v-on:click="listFriends">Построить</button>
      <button class="btn danger" v-on:click="clearItems">Очистить</button>
    </template>

    <hr>

    <CardList :itemList="selectList" @remove="remove" />

  </main>
</template>

<style>
main {
  max-width: 550px;
  margin: 0 auto;
}

.form-control {
  position: relative;
  margin-bottom: 0.5rem;
}

.form-control input {
  margin: 0;
  outline: none;
  border: 2px solid #ccc;
  display: block;
  width: 100%;
  color: #2c3e50;
  padding: 0.5rem 1.5rem;
  border-radius: 3px;
  font-size: 1rem;
}

.form-control label {
  display: block;
  margin: 0 0 0.3rem 0.3rem;
  font-weight: 500;
}

.form-control input:active,
.form-control input:focus {
  transition: border 0.22s;
  border: 2px solid #42b983;
}
</style>
