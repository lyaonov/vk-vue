<script>
import { ref, computed, onMounted } from "vue";
import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';
import { useTokenStore } from "../stores/state";

const tokenStore = useTokenStore();
const token = computed(() => tokenStore.token);
export default {
  props: {
    src: String,
    name: String,
    id: Number
  },
  data() {
    return {
      numFriends: null,
    }
  },
  methods: {
    async getNumFriends() {
      const params = {
        user_ids: this.id,
        fields: 'counters',
        access_token: token.value,
        v: 5.131,
      }
      await axios({
        url: 'https://api.vk.com/method/users.get',
        adapter: jsonpAdapter,
        method: "GET",
        params
      }).then(data => { this.numFriends = data.data.response[0].counters.friends })
    }
  },
  mounted() {
    this.getNumFriends()
  }
}

</script>

<template>
  <div class="vk-box">
    <img :src="src" />
    <div class="name">
      {{ name }}
    </div>
    <div class="count-friends">
      Друзья: <span>{{numFriends}}</span>
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

.count-friends {
  margin: 5px;
  text-align: center;
}

span {
  font-weight: bold;
}
</style>
