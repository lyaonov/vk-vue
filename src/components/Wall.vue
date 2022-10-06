<script setup>
import {ref, computed, onMounted} from "vue";
import VirtualList from 'vue3-virtual-scroll-list';
import axios from "axios";
import jsonpAdapter from "axios-jsonp";
import WallItem from "./WallItem.vue";
import AlertIcon from "../assets/alert.png";
import {useTokenStore} from "../stores/state";

const POST_COUNT = 10;

const tokenStore = useTokenStore();
const token = computed(() => tokenStore.token);

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
})
const feedItems = ref([]);
const nextPage = ref(0);
const loading = ref(false);
const wallError = ref(null);

async function fetchWall(page) {
  const params = {
    owner_id: props.userId,
    fields: 'id,photo_50,first_name,last_name',
    access_token: token.value,
    v: 5.131,
    count: POST_COUNT,
    offset: page * POST_COUNT,
    extended: 1,
  }
  const {data} = await axios({
    url: 'https://api.vk.com/method/wall.get',
    adapter: jsonpAdapter,
    method: "GET",
    params
  });
  if (data.error) {
    throw new Error(data.error.error_msg);
  }
  const {items, profiles, groups} = data.response;
  if (items.length === 0 && nextPage.value <= 1) {
    throw new Error("Нет записей");
  }
  return {items, profiles, groups};
}

function findNameAndAvatar(posterId, profiles, groups) {
  let avatar = null;
  let name = "";
  const profile = profiles.find((p) => p.id === posterId);
  const group = groups.find((g) => g.id === -posterId);
  if (profile) {
    avatar = profile.photo_50;
    name = profile.first_name + " " + profile.last_name;
  } else if (group) {
    avatar = group.photo_50;
    name = group.name;
  }
  return {
    avatar,
    name,
  }
}

function preloadWall() {
  loading.value = true;
  const pageToLoad = nextPage.value;
  nextPage.value++;
  fetchWall(pageToLoad).then(({items, profiles, groups}) => {
    feedItems.value = feedItems.value.concat(items.map((it) => {
      const posterId = it.from_id;
      const {avatar: postAvatar, name: postName} = findNameAndAvatar(posterId, profiles, groups);
      const repost = it.copy_history?.[0];
      if (repost) {
        const {avatar: repostAvatar, name: repostName} = findNameAndAvatar(repost.from_id, profiles, groups);
        repost.postAvatar = repostAvatar;
        repost.postName = repostName;
      }
      return {
        ...it,
        postAvatar,
        postName,
      }
    }));
  }).catch((e) => {
    wallError.value = e.toString();
  }).finally(() => {
    loading.value = false;
  });
}

onMounted(() => {
  preloadWall();
})
</script>

<template>
  <virtual-list v-if="!wallError"
                class="list"
                :data-key="'id'"
                :data-sources="feedItems"
                :data-component="WallItem"
                :estimate-size="70"
                @tobottom="preloadWall"
  >
    <template #footer>
      <div v-if="loading" class="loader">Loading...</div>
    </template>
  </virtual-list>
  <div v-else class="error vk-box">
    <div class="inner">
      <img :src="AlertIcon">
      <div class="error-text">
        {{wallError}}
      </div>
    </div>
  </div>
</template>

<style scoped>
.list {
  height: 95vh;
  overflow-y: auto;
}
.error {
  padding: 0.5rem 0;
  width: 100%;
  text-align: center;
}
.inner {
  display: flex;
  margin: 0 auto;
  width: 50%;
  align-items: center;
  justify-content: start;
}
.error-text {
  margin-left: 5px;
}
</style>
