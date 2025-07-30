<template>
  <!-- 整体三栏布局 -->
  <el-container class="chat-app">
    <!-- 左：房间列表 -->
    <el-aside width="260">
      <RoomList />
    </el-aside>

    <!-- 中：消息面板 -->
    <el-container>
      <!-- 房间顶部栏 -->
      <el-header height="48" class="chat-header" v-loading="!currentRoom">
        <span class="title">{{ currentRoom?.name || "请选择房间" }}</span>
        <el-button
          v-if="currentRoom"
          :icon="MoreFilled"
          circle
          @click="drawer = true"
        />
      </el-header>

      <!-- 消息列表 -->
      <el-main class="chat-main">
        <el-scrollbar ref="scrollRef" class="scroll">
          <MessageItem
            v-for="ev in timeline"
            :key="ev.getId()"
            :event="ev"
            :me="session.userId"
          />
        </el-scrollbar>
      </el-main>

      <!-- 底部输入 -->
      <el-footer height="auto" class="chat-input">
        <MessageInput
          :disabled="!currentRoom"
          @send="handleSend"
          @upload="handleUpload"
        />
      </el-footer>
    </el-container>
  </el-container>

  <!-- 右侧抽屉 -->
  <ChatDrawer v-model="drawer" :room="currentRoom" />

  <!-- 呼叫覆盖层（可选） -->
  <CallLayer />
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { MoreFilled } from "@element-plus/icons-vue";

import { useRoomStore } from "@/store/rooms";
import { useSessionStore } from "@/store/session";
import { sendText, sendContent } from "@/api/matrix";

import RoomList from "./RoomList.vue";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";
import ChatDrawer from "./ChatDrawer.vue";
import CallLayer from "./CallLayer.vue";

const rooms = useRoomStore();
const session = useSessionStore();

const drawer = ref(false);
const scrollRef = ref(null);

/* 当前房间 & 时间线 */
const currentRoom = computed(() =>
  rooms.rooms.find((r) => r.roomId === rooms.currentRoomId)
);
const timeline = computed(() =>
  currentRoom.value ? currentRoom.value.timeline : []
);

/* 发送文本 */
async function handleSend(text) {
  try {
    await sendText(currentRoom.value.roomId, text);
    nextTick(scrollToBottom);
  } catch (e) {
    ElMessage.error("发送失败: " + e.message);
  }
}

/* 上传附件 */
async function handleUpload(file) {
  try {
    await sendContent(currentRoom.value.roomId, file);
    nextTick(scrollToBottom);
  } catch (e) {
    ElMessage.error("上传失败: " + e.message);
  }
}

/* 自动滚到底部 */
function scrollToBottom() {
  const s = scrollRef.value;
  if (s) s.setScrollTop(s.wrapRef.scrollHeight);
}

/* 当房间或时间线变化时滚到底 */
watch([currentRoom, timeline], scrollToBottom);

onMounted(scrollToBottom);
</script>

<style scoped>
.chat-app {
  height: 100vh;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}
.chat-header .title {
  font-weight: 600;
  font-size: 15px;
}
.chat-main {
  padding: 8px 16px 0;
}
.scroll {
  height: 100%;
}
.chat-input {
  padding: 8px 12px;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}
</style>
