<script setup>
import {computed} from "vue";
import nanAvatar from "../assets/placeHolderAvatar.jpg";

const props = defineProps({
  people: {
    type: Array,
    required: true
  }
})
const peopleChunks = computed(() => {
  const chunkSize = 3;
  const result = [];
  for (let i = 0; i < props.people.length; i += chunkSize) {
    const chunk = props.people.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
})
</script>

<template>
<div class="vk-box">
  <div class="people-row" v-for="peopleRow in peopleChunks">
    <div class="people-cell" v-for="person in peopleRow">
      <img :src="person?.photoMain??nanAvatar">
      <div class="name">
        {{person.firstName}}
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
img {
  border-radius: 50%;
  overflow: hidden;
  width: 50px;
  height: 50px;
}

.people-row {
  width: 210px;
  margin: 0 auto;
  overflow: hidden;
  text-align: left;
}

.people-cell {
  text-align: center;
  float: left;
  width: 70px;
}

.name {
  font-size: 12px;
}
</style>
