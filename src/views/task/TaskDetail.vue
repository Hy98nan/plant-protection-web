<template>
  <div class="task-detail">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>任务详情</span>
          <div>
            <el-button text @click="$router.back()">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
          </div>
        </div>
      </template>

      <template v-if="taskInfo">
        <!-- 状态栏 -->
        <div class="status-bar">
          <el-tag :type="getStatusType(taskInfo.status)" size="large" effect="dark">
            {{ getStatusLabel(taskInfo.status) }}
          </el-tag>
          <el-tag v-if="taskInfo.priority" :color="getPriorityColor(taskInfo.priority)" size="small" effect="dark" style="border: none;">
            {{ getPriorityLabel(taskInfo.priority) }}
          </el-tag>
          <span class="task-no">{{ taskInfo.taskNo }}</span>
        </div>

        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="3" border class="detail-section">
          <el-descriptions-item label="任务类型">{{ getTaskTypeLabel(taskInfo.taskType) }}</el-descriptions-item>
          <el-descriptions-item label="计划日期">{{ taskInfo.plannedDate }}</el-descriptions-item>
          <el-descriptions-item label="计划时间">{{ taskInfo.plannedStartTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ taskInfo.createTime }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ taskInfo.dispatcherId || '系统管理员' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{ taskInfo.description || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 作业信息 -->
        <el-descriptions title="作业信息" :column="3" border class="detail-section">
          <el-descriptions-item label="客户">{{ taskInfo.customerName }}</el-descriptions-item>
          <el-descriptions-item label="地块">{{ taskInfo.farmlandName }}</el-descriptions-item>
          <el-descriptions-item label="作业面积">{{ taskInfo.plannedArea }} 亩</el-descriptions-item>
          <el-descriptions-item label="药剂">{{ taskInfo.pesticideName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="每亩用量">{{ taskInfo.dosagePerAcre ? taskInfo.dosagePerAcre + ' ml' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="实际面积">{{ taskInfo.actualArea ? taskInfo.actualArea + ' 亩' : '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 调度信息 -->
        <el-descriptions title="调度信息" :column="3" border class="detail-section">
          <el-descriptions-item label="飞手">{{ taskInfo.pilotName || '未指派' }}</el-descriptions-item>
          <el-descriptions-item label="无人机">{{ taskInfo.droneName || '未指派' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 异常记录 -->
        <div class="detail-section" v-if="exceptionList.length > 0">
          <h3 style="margin-bottom: 16px;">异常记录</h3>
          <el-card v-for="item in exceptionList" :key="item.id" class="exception-card">
            <div class="exception-header">
              <div class="exception-tags">
                <el-tag :style="{ backgroundColor: getExceptionType(item.exceptionType).color, color: '#fff' }" size="small">
                  {{ getExceptionType(item.exceptionType).text }}
                </el-tag>
                <el-tag :style="{ backgroundColor: getExceptionLevel(item.exceptionLevel).color, color: '#fff' }" size="small">
                  {{ getExceptionLevel(item.exceptionLevel).text }}
                </el-tag>
                <el-tag :type="getExceptionStatus(item.handleStatus).type" size="small">
                  {{ getExceptionStatus(item.handleStatus).text }}
                </el-tag>
              </div>
              <span class="exception-time">{{ item.reportTime }}</span>
            </div>
            <div class="exception-desc">{{ item.description }}</div>
            <div class="exception-footer">
              <span>上报人：{{ item.reporterName || '未知' }}</span>
              <div class="exception-actions" v-if="item.handleStatus === 'pending' || item.handleStatus === 'processing'">
                <el-button v-if="item.handleStatus === 'pending'" size="small" type="primary" @click="handleStartProcess(item)">处理中</el-button>
                <el-button v-if="item.handleStatus === 'pending' || item.handleStatus === 'processing'" size="small" type="success" @click="handleResolve(item)">已解决</el-button>
                <el-button v-if="item.handleStatus === 'pending' || item.handleStatus === 'processing'" size="small" type="danger" @click="handleClose(item)">关闭</el-button>
              </div>
            </div>
            <div v-if="item.handleResult" class="exception-handle-result">
              <span class="handle-label">处理结果：</span>
              <span class="handle-content">{{ item.handleResult }}</span>
            </div>
          </el-card>
        </div>
        <div class="detail-section" v-if="exceptionList.length === 0">
          <h3 style="margin-bottom: 16px;">异常记录</h3>
          <el-empty description="暂无异常记录" />
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar">
          <el-button v-if="taskInfo.status === 'PENDING'" type="warning" @click="showAssignDialog">指派飞手</el-button>
          <el-button v-if="taskInfo.status === 'ASSIGNED' || taskInfo.status === 'CONFIRMED'" type="warning" @click="showReassignDialog">更换飞手</el-button>
          <el-button v-if="taskInfo.status === 'ASSIGNED'" type="success" @click="handleConfirm">确认任务</el-button>
          <el-button v-if="taskInfo.status === 'CONFIRMED'" type="primary" @click="handleStart">开始执行</el-button>
          <el-button v-if="taskInfo.status === 'EXECUTING'" type="success" @click="handleComplete">完成任务</el-button>
          <el-button v-if="taskInfo.status === 'PENDING' || taskInfo.status === 'ASSIGNED'" type="danger" @click="handleCancel">取消任务</el-button>
        </div>
      </template>
    </el-card>

    <!-- 指派/更换飞手弹窗 -->
    <el-dialog v-model="assignDialogVisible" :title="taskInfo?.status === 'PENDING' ? '指派飞手' : '更换飞手'" width="500px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="飞手">
          <el-select v-model="assignForm.pilotId" placeholder="请选择飞手" filterable style="width: 100%">
            <el-option v-for="item in pilotOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="无人机">
          <el-select v-model="assignForm.droneId" placeholder="请选择无人机" filterable style="width: 100%">
            <el-option v-for="item in droneOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { TASK_STATUS_LIST, TASK_TYPES, PRIORITY_LEVELS } from '@/utils/constants'
import { getTaskDetail, confirmTask, startTask, completeTask, cancelTask, assignPilot, reassignPilot, getTaskExceptions, handleTaskException } from '@/api/task'
import { getPilotOptions } from '@/api/pilot'
import { getDroneOptions } from '@/api/drone'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const assignDialogVisible = ref(false)

const taskInfo = ref(null)

const assignForm = reactive({
  pilotId: '',
  droneId: ''
})

const pilotOptions = ref([])
const droneOptions = ref([])
const exceptionList = ref([])

const exceptionTypes = {
  equipment: { text: '设备故障', color: '#F56C6C' },
  weather: { text: '天气异常', color: '#409EFF' },
  pesticide: { text: '药剂问题', color: '#67C23A' },
  personnel: { text: '人员问题', color: '#E6A23C' },
  other: { text: '其他异常', color: '#909399' }
}

const exceptionLevels = {
  minor: { text: '轻微', color: '#67C23A' },
  major: { text: '一般', color: '#E6A23C' },
  critical: { text: '严重', color: '#F56C6C' }
}

const handleStatus = {
  pending: { text: '待处理', type: 'warning' },
  processing: { text: '处理中', type: 'info' },
  resolved: { text: '已解决', type: 'success' },
  closed: { text: '已关闭', type: 'danger' }
}

function getExceptionType(item) {
  return exceptionTypes[item] || { text: '未知', color: '#909399' }
}

function getExceptionLevel(item) {
  return exceptionLevels[item] || { text: '未知', color: '#909399' }
}

function getExceptionStatus(item) {
  return handleStatus[item] || { text: '未知', type: 'info' }
}

function getStatusType(status) {
  const item = TASK_STATUS_LIST.find(s => s.key === status)
  return item ? item.type : 'info'
}

function getStatusLabel(status) {
  const item = TASK_STATUS_LIST.find(s => s.key === status)
  return item ? item.label : status
}

function getTaskTypeLabel(type) {
  const item = TASK_TYPES.find(t => t.key === type)
  return item ? item.label : type
}

function getPriorityColor(priority) {
  const item = PRIORITY_LEVELS.find(p => p.key === priority)
  return item ? item.color : '#909399'
}

function getPriorityLabel(priority) {
  const item = PRIORITY_LEVELS.find(p => p.key === priority)
  return item ? item.label : priority
}

async function loadOptions() {
  try {
    const [pilotRes, droneRes] = await Promise.all([
      getPilotOptions(),
      getDroneOptions()
    ])
    pilotOptions.value = pilotRes.data || []
    droneOptions.value = droneRes.data || []
  } catch (error) {
    ElMessage.error('加载选项数据失败')
  }
}

async function fetchDetail() {
  loading.value = true
  try {
    const [taskRes, exceptionRes] = await Promise.all([
      getTaskDetail(route.params.id),
      getTaskExceptions(route.params.id)
    ])
    taskInfo.value = taskRes.data || taskRes
    exceptionList.value = exceptionRes.data || []
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

function showAssignDialog() {
  assignForm.pilotId = ''
  assignForm.droneId = ''
  assignDialogVisible.value = true
}

function showReassignDialog() {
  assignForm.pilotId = taskInfo.value?.pilotId || ''
  assignForm.droneId = taskInfo.value?.droneId || ''
  assignDialogVisible.value = true
}

async function handleAssign() {
  if (!assignForm.pilotId) {
    ElMessage.warning('请选择飞手')
    return
  }
  try {
    if (taskInfo.value?.status === 'PENDING') {
      await assignPilot(taskInfo.value.id, assignForm)
    } else {
      await reassignPilot(taskInfo.value.id, assignForm)
    }
    assignDialogVisible.value = false
    ElMessage.success('操作成功')
    fetchDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleConfirm() {
  try {
    await ElMessageBox.confirm('确认该任务？', '提示', { type: 'warning' })
    await confirmTask(taskInfo.value.id)
    ElMessage.success('任务已确认')
    fetchDetail()
  } catch (e) {
  }
}

async function handleStart() {
  try {
    await ElMessageBox.confirm('确认开始执行？', '提示', { type: 'warning' })
    await startTask(taskInfo.value.id)
    ElMessage.success('任务已开始执行')
    fetchDetail()
  } catch (e) {
  }
}

async function handleComplete() {
  try {
    const { value } = await ElMessageBox.prompt('请输入实际作业面积（亩）', '完成任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^\d+(\.\d+)?$/,
      inputErrorMessage: '请输入有效的面积数值'
    })
    await completeTask(taskInfo.value.id, { actualArea: parseFloat(value) })
    ElMessage.success('任务已完成')
    fetchDetail()
  } catch (e) {
  }
}

async function handleCancel() {
  try {
    const { value } = await ElMessageBox.prompt('请输入取消原因', '取消任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (val) => val && val.trim() ? true : '请输入取消原因'
    })
    await cancelTask(taskInfo.value.id, { reason: value })
    ElMessage.success('任务已取消')
    fetchDetail()
  } catch (e) {
  }
}

async function handleStartProcess(item) {
  try {
    await handleTaskException(item.id, { handleStatus: 'processing', handleResult: '开始处理' })
    ElMessage.success('已标记为处理中')
    fetchDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleResolve(item) {
  try {
    const { value } = await ElMessageBox.prompt('请输入处理结果', '确认解决', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await handleTaskException(item.id, { handleStatus: 'resolved', handleResult: value })
    ElMessage.success('已标记为已解决')
    fetchDetail()
  } catch (e) {
  }
}

async function handleClose(item) {
  try {
    await ElMessageBox.confirm('确定要关闭此异常吗？', '关闭异常', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await handleTaskException(item.id, { handleStatus: 'closed', handleResult: '已关闭' })
    ElMessage.success('已关闭')
    fetchDetail()
  } catch (e) {
  }
}

onMounted(async () => {
  await loadOptions()
  fetchDetail()
})
</script>

<style scoped>
.task-detail {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.task-no {
  font-size: 16px;
  color: #666;
  margin-left: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.action-bar {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.exception-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.exception-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.exception-tags {
  display: flex;
  gap: 8px;
}

.exception-time {
  font-size: 14px;
  color: #909399;
}

.exception-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.exception-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.exception-actions {
  display: flex;
  gap: 8px;
}

.exception-handle-result {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 13px;
}

.handle-label {
  color: #909399;
}

.handle-content {
  color: #67C23A;
  font-weight: 500;
}
</style>
