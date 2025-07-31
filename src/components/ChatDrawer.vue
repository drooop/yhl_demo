<template>
  <el-drawer
    title="管理总线"
    v-model="modelValue"
    size="100%"
    direction="rtl"
    close-on-press-escape
    close-delay="200"
    show-close="true"
  >
    <ChatView />
  </el-drawer>
</template>

<script setup>
import { computed } from "vue";
import ChatView from "./ChatView.vue";

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue"]);

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(v) {
    emit("update:modelValue", v);
  },
});
</script>

<style scoped></style>
