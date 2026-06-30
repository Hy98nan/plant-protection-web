<template>
  <router-view />
  <FloatingButton v-if="showFloatingButton" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import FloatingButton from '@/components/FloatingButton.vue'

const route = useRoute()
const settingsStore = useSettingsStore()

const showFloatingButton = computed(() => {
  return settingsStore.showFloatingButton 
    && route.path !== '/login' 
    && route.path !== '/rag/chat'
})
</script>

<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  background-color: #f0f2f5;
}
</style>
