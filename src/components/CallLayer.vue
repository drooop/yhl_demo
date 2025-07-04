<template>
  <el-dialog
    v-model="visible"
    width="600px"
    :show-close="false"
    class="call-layer"
    lock-scroll
    destroy-on-close
  >
    <template #header>
      <span>{{ title }}</span>
    </template>

    <!-- 远端视频(大) -->
    <video
      ref="remote"
      autoplay
      playsinline
      style="width: 100%; height: 360px; background: #000"
    ></video>

    <!-- 本地视频(小) -->
    <video ref="local" autoplay muted playsinline class="local-video"></video>

    <template #footer>
      <!-- <el-button :icon="Microphone" @click="toggleMute" />
      <el-button :icon="VideoCamera" @click="toggleVideo" />
      <el-button type="danger" :icon="Phone" @click="hangup">挂断</el-button> -->
      <template v-if="callStore.state === 'incoming'">
        <el-button type="primary" :icon="Phone" @click="answer">接听</el-button>
        <el-button type="danger" :icon="Phone" @click="hangup">拒绝</el-button>
      </template>
      <template v-else>
        <el-button :icon="Microphone" @click="toggleMute" />
        <el-button :icon="VideoCamera" @click="toggleVideo" />
        <el-button type="danger" :icon="Phone" @click="hangup">挂断</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { Phone, Microphone, VideoCamera } from "@element-plus/icons-vue";
import { useCallStore } from "../store/call";

const callStore = useCallStore();
const visible = ref(false);
const remote = ref(null);
const local = ref(null);

watch(
  () => callStore.state,
  (s) => {
    visible.value = s !== "idle";
    if (s === "connected") attachStreams();
  }
);

function attachStreams() {
  // remote.value.srcObject = callStore.call.getRemoteUsermediaStream();
  // local.value.srcObject = callStore.call.getLocalUsermediaStream();
  if (!callStore.call) return;
  remote.value.srcObject = callStore.call.getRemoteUsermediaStream() || null;
  local.value.srcObject = callStore.call.getLocalUsermediaStream() || null;
}

function toggleMute() {
  callStore.toggleMute();
}

function toggleVideo() {
  callStore.toggleVideo();
}

function hangup() {
  callStore.hangup();
}

function answer() {
  callStore.call.answer();
  callStore.updateState("connected");
}

onMounted(() => {
  if (callStore.state === "connected") attachStreams();
  /* 远端流变化时也刷新（包括对方接听后） */
  callStore.call?.on("feeds_changed", attachStreams);
});

const title = computed(() =>
  callStore.state === "outgoing"
    ? "等待对方接听…"
    : callStore.state === "incoming"
    ? "来电…"
    : "视频通话"
);
</script>

<style scoped>
.call-layer :deep(.el-dialog__body) {
  position: relative;
}
.local-video {
  position: absolute;
  bottom: 80px;
  right: 16px;
  width: 120px;
  height: 90px;
  background: #000;
}
</style>
