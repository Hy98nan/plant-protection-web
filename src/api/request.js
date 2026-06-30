import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  setTokenExpires,
  clearAuth
} from '@/utils/auth'
import router from '@/router'

const getBaseURL = () => {
  try {
    const storedHost = localStorage.getItem('serverHost')
    if (storedHost) {
      return storedHost + '/api'
    }
  } catch (e) {
    // ignore
  }
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000
})

let isRefreshing = false
let refreshQueue = []

const refreshToken = () => {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    return Promise.reject(new Error('no refresh token'))
  }
  return axios.post(getBaseURL() + '/auth/refresh', {
    refreshToken: refreshTokenValue
  })
}

const processQueue = (error, token = null) => {
  refreshQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  refreshQueue = []
}

let isHandlingLogout = false

const handleUnauthorized = (message) => {
  if (isHandlingLogout) return
  isHandlingLogout = true

  const msg = message || '登录已过期，请重新登录'

  clearAuth()

  ElMessageBox.confirm(msg, '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
    showClose: false
  }).then(() => {
    router.push('/login')
    isHandlingLogout = false
  }).catch(() => {
    isHandlingLogout = false
    router.push('/login')
  })
}

service.interceptors.request.use(
  async (config) => {
    const token = getToken()
    if (token) {
      if (config.url !== '/auth/refresh' && config.url !== '/auth/login') {
        const { isTokenExpiringSoon } = await import('@/utils/auth')
        if (isTokenExpiringSoon()) {
          if (!isRefreshing) {
            isRefreshing = true
            try {
              const res = await refreshToken()
              if (res.data.code === 200) {
                const data = res.data.data
                setToken(data.token)
                setRefreshToken(data.refreshToken)
                setTokenExpires(data.expiresIn)
                config.headers['Authorization'] = `Bearer ${data.token}`
                processQueue(null, data.token)
              } else {
                processQueue(new Error(res.data.message || 'refresh failed'))
              }
            } catch (e) {
              processQueue(e)
            } finally {
              isRefreshing = false
            }
          } else {
            await new Promise((resolve, reject) => {
              refreshQueue.push({ resolve, reject })
            }).then(newToken => {
              config.headers['Authorization'] = `Bearer ${newToken}`
            }).catch(() => {
              return Promise.reject(new Error('token refresh failed'))
            })
          }
        } else {
          config.headers['Authorization'] = `Bearer ${token}`
        }
      } else {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200 && res.code !== 0) {
      if (res.code === 401) {
        handleUnauthorized(res.message || '登录已过期，请重新登录')
      } else {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  async (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        handleUnauthorized('登录已过期，请重新登录')
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('请求资源不存在')
      } else if (status === 500) {
        ElMessage.error('服务器内部错误')
      } else {
        ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络连接异常，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default service
