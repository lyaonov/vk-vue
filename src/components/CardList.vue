<script setup>
import {defineEmits} from 'vue';
const emit = defineEmits(["remove"]);
defineProps({
  itemList: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <ul class="list" v-if="itemList.length !== 0">
    <li class="list-item card" v-for="(item, i) in itemList">
      <img :src="item.photoMain" alt="">
      <span>{{ item.name }}</span>
      <button class="danger btn" v-on:click="() => emit('remove', i)">Удалить</button>
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

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}
</style>
