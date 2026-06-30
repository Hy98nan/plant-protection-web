<template>
  <div class="drone-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="编号/型号" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="空闲" value="idle" />
            <el-option label="作业中" value="working" />
            <el-option label="维护中" value="maintaining" />
            <el-option label="已报废" value="scrapped" />
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
          <span>无人机列表</span>
          <el-button type="primary" icon="Plus" @click="$router.push('/drone/form')">新增无人机</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="droneNo" label="编号" width="110" />
        <el-table-column prop="model" label="型号" width="100" />
        <el-table-column prop="brand" label="品牌" width="80" />
        <el-table-column prop="purchaseDate" label="购买日期" width="110" />
        <el-table-column prop="totalFlightHours" label="累计飞行(h)" width="120" align="center">
          <template #default="{ row }">{{ row.totalFlightHours || 0 }}</template>
        </el-table-column>
        <el-table-column prop="totalFlightArea" label="累计作业(亩)" width="110" align="center">
          <template #default="{ row }">{{ row.totalFlightArea || 0 }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getDroneStatusType(row.status)" size="small">{{ getDroneStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" text size="small" @click="$router.push(`/drone/form/${row.id}`)">编辑</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDroneList, deleteDrone } from '@/api/drone'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const queryParams = reactive({ keyword: '', status: '', page: 1, pageSize: 20 })

const statusMap = { idle: { label: '空闲', type: 'success' }, working: { label: '作业中', type: 'primary' }, maintenance: { label: '维护中', type: 'warning' }, scrapped: { label: '已报废', type: 'danger' } }
function getDroneStatusType(s) { return statusMap[s]?.type || 'info' }
function getDroneStatusLabel(s) { return statusMap[s]?.label || s }

async function fetchData() {
  loading.value = true
  try {
    const params = { pageNum: queryParams.page, pageSize: queryParams.pageSize }
    if (queryParams.keyword) {
      params.keyword = queryParams.keyword
    }
    if (queryParams.status) {
      params.status = queryParams.status
    }
    const res = await getDroneList(params)
    tableData.value = res.data.records || res.data || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取无人机列表失败')
  }
  finally { loading.value = false }
}

function handleSearch() { queryParams.page = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.status = ''; queryParams.page = 1; fetchData() }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除无人机"${row.droneNo}"吗？`, '提示', { type: 'warning' })
    await deleteDrone(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.drone-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
.action-buttons { display: flex; gap: 8px; }
</style>
