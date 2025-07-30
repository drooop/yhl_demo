<template>
  <el-scrollbar class="room-scroll">
    <el-menu
      :default-active="rooms.currentRoomId"
      class="room-menu"
      @select="selectRoom"
    >
      <template v-for="r in rooms.rooms" :key="r.roomId">
        <el-menu-item :index="r.roomId">
          <el-badge :value="unread(r)" :hidden="!unread(r)">
            <span>{{ r.name || r.roomId }}</span>
          </el-badge>
        </el-menu-item>
      </template>

      <el-empty v-if="!rooms.rooms.length" description="暂无房间" />
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { useRoomStore } from "@/store/rooms";

const rooms = useRoomStore();

function selectRoom(id) {
  rooms.currentRoomId = id;
}

/* 计算未读数 */
function unread(room) {
  return Math.max(room.getUnreadNotificationCount(), 0);
}
</script>

<style scoped>
.room-scroll {
  height: 100%;
  border-right: 1px solid var(--el-border-color-light);
}
.room-menu {
  border: none;
}
</style>
