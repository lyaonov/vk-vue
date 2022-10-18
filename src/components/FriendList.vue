
<script>
import { defineEmits, computed, onMounted } from 'vue';
import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';
import { useTokenStore } from "../stores/state";
const tokenStore = useTokenStore();
const token = computed(() => tokenStore.token);

export default {
  props: {
    itemList: Array,
  },
  data() {
    return {
      // minColor: [255, 255, 255],
      // maxColor: [68, 123, 186],
      coloredList: this.itemList.map((item) => ({
        color: this.getColor(item.relatedFriends.length),
        numberFriend: this.getFriend(item, item.id),
        ...item
      })),
    }
  },
  methods: {
    getColor(friendsCount) {
      let minFriendsCount = this.itemList.reduce((a, b) => Math.min(a, b.relatedFriends.length), Number.MAX_SAFE_INTEGER)
      let maxFriendsCount = this.itemList.reduce((a, b) => Math.max(a, b.relatedFriends.length), Number.MIN_SAFE_INTEGER)
      const alpha = (friendsCount - minFriendsCount) / (maxFriendsCount - minFriendsCount);
      const r = Math.floor(255 + (68 - 255) * alpha);
      const g = Math.floor(255 + (123 - 255) * alpha);
      const b = Math.floor(255 + (186 - 255) * alpha);
      return `rgb(${r}, ${g}, ${b}, .5)`;
    },
    selectFriend(id) {
      for (var i = 1; i < 99999; i++) {
        window.clearInterval(i);
        window.clearTimeout(i);
        if(window.mozCancelAnimationFrame)window.mozCancelAnimationFrame(i); // Firefox
      }
        this.$emit('selectFriend', id)
      },
      getFriend(item, id) {
        let saver = 0
        for (let i = 0; i < this.itemList.length; i++) {
          if (this.itemList[i] === item) {
            saver = i + 1
            break
          }
        }


        let x = setTimeout(() => {
          this.getReqNumFriends(id, saver - 1)
        }, saver * 400)
        let y = x

      },
      getReqNumFriends(id, i) {
        const params = {
          user_ids: id,
          fields: 'counters',
          access_token: token.value,
          v: 5.131,
        }
        axios({
          url: 'https://api.vk.com/method/users.get',
          adapter: jsonpAdapter,
          method: "GET",
          params
        }).then(data => {
          try {
            this.coloredList[i].numberFriend = data.data.response[0].counters.friends
          } catch (e) { console.log(data.data.response[0]) }
        })

      }

    },
    mounted() {
    }

  }
</script>

<template>
  <ul class="list" v-if="coloredList.length !== 0">
    <li class="list-item card" @click="selectFriend(item.id)" :style="{'background-color': item.color}"
      v-for="item in coloredList">
      <img :src="item.photoMain" alt="">
      <div class="info">
        <div class="name">{{ item.name }}</div>
        <div class="description">{{ item.description + (item.numberFriend ? ', ' + item.numberFriend + ' друзей' : "")
        }}</div>
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

li:hover {
  scale: 1.02;
  transition: 0.2s;
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
