<template>
  <el-empty v-if="!room" description="请选择一个房间" />
  <div v-else class="chat">
    <div ref="scroller" class="history">
      <MessageItem v-for="e in timeline" :key="e.getId()" :event="e" />
    </div>
    <MessageInput :room-id="room.roomId" />
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref, computed } from "vue";
import { useRoomStore } from "../store/rooms";
import MessageItem from "./MessageItem.vue";

const roomStore = useRoomStore();
const room = computed(() => roomStore.currentRoom);
const timeline = computed(() => {
  // 读取 roomStore.bump，确保依赖收集到
  roomStore.bump;
  return room.value?.timeline || [];
});

const scroller = ref(null);
function scrollBottom() {
  scroller.value && (scroller.value.scrollTop = scroller.value.scrollHeight);
}
onMounted(scrollBottom);
watch(
  () => roomStore.currentRoomId,
  () => nextTick(scrollBottom)
);
watch(
  () => roomStore.bump,
  () => nextTick(scrollBottom)
);
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.history {
  flex: 1;
  overflow: auto;
  padding: 16px;
  scroll-behavior: smooth;
}
</style>
