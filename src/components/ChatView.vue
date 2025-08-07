<template>
  <!-- 整体三栏布局 -->
  <el-container class="chat-app">
    <!-- 左：房间列表 -->
    <el-aside width="260" class="room-aside">
      <div class="room-tools">
        <el-button circle :icon="Plus" @click="toolVisible = true" />
        <el-button circle :icon="Refresh" @click="onRefresh" />
      </div>
      <RoomList />
    </el-aside>

    <!-- 中：消息面板 -->
    <el-container>
      <!-- 房间顶部栏 -->
      <el-header height="48" class="chat-header" v-loading="!currentRoom">
        <span class="title">{{ currentRoom?.name || "请选择房间" }}</span>
        <el-button
          v-if="currentRoom && isOwner"
          :icon="User"
          circle
          @click="inviteDialog = true"
        />
        <el-button
          v-if="currentRoom"
          :icon="VideoCamera"
          circle
          @click="call"
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


  <el-dialog v-model="toolVisible" title="房间管理" width="400px">
    <el-form label-width="80px">
      <el-form-item label="新建房间">
        <el-input v-model="newRoom" placeholder="房间名" />
        <el-button @click="create">创建</el-button>
      </el-form-item>
      <el-form-item label="加入房间">
        <el-input v-model="joinId" placeholder="房间ID" />
        <el-button @click="join">加入</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="inviteDialog" title="邀请用户" width="300px">
    <el-input v-model="inviteId" placeholder="用户名" />
    <template #footer>
      <el-button @click="inviteDialog = false">取消</el-button>
      <el-button type="primary" @click="invite">确认邀请</el-button>
    </template>
  </el-dialog>

  <!-- 呼叫覆盖层（可选） -->
  <CallLayer />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage, ElMessageBox, ElScrollbar } from "element-plus";
import type { MatrixEvent } from "matrix-js-sdk";
import { Plus, Refresh, User, VideoCamera } from "@element-plus/icons-vue";

import { useRoomStore } from "@/stores/rooms";
import { useSessionStore } from "@/stores/session";
import {
  sendText,
  sendContent,
  createRoom,
  joinRoom,
  inviteUser,
  refreshRooms,
} from "@/api/matrix";
import { placeVideoCall } from "@/api/matrix";

import RoomList from "./RoomList.vue";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";
import CallLayer from "./CallLayer.vue";

const rooms = useRoomStore();
const session = useSessionStore();

const scrollRef = ref<InstanceType<typeof ElScrollbar> | null>(null);
const toolVisible = ref(false);
const newRoom = ref("");
const joinId = ref("");
const inviteId = ref("");
const inviteDialog = ref(false);

/* 当前房间 & 时间线 */
const currentRoom = computed(() =>
  rooms.rooms.find((r) => r.roomId === rooms.currentRoomId)
);
const timeline = computed<MatrixEvent[]>(() => {
  rooms.bump;
  if (!currentRoom.value) return [];
  return (currentRoom.value.timeline as MatrixEvent[]).filter((ev) => {
    if (ev.getType() !== 'm.room.message') return false;
    const msgtype = ev.getContent()?.msgtype;
    return ['m.text', 'm.image', 'm.file'].includes(msgtype);
  });
});

const isOwner = computed(
  () => currentRoom.value?.getCreator?.() === session.userId
);

/* 发送文本 */
async function handleSend(text: string) {
  try {
    await sendText(currentRoom.value.roomId, text);
    nextTick(scrollToBottom);
  } catch (e) {
    ElMessage.error("发送失败: " + e.message);
  }
}

/* 上传附件 */
async function handleUpload(file: File) {
  try {
    await ElMessageBox.confirm(
      `发送文件 ${file.name}?`,
      "文件传输",
      {
        confirmButtonText: "发送",
        cancelButtonText: "取消",
      }
    );
  } catch {
    return;
  }
  try {
    await sendContent(currentRoom.value.roomId, file);
    nextTick(scrollToBottom);
  } catch (e) {
    ElMessage.error("上传失败: " + e.message);
  }
}

async function create() {
  if (!newRoom.value.trim()) return;
  if (rooms.rooms.some((r) => r.name === newRoom.value.trim())) {
    ElMessage.warning("房间已存在");
    return;
  }
  try {
    await createRoom(newRoom.value.trim());
    newRoom.value = "";
    toolVisible.value = false;
    refreshRooms();
  } catch (e) {
    ElMessage.error("房间创建失败");
  }
}

async function join() {
  if (!joinId.value.trim()) return;
  try {
    await joinRoom(joinId.value.trim());
    joinId.value = "";
    toolVisible.value = false;
    refreshRooms();
  } catch (e) {
    ElMessage.error("加入房间失败");
  }
}

async function invite() {
  if (!inviteId.value.trim()) return;
  try {
    await inviteUser(currentRoom.value.roomId, inviteId.value.trim());
    inviteId.value = "";
    toolVisible.value = false;
  } catch (e) {
    ElMessage.error("邀请失败");
  }
}

/* 发起视频通话 */
function call() {
  if (!currentRoom.value) return;
  placeVideoCall(currentRoom.value.roomId).catch((e) =>
    ElMessage.error("无法发起通话: " + e.message)
  );
}

function onRefresh() {
  refreshRooms();
}

/* 自动滚到底部 */
function scrollToBottom() {
  const s = scrollRef.value;
  if (s) s.setScrollTop(s.wrapRef.scrollHeight);
}

/* 当房间或时间线变化时滚到底 */
watch([
  () => rooms.currentRoomId,
  () => rooms.bump,
], () => nextTick(scrollToBottom));

// 定时检查是否有新消息
onMounted(() => {
  const timer = setInterval(scrollToBottom, 1000);
  onUnmounted(() => clearInterval(timer));
});
onMounted(() => {
  scrollToBottom();
  refreshRooms();
});
</script>

<style scoped lang="scss">
.chat-app {
  height: 80vh;
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
.room-aside {
  display: flex;
  flex-direction: column;
}
.room-tools {
  display: flex;
  justify-content: flex-end;
  padding: 4px;
  gap: 4px;
}
</style>
