<template>
  <div class="drone-usage-report">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>无人机利用率报表</span>
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
            <div class="summary-label">无人机总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">72%</div>
            <div class="summary-label">平均利用率</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">3,140</div>
            <div class="summary-label">总飞行时长(h)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-value">867</div>
            <div class="summary-label">总任务数</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <h4 class="chart-title">各无人机利用率</h4>
          <div ref="usageChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <h4 class="chart-title">无人机状态分布</h4>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <h4 class="chart-title">月度飞行时长趋势</h4>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-col>
      </el-row>

      <h4 class="chart-title" style="margin-top: 20px;">无人机使用明细</h4>
      <el-table :data="droneData" stripe border style="width: 100%">
        <el-table-column prop="droneNo" label="编号" width="110" />
        <el-table-column prop="model" label="型号" width="80" />
        <el-table-column prop="brand" label="品牌" width="80" />
        <el-table-column prop="totalFlightTime" label="飞行时长(h)" width="110" align="center" />
        <el-table-column prop="totalTaskCount" label="任务数" width="80" align="center" />
        <el-table-column prop="totalArea" label="作业面积(亩)" width="120" align="center" />
        <el-table-column prop="utilization" label="利用率" width="150" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.utilization" :color="getUtilColor(row.utilization)" :stroke-width="10" :text-inside="true" />
          </template>
        </el-table-column>
        <el-table-column prop="avgFlightPerTask" label="平均时长/任务(h)" width="140" align="center" />
        <el-table-column prop="maintenanceCount" label="维护次数" width="90" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const usageChartRef = ref(null)
const statusChartRef = ref(null)
const trendChartRef = ref(null)
const dateRange = ref(null)
let usageChart = null
let statusChart = null
let trendChart = null

const droneData = ref([
  { droneNo: 'DJI-A001', model: 'T40', brand: '大疆', totalFlightTime: 320, totalTaskCount: 95, totalArea: 12300, utilization: 85, avgFlightPerTask: 3.37, maintenanceCount: 3 },
  { droneNo: 'DJI-A002', model: 'T40', brand: '大疆', totalFlightTime: 280, totalTaskCount: 82, totalArea: 9800, utilization: 78, avgFlightPerTask: 3.41, maintenanceCount: 2 },
  { droneNo: 'DJI-B001', model: 'T30', brand: '大疆', totalFlightTime: 650, totalTaskCount: 180, totalArea: 19700, utilization: 90, avgFlightPerTask: 3.61, maintenanceCount: 5 },
  { droneNo: 'XAG-P001', model: 'P80', brand: '极飞', totalFlightTime: 890, totalTaskCount: 260, totalArea: 25600, utilization: 82, avgFlightPerTask: 3.42, maintenanceCount: 4 },
  { droneNo: 'DJI-C001', model: 'T20', brand: '大疆', totalFlightTime: 1200, totalTaskCount: 350, totalArea: 35000, utilization: 25, avgFlightPerTask: 3.43, maintenanceCount: 8 }
])

function getUtilColor(val) {
  if (val >= 80) return '#67C23A'
  if (val >= 50) return '#E6A23C'
  return '#F56C6C'
}

function initUsageChart() {
  usageChart = echarts.init(usageChartRef.value)
  usageChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['DJI-A001', 'DJI-A002', 'DJI-B001', 'XAG-P001', 'DJI-C001'] },
    yAxis: { type: 'value', max: 100, name: '利用率(%)' },
    series: [{
      type: 'bar', barWidth: '40%',
      data: [
        { value: 85, itemStyle: { color: '#67C23A' } },
        { value: 78, itemStyle: { color: '#409EFF' } },
        { value: 90, itemStyle: { color: '#67C23A' } },
        { value: 82, itemStyle: { color: '#409EFF' } },
        { value: 25, itemStyle: { color: '#F56C6C' } }
      ],
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: 'top', formatter: '{c}%' }
    }]
  })
}

function initStatusChart() {
  statusChart = echarts.init(statusChartRef.value)
  statusChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}台 ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{c}台' },
      data: [
        { value: 2, name: '空闲', itemStyle: { color: '#67C23A' } },
        { value: 1, name: '作业中', itemStyle: { color: '#409EFF' } },
        { value: 1, name: '维护中', itemStyle: { color: '#E6A23C' } },
        { value: 1, name: '已报废', itemStyle: { color: '#909399' } }
      ]
    }]
  })
}

function initTrendChart() {
  trendChart = echarts.init(trendChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['DJI-A001', 'DJI-A002', 'DJI-B001', 'XAG-P001'], bottom: '5%' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false },
    yAxis: { type: 'value', name: '飞行时长(h)' },
    series: [
      { name: 'DJI-A001', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: [45, 52, 58, 55, 60, 50] },
      { name: 'DJI-A002', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: [40, 48, 50, 45, 52, 45] },
      { name: 'DJI-B001', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: [95, 110, 120, 105, 115, 105] },
      { name: 'XAG-P001', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: [130, 150, 160, 140, 155, 155] }
    ]
  })
}

function handleSearch() {}

function handleResize() {
  usageChart && usageChart.resize()
  statusChart && statusChart.resize()
  trendChart && trendChart.resize()
}

onMounted(() => {
  initUsageChart()
  initStatusChart()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  usageChart && usageChart.dispose()
  statusChart && statusChart.dispose()
  trendChart && trendChart.dispose()
})
</script>

<style scoped>
.drone-usage-report { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.filter-bar { display: flex; gap: 8px; }
.summary-row { margin-bottom: 24px; }
.summary-item { text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; }
.summary-value { font-size: 28px; font-weight: 700; color: #409EFF; }
.summary-label { font-size: 13px; color: #999; margin-top: 8px; }
.chart-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; }
.chart-container { height: 320px; width: 100%; }
</style>
