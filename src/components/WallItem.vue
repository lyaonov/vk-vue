<script setup>
import {ref, computed} from "vue";
import timeAgo from '../lib/timeago'

const props = defineProps({
  source: {
    type: Object,
  },
  isRepost: {
    type: Boolean,
    default: false,
  }
})

const attachments = computed(() => props.source.attachments);

const repost = computed(() => props.source.copy_history?.[0]);

const links = computed(() => {
  const result = [];
  attachments.value?.forEach((at) => {
    if (at.type === "link") {
      result.push({
        caption: at.link.caption,
        url: at.link.url,
      });
    }
  });
  return result;
});

const photos = computed(() => {
  const result = [];
  attachments.value?.forEach((at) => {
    if (at.type === "photo" && at.photo.sizes) {
      let bestUrl = at.photo.sizes[0].url;
      let bestWidth = at.photo.sizes[0].width;
      at.photo.sizes.forEach((size) => {
        if (size.width > bestWidth) {
          bestWidth = size.width;
          bestUrl = size.url;
        }
      })
      result.push(bestUrl);
    }
  });
  return result;
});

const timeString = computed(() => {
  const postTime = new Date(props.source.date * 1000);
  return timeAgo.format(postTime);
})
</script>

<template>
<div :class="{post:true, 'vk-box': true, repost: isRepost}">
  <div class="header">
    <div class="avatar">
      <img :src="source.postAvatar" />
    </div>
    <div class="poster-info">
      <div class="poster-name">
        {{source.postName}}
      </div>
      <div class="post-time">
        {{timeString}}
      </div>
    </div>
  </div>
  <div></div>
  <div class="content">
    <div class="text" v-if="source.text">
      {{source.text}}
    </div>
    <div class="link" v-for="link in links">
      <a :href="link.url">{{link.caption}}</a>
    </div>
    <div class="photo" v-for="photoUrl in photos">
      <img :src="photoUrl" />
    </div>
    <WallItem v-if="repost" :is-repost="true" :source="repost"/>
  </div>
</div>
</template>

<style scoped>
.post {
  margin-top: 30px;
  margin-bottom: 30px;
  width: 100%;
  padding: 1em;
}
.repost {
  border-left: 2px solid rgba(0, 20, 51, 0.12);
  padding-left: 12px;
}
.avatar img {
  border-radius: 50%;
  width: 50px;
  height: 50px;
}
.avatar {
  float: left;
}
.header {
  display: flex;
  float: left;
  align-items: center;
  justify-content: start;
  padding: 0.5rem 0;
  font-size: 15px;
}
.poster-info {
  padding-left: 0.5rem;
}
.content {
  clear: both;
}
.text {
  font-size: 14px;
  margin-bottom: 5px;
}
.photo img {
  width: 50%;
}
</style>
