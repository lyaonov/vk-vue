<script setup>
import CardList from "../components/CardList.vue"
import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { useSelectListStore, useFriendListStore } from "../stores/state";
import FriendsTable from "../components/FriendsTable.vue";
import Avatar from "../components/Avatar.vue";
import Wall from "../components/Wall.vue";


const route = useRoute();
const userId = computed(() => Number(route.params.id));

const selectListStore = useSelectListStore();
const selectList = computed(() => selectListStore.list);

const friendsListStore = useFriendListStore();
const friendsList = computed(() => friendsListStore.list);
const curPerson = computed(() => friendsList.value.find((it) => it.id === userId.value));
const people = computed(() => curPerson.value.relatedFriends.map((id) => selectList.value.find((it) => it.id === id)));
const imgSrc = computed(() => curPerson.value.photoMain);
const id = computed(() => curPerson.value.id);

</script>

<template>
  <main>
    <div class="left-column">
      <Avatar :name="curPerson.name" :src="imgSrc" :id='id' />
      <FriendsTable :people="people" />
    </div>
    <div class="right-column">
      <Wall :user-id="userId" />
    </div>
  </main>
</template>

<style>
main {
  max-width: 1000px;
  margin: 0 auto;
}

.left-column {
  position: sticky;
  float: left;
}

.right-column {
  width: 550px;
  margin-left: 245px;
}
</style>
