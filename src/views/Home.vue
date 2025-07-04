<template>
  <el-container style="height: 100vh">
    <el-aside width="240px"><RoomList /></el-aside>
    <el-container>
      <el-main><ChatView /></el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import RoomList from "../components/RoomList.vue";
import ChatView from "../components/ChatView.vue";
</script>
