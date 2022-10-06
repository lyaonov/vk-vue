<script setup>
import {useTokenStore} from "../stores/state";
import {computed, ref} from "vue";
import axios from "axios";
import jsonpAdapter from "axios-jsonp";
import { notify } from "@kyvg/vue3-notification";

defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const tokenStore = useTokenStore();
const tempToken = ref("");
const tokenRegex = /access_token=(.*?)&/

function onSubmit() {
  const match = tokenRegex.exec(tempToken.value);
  let actualToken;
  if (match) {
    actualToken = match[1];
  } else {
    actualToken = tempToken.value;
  }
  console.log(actualToken);
  const params = {
    user_ids: 1,
    access_token: actualToken,
    v: 5.131,
  }
  axios({
    url: 'https://api.vk.com/method/users.get',
    adapter: jsonpAdapter,
    method: "GET",
    params
  }).then(({data}) => {
    if (!data.error) {
      tokenStore.set(actualToken);
      sessionStorage.setItem('access_token', actualToken);
      notify({
        title: "Success",
        text: "Access token accepted",
        type: "success",
      });
    } else {
      notify({
        title: "Error",
        text: data.error?.error_msg,
        type: "error",
      });
    }
  }).catch((e) => {
    notify({
      title: "Error",
      text: e.toString(),
      type: "error",
    });
  })
}
</script>

<template>
  <Transition name="fade">
    <div
        v-if="show"
        @keydown.enter="onSubmit"
        class="dialog-wrapper"
    >
      <div class="dialog">
        <div class="text">
          Введите <a href="https://oauth.vk.com/authorize?client_id=51441634&display=page&redirect_uri=&scope=friends&response_type=token&v=5.131" target="_blank">access token</a>
        </div>
        <input type="text" v-model="tempToken">
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-wrapper {
  z-index: 100;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  margin: 0;
}
/* dont remove, it's used by Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog {
  width: 300px;
  flex: none;
  padding: 1rem;
  background: #1c1f22;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}
.text {
  text-align: center;
}
.text,input {
  margin: 0.5em;
}
</style>
