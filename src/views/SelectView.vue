<script setup>
import CardList from "../components/CardList.vue"
import SearchList from '../components/SearchList.vue'
import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { useSelectListStore, useSearchListStore, useFriendListStore, useTokenStore } from "../stores/state";
import { notify } from "@kyvg/vue3-notification";

for (var i = 1; i < 99999; i++) {
  window.clearInterval(i);
  window.clearTimeout(i);
  if (window.mozCancelAnimationFrame) window.mozCancelAnimationFrame(i); // Firefox
} // clear timeout

let checkTimeoutString = ''

const tokenStore = useTokenStore();
const token = computed(() => tokenStore.token);

const sexMap = {
  1: "Ж",
  2: "М"
}
const monthName = {
  1: ' января',
  2: ' февраля',
  3: ' марта',
  4: ' апреля',
  5: ' мая',
  6: ' июня',
  7: ' июля',
  8: ' августа',
  9: ' сентября',
  10: ' октября',
  11: ' ноября',
  12: ' декабря'
}

const bdateRegex = /(\d+)\.(\d+)\.(\d+)/;
const bdateRegexDayMonth = /(\d+)\.(\d+)/;

const pholder = ref('Введите ник пользователя');
const title = ref('Список');
const autoPholder = ref('Поиск по имени');

const router = useRouter();
const route = useRoute();

const selectListStore = useSelectListStore();
const selectList = computed(() => selectListStore.list);

const searchListStore = useSearchListStore();
const searchList = computed(() => searchListStore.list);

const friendsListStore = useFriendListStore();

const { friendList, setFriendList } = useFriendListStore();
const inputValue = ref('');
const inputName = ref('');
const textAutocomplete = ref('')

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
          const bdateMatch2 = bdateRegexDayMonth.exec(friend.bdate);
          let age = null;
          if (bdateMatch) {
            const day = Number(bdateMatch[1]);
            const month = Number(bdateMatch[2]);
            const year = Number(bdateMatch[3]);
            const bdate = new Date(year, month, day, 0, 0, 0, 0);
            const today = new Date();
            const diffMs = today - bdate;
            age = `,  ${Math.floor(diffMs / 31556952000)}  лет`;
          } else if (bdateMatch2) {
            const day = Number(bdateMatch2[1]);
            const month = monthName[Number(bdateMatch2[2])];
            age = `, ${day}  ${month}`;
          }
          let description = '';
          if (friend.sex) {
            description += `${sexMap[friend.sex]}`;
          }
          if (age) {
            description += age;
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

function searchItem() {
  searchListStore.clear()
  if (inputName.value !== '') {
    const params = {
      q: inputName.value,
      fields: 'photo_200',
      access_token: token.value,
      v: 5.131,
    }
    axios({
      url: 'https://api.vk.com/method/users.search',
      adapter: jsonpAdapter,
      method: "GET",
      params
    }).then(({ data }) => {
      let count = 0
      if(data.response.items.length >= 5){
        count = 5
      }
      else{
        count = data.response.items.length
      }
      if (count === 0){textAutocomplete.value = ''}
      for (let i = 0; i < count; i++) {
        const newItem = {
          id: data.response.items[i].id,
          photo: data.response.items[i].photo_200,
          Name: data.response.items[i].first_name + ' ' + data.response.items[i].last_name,
        }
        if (!(searchList.value.find((person) => person.id === newItem.id))) {
          searchListStore.push(newItem)
            textAutocomplete.value = searchList.value[0].Name 
        }
      }
    });
  } else {
    searchListStore.clear()
    textAutocomplete.value=''
  }
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
      if (!(selectList.value.find((person) => person.id === newItem.id))) {
        selectListStore.push(newItem);
        saveToLocalStorage(selectList.value);
      }

    });
    inputValue.value = '';
  }
}
function addNewItem2(id) {
  if (id !== '') {
    const params = {
      user_ids: id,
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
      if (!(selectList.value.find((person) => person.id === newItem.id))) {
        selectListStore.push(newItem);
        saveToLocalStorage(selectList.value);
      }
    });
  }
}

onMounted(() => {
  const localItems = localStorage.getItem('selectList');
  if (localItems && localItems !== "undefined") {
    selectListStore.set(JSON.parse(localItems));
  }
  const localItems2 = localStorage.getItem('searchList');
  if (localItems2 && localItems2 !== "undefined") {
    searchListStore.set(JSON.parse(localItems2));
  }
})


function remove(i) {
  selectListStore.remove(i);
  localStorage.clear()
  localStorage.setItem('selectList', JSON.stringify(selectList.value))
}
function add(i) {
  addNewItem2(i)
  searchListStore.clear()
  inputName.value = '';
  checkTimeoutString = ''
  textAutocomplete.value=''
}
function clear() {
  searchListStore.clear()
  inputName.value = '';
  textAutocomplete.value=''
  checkTimeoutString = ''
}
function show() {
  setTimeout(() => {
    check()
  }, 1000)

  function check() {
    if (inputName.value !== checkTimeoutString) {
      checkTimeoutString = inputName.value
      searchItem()
    }
  }
}
function addAutocompleteValue(){
  add(searchList.value[0].id)
  searchListStore.clear()
  textAutocomplete.value=''

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
      <div class="form-control">
        <input type="text" v-bind:placeholder="autoPholder" v-model="inputName" @keyup="show"
          v-on:keypress.enter='searchItem, addAutocompleteValue()' >
        <p>{{textAutocomplete}}</p>
        <button class="btn" v-on:click="searchItem">Искать</button>
        <SearchList :itemList="searchList" @add="add" @clear='clear' />

      </div>
      <hr>
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

p {
  text-align: center;
  position: absolute;
  opacity: .9;
  white-space: pre-wrap;
  top: 24px;
  background-color: lightblue;
  color: white;
  width: 70%;
  padding-left: 15px;
  border-radius: 5px;
  z-index: 36;
}

.form-control {
  position: relative;
  margin-bottom: 0.5rem;
}

.form-control input {
  margin: 0px;
  outline: none;
  border: 2px solid #ccc;
  display: block;
  width: 70%;
  color: #2c3e50;
  padding: 0.5rem 1.5rem;
  border-radius: 3px;
  font-size: 1rem;
  float: left;

}

button {
  margin: 5px;
  margin-left: 10px;
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
