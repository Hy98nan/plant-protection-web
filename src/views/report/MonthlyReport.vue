<template>
  <div class="monthly-report">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>月度经营分析</span>
          <div class="filter-bar">
            <el-date-picker v-model="selectedMonth" type="month" placeholder="选择月份" value-format="YYYY-MM" style="width: 150px" />
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button type="success" icon="Download" @click="handleExport">导出报表</el-button>
          </div>
        </div>
      </template>

      <!-- 核心指标 -->
      <el-row :gutter="16" class="summary-row">
        <el-col :span="6">
          <div class="summary-item" style="background: linear-gradient(135deg, #409EFF, #79bbff); color: #fff;">
            <div class="summary-value">{{ summary.totalRevenue }}</div>
            <div class="summary-label">本月营收(元)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item" style="background: linear-gradient(135deg, #67C23A, #95d475); color: #fff;">
            <div class="summary-value">{{ summary.totalProfit }}</div>
            <div class="summary-label">本月利润(元)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item" style="background: linear-gradient(135deg, #E6A23C, #eebe77); color: #fff;">
            <div class="summary-value">{{ summary.totalTasks }}</div>
            <div class="summary-label">本月任务数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item" style="background: linear-gradient(135deg, #F56C6C, #f89898); color: #fff;">
            <div class="summary-value">{{ summary.profitRate }}</div>
            <div class="summary-label">利润率</div>
          </div>
        </el-col>
      </el-row>

      <!-- 营收与利润趋势 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <h4 class="chart-title">营收与利润趋势</h4>
          <div ref="revenueChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="8">
          <h4 class="chart-title">成本构成</h4>
          <div ref="costChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <!-- 任务量与面积趋势 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <h4 class="chart-title">月度任务量趋势</h4>
          <div ref="taskChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <h4 class="chart-title">月度作业面积趋势</h4>
          <div ref="areaChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <!-- 经营明细表 -->
      <h4 class="chart-title" style="margin-top: 20px;">月度经营明细</h4>
      <el-table :data="monthlyData" stripe border style="width: 100%">
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="taskCount" label="任务数" width="80" align="center" />
        <el-table-column prop="totalArea" label="作业面积(亩)" width="120" align="center" />
        <el-table-column prop="revenue" label="营收(元)" width="120" align="right">
          <template #default="{ row }">
            <strong style="color: #409EFF;">{{ Number(row.revenue).toLocaleString() }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="pesticideCost" label="药剂成本(元)" width="120" align="right" />
        <el-table-column prop="laborCost" label="人工成本(元)" width="120" align="right" />
        <el-table-column prop="equipmentCost" label="设备成本(元)" width="120" align="right" />
        <el-table-column prop="totalCost" label="总成本(元)" width="120" align="right">
          <template #default="{ row }">
            <strong style="color: #F56C6C;">{{ Number(row.totalCost).toLocaleString() }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="利润(元)" width="120" align="right">
          <template #default="{ row }">
            <strong style="color: #67C23A;">{{ Number(row.profit).toLocaleString() }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="profitRate" label="利润率" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.profitRate >= 30 ? 'success' : row.profitRate >= 20 ? 'warning' : 'danger'" size="small">
              {{ row.profitRate }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const revenueChartRef = ref(null)
const costChartRef = ref(null)
const taskChartRef = ref(null)
const areaChartRef = ref(null)
const selectedMonth = ref('2024-06')
let revenueChart = null
let costChart = null
let taskChart = null
let areaChart = null

const summary = ref({
  totalRevenue: '52,800',
  totalProfit: '18,480',
  totalTasks: '86',
  profitRate: '35%'
})

const monthlyData = ref([
  { month: '2024-01', taskCount: 65, totalArea: 4200, revenue: 38000, pesticideCost: 5600, laborCost: 12000, equipmentCost: 3000, totalCost: 20600, profit: 17400, profitRate: 45.8 },
  { month: '2024-02', taskCount: 58, totalArea: 3800, revenue: 34500, pesticideCost: 4800, laborCost: 10800, equipmentCost: 2800, totalCost: 18400, profit: 16100, profitRate: 46.7 },
  { month: '2024-03', taskCount: 72, totalArea: 5100, revenue: 46000, pesticideCost: 6500, laborCost: 13500, equipmentCost: 3200, totalCost: 23200, profit: 22800, profitRate: 49.6 },
  { month: '2024-04', taskCount: 80, totalArea: 5800, revenue: 52500, pesticideCost: 7200, laborCost: 15000, equipmentCost: 3500, totalCost: 25700, profit: 26800, profitRate: 51.0 },
  { month: '2024-05', taskCount: 90, totalArea: 6500, revenue: 59000, pesticideCost: 8100, laborCost: 16800, equipmentCost: 3800, totalCost: 28700, profit: 30300, profitRate: 51.4 },
  { month: '2024-06', taskCount: 86, totalArea: 6200, revenue: 52800, pesticideCost: 7800, laborCost: 16200, equipmentCost: 3600, totalCost: 27600, profit: 25200, profitRate: 47.7 }
])

function initRevenueChart() {
  revenueChart = echarts.init(revenueChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  revenueChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['营收', '利润'], bottom: '5%' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', name: '金额(元)' },
    series: [
      {
        name: '营收', type: 'bar', barWidth: '30%',
        data: [38000, 34500, 46000, 52500, 59000, 52800],
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#409EFF' }
      },
      {
        name: '利润', type: 'line', smooth: true, yAxisIndex: 0,
        data: [17400, 16100, 22800, 26800, 30300, 25200],
        lineStyle: { color: '#67C23A', width: 3 },
        itemStyle: { color: '#67C23A' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(103,194,58,0.3)' }, { offset: 1, color: 'rgba(103,194,58,0.05)' }]) }
      }
    ]
  })
}

function initCostChart() {
  costChart = echarts.init(costChartRef.value)
  costChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}元 ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: 7800, name: '药剂成本', itemStyle: { color: '#E6A23C' } },
        { value: 16200, name: '人工成本', itemStyle: { color: '#409EFF' } },
        { value: 3600, name: '设备成本', itemStyle: { color: '#67C23A' } }
      ]
    }]
  })
}

