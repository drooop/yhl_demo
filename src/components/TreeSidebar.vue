<template>
  <el-tree-v2
    v-if="tree.length"
    :data="tree"
    :props="props"
    highlight-current
    node-key="id"
    @node-click="onClick"
    style="width:100%; height:100%"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['select'])
const tree = ref([])
const props = { label: 'label', children: 'children' }

onMounted(async () => {
  const res = await fetch('/tree.json')
  tree.value = await res.json()
})

function onClick(data, node) {
  const segments = []
  let n = node
  while (n && n.level > 1) {
    segments.unshift({ type: n.data.type, label: n.data.label })
    n = n.parent
  }
  const items = segments.map((seg, idx) => {
    const path = '/main' + segments.slice(0, idx + 1).map(s => `/${s.type}/${encodeURIComponent(s.label)}`).join('')
    return { label: seg.label, path }
  })
  emit('select', items)
}
</script>

