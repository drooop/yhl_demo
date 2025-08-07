<template>
  <el-drawer
    v-model="modelValue"
    :with-header="false"
    size="100%"
    direction="rtl"
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

<style scoped>
</style>
