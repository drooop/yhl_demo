<template>
  <el-scrollbar height="100%">
    <el-menu :default-active="currentRoomId" @select="onSelect">
      <el-menu-item v-for="r in rooms" :key="r.roomId" :index="r.roomId">
        {{ r.name || r.roomId }}
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { computed } from "vue";
import { useRoomStore } from "../store/rooms";

const roomStore = useRoomStore();
const rooms = computed(() => roomStore.rooms);
const currentRoomId = computed(() => roomStore.currentRoomId);

function onSelect(id) {
  roomStore.select(id);
}
</script>
