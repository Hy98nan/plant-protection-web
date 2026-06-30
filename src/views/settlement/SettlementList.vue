<template>
  <div class="settlement-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="结算单号/客户" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待结算" value="pending" />
            <el-option label="已结算" value="settled" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker v-model="queryParams.month" type="month" placeholder="选择月份" value-format="YYYY-MM" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" icon="Download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span>结算列表</span>
          <div class="summary-info">
            <span>待结算金额: <strong style="color: #E6A23C;">{{ pendingAmount }} 元</strong></span>
            <span style="margin-left: 24px;">已结算金额: <strong style="color: #67C23A;">{{ settledAmount }} 元</strong></span>
          </div>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%" show-summary :summary-method="getSummary">
        <el-table-column prop="settlementNo" label="结算单号" width="150" />
        <el-table-column prop="customerName" label="客户" width="100" />
        <el-table-column prop="taskCount" label="任务数" width="80" align="center" />
        <el-table-column prop="totalArea" label="总面积(亩)" width="100" align="center" />
        <el-table-column prop="pesticideCost" label="药剂费(元)" width="110" align="right" />
        <el-table-column prop="flightCost" label="飞行费(元)" width="110" align="right" />
        <el-table-column prop="totalAmount" label="总金额(元)" width="110" align="right">
          <template #default="{ row }">
            <strong style="color: #409EFF;">{{ Number(row.totalAmount).toLocaleString() }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settlementDate" label="结算日期" width="110" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="handleView(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" type="success" text size="small" @click="handleConfirm(row)">确认结算</el-button>
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

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const pendingAmount = ref('15,600.00')
const settledAmount = '86,400.00'
const queryParams = reactive({ keyword: '', status: '', month: '', page: 1, pageSize: 20 })

const statusMap = { pending: { label: '待结算', type: 'warning' }, settled: { label: '已结算', type: 'success' }, cancelled: { label: '已取消', type: 'info' } }
function getStatusType(s) { return statusMap[s]?.type || 'info' }
function getStatusLabel(s) { return statusMap[s]?.label || s }

function getSummary({ columns, data }) {
  const sums = []
  columns.forEach((col, index) => {
    if (index === 0) { sums[index] = '合计'; return }
    if (['taskCount', 'totalArea', 'pesticideCost', 'flightCost', 'totalAmount'].includes(col.property)) {
      sums[index] = data.reduce((sum, row) => sum + Number(row[col.property] || 0), 0).toFixed(2)
    } else { sums[index] = '' }
  })
  return sums
}

async function fetchData() {
  loading.value = true
  try {
    tableData.value = [
      { id: 1, settlementNo: 'ST20240601001', customerName: '张老板', taskCount: 5, totalArea: 320, pesticideCost: 2400, flightCost: 6400, totalAmount: 8800, status: 'pending', settlementDate: '-' },
      { id: 2, settlementNo: 'ST20240601002', customerName: '李大户', taskCount: 8, totalArea: 450, pesticideCost: 3200, flightCost: 9000, totalAmount: 12200, status: 'settled', settlementDate: '2024-06-01' },
      { id: 3, settlementNo: 'ST20240531001', customerName: '王农场', taskCount: 3, totalArea: 150, pesticideCost: 1200, flightCost: 3000, totalAmount: 4200, status: 'settled', settlementDate: '2024-05-31' },
      { id: 4, settlementNo: 'ST20240531002', customerName: '赵合作社', taskCount: 12, totalArea: 680, pesticideCost: 5100, flightCost: 13600, totalAmount: 18700, status: 'pending', settlementDate: '-' },
      { id: 5, settlementNo: 'ST20240530001', customerName: '张老板', taskCount: 4, totalArea: 210, pesticideCost: 1600, flightCost: 4200, totalAmount: 5800, status: 'settled', settlementDate: '2024-05-30' }
    ]
    total.value = 5
  } catch (error) { ElMessage.error('获取结算列表失败') }
  finally { loading.value = false }
}

function handleSearch() { queryParams.page = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.status = ''; queryParams.month = ''; queryParams.page = 1; fetchData() }
function handleExport() { ElMessage.success('导出功能已触发') }
function handleView(row) { ElMessage.info(`查看结算单: ${row.settlementNo}`) }

async function handleConfirm(row) {
  try {
    await ElMessageBox.confirm(`确认结算单"${row.settlementNo}"，金额 ${row.totalAmount} 元？`, '确认结算', { type: 'warning' })
    row.status = 'settled'
    row.settlementDate = new Date().toISOString().split('T')[0]
    ElMessage.success('结算确认成功')
  } catch (e) {}
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.settlement-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.summary-info { font-size: 14px; color: #666; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
