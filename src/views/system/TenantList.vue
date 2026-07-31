<template>
  <div class="tenant-list">
    <div class="search-bar">
      <el-form :model="queryParams" inline>
        <el-form-item label="租户名称">
          <el-input v-model="queryParams.name" placeholder="请输入租户名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="租户编码">
          <el-input v-model="queryParams.code" placeholder="请输入租户编码" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="套餐">
          <el-select v-model="queryParams.plan" placeholder="请选择套餐" clearable style="width: 120px">
            <el-option label="试用版" value="trial" />
            <el-option label="基础版" value="basic" />
            <el-option label="专业版" value="professional" />
            <el-option label="企业版" value="enterprise" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="停用" :value="0" />
            <el-option label="已过期" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增租户</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="name" label="租户名称" min-width="150" />
      <el-table-column prop="code" label="租户编码" width="120" />
      <el-table-column prop="plan" label="套餐" width="100">
        <template #default="{ row }">
          <el-tag :type="getPlanTagType(row.plan)" size="small">{{ getPlanLabel(row.plan) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contactName" label="联系人" width="100" />
      <el-table-column prop="contactPhone" label="联系电话" width="130" />
      <el-table-column prop="maxUsers" label="用户上限" width="100" />
      <el-table-column prop="expireTime" label="到期时间" width="180" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="handleExtendTrial(row)">延长试用</el-button>
          <el-button v-if="row.status === 1" link type="danger" @click="handleToggleStatus(row, 0)">停用</el-button>
          <el-button v-else link type="success" @click="handleToggleStatus(row, 1)">启用</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑租户' : '新增租户'" width="600px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入租户编码" />
        </el-form-item>
        <el-form-item label="套餐" prop="plan">
          <el-select v-model="formData.plan" style="width: 100%">
            <el-option label="试用版" value="trial" />
            <el-option label="基础版" value="basic" />
            <el-option label="专业版" value="professional" />
            <el-option label="企业版" value="enterprise" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="formData.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="用户上限">
          <el-input-number v-model="formData.maxUsers" :min="1" :max="999999" />
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="formData.expireTime"
            type="datetime"
            placeholder="选择到期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTenantList,
  createTenant,
  updateTenant,
  deleteTenant,
  updateTenantStatus,
  extendTrial
} from '@/api/tenant'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const editId = ref(null)

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const queryParams = reactive({
  name: '',
  code: '',
  plan: '',
  status: null
})

const formData = reactive({
  name: '',
  code: '',
  plan: 'trial',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  maxUsers: 100,
  expireTime: '',
  status: 1,
  remark: ''
})

const formRules = {
  name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入租户编码', trigger: 'blur' }],
  plan: [{ required: true, message: '请选择套餐', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...queryParams
    }
    const res = await getTenantList(params)
    if (res.code === 200) {
      tableData.value = res.data.records || res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取租户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  loadData()
}

function handleReset() {
  queryParams.name = ''
  queryParams.code = ''
  queryParams.plan = ''
  queryParams.status = null
  pagination.pageNum = 1
  loadData()
}

function handleSizeChange() {
  pagination.pageNum = 1
  loadData()
}

function handlePageChange() {
  loadData()
}

function handleAdd() {
  editId.value = null
  Object.assign(formData, {
    name: '',
    code: '',
    plan: 'trial',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    maxUsers: 100,
    expireTime: '',
    status: 1,
    remark: ''
  })
  dialogVisible.value = true
}

function handleEdit(row) {
  editId.value = row.id
  Object.assign(formData, {
    name: row.name,
    code: row.code,
    plan: row.plan,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    maxUsers: row.maxUsers,
    expireTime: row.expireTime,
    status: row.status,
    remark: row.remark
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }
  submitLoading.value = true
  try {
    if (editId.value) {
      await updateTenant(editId.value, formData)
      ElMessage.success('更新成功')
    } else {
      await createTenant(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除租户"${row.name}"吗？此操作不可恢复。`, '提示', { type: 'error' })
    await deleteTenant(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {}
}

async function handleToggleStatus(row, status) {
  try {
    const action = status === 1 ? '启用' : '停用'
    await ElMessageBox.confirm(`确定${action}租户"${row.name}"吗？`, '提示', { type: 'warning' })
    await updateTenantStatus(row.id, status)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (e) {}
}

async function handleExtendTrial(row) {
  try {
    const { value } = await ElMessageBox.prompt(`请输入延长天数（默认7天）`, '延长试用', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入数字',
      inputValue: '7'
    })
    const days = parseInt(value) || 7
    await extendTrial(row.id, days)
    ElMessage.success(`已延长${days}天`)
    loadData()
  } catch (e) {}
}

function getPlanLabel(plan) {
  const map = { trial: '试用版', basic: '基础版', professional: '专业版', enterprise: '企业版' }
  return map[plan] || plan
}

function getPlanTagType(plan) {
  const map = { trial: 'info', basic: '', professional: 'warning', enterprise: 'success' }
  return map[plan] || ''
}

function getStatusLabel(status) {
  const map = { 0: '停用', 1: '正常', 2: '已过期' }
  return map[status] || status
}

function getStatusTagType(status) {
  const map = { 0: 'danger', 1: 'success', 2: 'warning' }
  return map[status] || ''
}
</script>

<style scoped>
.tenant-list {
  padding: 20px;
}

.search-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-bar :deep(.el-form-item__label) {
  color: #fff;
}

.toolbar {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
