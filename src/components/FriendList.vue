<script setup>
import {defineEmits, computed} from 'vue';

const emit = defineEmits(["selectFriend"]);
const props = defineProps({
  itemList: {
    type: Array,
    required: true
  }
})

const minColor = [255, 255, 255];
const maxColor = [68, 123, 186];
const minFriendsCount = computed(() => props.itemList.reduce((a, b) => Math.min(a, b.relatedFriends.length), Number.MAX_SAFE_INTEGER));
const maxFriendsCount = computed(() => props.itemList.reduce((a, b) => Math.max(a, b.relatedFriends.length), Number.MIN_SAFE_INTEGER));

const coloredList = computed(() => props.itemList.map((item) => ({
  color: getColor(item.relatedFriends.length),
  ...item
})));

function getColor(friendsCount) {
  const alpha = (friendsCount - minFriendsCount.value) / (maxFriendsCount.value - minFriendsCount.value);
  const r = Math.floor(minColor[0] + (maxColor[0] - minColor[0]) * alpha);
  const g = Math.floor(minColor[1] + (maxColor[1] - minColor[1]) * alpha);
  const b = Math.floor(minColor[2] + (maxColor[2] - minColor[2]) * alpha);
  return `rgb(${r}, ${g}, ${b}, .5)`;
}
</script>

<template>
  <ul class="list" v-if="coloredList.length !== 0">
    <li class="list-item card" @click="() => emit('selectFriend', item.id)" :style="{'background-color': item.color}" v-for="item in coloredList">
      <img :src="item.photoMain" alt="">
      <div class="info">
        <div class="name">{{ item.name }}</div>
        <div class="description">{{ item.description }}</div>
      </div>
    </li>
    <hr>
    <li><strong>Общее кол-во: {{ itemList.length }}</strong></li>
  </ul>
</template>

<style scoped>
img {
  border-radius: 50%;
  margin-left: 15px;
  width: 80px;
  height: 80px;
}

span {
  overflow: hidden;
}

li {
  margin: 0.5em;
}

.info {
  margin-left: 1em;
}

.name {
  font-weight: 600;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0.5rem 0;
  cursor: pointer;
}
</style>
