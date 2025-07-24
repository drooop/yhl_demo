<template>
  <div class="item-page">
    <h2>{{ $route.params.worker }}</h2>
    <iframe class="item-frame" src="http://www.baidu.com" />
  </div>
</template>

<script setup>
</script>

<style scoped>
.item-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.item-frame {
  flex: 1;
  border: none;
}
</style>
