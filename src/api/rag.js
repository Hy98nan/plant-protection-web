import axios from 'axios'
import { getToken } from '@/utils/auth'

const RAG_API_BASE = '/rag-api'

const ragAxios = axios.create({
  baseURL: RAG_API_BASE,
  timeout: 120000
})

ragAxios.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export const ragApi = {
  getModels() {
    return ragAxios.get('/chat/models')
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
    }).then(response => {
      console.log('[SSE] Response:', response.status, response.statusText)
      console.log('[SSE] Content-Type:', response.headers.get('content-type'))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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

  getDocuments(page = 1, size = 10) {
    return ragAxios.get('/documents/list', {
      params: { page, size }
    })
  },

  getDocument(docId) {
    return ragAxios.get(`/documents/${docId}`)
  },

  deleteDocument(docId) {
    return ragAxios.delete(`/documents/${docId}`)
  }
}

export default ragApi
