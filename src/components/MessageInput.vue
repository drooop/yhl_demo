<template>
  <div class="inputbar">
    <el-input v-model="text" @keyup.enter="send" placeholder="说点什么…" />
    <el-upload :auto-upload="false" :limit="1" :on-change="onFile">
      <template #trigger>
        <el-button circle icon="Upload" />
      </template>
    </el-upload>
    <el-button type="primary" @click="send">发送</el-button>
    <el-button type="success" @click="call">视频通话</el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { sendText, sendContent, placeVideoCall } from "../api/matrix";

const props = defineProps({ roomId: String });
const text = ref("");

async function send() {
  if (!text.value.trim()) return;
  try {
    await sendText(props.roomId, text.value);
  } catch {
    ElMessage.error("消息发送失败");
  }
  text.value = "";
}

async function onFile(file) {
  try {
    await ElMessageBox.confirm(
      `发送 ${file.name} (${(file.size / 1024).toFixed(1)} KB)？`,
      "确认发送",
      { type: "info", confirmButtonText: "发送", cancelButtonText: "取消" }
    );
    await sendContent(props.roomId, file.raw);
  } catch (e) {
    if (e !== "cancel" && e !== "close") ElMessage.error("附件发送失败");
  }
}

function call() {
  placeVideoCall(props.roomId);
}
</script>

<style scoped>
.inputbar {
  display: flex;
  gap: 8px;
  padding: 8px;
}
</style>
