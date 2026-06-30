<template>
  <div class="task-list">
    <!-- 搜索栏 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-header">
        <span class="search-title">搜索筛选</span>
      </div>
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item label="任务编号">
          <el-input v-model="queryParams.keyword" placeholder="请输入任务编号" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option v-for="item in TASK_STATUS_LIST" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="queryParams.taskType" placeholder="全部类型" clearable style="width: 140px">
            <el-option v-for="item in TASK_TYPES" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏和表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span>任务列表</span>
          <div>
            <el-button type="primary" icon="Plus" @click="$router.push('/task/create')">创建任务</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="taskNo" label="任务编号" width="150" fixed />
        <el-table-column prop="taskType" label="类型" width="100">
          <template #default="{ row }">
            {{ getTaskTypeLabel(row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column prop="farmlandName" label="地块名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户" width="100" show-overflow-tooltip />
        <el-table-column prop="pilotName" label="飞手" width="90" />
        <el-table-column prop="droneName" label="无人机" width="100" />
        <el-table-column prop="plannedArea" label="面积(亩)" width="90" align="center" />
        <el-table-column prop="plannedDate" label="计划日期" width="110" />
        <el-table-column prop="status" label="状态" width="90" fixed="right">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 'DRAFT'"
                type="primary"
                text
                size="small"
                @click="$router.push(`/task/create/${row.id}`)"
              >编辑</el-button>
              <el-button
                v-if="row.status === 'DRAFT'"
                type="success"
                text
                size="small"
                @click="handlePublish(row)"
              >发布</el-button>
              <el-button
                v-if="row.status === 'DRAFT'"
                type="danger"
                text
                size="small"
                @click="handleDelete(row)"
              >删除</el-button>
              <el-button
                v-if="row.status !== 'DRAFT'"
                type="primary"
                text
                size="small"
                @click="$router.push(`/task/detail/${row.id}`)"
              >详情</el-button>
              <el-button
                v-if="row.status === 'ASSIGNED'"
                type="success"
                text
                size="small"
                @click="handleConfirm(row)"
              >确认</el-button>
              <el-button
                v-if="row.status === 'CONFIRMED'"
                type="primary"
                text
                size="small"
                @click="handleStart(row)"
              >开始</el-button>
              <el-button
                v-if="row.status === 'EXECUTING'"
                type="success"
                text
                size="small"
                @click="handleComplete(row)"
              >完成</el-button>
              <el-button
                v-if="row.status === 'PENDING' || row.status === 'ASSIGNED' || row.status === 'CONFIRMED'"
                type="danger"
                text
                size="small"
                @click="handleCancel(row)"
              >取消</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TASK_STATUS_LIST, TASK_TYPES } from '@/utils/constants'
import { getTaskList, confirmTask, startTask, completeTask, cancelTask, publishDraft, deleteTask } from '@/api/task'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])

const queryParams = reactive({
  keyword: '',
  status: '',
  taskType: '',
  dateRange: null,
  page: 1,
  pageSize: 20
})

function getTaskTypeLabel(type) {
  const item = TASK_TYPES.find(t => t.key === type)
  return item ? item.label : type
}

function getStatusType(status) {
  const item = TASK_STATUS_LIST.find(s => s.key === status)
  return item ? item.type : 'info'
}

function getStatusLabel(status) {
  const item = TASK_STATUS_LIST.find(s => s.key === status)
  return item ? item.label : status
}

async function fetchData() {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.page,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword,
      status: queryParams.status,
      taskType: queryParams.taskType
    }
    if (queryParams.dateRange && queryParams.dateRange.length === 2) {
      params.startDate = queryParams.dateRange[0]
      params.endDate = queryParams.dateRange[1]
    }
    const res = await getTaskList(params)
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.page = 1
  fetchData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.taskType = ''
  queryParams.dateRange = null
  queryParams.page = 1
  fetchData()
}

async function handleConfirm(row) {
  try {
    await ElMessageBox.confirm('确认该任务？', '提示', { type: 'warning' })
    await confirmTask(row.id)
    row.status = 'CONFIRMED'
    ElMessage.success('任务已确认')
    fetchData()
  } catch (e) {}
}

async function handleStart(row) {
  try {
    await ElMessageBox.confirm('确认开始执行该任务？', '提示', { type: 'warning' })
    await startTask(row.id)
    row.status = 'EXECUTING'
    ElMessage.success('任务已开始')
    fetchData()
  } catch (e) {}
}

async function handleComplete(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入实际作业面积（亩）', '完成任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^\d+(\.\d+)?$/,
      inputErrorMessage: '请输入有效的面积数值'
    })
    await completeTask(row.id, { actualArea: parseFloat(value) })
    row.status = 'COMPLETED'
    ElMessage.success('任务已完成')
    fetchData()
  } catch (e) {}
}

async function handleCancel(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入取消原因', '取消任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (val) => val && val.trim() ? true : '请输入取消原因'
    })
    await cancelTask(row.id, { reason: value })
    row.status = 'CANCELLED'
    ElMessage.success('任务已取消')
    fetchData()
  } catch (e) {}
}

async function handlePublish(row) {
  try {
    await ElMessageBox.confirm('确认发布该草稿？发布后将无法再编辑草稿。', '提示', { type: 'warning' })
    await publishDraft(row.id)
    ElMessage.success('任务发布成功')
    fetchData()
  } catch (e) {}
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该草稿？删除后无法恢复。', '提示', { type: 'warning' })
    await deleteTask(row.id)
    ElMessage.success('草稿已删除')
    fetchData()
  } catch (e) {}
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.task-list {
  width: 100%;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.search-header {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 8px 8px 0 0;
  margin: -20px -20px 16px -20px;
}

.search-title {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 2px;
}

.search-form {
  padding: 0 8px;
}

.search-buttons {
  margin-left: 16px;
}

.table-card {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
