<template>
  <Layout>
    <router-view />
  </Layout>
  <CallLayer />
</template>

<script setup>
import CallLayer from './components/CallLayer.vue';
import Layout from './views/Layout.vue';
</script>
