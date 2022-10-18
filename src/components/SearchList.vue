<script setup>
import { defineEmits } from 'vue';
const emit = defineEmits(["add"], ["clear"]);
defineProps({
    itemList: {
        type: Array,
        required: true
    }
})

</script>

<template>
    <ul class="list" v-if="itemList.length !== 0">
        <div class="popover">
            <h1 class="center">Выбери пользователя</h1>
            <button class="btn danger" style="margin-top:10px;" v-on:click="() => emit('clear')">Очистить</button>
        </div>
        <li class="list-item card" v-on:click="() => emit('add', item.id)" v-for="(item, i) in itemList">
            <img :src="item.photo" alt="">
            <span>{{ item.Name }}</span>
            <button class="btn" @click.stop v-on:click="() => emit('add', item.id)">Добавить</button>
        </li>
    </ul>
</template>

<style scoped>
.popover h1{
    float:left;
    font-size: 20px;
    height: 20px;
}
img {
    border-radius: 50%;
    margin-left: 15px;
    width: 80px;
    height: 80px;
}
.popover{
    margin-top: 20px;
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
li:hover{
    background-color: rgba(255, 255, 128, 0.3);
    scale: 1.02;
    transition: 0.2s;
}
</style>
