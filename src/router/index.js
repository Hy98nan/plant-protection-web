import { createRouter, createWebHistory } from 'vue-router'
import { getToken, removeToken, removeUserInfo } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const whiteList = ['/login', '/rag/chat']

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/rag/chat',
    name: 'RagChat',
    component: () => import('@/views/rag/Chat.vue'),
    meta: { title: '植保笔记' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { title: '首页', icon: 'Odometer' }
      },
      {
        path: 'task',
        name: 'Task',
        redirect: '/task/list',
        meta: { title: '任务管理', icon: 'List', roles: ['ADMIN', 'DISPATCHER', 'PILOT'] },
        children: [
          {
            path: 'list',
            name: 'TaskList',
            component: () => import('@/views/task/TaskList.vue'),
            meta: { title: '任务列表', roles: ['ADMIN', 'DISPATCHER', 'PILOT'] }
          },
          {
            path: 'create/:id?',
            name: 'TaskCreate',
            component: () => import('@/views/task/TaskCreate.vue'),
            meta: { title: '创建任务', roles: ['ADMIN', 'DISPATCHER'] }
          },
          {
            path: 'detail/:id',
            name: 'TaskDetail',
            component: () => import('@/views/task/TaskDetail.vue'),
            meta: { title: '任务详情', roles: ['ADMIN', 'DISPATCHER', 'PILOT'] }
          }
        ]
      },
      {
        path: 'pilot',
        name: 'Pilot',
        redirect: '/pilot/list',
        meta: { title: '飞手管理', icon: 'User', roles: ['ADMIN', 'DISPATCHER'] },
        children: [
          {
            path: 'list',
            name: 'PilotList',
            component: () => import('@/views/pilot/PilotList.vue'),
            meta: { title: '飞手列表', roles: ['ADMIN', 'DISPATCHER'] }
          },
          {
            path: 'form/:id?',
            name: 'PilotForm',
            component: () => import('@/views/pilot/PilotForm.vue'),
            meta: { title: '飞手表单', roles: ['ADMIN', 'DISPATCHER'] }
          }
        ]
      },
      {
        path: 'customer',
        name: 'Customer',
        redirect: '/customer/list',
        meta: { title: '客户管理', icon: 'Avatar', roles: ['ADMIN', 'DISPATCHER'] },
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customer/CustomerList.vue'),
            meta: { title: '客户列表', roles: ['ADMIN', 'DISPATCHER'] }
          },
          {
            path: 'form/:id?',
            name: 'CustomerForm',
            component: () => import('@/views/customer/CustomerForm.vue'),
            meta: { title: '客户表单', roles: ['ADMIN', 'DISPATCHER'] }
          }
        ]
      },
      {
        path: 'farmland',
        name: 'Farmland',
        redirect: '/farmland/list',
        meta: { title: '地块管理', icon: 'MapLocation', roles: ['ADMIN', 'DISPATCHER'] },
        children: [
          {
            path: 'list',
            name: 'FarmlandList',
            component: () => import('@/views/farmland/FarmlandList.vue'),
            meta: { title: '地块列表', roles: ['ADMIN', 'DISPATCHER'] }
          },
          {
            path: 'form/:id?',
            name: 'FarmlandForm',
            component: () => import('@/views/farmland/FarmlandForm.vue'),
            meta: { title: '地块表单', roles: ['ADMIN', 'DISPATCHER'] }
          }
        ]
      },
      {
        path: 'drone',
        name: 'Drone',
        redirect: '/drone/list',
        meta: { title: '无人机管理', icon: 'Position', roles: ['ADMIN', 'DISPATCHER'] },
        children: [
          {
            path: 'list',
            name: 'DroneList',
            component: () => import('@/views/drone/DroneList.vue'),
            meta: { title: '无人机列表', roles: ['ADMIN', 'DISPATCHER'] }
          },
          {
            path: 'form/:id?',
            name: 'DroneForm',
            component: () => import('@/views/drone/DroneForm.vue'),
            meta: { title: '无人机表单', roles: ['ADMIN', 'DISPATCHER'] }
          }
        ]
      },
      {
        path: 'battery',
        name: 'Battery',
        redirect: '/battery/list',
        meta: { title: '电池管理', icon: 'Lightning', roles: ['ADMIN', 'DISPATCHER'] },
        children: [
          {
            path: 'list',
            name: 'BatteryList',
            component: () => import('@/views/battery/BatteryList.vue'),
            meta: { title: '电池列表', roles: ['ADMIN', 'DISPATCHER'] }
          }
        ]
      },
      {
        path: 'pesticide',
        name: 'Pesticide',
        redirect: '/pesticide/list',
        meta: { title: '药剂管理', icon: 'Box', roles: ['ADMIN', 'DISPATCHER'] },
        children: [
          {
            path: 'list',
            name: 'PesticideList',
            component: () => import('@/views/pesticide/PesticideList.vue'),
            meta: { title: '药剂列表', roles: ['ADMIN', 'DISPATCHER'] }
          },
          {
            path: 'form/:id?',
            name: 'PesticideForm',
            component: () => import('@/views/pesticide/PesticideForm.vue'),
            meta: { title: '药剂表单', roles: ['ADMIN', 'DISPATCHER'] }
          }
        ]
      },
      {
        path: 'settlement',
        name: 'Settlement',
        redirect: '/settlement/list',
        meta: { title: '结算管理', icon: 'Money', roles: ['ADMIN', 'FINANCE'] },
        children: [
          {
            path: 'list',
            name: 'SettlementList',
            component: () => import('@/views/settlement/SettlementList.vue'),
            meta: { title: '结算列表', roles: ['ADMIN', 'FINANCE'] }
          }
        ]
      },
      {
        path: 'report',
        name: 'Report',
        redirect: '/report/performance',
        meta: { title: '报表统计', icon: 'DataAnalysis', roles: ['ADMIN', 'FINANCE'] },
        children: [
          {
            path: 'performance',
            name: 'PerformanceReport',
            component: () => import('@/views/report/PerformanceReport.vue'),
            meta: { title: '飞手绩效', roles: ['ADMIN', 'FINANCE'] }
          },
          {
            path: 'drone-usage',
            name: 'DroneUsageReport',
            component: () => import('@/views/report/DroneUsageReport.vue'),
            meta: { title: '无人机利用率', roles: ['ADMIN', 'FINANCE'] }
          },
          {
            path: 'pesticide',
            name: 'PesticideReport',
            component: () => import('@/views/report/PesticideReport.vue'),
            meta: { title: '药剂消耗', roles: ['ADMIN', 'FINANCE'] }
          },
          {
            path: 'monthly',
            name: 'MonthlyReport',
            component: () => import('@/views/report/MonthlyReport.vue'),
            meta: { title: '月度分析', roles: ['ADMIN', 'FINANCE'] }
          }
        ]
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting', roles: ['ADMIN'] },
        children: [
          {
            path: 'user',
            name: 'UserList',
            component: () => import('@/views/system/UserList.vue'),
            meta: { title: '用户管理', roles: ['ADMIN'] }
          },
          {
            path: 'user/form/:id?',
            name: 'UserForm',
            component: () => import('@/views/system/UserForm.vue'),
            meta: { title: '用户表单', roles: ['ADMIN'] }
          },
          {
            path: 'role',
            name: 'RoleList',
            component: () => import('@/views/system/RoleList.vue'),
            meta: { title: '角色管理', roles: ['ADMIN'] }
          },
          {
            path: 'menu',
            name: 'MenuList',
            component: () => import('@/views/system/MenuList.vue'),
            meta: { title: '菜单管理', roles: ['ADMIN'] }
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/views/system/Profile.vue'),
            meta: { title: '个人中心', hidden: true }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 植保笔记` : '植保笔记'
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      const userStore = useUserStore()
      // 判断用户是否已加载角色信息
      if (!userStore.roleCodes || userStore.roleCodes.length === 0) {
        userStore.getUserInfo().then(() => {
          // 权限判断
          if (hasPermission(to)) {
            next()
          } else {
            next('/dashboard')
          }
        }).catch(() => {
          // 获取用户信息失败，说明 token 无效，清除所有登录状态
          removeToken()
          removeUserInfo()
          userStore.resetState()
          next('/login')
        })
      } else {
        // 权限判断
        if (hasPermission(to)) {
          next()
        } else {
          next('/dashboard')
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

// 权限判断函数
function hasPermission(to) {
  const userStore = useUserStore()
  const { roles } = to.meta
  // 如果没有设置角色要求，则允许访问
  if (!roles || roles.length === 0) {
    return true
  }
  // 超级管理员拥有所有权限
  if (userStore.roleCodes && userStore.roleCodes.includes('SUPER_ADMIN')) {
    return true
  }
  // 检查用户角色是否匹配路由要求的角色
  if (userStore.roleCodes && roles.some(role => userStore.roleCodes.includes(role))) {
    return true
  }
  return false
}

export default router