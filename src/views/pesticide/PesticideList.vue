<template>
  <div class="pesticide-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="名称/厂家" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.pesticideType" placeholder="全部" clearable style="width: 120px">
            <el-option label="杀虫剂" value="insecticide" />
            <el-option label="杀菌剂" value="fungicide" />
            <el-option label="除草剂" value="herbicide" />
            <el-option label="叶面肥" value="foliar" />
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
          <span>药剂列表</span>
          <el-button type="primary" icon="Plus" @click="$router.push('/pesticide/form')">新增药剂</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="pesticideType" label="类型" width="90">
          <template #default="{ row }">{{ getTypeLabel(row.pesticideType) }}</template>
        </el-table-column>
        <el-table-column prop="targetPest" label="有效成分" width="120" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="stockQuantity" label="库存" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: Number(row.stockQuantity) < 10 ? '#F56C6C' : '#333', fontWeight: Number(row.stockQuantity) < 10 ? '600' : 'normal' }">
              {{ row.stockQuantity }}{{ row.unit || '' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价(元)" width="110" align="right" />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="140" show-overflow-tooltip />
        <el-table-column prop="expiryDate" label="有效期至" width="110" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="$router.push(`/pesticide/form/${row.id}`)">编辑</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
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
import { getPesticideList, deletePesticide } from '@/api/pesticide'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const queryParams = reactive({ keyword: '', pesticideType: '', pageNum: 1, pageSize: 20 })

const typeMap = { insecticide: '杀虫剂', fungicide: '杀菌剂', herbicide: '除草剂', foliar: '叶面肥', fertilizer: '叶面肥' }
function getTypeLabel(t) { return typeMap[t] || t }

async function fetchData() {
  loading.value = true
  try {
    const res = await getPesticideList(queryParams)
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error(error?.message || '获取药剂列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() { queryParams.pageNum = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.pesticideType = ''; queryParams.pageNum = 1; fetchData() }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除药剂"${row.name}"吗？`, '提示', { type: 'warning' })
    await deletePesticide(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {}
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.pesticide-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
