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
        ref="uploadRef"
        :show-file-list="false"
        :disabled="disabled"
        :before-upload="beforeUpload"
      >
        <el-button :icon="Plus" circle />
      </el-upload>

      <el-button
        type="primary"
        :disabled="disabled || !draft.trim()"
        @click="emitSend"
      >
        发送
      </el-button>
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { UploadInstance } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

const props = defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ (e: "send", text: string): void; (e: "upload", file: File): void }>();

const draft = ref("");
const uploadRef = ref<UploadInstance>();

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
  uploadRef.value?.clearFiles();
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
