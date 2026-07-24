import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  setTokenExpires,
  isTokenExpiringSoon,
  clearAuth
} from '@/utils/auth'
import router from '@/router'

const RAG_API_BASE = '/rag-api'

const ragAxios = axios.create({
  baseURL: RAG_API_BASE,
  timeout: 120000
})

let isRefreshing = false
let refreshQueue = []

const refreshToken = () => {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    return Promise.reject(new Error('no refresh token'))
  }
  return axios.post('/api/auth/refresh', {
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
let authFailed = false

const handleUnauthorized = (message, forceDialog = false) => {
  if (isHandlingLogout) return
  if (authFailed && !forceDialog) return

  isHandlingLogout = true
  authFailed = true

  const msg = message || 'RAG服务认证已过期，请重新登录'

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
    authFailed = false
  })
}

const resetAuthFailed = () => {
  authFailed = false
}

ragAxios.interceptors.request.use(
  async (config) => {
    const token = getToken()
    if (token) {
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
    }
    return config
  },
  (error) => {
    console.error('RAG请求错误:', error)
    return Promise.reject(error)
  }
)

ragAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      const config = error.config

      if (status === 401) {
        if (!config?.silentAuth) {
          handleUnauthorized(data?.message || 'RAG服务认证已过期，请重新登录')
        }
      } else if (status === 403) {
        const msg = data?.message || '配额已用完或无权限访问'
        if (!config?.silentAuth) {
          ElMessage.warning(msg)
        }
      } else if (status === 429) {
        const msg = data?.message || '请求过于频繁，请稍后再试'
        if (!config?.silentAuth) {
          ElMessage.warning(msg)
        }
      } else if (status === 500) {
        console.error('RAG服务内部错误:', data?.message)
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('RAG请求超时')
    } else {
      console.error('RAG网络异常:', error.message)
    }
    return Promise.reject(error)
  }
)

