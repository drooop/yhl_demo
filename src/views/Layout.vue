<template>
  <el-container style="height: 100vh">
    <el-header class="app-header">
      <div class="left">
        <el-icon><House /></el-icon>
        <span class="title">yhl</span>
      </div>
      <div class="right">
        <el-icon @click="chatVisible = true" class="action"><ChatDotRound /></el-icon>
        <el-popover placement="bottom" trigger="click">
          <template #reference>
            <el-badge :value="invites.length" class="action">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </template>
          <div v-if="invites.length">
            <el-button v-for="r in invites" :key="r.roomId" text @click="acceptInvite(r)">
              {{ r.name || r.roomId }}
            </el-button>
          </div>
          <div v-else>暂无邀请</div>
        </el-popover>
        <el-dropdown>
          <span class="action"><el-icon><User /></el-icon></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="toSettings">用户设置</el-dropdown-item>
              <el-dropdown-item @click="logout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="240px"><TreeSidebar @select="onSelect" /></el-aside>
      <el-container>
        <div class="breadcrumb">
          <el-breadcrumb separator="->">
            <el-breadcrumb-item v-for="(c, i) in crumbs" :key="i">
              <a @click.prevent="navigate(i)">{{ c.label }}</a>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-main>
          <slot />
        </el-main>
      </el-container>
    </el-container>
    <ChatDrawer v-model="chatVisible" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, ChatDotRound, User, Bell } from '@element-plus/icons-vue'
import TreeSidebar from '../components/TreeSidebar.vue'
import ChatDrawer from '../components/ChatDrawer.vue'
import { useSessionStore } from '../stores/session'
import { useRoomStore } from '../stores/rooms'
import { joinRoom, refreshRooms } from '../api/matrix'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()
const rooms = useRoomStore()
const chatVisible = ref(false)
const invites = computed(() => rooms.invites)
const crumbs = computed(() => {
  const items = []
  const ws = route.params.workspace
  const pic = route.params.pic
  const worker = route.params.worker
  const model = route.params.model
  if (ws) {
    const wPath = `/workspace/${encodeURIComponent(ws)}`
    items.push({ label: ws, path: wPath })
    if (pic) {
      const pPath = `${wPath}/pic/${encodeURIComponent(pic)}`
      items.push({ label: pic, path: pPath })
      if (worker) {
        const woPath = `${pPath}/worker/${encodeURIComponent(worker)}`
        items.push({ label: worker, path: woPath })
        if (model) {
          const mPath = `${woPath}/model/${encodeURIComponent(model)}`
          items.push({ label: model, path: mPath })
        }
      }
    }
  }
  return items
})

function onSelect(items) {
  if (items.length) router.push(items[items.length - 1].path)
}

function navigate(i) {
  router.push(crumbs.value[i].path)
}

function logout() {
  session.logout()
  router.push('/login')
}

function toSettings() {
  router.push('/settings')
}

async function acceptInvite(room) {
  try {
    await ElMessageBox.confirm(`加入房间 ${room.name || room.roomId}?`, '邀请', {
      confirmButtonText: '接受',
      cancelButtonText: '取消'
    })
    await joinRoom(room.roomId)
    refreshRooms()
  } catch {}
}
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  display: flex;
  align-items: center;
}
.title {
  margin-left: 8px;
  font-weight: bold;
}
.right .action {
  margin-left: 16px;
  cursor: pointer;
}
.breadcrumb {
  padding: 16px;
}
</style>
