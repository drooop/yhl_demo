<template>
  <Layout v-if="showLayout">
    <router-view />
  </Layout>
  <router-view v-else />
  <CallLayer />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CallLayer from './components/CallLayer.vue'
import Layout from './views/Layout.vue'

const route = useRoute()
const showLayout = computed(() => route.path !== '/login')
</script>
