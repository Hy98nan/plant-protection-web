<template>
  <el-header class="header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="$emit('toggle-sidebar')" :size="20">
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.meta?.title || item.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-badge :value="3" :max="99" class="notification-badge">
        <el-icon :size="20" class="header-icon"><Bell /></el-icon>
      </el-badge>
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.avatar || undefined">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ userStore.username || '用户' }}</span>
          <el-tag size="small" type="primary">{{ roleLabel }}</el-tag>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>修改密码
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dialog v-model="settingsDialogVisible" title="设置" width="480px">
      <div class="settings-content">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">显示悬浮客服按钮</div>
            <div class="setting-desc">在页面右下角显示植保笔记悬浮快捷入口</div>
          </div>
          <el-switch v-model="showFloatingButton" @change="saveSettings" />
        </div>
      </div>
    </el-dialog>
  </el-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { ROLE_MAP } from '@/utils/constants'
import { ElMessageBox, ElMessage } from 'element-plus'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const settingsDialogVisible = ref(false)

const showFloatingButton = computed({
  get: () => settingsStore.showFloatingButton,
  set: (val) => settingsStore.updateShowFloatingButton(val)
})

const roleLabel = computed(() => {
  if (!userStore.roleNames || userStore.roleNames.length === 0) {
    return ''
  }
  return userStore.roleNames.join(', ')
})

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
})

async function handleCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.userLogout()
    } catch (e) {
      // 取消
    }
  } else if (command === 'profile') {
    router.push('/system/profile')
  } else if (command === 'password') {
    ElMessage.info('修改密码功能已移至个人中心')
    router.push('/system/profile')
  } else if (command === 'settings') {
    settingsDialogVisible.value = true
  }
}
</script>

<style scoped>
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.header-icon:hover {
  color: #409EFF;
}

.notification-badge {
  line-height: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.settings-content {
  padding: 10px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  color: #909399;
}
</style>
