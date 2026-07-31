<template>
  <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
    <div class="logo-container">
      <el-icon :size="28" color="#409EFF"><Position /></el-icon>
      <span v-show="!isCollapse" class="logo-text">植保笔记</span>
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#409EFF"
        router
      >
        <menu-item
          v-for="route in menuRoutes"
          :key="route.fullPath"
          :menu="route"
        />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MenuItem from './MenuItem.vue'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  return route.path
})

function transformMenus(menus, parentPath = '') {
  if (!menus || menus.length === 0) return []
  return menus
    .filter(m => m.visible === 1 && m.status === 1 && m.menuType !== 'button')
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map(m => {
      const fullPath = m.path || ''
      let relativePath = fullPath
      if (parentPath && fullPath.startsWith(parentPath + '/')) {
        relativePath = fullPath.substring(parentPath.length + 1)
      } else if (parentPath && fullPath === parentPath) {
        relativePath = ''
      } else {
        relativePath = fullPath.replace(/^\//, '')
      }

      const childRoute = {
        path: relativePath,
        fullPath: fullPath,
        meta: {
          title: m.menuName,
          icon: m.icon || undefined
        }
      }

      if (m.children && m.children.length > 0) {
        const transformedChildren = transformMenus(m.children, fullPath)
        if (transformedChildren.length > 0) {
          childRoute.children = transformedChildren
        }
      }

      return childRoute
    })
}

const menuRoutes = computed(() => {
  const menus = userStore.menus || []
  return transformMenus(menus)
})
</script>

<style scoped>
.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #ffffff1a;
  padding: 0 16px;
  white-space: nowrap;
  overflow: hidden;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.el-menu {
  border-right: none;
}

.el-menu-item.is-active {
  background-color: #409EFF20 !important;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 0;
}

:deep(.el-scrollbar) {
  height: calc(100vh - 60px);
}
</style>