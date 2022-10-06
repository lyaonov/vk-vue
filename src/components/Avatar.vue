<script setup>
defineProps({
  src: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required:true,
  }
})
</script>

<template>
<div class="vk-box">
  <img :src="src" />
  <div class="name">
    {{ name }}
  </div>
</div>
</template>

<style scoped>
img {
  margin: 0 auto;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
}
.name {
  text-align: center;
}
</style>