function initTaskChart() {
  taskChart = echarts.init(taskChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  taskChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', name: '任务数' },
    series: [{
      type: 'line', smooth: true,
      data: [65, 58, 72, 80, 90, 86],
      lineStyle: { color: '#409EFF', width: 3 },
      itemStyle: { color: '#409EFF' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.05)' }]) }
    }]
  })
}

function initAreaChart() {
  areaChart = echarts.init(areaChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  areaChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', name: '面积(亩)' },
    series: [{
      type: 'bar', barWidth: '40%',
      data: [4200, 3800, 5100, 5800, 6500, 6200],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67C23A' }, { offset: 1, color: '#95d475' }
        ])
      }
    }]
  })
}

function handleSearch() {}
function handleExport() {}

function handleResize() {
  revenueChart && revenueChart.resize()
  costChart && costChart.resize()
  taskChart && taskChart.resize()
  areaChart && areaChart.resize()
}

onMounted(() => {
  initRevenueChart()
  initCostChart()
  initTaskChart()
  initAreaChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart && revenueChart.dispose()
  costChart && costChart.dispose()
  taskChart && taskChart.dispose()
  areaChart && areaChart.dispose()
})
</script>

<style scoped>
.monthly-report { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.filter-bar { display: flex; gap: 8px; }
.summary-row { margin-bottom: 24px; }
.summary-item { text-align: center; padding: 20px; border-radius: 8px; }
.summary-value { font-size: 28px; font-weight: 700; }
.summary-label { font-size: 13px; opacity: 0.85; margin-top: 8px; }
.chart-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; }
.chart-container { height: 320px; width: 100%; }
</style>
