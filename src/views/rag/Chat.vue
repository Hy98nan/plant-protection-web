<template>
  <div class="rag-chat">
    <el-container class="rag-container">
      <el-aside width="260px" class="rag-sidebar">
        <div class="sidebar-header">
          <div class="header-title">
            <el-icon size="20" icon="folder-opened" />
            <span>笔记管理</span>
          </div>
          <el-button type="primary" size="small" icon="upload" @click="showUploadDialog = true">
            上传文档
          </el-button>
        </div>

        <div class="document-list">
          <div v-if="documents.length === 0" class="empty-docs">
            <el-empty description="暂无文档" :image-size="40" />
          </div>
          <div
            v-for="doc in documents"
            :key="doc.docId"
            class="document-item"
          >
            <div class="doc-info">
              <el-icon size="16" icon="document" />
              <span class="doc-name" :title="doc.fileName">{{ doc.fileName }}</span>
            </div>
            <div class="doc-meta">
              <el-tag size="small" :type="getStatusType(doc.status)">
                {{ getStatusText(doc.status) }}
              </el-tag>
              <span class="doc-chunks">{{ doc.chunkCount }}块</span>
            </div>
            <el-button
              type="danger"
              size="small"
              icon="delete"
              @click="handleDelete(doc.docId)"
            />
          </div>
        </div>

        <div class="sidebar-footer">
          <el-button size="small" icon="refresh" @click="loadDocuments" :loading="loadingDocs">
            刷新列表
          </el-button>
        </div>
      </el-aside>

      <el-main class="rag-main">
        <div class="chat-header">
          <div class="header-left">
            <el-icon size="24" color="#409eff" icon="message" />
            <h2>智能问答</h2>
            <el-button
              v-if="sessionId"
              size="small"
              type="warning"
              icon="refresh-right"
              @click="handleNewChat"
              class="new-chat-btn"
            >
              新对话
            </el-button>
          </div>
          <div class="header-right">
            <div class="mode-switch">
              <span class="mode-label" :class="{ active: !streamMode }">同步</span>
              <el-switch
                v-model="streamMode"
                size="small"
                inline-prompt
                active-text="流"
                inactive-text="同"
                @change="handleModeChange"
              />
              <span class="mode-label" :class="{ active: streamMode }">流式</span>
            </div>
            <el-select
              v-model="currentModelId"
              placeholder="选择模型"
              size="default"
              @change="handleModelChange"
              class="model-select"
            >
              <el-option
                v-for="model in models"
                :key="model.id"
                :label="model.name"
                :value="model.id"
              >
                <div class="model-option">
                  <span>{{ model.name }}</span>
                  <el-tag size="small" type="info">{{ model.provider }}</el-tag>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>

        <div class="chat-messages" ref="messagesRef">
          <div v-if="messages.length === 0" class="empty-chat">
            <div class="empty-icon">
              <el-icon size="80" color="#c0c4cc" icon="message" />
            </div>
            <p>开始向植保笔记提问吧</p>
            <div class="suggestions">
              <el-tag
                v-for="suggestion in suggestions"
                :key="suggestion"
                class="suggestion-tag"
                @click="sendMessage(suggestion)"
              >
                {{ suggestion }}
              </el-tag>
            </div>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.role]"
          >
            <div class="message-avatar">
              <el-icon v-if="msg.role === 'user'" size="20" icon="user" />
              <el-icon v-else size="20" icon="robot" />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
              <div v-if="msg.role === 'assistant' && msg.references && msg.references.length > 0" class="references">
                <div class="references-header" @click="msg.showReferences = !msg.showReferences">
                  <el-icon size="14" icon="document" />
                  <span>引用来源 ({{ msg.references.length }})</span>
                  <el-icon size="14" :icon="msg.showReferences ? 'arrow-up' : 'arrow-down'" />
                </div>
                <div v-show="msg.showReferences" class="references-list">
                  <div
                    v-for="ref in msg.references"
                    :key="ref.index"
                    class="reference-item"
                  >
                    <span class="ref-index">[{{ ref.index }}]</span>
                    <span class="ref-doc-name" v-if="ref.docName">{{ ref.docName }}</span>
                    <span class="ref-page">页码: {{ ref.page }}</span>
                    <span class="ref-score" v-if="ref.score">相似度: {{ (ref.score * 100).toFixed(1) }}%</span>
                    <p class="ref-content">{{ ref.content }}</p>
                  </div>
                </div>
              </div>
              <div class="message-meta">
                <span class="model-name" v-if="msg.modelId">{{ msg.modelId }}</span>
                <span class="response-time" v-if="msg.responseTime">
                  {{ msg.responseTime }}ms
                </span>
              </div>
            </div>
          </div>

          <div v-if="loading || streamLoading" class="message assistant loading">
            <div class="message-avatar">
              <el-icon size="20" icon="robot" />
            </div>
            <div class="message-content">
              <!-- 流式模式：显示加载动画 -->
              <div v-if="streamLoading" class="streaming-indicator">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="streaming-text">正在生成回答...</span>
              </div>
              <!-- 同步模式：显示打字动画 -->
              <div v-else class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入问题，按Enter发送，Shift+Enter换行"
            @keydown.enter.exact.prevent="handleSend"
            :disabled="loading"
            resize="none"
            class="chat-textarea"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              :loading="loading"
              @click="handleSend"
              :disabled="!inputText.trim()"
              class="send-btn"
            >
              <el-icon icon="send" />
              发送
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>

    <el-dialog
      v-model="showUploadDialog"
      title="上传文档"
      width="500px"
    >
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="5"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".pdf,.docx,.doc,.txt,.md"
        drag
        class="upload-area"
      >
        <el-icon class="upload-icon" icon="upload-filled" />
        <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="upload-tip">
            支持 PDF、DOCX、TXT、Markdown 格式，单个文件最大 20MB
          </div>
        </template>
      </el-upload>
      <el-form-item label="文档分类">
        <el-input v-model="uploadCategory" placeholder="可选，默认为 default" />
      </el-form-item>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploading">
          上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ragApi from '@/api/rag'
