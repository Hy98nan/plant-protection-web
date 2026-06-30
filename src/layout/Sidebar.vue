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
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="route.children && route.children.length > 1" :index="route.path">
            <template #title>
              <el-icon><component :is="route.meta.icon" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="`${route.path}/${child.path}`"
            >
              <el-icon v-if="child.meta.icon"><component :is="child.meta.icon" /></el-icon>
              <span>{{ child.meta.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- 单子菜单或无子菜单 -->
          <el-menu-item
            v-else
            :index="route.children && route.children.length === 1 ? `${route.path}/${route.children[0].path}` : route.path"
          >
            <el-icon><component :is="route.meta.icon" /></el-icon>
            <template #title>
              <span>{{ route.meta.title }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

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

const allRoutes = [
  {
    path: '/dashboard',
    meta: { title: '首页', icon: 'Odometer', roles: ['ADMIN', 'DISPATCHER', 'PILOT', 'FINANCE'] }
  },
  {
    path: '/task',
    meta: { title: '任务管理', icon: 'List', roles: ['ADMIN', 'DISPATCHER', 'PILOT'] },
    children: [
      { path: 'list', meta: { title: '任务列表', roles: ['ADMIN', 'DISPATCHER', 'PILOT'] } },
      { path: 'create', meta: { title: '创建任务', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/pilot',
    meta: { title: '飞手管理', icon: 'User', roles: ['ADMIN', 'DISPATCHER'] },
    children: [
      { path: 'list', meta: { title: '飞手列表', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/customer',
    meta: { title: '客户管理', icon: 'Avatar', roles: ['ADMIN', 'DISPATCHER'] },
    children: [
      { path: 'list', meta: { title: '客户列表', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/farmland',
    meta: { title: '地块管理', icon: 'MapLocation', roles: ['ADMIN', 'DISPATCHER'] },
    children: [
      { path: 'list', meta: { title: '地块列表', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/drone',
    meta: { title: '无人机管理', icon: 'Position', roles: ['ADMIN', 'DISPATCHER'] },
    children: [
      { path: 'list', meta: { title: '无人机列表', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/battery',
    meta: { title: '电池管理', icon: 'Lightning', roles: ['ADMIN', 'DISPATCHER'] },
    children: [
      { path: 'list', meta: { title: '电池列表', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/pesticide',
    meta: { title: '药剂管理', icon: 'Box', roles: ['ADMIN', 'DISPATCHER'] },
    children: [
      { path: 'list', meta: { title: '药剂列表', roles: ['ADMIN', 'DISPATCHER'] } }
    ]
  },
  {
    path: '/settlement',
    meta: { title: '结算管理', icon: 'Money', roles: ['ADMIN', 'FINANCE'] },
    children: [
      { path: 'list', meta: { title: '结算列表', roles: ['ADMIN', 'FINANCE'] } }
    ]
  },
  {
    path: '/report',
    meta: { title: '报表统计', icon: 'DataAnalysis', roles: ['ADMIN', 'FINANCE'] },
    children: [
      { path: 'performance', meta: { title: '飞手绩效', roles: ['ADMIN', 'FINANCE'] } },
      { path: 'drone-usage', meta: { title: '无人机利用率', roles: ['ADMIN', 'FINANCE'] } },
      { path: 'pesticide', meta: { title: '药剂消耗', roles: ['ADMIN', 'FINANCE'] } },
      { path: 'monthly', meta: { title: '月度分析', roles: ['ADMIN', 'FINANCE'] } }
    ]
  },
  {
    path: '/system',
    meta: { title: '系统管理', icon: 'Setting', roles: ['ADMIN'] },
    children: [
      { path: 'user', meta: { title: '用户管理', roles: ['ADMIN'] } },
      { path: 'role', meta: { title: '角色管理', roles: ['ADMIN'] } },
      { path: 'menu', meta: { title: '菜单管理', roles: ['ADMIN'] } }
    ]
  }
]

const menuRoutes = computed(() => {
  const roleCodes = userStore.roleCodes || []
  // 超级管理员拥有所有菜单
  if (roleCodes.includes('SUPER_ADMIN')) {
    return allRoutes
  }
  return allRoutes.filter(r => {
    if (!r.meta.roles || r.meta.roles.length === 0) {
      return true
    }
    return r.meta.roles.some(role => roleCodes.includes(role))
  })
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
