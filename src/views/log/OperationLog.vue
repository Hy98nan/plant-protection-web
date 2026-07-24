<template>
  <div class="page-container">
    <el-card>
      <el-form :model="query" inline @submit.prevent="handleSearch">
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model="query.module" placeholder="如：用户管理" clearable />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="query.businessType" placeholder="全部" clearable style="width: 120px">
            <el-option label="新增" value="CREATE" />
            <el-option label="修改" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="查询" value="QUERY" />
            <el-option label="导出" value="EXPORT" />
            <el-option label="导入" value="IMPORT" />
          </el-select>
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failure" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 16px">
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column label="业务类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="tagType(row.businessType)">
              {{ businessLabel(row.businessType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="httpMethod" label="方法" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="methodType(row.httpMethod)">{{ row.httpMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestUrl" label="请求路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="costTime" label="耗时(ms)" width="100" align="right" />
        <el-table-column label="结果" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>

      <el-pagination
        v-model:current-page="query.current"
        v-model:page-size="query.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="loadData"
        @size-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pageOperationLog } from '@/api/log'

const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  current: 1,
  size: 20,
  username: '',
  module: '',
  businessType: '',
  status: ''
})

const businessMap = {
  CREATE: '新增', UPDATE: '修改', DELETE: '删除',
  QUERY: '查询', EXPORT: '导出', IMPORT: '导入'
}
const businessLabel = (t) => businessMap[t] || t
const tagType = (t) => ({ CREATE: 'success', UPDATE: 'warning', DELETE: 'danger', QUERY: '', EXPORT: 'info', IMPORT: 'info' }[t] || '')

const methodType = (m) => ({ GET: '', POST: 'success', PUT: 'warning', DELETE: 'danger' }[m] || '')

const loadData = async () => {
  loading.value = true
  try {
    const res = await pageOperationLog(query)
    if (res.code === 200) {
      list.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (e) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.current = 1
  loadData()
}

const handleReset = () => {
  Object.keys(query).forEach(k => {
    if (typeof query[k] === 'string') query[k] = ''
  })
  query.current = 1
  query.size = 20
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