export const ragApi = {
  getModels(silent = true) {
    return ragAxios.get('/chat/models', { silentAuth: silent })
  },

  query(question, modelId, sessionId) {
    return ragAxios.post('/chat/query', {
      question,
      modelId,
      sessionId
    })
  },

  queryStream(question, modelId, sessionId, callbacks = {}) {
    const {
      onSession, onModel, onContent,
      onReferences, onDone, onError
    } = callbacks

    let answer = ''

    console.log('[SSE] Starting stream request, question:', question)

    fetch(`${RAG_API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${getToken() || ''}`
      },
      body: JSON.stringify({ question, modelId, sessionId })
    }).then(async response => {
      console.log('[SSE] Response:', response.status, response.statusText)
      console.log('[SSE] Content-Type:', response.headers.get('content-type'))

      if (!response.ok) {
        let errorMsg = `请求失败 (${response.status})`
        try {
          const text = await response.text()
          const parsed = JSON.parse(text)
          errorMsg = parsed.message || errorMsg
        } catch {
          // 响应不是 JSON，使用默认错误信息
        }

        if (response.status === 401) {
          handleUnauthorized(errorMsg)
        } else if (response.status === 403) {
          ElMessage.warning(errorMsg || '今日配额已用完，请明天再试')
        } else if (response.status === 429) {
          ElMessage.warning(errorMsg || '请求过于频繁，请稍后再试')
        }

        throw new Error(errorMsg)
      }

      if (!response.body) {
        throw new Error('SSE not supported: response.body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let currentEvent = 'message'  // 默认事件类型
      let currentData = ''          // 当前事件的数据（可能跨多行）

      console.log('[SSE] Reader created, starting to read...')

      /**
       * 处理一个完整的 SSE 事件
       * SSE 格式规范：
       *   event: 事件名
       *   data: 数据内容（可以有多行）
       *   （空行表示事件结束）
       */
      const dispatchEvent = () => {
        if (currentData === '') return  // 没有数据，忽略

        const data = currentData

        console.log('[SSE] Event:', currentEvent, ', data length:', data.length)

        switch (currentEvent) {
          case 'session':
            console.log('[SSE] Session:', data)
            if (onSession) onSession(data)
            break

          case 'model':
            console.log('[SSE] Model:', data)
            if (onModel) onModel(data)
            break

          case 'content':
            answer += data
            console.log('[SSE] Content, total length:', answer.length)
            if (onContent) onContent(answer)
            break

          case 'references':
            try {
              const refs = JSON.parse(data)
              console.log('[SSE] References:', refs.length, 'items')
              if (onReferences) onReferences(Array.isArray(refs) ? refs : [])
            } catch (e) {
              console.error('[SSE] Failed to parse references:', e)
              if (onReferences) onReferences([])
            }
            break

          case 'done':
            try {
              const doneInfo = JSON.parse(data)
              console.log('[SSE] Done:', doneInfo)
              if (onDone) {
                onDone({
                  answer,
                  answerLength: doneInfo.answerLength || answer.length
                })
              }
            } catch (e) {
              console.log('[SSE] Done (raw):', data)
              if (onDone) onDone({ answer })
            }
            break

          case 'error':
            console.error('[SSE] Error event:', data)
            if (onError) onError(new Error(data))
            break

          default:
            // 未知事件，作为 content 处理
            answer += data
            if (onContent) onContent(answer)
            break
        }

        // 重置当前事件
        currentEvent = 'message'
        currentData = ''
      }

      /**
       * 处理一行 SSE 数据
       */
      const processLine = (line) => {
        // 空行表示事件结束
        if (line === '') {
          dispatchEvent()
          return
        }

        // event: 事件名
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
          return
        }

        // data: 数据内容
        if (line.startsWith('data:')) {
          const dataPart = line.slice(5).trim()
          if (currentData) {
            currentData += '\n' + dataPart  // 多行数据用换行连接
          } else {
            currentData = dataPart
          }
          return
        }

        // 其他行（注释等），忽略
        console.log('[SSE] Ignored line:', line)
      }

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('[SSE] Stream ended')
            // 流结束，处理剩余的 buffer
            if (buffer.trim() !== '') {
              const lines = buffer.split('\n')
              for (const line of lines) {
                processLine(line.trim())
              }
            }
            return
          }

          const text = decoder.decode(value, { stream: true })
          buffer += text

          // 按换行符分割
          let lineEndIndex
          while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, lineEndIndex).trim()
            buffer = buffer.slice(lineEndIndex + 1)
            processLine(line)
          }

          read()
        }).catch(error => {
          console.error('[SSE] Read error:', error)
          if (onError) onError(error)
        })
      }

      read()
    }).catch(error => {
      console.error('[SSE] Fetch error:', error)
      if (onError) onError(error)
    })

    return { close: () => {} }
  },

  clearSession(sessionId) {
    return ragAxios.delete(`/chat/session/${sessionId}`)
  },

  uploadDocument(file, category) {
    const formData = new FormData()
    formData.append('file', file)
    if (category) {
      formData.append('category', category)
    }
    return ragAxios.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getDocuments(page = 1, size = 10, silent = true) {
    return ragAxios.get('/documents/list', {
      params: { page, size },
      silentAuth: silent
    })
  },

  getDocument(docId) {
    return ragAxios.get(`/documents/${docId}`)
  },

  deleteDocument(docId) {
    return ragAxios.delete(`/documents/${docId}`)
  },

  getCurrentQuota(silent = true) {
    return ragAxios.get('/quota/current', { silentAuth: silent })
  },

  getQuotaUsage(page = 1, size = 10, params = {}) {
    return ragAxios.get('/quota/usage', {
      params: { page, size, ...params }
    })
  },

  getQuotaStats(params = {}) {
    return ragAxios.get('/quota/stats', { params })
  },

  resetAuthFailed() {
    return resetAuthFailed()
  }
}

export default ragApi
