<template>
  <el-empty v-if="!room" description="请选择一个房间" />
  <div v-else class="chat">
    <div class="toolbar">
      <el-button circle icon="Plus" @click="toolVisible = true" />
      <el-button circle icon="Refresh" @click="onRefresh" />
    </div>
    <div ref="scroller" class="history">
      <MessageItem v-for="e in timeline" :key="e.getId()" :event="e" />
    </div>
    <MessageInput :room-id="room.roomId" />
    <el-dialog v-model="toolVisible" title="房间功能" width="400px">
      <el-form label-width="80px">
        <el-form-item label="新建房间">
          <el-input v-model="newRoom" placeholder="房间名" />
          <el-button @click="create">创建</el-button>
        </el-form-item>
        <el-form-item label="加入房间">
          <el-input v-model="joinId" placeholder="房间地址" />
          <el-button @click="join">加入</el-button>
        </el-form-item>
        <el-form-item label="邀请用户">
          <el-input v-model="inviteId" placeholder="@user:example.com" />
          <el-button @click="invite">邀请</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref, computed } from "vue";
import { useRoomStore } from "../store/rooms";
import MessageItem from "./MessageItem.vue";
import { createRoom, joinRoom, inviteUser, refreshRooms } from "../api/matrix";
import { ElMessage } from "element-plus";

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

const toolVisible = ref(false);
const newRoom = ref("");
const joinId = ref("");
const inviteId = ref("");

async function create() {
  try {
    await createRoom(newRoom.value);
    newRoom.value = "";
    toolVisible.value = false;
    refreshRooms();
  } catch {
    ElMessage.error("房间创建失败");
  }
}

async function join() {
  try {
    await joinRoom(joinId.value);
    joinId.value = "";
    toolVisible.value = false;
    refreshRooms();
  } catch {
    ElMessage.error("加入房间失败");
  }
}

async function invite() {
  try {
    await inviteUser(room.value.roomId, inviteId.value);
    inviteId.value = "";
    toolVisible.value = false;
  } catch {
    ElMessage.error("邀请失败");
  }
}

function onRefresh() {
  refreshRooms();
}
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 4px 8px;
}
.history {
  flex: 1;
  overflow: auto;
  padding: 16px;
  scroll-behavior: smooth;
}
</style>
