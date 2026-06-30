<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="floating-button"
      :style="buttonStyle"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @click="handleClick"
    >
      <el-icon size="24"><ChatDotRound /></el-icon>
      <transition name="fade">
        <div v-if="showTooltip" class="tooltip">
          植保笔记
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const visible = ref(true)
const showTooltip = ref(false)
const expanded = ref(false)

const buttonStyle = computed(() => {
  return {
    right: '24px',
    bottom: expanded.value ? '120px' : '24px'
  }
})

const handleClick = () => {
  window.open('/rag/chat', '_blank')
}
</script>

<style scoped>
.floating-button {
  position: fixed;
  z-index: 9999;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

.tooltip {
  position: absolute;
  right: 68px;
  top: 50%;
  transform: translateY(-50%);
  background: #303133;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: #303133;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
