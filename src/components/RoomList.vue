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

<script setup lang="ts">
import type { Room, NotificationCountType } from "matrix-js-sdk";
import { useRoomStore } from "@/stores/rooms";
import { useSessionStore } from "@/stores/session";

const rooms = useRoomStore();
const session = useSessionStore();

function selectRoom(id: string) {
  rooms.currentRoomId = id;
  const room = session.client?.getRoom(id);
  const last = room?.timeline[room.timeline.length - 1];
  if (last) session.client?.sendReadReceipt(last);
  room?.setUnreadNotificationCount(NotificationCountType.Total, 0);
  room?.setUnreadNotificationCount(NotificationCountType.Highlight, 0);
}

function unread(room: Room) {
  return Math.max(room.getUnreadNotificationCount(), 0);
}
</script>

<style scoped lang="scss">
.room-scroll {
  height: 100%;
  border-right: 1px solid var(--el-border-color-light);
}
.room-menu {
  border: none;
}
</style>
