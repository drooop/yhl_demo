<template>
  <el-dialog
    v-model="visible"
    width="800px"
    :show-close="false"
    class="call-layer"
    lock-scroll
    destroy-on-close
  >
    <template #header>
      <span>视频通话</span>
    </template>

    <div ref="container" class="jitsi-box"></div>

    <template #footer>
      <el-button :icon="Microphone" @click="toggleMute" />
      <el-button :icon="VideoCamera" @click="toggleVideo" />
      <el-button type="danger" :icon="Phone" @click="hangup">挂断</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { Phone, Microphone, VideoCamera } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { useCallStore } from '../store/call';
import { useSessionStore } from '../store/session';

const callStore = useCallStore();
const session = useSessionStore();
const visible = ref(false);
const container = ref(null);

watch(
  () => callStore.state,
  async (s) => {
    visible.value = s !== 'idle';
    if (s === 'pending') {
      if (callStore.incoming) {
        try {
          await ElMessageBox.confirm('是否接听来电?', '视频通话', {
            confirmButtonText: '接听',
            cancelButtonText: '拒绝',
          });
        } catch {
          callStore.hangup();
          return;
        }
      }
      await nextTick();
      callStore.start(container.value, session.userId);
    }
  }
);

function toggleMute() {
  callStore.toggleMute();
}

function toggleVideo() {
  callStore.toggleVideo();
}

function hangup() {
  callStore.hangup();
}
</script>

<style scoped>
.jitsi-box {
  width: 100%;
  height: 500px;
}
</style>
