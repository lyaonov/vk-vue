<script setup>
import {computed} from "vue";
import {useFriendListStore, useSelectListStore} from "../stores/state";
import FriendList from "../components/FriendList.vue";
import {useRouter} from "vue-router";

const router = useRouter();
const friendsListStore = useFriendListStore();
const friendsList = computed(() => friendsListStore.list);

function selectFriend(id) {
  router.push(`/wall/${id}`);
}
</script>

<template>
  <main>
    <FriendList :itemList="friendsList" @selectFriend="selectFriend"/>
  </main>
</template>

<style>
main {
  max-width: 550px;
  margin: 0 auto;
}
</style>
