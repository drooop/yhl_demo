<template>
  <div :class="['msg-wrap', fromMe ? 'me' : '']">
    <el-avatar class="avatar" :src="avatarUrl" :size="32">{{ initials }}</el-avatar>
    <div class="bubble">
      <template v-if="isText">
        <p class="text">{{ content.body }}</p>
      </template>
      <template v-else-if="isImage">
        <el-image
          :src="mxcToUrl(content.url)"
          :preview-src-list="[mxcToUrl(content.url)]"
          class="img"
        />
        <el-button size="small" :icon="Download" text @click="download(content.url)">
          下载
        </el-button>
      </template>
      <template v-else>
        <el-icon><Paperclip /></el-icon>
        <span class="file-name">{{ content.body }}</span>
        <el-button size="small" :icon="Download" text @click="download(content.url)">
          下载
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Download, Paperclip } from "@element-plus/icons-vue";
import type { MatrixEvent } from "matrix-js-sdk";
import { useSessionStore } from "@/stores/session";

interface Props {
  event: MatrixEvent;
  me: string;
}

const props = defineProps<Props>();
const session = useSessionStore();

const sender = props.event.getSender();
const content = props.event.getContent();

const fromMe = computed(() => sender === props.me);
const isText = content.msgtype === "m.text";
const isImage = content.msgtype === "m.image";

const avatarUrl = "";
const initials = sender?.replace("@", "").charAt(0).toUpperCase();

function mxcToUrl(mxc: string) {
  if (!mxc?.startsWith("mxc://")) return mxc;
  const base = session.baseUrl?.replace(/\/$/, "");
  const [, server, mediaId] = mxc.match(/^mxc:\/\/([^/]+)\/(.+)$/) || [];
  return `${base}/_matrix/media/v3/download/${server}/${mediaId}`;
}

function download(url: string) {
  window.open(mxcToUrl(url), "_blank");
}
</script>

<style scoped lang="scss">
.msg-wrap {
  display: flex;
  margin-bottom: 8px;
}
.msg-wrap.me {
  flex-direction: row-reverse;
}
.avatar {
  flex: 0 0 32px;
}
.bubble {
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  margin: 0 8px;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.msg-wrap.me .bubble {
  background: var(--el-color-primary-light-9);
}
.text {
  margin: 0;
}
.img {
  max-width: 200px;
  border-radius: 4px;
}
.file-name {
  margin-right: 4px;
}
</style>
