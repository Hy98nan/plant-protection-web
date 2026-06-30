<template>
  <div class="pesticide-report">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>药剂消耗统计</span>
          <div class="filter-bar">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px" />
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="16" class="summary-row">
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">5</div>
            <div class="summary-label">药剂种类</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">233</div>
            <div class="summary-label">总消耗量(升)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">4,815</div>
            <div class="summary-label">总费用(元)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">20.7</div>
            <div class="summary-label">平均单价(元/升)</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <h4 class="chart-title">各药剂消耗量对比</h4>
          <div ref="barChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <h4 class="chart-title">药剂费用占比</h4>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <h4 class="chart-title">月度药剂消耗趋势</h4>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <h4 class="chart-title" style="margin-top: 20px;">药剂消耗明细</h4>
      <el-table :data="pesticideData" stripe border style="width: 100%" show-summary :summary-method="getSummary">
        <el-table-column prop="name" label="药剂名称" width="120" />
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">{{ getTypeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="consumption" label="消耗量(升)" width="110" align="center" />
        <el-table-column prop="unitPrice" label="单价(元/升)" width="110" align="right" />
        <el-table-column prop="totalCost" label="总费用(元)" width="110" align="right">
          <template #default="{ row }">
            <strong style="color: #F56C6C;">{{ Number(row.totalCost).toLocaleString() }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="taskCount" label="使用任务数" width="100" align="center" />
        <el-table-column prop="avgPerTask" label="平均用量(升/任务)" width="140" align="center" />
        <el-table-column prop="stock" label="当前库存(升)" width="110" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.stock < 10 ? '#F56C6C' : '#333', fontWeight: row.stock < 10 ? '600' : 'normal' }">
              {{ row.stock }} {{ row.stock < 10 ? '(库存不足)' : '' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const barChartRef = ref(null)
const pieChartRef = ref(null)
const lineChartRef = ref(null)
const dateRange = ref(null)
let barChart = null
let pieChart = null
let lineChart = null

const pesticideData = ref([
  { name: '草甘膦', type: 'herbicide', consumption: 80, unitPrice: 15, totalCost: 1200, taskCount: 45, avgPerTask: 1.78, stock: 50 },
  { name: '吡虫啉', type: 'insecticide', consumption: 35, unitPrice: 25, totalCost: 875, taskCount: 28, avgPerTask: 1.25, stock: 30 },
  { name: '多菌灵', type: 'fungicide', consumption: 48, unitPrice: 18, totalCost: 864, taskCount: 32, avgPerTask: 1.50, stock: 8 },
  { name: '阿维菌素', type: 'insecticide', consumption: 40, unitPrice: 35, totalCost: 1400, taskCount: 22, avgPerTask: 1.82, stock: 45 },
  { name: '磷酸二氢钾', type: 'foliar', consumption: 30, unitPrice: 8, totalCost: 240, taskCount: 18, avgPerTask: 1.67, stock: 100 }
])

const typeMap = { insecticide: '杀虫剂', fungicide: '杀菌剂', herbicide: '除草剂', foliar: '叶面肥' }
function getTypeLabel(t) { return typeMap[t] || t }

function getSummary({ columns, data }) {
  const sums = []
  columns.forEach((col, index) => {
    if (index === 0) { sums[index] = '合计'; return }
    if (['consumption', 'totalCost', 'taskCount'].includes(col.property)) {
      sums[index] = data.reduce((sum, row) => sum + Number(row[col.property] || 0), 0)
    } else { sums[index] = '' }
  })
  return sums
}

function initBarChart() {
  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['草甘膦', '吡虫啉', '多菌灵', '阿维菌素', '磷酸二氢钾'] },
    yAxis: { type: 'value', name: '消耗量(升)' },
    series: [{
      type: 'bar', barWidth: '40%',
      data: [80, 35, 48, 40, 30],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#E6A23C' }, { offset: 1, color: '#f0c78a' }
        ])
      }
    }]
  })
}

function initPieChart() {
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}元 ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie', radius: ['35%', '65%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: 1200, name: '草甘膦', itemStyle: { color: '#E6A23C' } },
        { value: 875, name: '吡虫啉', itemStyle: { color: '#409EFF' } },
        { value: 864, name: '多菌灵', itemStyle: { color: '#67C23A' } },
        { value: 1400, name: '阿维菌素', itemStyle: { color: '#F56C6C' } },
        { value: 240, name: '磷酸二氢钾', itemStyle: { color: '#909399' } }
      ]
    }]
  })
}

function initLineChart() {
  lineChart = echarts.init(lineChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['草甘膦', '吡虫啉', '多菌灵', '阿维菌素'], bottom: '5%' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false },
    yAxis: { type: 'value', name: '消耗量(升)' },
    series: [
      { name: '草甘膦', type: 'line', smooth: true, data: [10, 12, 15, 14, 16, 13] },
      { name: '吡虫啉', type: 'line', smooth: true, data: [5, 6, 7, 5, 7, 5] },
      { name: '多菌灵', type: 'line', smooth: true, data: [6, 8, 9, 8, 10, 7] },
      { name: '阿维菌素', type: 'line', smooth: true, data: [5, 7, 8, 6, 8, 6] }
    ]
  })
}

function handleSearch() {}

function handleResize() {
  barChart && barChart.resize()
  pieChart && pieChart.resize()
  lineChart && lineChart.resize()
}

onMounted(() => {
  initBarChart()
  initPieChart()
  initLineChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  barChart && barChart.dispose()
  pieChart && pieChart.dispose()
  lineChart && lineChart.dispose()
})
</script>

<style scoped>
.pesticide-report { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.filter-bar { display: flex; gap: 8px; }
.summary-row { margin-bottom: 24px; }
.summary-item { text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; }
.summary-value { font-size: 28px; font-weight: 700; color: #409EFF; }
.summary-label { font-size: 13px; color: #999; margin-top: 8px; }
.chart-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; }
.chart-container { height: 320px; width: 100%; }
</style>
