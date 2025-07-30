<template>
  <el-drawer :model-value="visible" @close="$emit('update:visible', false)" size="100%" direction="rtl">
    <template #header>
      <span>聊天</span>
    </template>
    <el-container style="height: 100%">
      <el-aside width="240px"><RoomList /></el-aside>
      <el-container>
        <el-main><ChatView /></el-main>
      </el-container>
    </el-container>
  </el-drawer>
</template>

<script setup>
import RoomList from './RoomList.vue'
import ChatView from './ChatView.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
</script>

