<template>
  <div class="performance-report">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>飞手绩效报表</span>
          <div class="filter-bar">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px" />
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="16" class="summary-row">
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">5</div>
            <div class="summary-label">飞手总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">712</div>
            <div class="summary-label">总完成任务</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">45,680</div>
            <div class="summary-label">总作业面积(亩)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">4.5</div>
            <div class="summary-label">平均评分</div>
          </div>
        </el-col>
      </el-row>

      <!-- 图表 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <h4 class="chart-title">飞手任务完成量对比</h4>
          <div ref="barChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <h4 class="chart-title">飞手作业面积占比</h4>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <h4 class="chart-title">飞手月度任务趋势</h4>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <!-- 飞手绩效表格 -->
      <h4 class="chart-title" style="margin-top: 20px;">飞手绩效明细</h4>
      <el-table :data="pilotData" stripe border style="width: 100%">
        <el-table-column prop="name" label="飞手" width="80" />
        <el-table-column prop="taskCount" label="完成任务数" width="110" align="center" />
        <el-table-column prop="totalArea" label="总作业面积(亩)" width="130" align="center" />
        <el-table-column prop="totalFlightTime" label="飞行时长(h)" width="110" align="center" />
        <el-table-column prop="avgEfficiency" label="平均效率(亩/h)" width="120" align="center" />
        <el-table-column prop="completionRate" label="完成率" width="100" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="客户评分" width="100" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled :size="14" />
          </template>
        </el-table-column>
        <el-table-column prop="earnings" label="总收入(元)" width="110" align="right">
          <template #default="{ row }">
            <strong style="color: #67C23A;">{{ Number(row.earnings).toLocaleString() }}</strong>
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

const pilotData = ref([
  { name: '张三', taskCount: 186, totalArea: 12300, totalFlightTime: 520, avgEfficiency: 23.7, completionRate: 96, rating: 5, earnings: 24600 },
  { name: '李四', taskCount: 142, totalArea: 9800, totalFlightTime: 380, avgEfficiency: 25.8, completionRate: 94, rating: 4, earnings: 19600 },
  { name: '王五', taskCount: 98, totalArea: 7200, totalFlightTime: 260, avgEfficiency: 27.7, completionRate: 92, rating: 4, earnings: 14400 },
  { name: '赵六', taskCount: 56, totalArea: 3800, totalFlightTime: 150, avgEfficiency: 25.3, completionRate: 88, rating: 3, earnings: 7600 },
  { name: '钱七', taskCount: 230, totalArea: 12580, totalFlightTime: 680, avgEfficiency: 18.5, completionRate: 98, rating: 5, earnings: 25160 }
])

function initBarChart() {
  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['张三', '李四', '王五', '赵六', '钱七'] },
    yAxis: { type: 'value', name: '任务数' },
    series: [{
      type: 'bar', barWidth: '40%',
      data: [186, 142, 98, 56, 230],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409EFF' }, { offset: 1, color: '#79bbff' }
        ])
      }
    }]
  })
}

function initPieChart() {
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}亩 ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie', radius: ['35%', '65%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: 12300, name: '张三', itemStyle: { color: '#409EFF' } },
        { value: 9800, name: '李四', itemStyle: { color: '#67C23A' } },
        { value: 7200, name: '王五', itemStyle: { color: '#E6A23C' } },
        { value: 3800, name: '赵六', itemStyle: { color: '#F56C6C' } },
        { value: 12580, name: '钱七', itemStyle: { color: '#909399' } }
      ]
    }]
  })
}

function initLineChart() {
  lineChart = echarts.init(lineChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['张三', '李四', '王五', '赵六', '钱七'], bottom: '5%' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false },
    yAxis: { type: 'value', name: '任务数' },
    series: [
      { name: '张三', type: 'line', smooth: true, data: [28, 32, 35, 30, 33, 28] },
      { name: '李四', type: 'line', smooth: true, data: [22, 25, 28, 24, 22, 21] },
      { name: '王五', type: 'line', smooth: true, data: [15, 18, 16, 17, 16, 16] },
      { name: '赵六', type: 'line', smooth: true, data: [8, 10, 12, 9, 10, 7] },
      { name: '钱七', type: 'line', smooth: true, data: [38, 42, 40, 36, 38, 36] }
    ]
  })
}

function handleSearch() {
  ElMessage.success('查询完成')
}

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
.performance-report { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.filter-bar { display: flex; gap: 8px; }
.summary-row { margin-bottom: 24px; }
.summary-item { text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; }
.summary-value { font-size: 28px; font-weight: 700; color: #409EFF; }
.summary-label { font-size: 13px; color: #999; margin-top: 8px; }
.chart-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; }
.chart-container { height: 320px; width: 100%; }
</style>
