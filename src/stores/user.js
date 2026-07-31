import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo, logout } from '@/api/auth'
import { getCurrentMenus } from '@/api/menu'
import {
  getToken,
  setToken,
  setRefreshToken,
  setTokenExpires,
  clearAuth
} from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const username = ref('')
  const realName = ref('')
  const roleIds = ref([])
  const roleNames = ref([])
  const roleCodes = ref([])
  const permissions = ref([])
  const userId = ref(null)
  const avatar = ref('')
  const totalArea = ref(0)
  const totalTaskCount = ref(0)
  const menus = ref([])

  async function userLogin(loginForm) {
    const res = await login(loginForm)
    token.value = res.data.token
    setToken(res.data.token)
    if (res.data.refreshToken) {
      setRefreshToken(res.data.refreshToken)
    }
    if (res.data.expiresIn) {
      setTokenExpires(res.data.expiresIn)
    }

    username.value = res.data.username || ''
    realName.value = res.data.realName || ''
    userId.value = res.data.userId || null
    avatar.value = res.data.avatar || ''

    roleIds.value = res.data.roleIds || []
    roleNames.value = res.data.roleNames || []
    roleCodes.value = res.data.roleCodes || []
    permissions.value = res.data.permissions || []

    await fetchMenus()

    return res
  }

  async function getUserInfoAction() {
    const res = await getUserInfo()
    username.value = res.data.username || ''
    realName.value = res.data.realName || ''
    userId.value = res.data.userId || null
    avatar.value = res.data.avatar || ''

    roleIds.value = res.data.roleIds || []
    roleNames.value = res.data.roleNames || []
    roleCodes.value = res.data.roleCodes || []
    permissions.value = res.data.permissions || []

    totalArea.value = res.data.totalArea || 0
    totalTaskCount.value = res.data.totalTaskCount || 0

    await fetchMenus()

    return res.data
  }

  async function userLogout() {
    try {
      await logout()
    } catch (e) {
      console.warn('后端登出接口调用失败:', e)
    }
    
    resetState()
    clearAuth()
    window.location.replace('/login')
  }

  function resetState() {
    token.value = ''
    username.value = ''
    realName.value = ''
    roleIds.value = []
    roleNames.value = []
    roleCodes.value = []
    permissions.value = []
    userId.value = null
    avatar.value = ''
    totalArea.value = 0
    totalTaskCount.value = 0
    menus.value = []
  }

  async function fetchMenus() {
    try {
      const res = await getCurrentMenus()
      menus.value = res.data || []
    } catch (e) {
      console.warn('获取菜单失败:', e)
      menus.value = []
    }
  }

  return {
    token,
    username,
    realName,
    roleIds,
    roleNames,
    roleCodes,
    permissions,
    userId,
    avatar,
    totalArea,
    totalTaskCount,
    menus,
    userLogin,
    getUserInfo: getUserInfoAction,
    userLogout,
    resetState,
    fetchMenus
  }
})
