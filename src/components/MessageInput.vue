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

<script setup>
import { ref } from "vue";
import { Paperclip, Position } from "@element-plus/icons-vue";

const props = defineProps({
  disabled: Boolean,
});
const emit = defineEmits(["send", "upload"]);

const draft = ref("");

function emitSend() {
  if (!draft.value.trim()) return;
  emit("send", draft.value.trim());
  draft.value = "";
}

function onKey(e) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    emitSend();
  }
}

/* 上传前钩子-直接把 file 对象交给父组件 */
function beforeUpload(file) {
  emit("upload", file);
  return false; // 阻止 el-upload 自动提交
}
</script>

<style scoped>
/* 让 textarea 与按钮在同一行 */
:deep(.el-input__wrapper) {
  display: flex;
  align-items: center;
}
</style>
