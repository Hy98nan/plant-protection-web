<template>
  <div class="farmland-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="地块名称/地址" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="作物类型">
          <el-select v-model="queryParams.cropType" placeholder="全部" clearable style="width: 120px">
            <el-option label="水稻" value="rice" />
            <el-option label="小麦" value="wheat" />
            <el-option label="玉米" value="corn" />
            <el-option label="果树" value="fruit" />
            <el-option label="蔬菜" value="vegetable" />
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
          <span>地块列表</span>
          <el-button type="primary" icon="Plus" @click="$router.push('/farmland/form')">新增地块</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="地块名称" width="140" />
        <el-table-column prop="customerName" label="所属客户" width="120" />
        <el-table-column prop="cropType" label="作物类型" width="90">
          <template #default="{ row }">{{ getCropLabel(row.cropType) }}</template>
        </el-table-column>
        <el-table-column prop="area" label="面积(亩)" width="90" align="center" />
        <el-table-column prop="location" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="longitude" label="经度" width="110" />
        <el-table-column prop="latitude" label="纬度" width="110" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" text size="small" @click="$router.push(`/farmland/form/${row.id}`)">编辑</el-button>
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
import { getFarmlandList, deleteFarmland } from '@/api/farmland'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])

const queryParams = reactive({ keyword: '', cropType: '', page: 1, pageSize: 20 })

const cropMap = { rice: '水稻', wheat: '小麦', corn: '玉米', fruit: '果树', vegetable: '蔬菜' }
function getCropLabel(type) { return cropMap[type] || type }

async function fetchData() {
  loading.value = true
  try {
    const params = { pageNum: queryParams.page, pageSize: queryParams.pageSize }
    if (queryParams.keyword) {
      params.name = queryParams.keyword
    }
    if (queryParams.cropType) {
      params.cropType = queryParams.cropType
    }
    const res = await getFarmlandList(params)
    tableData.value = res.data.records || res.data || []
    total.value = res.data.total || total.value
  } catch (error) {
    ElMessage.error('获取地块列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() { queryParams.page = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.cropType = ''; queryParams.page = 1; fetchData() }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除地块"${row.name}"吗？`, '提示', { type: 'warning' })
    await deleteFarmland(row.id)
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
.farmland-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
.action-buttons { display: flex; gap: 8px; }
</style>
