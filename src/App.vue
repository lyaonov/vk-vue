<script setup>
import {useTokenStore} from "./stores/state";
import TokenModal from "./components/TokenModal.vue";
import {computed, onMounted} from "vue";

const tokenStore = useTokenStore();
const token = computed(() => tokenStore.token);

onMounted(() => {
  const localToken = sessionStorage.getItem('access_token');
  if (localToken && localToken !== "undefined") {
    tokenStore.set(localToken);
  }
})
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path"/>
    </Transition>
  </RouterView>
  <TokenModal :show="!token"/>
  <notifications />
</template>

<style scoped>
/* do not remove, used for transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
