import { createRouter, createWebHistory } from 'vue-router'
import { getToken, removeToken, removeUserInfo } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const whiteList = ['/login', '/rag/chat']

const alwaysAllowPaths = ['/system/user/form', '/system/profile']

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
        meta: { title: '任务管理', icon: 'List' },
        children: [
          {
            path: 'list',
            name: 'TaskList',
            component: () => import('@/views/task/TaskList.vue'),
            meta: { title: '任务列表' }
          },
          {
            path: 'create/:id?',
            name: 'TaskCreate',
            component: () => import('@/views/task/TaskCreate.vue'),
            meta: { title: '创建任务' }
          },
          {
            path: 'detail/:id',
            name: 'TaskDetail',
            component: () => import('@/views/task/TaskDetail.vue'),
            meta: { title: '任务详情' }
          }
        ]
      },
      {
        path: 'pilot',
        name: 'Pilot',
        redirect: '/pilot/list',
        meta: { title: '飞手管理', icon: 'User' },
        children: [
          {
            path: 'list',
            name: 'PilotList',
            component: () => import('@/views/pilot/PilotList.vue'),
            meta: { title: '飞手列表' }
          },
          {
            path: 'form/:id?',
            name: 'PilotForm',
            component: () => import('@/views/pilot/PilotForm.vue'),
            meta: { title: '飞手表单' }
          }
        ]
      },
      {
        path: 'customer',
        name: 'Customer',
        redirect: '/customer/list',
        meta: { title: '客户管理', icon: 'Avatar' },
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customer/CustomerList.vue'),
            meta: { title: '客户列表' }
          },
          {
            path: 'form/:id?',
            name: 'CustomerForm',
            component: () => import('@/views/customer/CustomerForm.vue'),
            meta: { title: '客户表单' }
          }
        ]
      },
      {
        path: 'farmland',
        name: 'Farmland',
        redirect: '/farmland/list',
        meta: { title: '地块管理', icon: 'MapLocation' },
        children: [
          {
            path: 'list',
            name: 'FarmlandList',
            component: () => import('@/views/farmland/FarmlandList.vue'),
            meta: { title: '地块列表' }
          },
          {
            path: 'form/:id?',
            name: 'FarmlandForm',
            component: () => import('@/views/farmland/FarmlandForm.vue'),
            meta: { title: '地块表单' }
          }
        ]
      },
      {
        path: 'drone',
        name: 'Drone',
        redirect: '/drone/list',
        meta: { title: '无人机管理', icon: 'Position' },
        children: [
          {
            path: 'list',
            name: 'DroneList',
            component: () => import('@/views/drone/DroneList.vue'),
            meta: { title: '无人机列表' }
          },
          {
            path: 'form/:id?',
            name: 'DroneForm',
            component: () => import('@/views/drone/DroneForm.vue'),
            meta: { title: '无人机表单' }
          }
        ]
      },
      {
        path: 'battery',
        name: 'Battery',
        redirect: '/battery/list',
        meta: { title: '电池管理', icon: 'Lightning' },
        children: [
          {
            path: 'list',
            name: 'BatteryList',
            component: () => import('@/views/battery/BatteryList.vue'),
            meta: { title: '电池列表' }
          }
        ]
      },
      {
        path: 'pesticide',
        name: 'Pesticide',
        redirect: '/pesticide/list',
        meta: { title: '药剂管理', icon: 'Box' },
        children: [
          {
            path: 'list',
            name: 'PesticideList',
            component: () => import('@/views/pesticide/PesticideList.vue'),
            meta: { title: '药剂列表' }
          },
          {
            path: 'form/:id?',
            name: 'PesticideForm',
            component: () => import('@/views/pesticide/PesticideForm.vue'),
            meta: { title: '药剂表单' }
          }
        ]
      },
      {
        path: 'settlement',
        name: 'Settlement',
        redirect: '/settlement/list',
        meta: { title: '结算管理', icon: 'Money' },
        children: [
          {
            path: 'list',
            name: 'SettlementList',
            component: () => import('@/views/settlement/SettlementList.vue'),
            meta: { title: '结算列表' }
          }
        ]
      },
      {
        path: 'price',
        name: 'Price',
        redirect: '/price/list',
        meta: { title: '定价管理', icon: 'Wallet' },
        children: [
          {
            path: 'list',
            name: 'PriceList',
            component: () => import('@/views/price/PriceList.vue'),
            meta: { title: '定价列表' }
          }
        ]
      },
      {
        path: 'report',
        name: 'Report',
        redirect: '/report/performance',
        meta: { title: '报表统计', icon: 'DataAnalysis' },
        children: [
          {
            path: 'performance',
            name: 'PerformanceReport',
            component: () => import('@/views/report/PerformanceReport.vue'),
            meta: { title: '飞手绩效' }
          },
          {
            path: 'drone-usage',
            name: 'DroneUsageReport',
            component: () => import('@/views/report/DroneUsageReport.vue'),
            meta: { title: '无人机利用率' }
          },
          {
            path: 'pesticide',
            name: 'PesticideReport',
            component: () => import('@/views/report/PesticideReport.vue'),
            meta: { title: '药剂消耗' }
          },
          {
            path: 'monthly',
            name: 'MonthlyReport',
            component: () => import('@/views/report/MonthlyReport.vue'),
            meta: { title: '月度分析' }
          }
        ]
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'tenant',
            name: 'TenantList',
            component: () => import('@/views/system/TenantList.vue'),
            meta: { title: '租户管理' }
          },
          {
            path: 'user',
            name: 'UserList',
            component: () => import('@/views/system/UserList.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'user/form/:id?',
            name: 'UserForm',
            component: () => import('@/views/system/UserForm.vue'),
            meta: { title: '用户表单' }
          },
          {
            path: 'role',
            name: 'RoleList',
            component: () => import('@/views/system/RoleList.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'menu',
            name: 'MenuList',
            component: () => import('@/views/system/MenuList.vue'),
            meta: { title: '菜单管理' }
          },
          {
            path: 'log',
            name: 'Log',
            redirect: '/system/log/login',
            meta: { title: '日志管理' },
            children: [
              {
                path: 'login',
                name: 'LoginLog',
                component: () => import('@/views/log/LoginLog.vue'),
                meta: { title: '登录日志' }
              },
              {
                path: 'operation',
                name: 'OperationLog',
                component: () => import('@/views/log/OperationLog.vue'),
                meta: { title: '操作日志' }
              }
            ]
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/views/system/Profile.vue'),
            meta: { title: '个人中心' }
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

function extractMenuPaths(menus) {
  const paths = []
  if (!menus || menus.length === 0) return paths
  for (const menu of menus) {
    if (menu.path) {
      paths.push(menu.path)
    }
    if (menu.children && menu.children.length > 0) {
      paths.push(...extractMenuPaths(menu.children))
    }
  }
  return paths
}

function hasPermission(to) {
  const userStore = useUserStore()
  const allowedPaths = extractMenuPaths(userStore.menus)

  // 菜单未加载时，只允许访问 dashboard 和白名单
  if (allowedPaths.length === 0) {
    return to.path === '/dashboard' || alwaysAllowPaths.some(p => to.path.startsWith(p))
  }

  for (const prefix of alwaysAllowPaths) {
    if (to.path.startsWith(prefix)) {
      return true
    }
  }

  // 精确匹配：路径等于菜单路径，或是菜单路径的子路径
  for (const menuPath of allowedPaths) {
    if (to.path === menuPath) {
      return true
    }
    if (to.path.startsWith(menuPath + '/')) {
      return true
    }
  }

  return false
}

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 植保笔记` : '植保笔记'
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      const userStore = useUserStore()
      if (!userStore.roleCodes || userStore.roleCodes.length === 0) {
        userStore.getUserInfo().then(() => {
          if (hasPermission(to)) {
            next()
          } else {
            next('/dashboard')
          }
        }).catch(() => {
          removeToken()
          removeUserInfo()
          userStore.resetState()
          next('/login')
        })
      } else {
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

export default router