<template>
  <div class="battery-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="编号" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="充电中" value="charging" />
            <el-option label="衰减" value="degraded" />
            <el-option label="损坏" value="damaged" />
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
          <span>电池列表</span>
          <el-button type="primary" icon="Plus" @click="showAddDialog">新增电池</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="batteryNo" label="编号" width="120" />
        <el-table-column prop="model" label="型号" width="100" />
        <el-table-column prop="capacity" label="容量(mAh)" width="110" align="center" />
        <el-table-column prop="chargeCycles" label="充电次数" width="100" align="center" />
        <el-table-column prop="health" label="健康度" width="100" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.health" :color="getHealthColor(row.health)" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="bindDrone" label="绑定无人机" width="110" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseDate" label="购买日期" width="110" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="showEditDialog(row)">编辑</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="编号" prop="batteryNo">
          <el-input v-model="form.batteryNo" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="容量(mAh)" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1000" :max="50000" :step="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="绑定无人机">
          <el-select v-model="form.bindDroneId" placeholder="请选择" clearable style="width: 100%">
            <el-option label="DJI-A001" value="1" />
            <el-option label="DJI-A002" value="2" />
            <el-option label="DJI-B001" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" value="normal" />
            <el-option label="充电中" value="charging" />
            <el-option label="衰减" value="degraded" />
            <el-option label="损坏" value="damaged" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增电池')
const formRef = ref(null)
const queryParams = reactive({ keyword: '', status: '', page: 1, pageSize: 20 })
const form = reactive({ id: null, batteryNo: '', model: '', capacity: 12000, bindDroneId: '', status: 'normal' })

const rules = {
  batteryNo: [{ required: true, message: '请输入编号', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入容量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const statusMap = { normal: { label: '正常', type: 'success' }, charging: { label: '充电中', type: 'primary' }, degraded: { label: '衰减', type: 'warning' }, damaged: { label: '损坏', type: 'danger' } }
function getStatusType(s) { return statusMap[s]?.type || 'info' }
function getStatusLabel(s) { return statusMap[s]?.label || s }
function getHealthColor(h) { return h >= 80 ? '#67C23A' : h >= 50 ? '#E6A23C' : '#F56C6C' }

async function fetchData() {
  loading.value = true
  try {
    tableData.value = [
      { id: 1, batteryNo: 'BAT-001', model: 'TB60', capacity: 12000, chargeCycles: 120, health: 95, bindDrone: 'DJI-A001', status: 'normal', purchaseDate: '2024-01-15' },
      { id: 2, batteryNo: 'BAT-002', model: 'TB60', capacity: 12000, chargeCycles: 115, health: 96, bindDrone: 'DJI-A002', status: 'charging', purchaseDate: '2024-01-15' },
      { id: 3, batteryNo: 'BAT-003', model: 'TB50', capacity: 10000, chargeCycles: 350, health: 72, bindDrone: 'DJI-B001', status: 'degraded', purchaseDate: '2023-06-01' },
      { id: 4, batteryNo: 'BAT-004', model: 'TB50', capacity: 10000, chargeCycles: 500, health: 45, bindDrone: '', status: 'damaged', purchaseDate: '2023-03-10' },
      { id: 5, batteryNo: 'BAT-005', model: 'TB60', capacity: 12000, chargeCycles: 80, health: 98, bindDrone: '', status: 'normal', purchaseDate: '2024-03-01' }
    ]
    total.value = 5
  } catch (error) { ElMessage.error('获取电池列表失败') }
  finally { loading.value = false }
}

function showAddDialog() {
  dialogTitle.value = '新增电池'
  Object.assign(form, { id: null, batteryNo: '', model: '', capacity: 12000, bindDroneId: '', status: 'normal' })
  dialogVisible.value = true
}

function showEditDialog(row) {
  dialogTitle.value = '编辑电池'
  Object.assign(form, { id: row.id, batteryNo: row.batteryNo, model: row.model, capacity: row.capacity, bindDroneId: '', status: row.status })
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    ElMessage.success(form.id ? '修改成功' : '新增成功')
    dialogVisible.value = false
    fetchData()
  })
}

function handleSearch() { queryParams.page = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.status = ''; queryParams.page = 1; fetchData() }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除电池"${row.batteryNo}"吗？`, '提示', { type: 'warning' })
    ElMessage.success('删除成功'); fetchData()
  } catch (e) {}
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.battery-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
