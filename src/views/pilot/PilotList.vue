<template>
  <div class="pilot-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="姓名/手机号" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
            <el-option label="作业中" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="技能等级">
          <el-select v-model="queryParams.skillLevel" placeholder="全部" clearable style="width: 120px">
            <el-option label="初级" value="junior" />
            <el-option label="高级" value="senior" />
            <el-option label="专家" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span>飞手列表</span>
          <el-button type="primary" icon="Plus" @click="$router.push('/pilot/form')">新增飞手</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="licenseNo" label="无人机执照" width="120" show-overflow-tooltip />
        <el-table-column prop="licenseType" label="执照类型" width="100">
          <template #default="{ row }">
            {{ getLicenseTypeLabel(row.licenseType) }}
          </template>
        </el-table-column>
        <el-table-column prop="licenseExpiry" label="执照有效期" width="110" />
        <el-table-column prop="skillLevel" label="技能等级" width="90">
          <template #default="{ row }">
            {{ getSkillLevelLabel(row.skillLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalFlightHours" label="飞行时长(h)" width="110" align="center" />
        <el-table-column prop="totalFlightArea" label="作业面积(亩)" width="120" align="center" />
        <el-table-column prop="taskCount" label="完成任务数" width="100" align="center" />
        <el-table-column prop="rating" label="评分" width="80" align="center">
          <template #default="{ row }">
            <el-rate :model-value="getRatingValue(row.rating)" disabled :size="14" />
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)" size="small">
              {{ getAuditStatusLabel(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" text size="small" @click="$router.push(`/pilot/form/${row.id}`)">编辑</el-button>
              <el-button type="success" text size="small" v-if="row.auditStatus === 0" @click="handleApprove(row)">审核通过</el-button>
              <el-button type="warning" text size="small" v-if="row.auditStatus === 0" @click="handleReject(row)">拒绝</el-button>
              <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
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
import { ElMessage, ElMessageBox, ElInput } from 'element-plus'
import { getPilotList, deletePilot, approveAudit, rejectAudit } from '@/api/pilot'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])

const queryParams = reactive({
  keyword: '',
  status: '',
  skillLevel: '',
  page: 1,
  pageSize: 20
})

function getRatingValue(rating) {
  if (rating === null || rating === undefined || rating === '') return 0
  if (typeof rating === 'number') return Math.floor(rating)
  if (rating.intValue !== undefined) return rating.intValue()
  return Math.floor(parseFloat(rating))
}

function getStatusType(status) {
  if (status === 1) return 'success'
  if (status === 2) return 'primary'
  return 'info'
}

function getStatusLabel(status) {
  if (status === 1) return '在职'
  if (status === 2) return '作业中'
  return '离职'
}

function getLicenseTypeLabel(type) {
  const map = { 'AOPA': 'AOPA', 'CAAC': 'CAAC', '其他': '其他' }
  return map[type] || '-'
}

function getSkillLevelLabel(level) {
  const map = { 'junior': '初级', 'senior': '高级', 'expert': '专家' }
  return map[level] || '-'
}

function getAuditStatusType(auditStatus) {
  if (auditStatus === 1) return 'success'
  if (auditStatus === 2) return 'danger'
  return 'warning'
}

function getAuditStatusLabel(auditStatus) {
  if (auditStatus === 1) return '审核通过'
  if (auditStatus === 2) return '审核拒绝'
  return '待审核'
}

async function fetchData() {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.page,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword
    }
    if (queryParams.status === 1 || queryParams.status === 0 || queryParams.status === 2) {
      params.status = queryParams.status
    }
    if (queryParams.skillLevel) {
      params.skillLevel = queryParams.skillLevel
    }
    const res = await getPilotList(params)
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取飞手列表失败')
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
  queryParams.skillLevel = ''
  queryParams.page = 1
  fetchData()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除飞手"${row.name}"吗？`, '提示', { type: 'warning' })
    await deletePilot(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {}
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(`确定审核通过飞手"${row.name}"吗？`, '提示', { type: 'info' })
    await approveAudit(row.id, {})
    ElMessage.success('审核通过')
    fetchData()
  } catch (e) {}
}

async function handleReject(row) {
  try {
    const { value: remark } = await ElMessageBox.prompt('请输入拒绝理由', '审核拒绝', {
      inputType: 'textarea',
      placeholder: '请输入拒绝理由',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    if (!remark.trim()) {
      ElMessage.error('请输入拒绝理由')
      return
    }
    await rejectAudit(row.id, { auditRemark: remark })
    ElMessage.success('已拒绝')
    fetchData()
  } catch (e) {}
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.pilot-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
.action-buttons { display: flex; gap: 8px; }
</style>
