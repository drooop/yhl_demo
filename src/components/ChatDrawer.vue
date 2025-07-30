<template>
  <el-drawer
    v-model="modelValue"
    title="房间信息"
    size="300"
    direction="rtl"
    :with-header="true"
  >
    <template v-if="room">
      <p><strong>ID:</strong> {{ room.roomId }}</p>
      <p><strong>成员:</strong></p>
      <el-list v-if="members.length">
        <el-list-item v-for="m in members" :key="m.userId">
          {{ m.name || m.userId }}
        </el-list-item>
      </el-list>
      <el-empty v-else description="暂无成员" />
    </template>
    <el-empty v-else description="请选择房间" />
  </el-drawer>
</template>

<script setup>
import { computed } from "vue";
import { useRoomStore } from "@/store/rooms";

const props = defineProps({
  modelValue: Boolean,
  room: Object,
});
const emit = defineEmits(["update:modelValue"]);

/* 双向绑定 */
const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(v) {
    emit("update:modelValue", v);
  },
});

const members = computed(() =>
  props.room ? Array.from(props.room.currentState.members.values()) : []
);
</script>

<style scoped></style>
