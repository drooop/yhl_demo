<template>
  <div :class="['msg-wrap', fromMe ? 'me' : '']">
    <el-avatar class="avatar" :src="avatarUrl" :size="32">
      {{ initials }}
    </el-avatar>

    <div class="bubble">
      <!-- 文本 -->
      <template v-if="isText">
        <p class="text">{{ content.body }}</p>
      </template>

      <!-- 图片 -->
      <template v-else-if="isImage">
        <el-image
          :src="mxcToUrl(content.url)"
          :preview-src-list="[mxcToUrl(content.url)]"
        />
      </template>

      <!-- 文件 -->
      <template v-else>
        <el-link :href="mxcToUrl(content.url)" target="_blank">{{
          content.body
        }}</el-link>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSessionStore } from "@/store/session";

const props = defineProps({
  event: Object,
  me: String,
});

const session = useSessionStore();

const sender = props.event.getSender();
const content = props.event.getContent();

const fromMe = computed(() => sender === props.me);
const isText = content.msgtype === "m.text";
const isImage = content.msgtype === "m.image";

const avatarUrl = ""; // 可以自行从 profile store 获取
const initials = sender?.replace("@", "").charAt(0).toUpperCase();

/* 简易 MXC => HTTP 转换（Synapse 默认模式）*/
function mxcToUrl(mxc) {
  if (!mxc?.startsWith("mxc://")) return mxc;
  const base = session.baseUrl?.replace(/\/$/, "");
  const [, server, mediaId] = mxc.match(/^mxc:\/\/([^/]+)\/(.+)$/);
  return `${base}/_matrix/media/v3/download/${server}/${mediaId}`;
}
</script>

<style scoped>
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
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  margin: 0 8px;
  word-break: break-word;
}
.msg-wrap.me .bubble {
  background: var(--el-color-primary-light-9);
}
.text {
  margin: 0;
}
</style>
