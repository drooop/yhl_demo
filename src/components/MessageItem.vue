<template>
  <div :class="['msg', isMe ? 'me' : 'other', failed && 'failed']">
    <!-- 文本 -->
    <div v-if="isText" class="bubble">{{ content.body }}</div>

    <!-- 通话邀请 -->
    <div v-else-if="isCallInvite" class="bubble">[视频通话邀请]</div>

    <!-- 图片 -->
    <el-card v-else-if="isImage" class="card">
      <el-image :src="mxcUrl" fit="cover" style="width: 150px; height: 150px" />
      <template #footer>
        <el-button link @click="download">下载</el-button>
      </template>
    </el-card>

    <!-- 文件 -->
    <el-card v-else class="card file">
      <div>{{ content.body }} ({{ prettySize }})</div>
      <template #footer>
        <el-button link @click="download">下载</el-button>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSessionStore } from "../store/session";
import * as sdk from "matrix-js-sdk";

const props = defineProps({ event: Object });
const session = useSessionStore();

const content = props.event.getContent();
const isMe = props.event.getSender() === session.userId;
const isText = content.msgtype === "m.text";
const failed = props.event.status === "not_sent";
const isImage = content.msgtype === "m.image";
const isCallInvite = props.event.getType() === "m.call.invite";

const mxcUrl = computed(() =>
  // session.client.mxcUrlToHttp(content.url, 300, 300, "scale")
  sdk.getHttpUriForMxc(session.client.baseUrl, content.url, 300, 300, "scale")
);
const prettySize = (content.info?.size / 1024).toFixed(1) + " KB";

async function download() {
  const url = session.client.mxcUrlToHttp(
    content.url,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true
  );
  const resp = await fetch(url, {
    headers: { Authorization: "Bearer " + session.client.getAccessToken() },
  });
  if (!resp.ok) return;
  const blob = await resp.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = content.body;
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>

<style scoped>
.msg {
  margin: 8px 0;
  display: flex;
}
.me {
  justify-content: flex-end;
}
.bubble {
  background: #409eff;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
}
.card {
  max-width: 200px;
}
.failed {
  opacity: 0.4;
  position: relative;
}
.failed::after {
  content: "未发送";
  color: red;
  position: absolute;
  top: -14px;
  right: 0;
}
</style>
