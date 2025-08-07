<template>
  <el-input
    v-model="draft"
    type="textarea"
    :rows="2"
    placeholder="发送消息 (Ctrl+Enter)"
    :disabled="disabled"
    @keydown="onKey"
  >
    <template #append>
      <el-upload
        :show-file-list="false"
        :disabled="disabled"
        :before-upload="beforeUpload"
      >
        <el-button :icon="Paperclip" circle />
      </el-upload>

      <el-button
        type="primary"
        :disabled="disabled || !draft.trim()"
        :icon="Position"
        @click="emitSend"
      />
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Paperclip, Position } from "@element-plus/icons-vue";

const props = defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ (e: "send", text: string): void; (e: "upload", file: File): void }>();

const draft = ref("");

function emitSend() {
  if (!draft.value.trim()) return;
  emit("send", draft.value.trim());
  draft.value = "";
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    emitSend();
  }
}

function beforeUpload(file: File) {
  emit("upload", file);
  return false;
}
</script>

<style scoped lang="scss">
/* 让 textarea 与按钮在同一行 */
:deep(.el-input__wrapper) {
  display: flex;
  align-items: center;
}
</style>
