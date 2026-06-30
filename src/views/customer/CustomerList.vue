<template>
  <div class="customer-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="客户名称/联系人" clearable style="width: 200px" @keyup.enter="handleSearch" />
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
          <span>客户列表</span>
          <el-button type="primary" icon="Plus" @click="$router.push('/customer/form')">新增客户</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="客户名称" width="140" />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="customerType" label="客户类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.customerType === 'individual'" size="small">个人</el-tag>
            <el-tag v-else-if="row.customerType === 'farmer'" size="small" type="success">农场主</el-tag>
            <el-tag v-else-if="row.customerType === 'cooperative'" size="small" type="warning">合作社</el-tag>
            <el-tag v-else-if="row.customerType === 'enterprise'" size="small" type="info">企业</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="账户余额(元)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: 600;">{{ Number(row.balance || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" text size="small" @click="$router.push(`/customer/form/${row.id}`)">编辑</el-button>
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
import { getCustomerList, deleteCustomer } from '@/api/customer'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])

const queryParams = reactive({ keyword: '', page: 1, pageSize: 20 })

async function fetchData() {
  loading.value = true
  try {
    const params = { pageNum: queryParams.page, pageSize: queryParams.pageSize }
    if (queryParams.keyword) {
      params.name = queryParams.keyword
    }
    const res = await getCustomerList(params)
    tableData.value = res.data.records || res.data || []
    total.value = res.data.total || total.value
  } catch (error) {
    ElMessage.error('获取客户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() { queryParams.page = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.page = 1; fetchData() }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除客户"${row.name}"吗？`, '提示', { type: 'warning' })
    await deleteCustomer(row.id)
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
.customer-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
.action-buttons { display: flex; gap: 8px; }
</style>