import { marked } from 'marked'

// 配置 marked 选项
marked.setOptions({
  breaks: true,  // 支持换行
  gfm: true      // GitHub Flavored Markdown
})

const messagesRef = ref(null)
const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const streamLoading = ref(false)
const models = ref([])
const currentModelId = ref('')
const sessionId = ref('')
const streamMode = ref(false)
const documents = ref([])
const loadingDocs = ref(false)

const showUploadDialog = ref(false)
const uploadRef = ref(null)
const fileList = ref([])
const uploadCategory = ref('')
const uploading = ref(false)

const suggestions = [
  '如何申请设备维修？',
  '农药使用规范有哪些？',
  '年假制度是怎么规定的？',
  '报销流程是什么？'
]

const loadModels = async () => {
  try {
    const res = await ragApi.getModels()
    if (res.data.code === 200) {
      models.value = res.data.data.models || []
      const defaultModel = res.data.data.defaultModel
      if (defaultModel) {
        currentModelId.value = defaultModel.id
      } else if (models.value.length > 0) {
        currentModelId.value = models.value[0].id
      }
    }
  } catch (e) {
    console.error('加载模型列表失败', e)
    ElMessage.warning('无法连接到RAG服务，请确保RAG服务已启动')
  }
}

const loadDocuments = async () => {
  loadingDocs.value = true
  try {
    const res = await ragApi.getDocuments(1, 100)
    if (res.data.code === 200) {
      documents.value = res.data.data || []
    }
  } catch (e) {
    console.error('加载文档列表失败', e)
  } finally {
    loadingDocs.value = false
  }
}

const handleModelChange = (modelId) => {
  localStorage.setItem('rag_model_id', modelId)
}

const handleModeChange = (val) => {
  localStorage.setItem('rag_stream_mode', val ? '1' : '0')
}

const handleSend = async () => {
  const text = inputText.value.trim()
  console.log('[Chat] handleSend called, text:', text, 'streamMode:', streamMode.value)
  if (!text || loading.value || streamLoading.value) {
    console.log('[Chat] handleSend early return, loading:', loading.value, 'streamLoading:', streamLoading.value)
    return
  }

  messages.value.push({
    role: 'user',
    content: text
  })

  inputText.value = ''
  await nextTick()
  scrollToBottom()

  if (streamMode.value) {
    console.log('[Chat] Calling handleStreamQuery')
    handleStreamQuery(text)
  } else {
    console.log('[Chat] Calling handleSyncQuery')
    await handleSyncQuery(text)
  }
}

/**
 * 同步问答模式 - 一次性获取完整答案
 */
