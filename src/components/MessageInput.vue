<template>
  <div class="message-input">
    <el-input
      v-model="draft"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 4 }"
      placeholder="发送消息 (Ctrl+Enter)"
      :disabled="disabled"
      @keydown="onKey"
    />
    <div class="actions">
      <el-upload
        ref="uploadRef"
        :show-file-list="false"
        :disabled="disabled"
        :before-upload="beforeUpload"
      >
        <el-button :icon="Plus" circle class="upload-btn" />
      </el-upload>
      <el-button
        data-test="send"
        class="send-btn"
        type="primary"
        :disabled="disabled || !draft.trim()"
        @click="emitSend"
      >
        发送
      </el-button>
    </div>
  </div>
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
.message-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.el-input {
  flex: 1;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions :deep(.el-button) {
  height: 36px;
}
</style>
