<template>
  <el-card class="login">
    <el-form @submit.prevent="onLogin">
      <el-form-item label="Homeserver">
        <el-input v-model="hs" placeholder="https://matrix.org" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="user" placeholder="@user:example.com" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="pwd" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginHomeserver } from "../api/matrix";

// const hs = ref("https://nsynapse.lexon.tq.i3s.io"); // 示例
// const user = ref("@drop:nr.lexon.tq.i3s.io");
const hs = ref("https://synapse.m2m.yhlcps.com");
const user = ref("@bot:m2m.yhlcps.com");
const pwd = ref("TQcps@123_");
const rt = useRouter();

async function onLogin() {
  await loginHomeserver({
    baseUrl: hs.value,
    user: user.value,
    password: pwd.value,
  });
  rt.push("/chat");
}
</script>

<style scoped>
.login {
  width: 400px;
  margin: 120px auto;
}
</style>