const handleSyncQuery = async (text) => {
  loading.value = true

  try {
    const res = await ragApi.query(text, currentModelId.value, sessionId.value)
    if (res.data.code === 200) {
      const data = res.data.data
      if (data.sessionId) {
        sessionId.value = data.sessionId
      }
      messages.value.push({
        role: 'assistant',
        content: data.answer,
        references: data.references || [],
        modelId: data.modelId,
        responseTime: data.responseTime,
        showReferences: false
      })
    } else {
      messages.value.push({
        role: 'assistant',
        content: '抱歉，发生了错误：' + res.data.message,
        showReferences: false
      })
    }
  } catch (e) {
    console.error('查询失败', e)
    messages.value.push({
      role: 'assistant',
      content: '抱歉，无法连接到问答服务，请检查RAG服务是否启动',
      showReferences: false
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

/**
 * 流式问答模式 - 实时逐字显示答案
 */
const handleStreamQuery = (text) => {
  console.log('[Chat] handleStreamQuery called, streamMode:', streamMode.value, 'text:', text)
  streamLoading.value = true

  // 创建流式消息占位，content会实时更新
  const streamMsg = reactive({
    role: 'assistant',
    content: '',
    references: [],
    modelId: '',
    responseTime: 0,
    showReferences: false,
    isStreaming: true
  })
  messages.value.push(streamMsg)

  console.log('[Chat] Calling ragApi.queryStream...')

  ragApi.queryStream(text, currentModelId.value, sessionId.value, {
    onSession: (sid) => {
      console.log('[Chat] Session received:', sid)
      sessionId.value = sid
    },
    onModel: (modelId) => {
      console.log('[Chat] Model received:', modelId)
      streamMsg.modelId = modelId
    },
    onSearch: (info) => {
      console.log('[Chat] Search received:', info)
    },
    onContent: (content) => {
      console.log('[Chat] Content received, length:', content.length)
      // 实时更新消息内容
      streamMsg.content = content
      // 手动触发更新
      nextTick(() => scrollToBottom())
    },
    onReferences: (refs) => {
      console.log('[Chat] References received:', refs)
      streamMsg.references = refs || []
    },
    onDone: (result) => {
      console.log('[Chat] Done received:', result)
      streamMsg.isStreaming = false
      streamMsg.responseTime = result.answerLength || 0
      streamLoading.value = false
      nextTick(() => scrollToBottom())
    },
    onError: (error) => {
      console.error('[Chat] Error:', error)
      streamMsg.content = '抱歉，流式输出异常：' + error.message
      streamMsg.isStreaming = false
      streamLoading.value = false
      nextTick(() => scrollToBottom())
    }
  })
}

const sendMessage = async (text) => {
  if (loading.value || streamLoading.value) return
  inputText.value = text
  await handleSend()
}

const handleNewChat = async () => {
  if (sessionId.value) {
    try {
      await ragApi.clearSession(sessionId.value)
    } catch (e) {
      console.error('清除会话失败', e)
    }
  }
  sessionId.value = ''
  messages.value = []
  ElMessage.success('已开始新对话')
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const formatMessage = (content) => {
  if (!content) return ''

  // 预处理：处理换行符，确保 Markdown 段落正确
  let processed = content
    .replace(/\r\n/g, '\n')  // 统一换行符
    .replace(/\n{3,}/g, '\n\n')  // 超过2个换行合并为2个

  // 使用 marked 渲染 Markdown
  try {
    const html = marked.parse(processed)

    // 后处理：美化输出
    return html
      // 引用编号高亮
      .replace(/\[(\d+)\]/g, '<span class="ref-link">[$1]</span>')
      // 移除空段落
      .replace(/<p>\s*<\/p>/g, '')
  } catch (e) {
    // 如果解析失败，返回转义的原始文本
    return processed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\[(\d+)\]/g, '<span class="ref-link">[$1]</span>')
  }
}

const getStatusType = (status) => {
  const types = {
    SUCCESS: 'success',
    PROCESSING: 'warning',
    FAILED: 'danger',
    UPLOADING: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    SUCCESS: '已完成',
    PROCESSING: '处理中',
    FAILED: '失败',
    UPLOADING: '上传中'
  }
  return texts[status] || status
}

const handleFileChange = (file, files) => {
  fileList.value = files
}

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  let successCount = 0

  try {
    for (const file of fileList.value) {
      const res = await ragApi.uploadDocument(file.raw, uploadCategory.value)
      if (res.data.code === 200) {
        successCount++
      } else {
        ElMessage.error(`${file.name} 上传失败: ${res.data.message}`)
      }
    }

    if (successCount > 0) {
      ElMessage.success(`成功上传 ${successCount} 个文件`)
      showUploadDialog.value = false
      fileList.value = []
      uploadCategory.value = ''
      loadDocuments()
    }
  } catch (e) {
    console.error('上传失败', e)
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (docId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？删除后无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await ragApi.deleteDocument(docId)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      loadDocuments()
    } else {
      ElMessage.error('删除失败: ' + res.data.message)
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除失败', e)
    }
  }
}

onMounted(() => {
  const savedModelId = localStorage.getItem('rag_model_id')
  if (savedModelId) {
    currentModelId.value = savedModelId
  }
  const savedStreamMode = localStorage.getItem('rag_stream_mode')
  if (savedStreamMode !== null) {
    streamMode.value = savedStreamMode === '1'
  }
  loadModels()
  loadDocuments()
})
</script>

<style scoped>
.rag-chat {
  height: 100%;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.rag-container {
  height: 100%;
}

.rag-sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-docs {
  padding: 30px 20px;
  text-align: center;
}

.document-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  background: #fafafa;
  gap: 8px;
  transition: all 0.2s ease;
}

.document-item:hover {
  background: #f0f5ff;
  transform: translateX(2px);
}

.doc-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.doc-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #303133;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.doc-chunks {
  font-size: 12px;
  color: #909399;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
}

.rag-main {
  display: flex;
  flex-direction: column;
  padding: 0;
  background: #f0f2f5;
}

.chat-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.new-chat-btn {
  margin-left: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.mode-label {
  transition: color 0.3s;
}

.mode-label.active {
  color: #409eff;
  font-weight: 600;
}

.model-selector {
  display: flex;
  align-items: center;
}

.model-select {
  width: 200px;
}

.model-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-chat p {
  font-size: 15px;
  color: #606266;
}

.suggestions {
  margin-top: 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.suggestion-tag {
  cursor: pointer;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.suggestion-tag:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.message {
  display: flex;
  margin-bottom: 24px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.message-content {
  max-width: 70%;
  margin: 0 14px;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  padding: 14px 18px;
  border-radius: 16px;
  line-height: 1.6;
  word-break: break-word;
  font-size: 14px;
}

.message.user .message-text {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.2);
}

.message.assistant .message-text {
  background: #fff;
  color: #303133;
  border-bottom-left-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* Markdown 渲染样式 */
.message-text :deep(p) {
  margin: 0 0 12px 0;
  line-height: 1.7;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3),
.message-text :deep(h4) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: #303133;
}

.message-text :deep(h1) { font-size: 18px; }
.message-text :deep(h2) { font-size: 16px; }
.message-text :deep(h3) { font-size: 15px; }

.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-text :deep(li) {
  margin: 4px 0;
  line-height: 1.6;
}

.message-text :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #e6a23c;
}

.message-text :deep(pre) {
  background: #1e1e1e;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
  overflow-x: auto;
}

.message-text :deep(pre code) {
  background: none;
  padding: 0;
  color: #d4d4d4;
  font-size: 13px;
  line-height: 1.6;
}

.message-text :deep(hr) {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 16px 0;
}

.message-text :deep(table) {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.message-text :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.message-text :deep(blockquote) {
  border-left: 3px solid #409eff;
  padding-left: 12px;
  margin: 12px 0;
  color: #606266;
}

.message-text :deep(strong) {
  font-weight: 600;
  color: #303133;
}

.message-text :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.message-text :deep(a:hover) {
  text-decoration: underline;
}

.references {
  margin-top: 14px;
  background: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.references-header {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  transition: background 0.2s ease;
}

.references-header:hover {
  background: #ebeef5;
}

.references-list {
  padding: 0 16px 16px;
}

.reference-item {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 13px;
  border-left: 3px solid #409eff;
}

.ref-index {
  font-weight: bold;
  color: #409eff;
}

.ref-doc-name {
  margin-left: 8px;
  color: #606266;
  font-weight: 500;
}

.ref-page {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.ref-score {
  margin-left: 8px;
  color: #67c23a;
  font-size: 12px;
}

.ref-content {
  margin: 10px 0 0 0;
  color: #606266;
  line-height: 1.6;
}

.message-meta {
  margin-top: 8px;
  font-size: 11px;
  color: #c0c4cc;
}

.message.user .message-meta {
  text-align: right;
}

.loading .message-text {
  display: flex;
  align-items: center;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: #909399;
  font-size: 13px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.streaming-text {
  color: #909399;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.chat-input {
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 14px;
  align-items: flex-end;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.chat-textarea {
  flex: 1;
}

.chat-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 12px 16px;
  border-color: #e4e7ed;
  resize: none;
  font-size: 14px;
}

.chat-textarea :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.send-btn {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
}

:deep(.ref-link) {
  color: #409eff;
  font-weight: bold;
  cursor: pointer;
}

.upload-area {
  margin-bottom: 16px;
}

.upload-icon {
  font-size: 56px;
  color: #409eff;
}

.upload-text {
  margin: 12px 0;
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>