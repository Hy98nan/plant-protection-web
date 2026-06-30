<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
          <div class="stat-icon">
            <el-icon :size="32"><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayTotal }}</div>
            <div class="stat-label">今日任务总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
          <div class="stat-icon">
            <el-icon :size="32"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待确认任务</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
          <div class="stat-icon">
            <el-icon :size="32"><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">执行中任务</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
          <div class="stat-icon">
            <el-icon :size="32"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成任务</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近7天任务趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button value="count">任务数量</el-radio-button>
                <el-radio-button value="area">作业面积</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>任务状态分布</span>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项和最近任务 -->
    <el-row :gutter="20" class="info-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-tag type="danger" size="small">{{ todoList.length }} 项待处理</el-tag>
            </div>
          </template>
          <div class="todo-list">
            <div v-for="item in todoList" :key="item.id" class="todo-item" @click="handleTodo(item)">
              <el-tag :type="item.tagType" size="small" effect="plain">{{ item.tag }}</el-tag>
              <span class="todo-text">{{ item.content }}</span>
              <span class="todo-time">{{ item.time }}</span>
            </div>
            <el-empty v-if="todoList.length === 0" description="暂无待办事项" :image-size="60" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
              <el-button type="primary" text size="small" @click="$router.push('/task/list')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentTasks" stripe size="small" style="width: 100%">
            <el-table-column prop="taskNo" label="任务编号" width="120" />
            <el-table-column prop="farmlandName" label="地块" min-width="100" show-overflow-tooltip />
            <el-table-column prop="pilotName" label="飞手" width="80" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scheduledDate" label="日期" width="110" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { TASK_STATUS_LIST } from '@/utils/constants'
import { getTaskStatistics, getTaskList } from '@/api/task'

const router = useRouter()
const trendChartRef = ref(null)
const statusChartRef = ref(null)
const trendType = ref('count')
let trendChart = null
let statusChart = null

const stats = ref({
  todayTotal: 0,
  pending: 0,
  inProgress: 0,
  completed: 0
})

const todoList = ref([])

const recentTasks = ref([])

// 加载统计数据
async function loadStats() {
  try {
    const res = await getTaskStatistics()
    if (res.data) {
      stats.value = {
        todayTotal: res.data.total || 0,
        pending: res.data.pending || 0,
        inProgress: res.data.executing || 0,
        completed: res.data.completed || 0
      }
    }
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}

// 加载最近任务
async function loadRecentTasks() {
  try {
    const res = await getTaskList({ pageNum: 1, pageSize: 5 })
    recentTasks.value = res.data.records || []
    
    // 生成待办事项（基于任务状态）
    const todos = []
    recentTasks.value.forEach(task => {
      if (task.status === 'PENDING') {
        todos.push({
          id: task.id,
          tag: '待确认',
          tagType: 'warning',
          content: `任务 ${task.taskNo} 等待确认`,
          time: task.plannedDate || ''
        })
      } else if (task.status === 'ASSIGNED') {
        todos.push({
          id: task.id,
          tag: '待执行',
          tagType: 'primary',
          content: `任务 ${task.taskNo} 已指派待执行`,
          time: task.plannedDate || ''
        })
      }
    })
    todoList.value = todos
  } catch (e) {
    console.error('加载最近任务失败', e)
  }
}

function getStatusType(status) {
  const item = TASK_STATUS_LIST.find(s => s.key === status)
  return item ? item.type : 'info'
}

function getStatusLabel(status) {
  const item = TASK_STATUS_LIST.find(s => s.key === status)
  return item ? item.label : status
}

function handleTodo(item) {
  router.push(`/task/detail/${item.id}`)
}

function initTrendChart() {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

function updateTrendChart() {
  if (!trendChart) return
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      name: trendType.value === 'count' ? '任务数(个)' : '面积(亩)',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: trendType.value === 'count' ? '任务数' : '作业面积',
        type: 'bar',
        barWidth: '40%',
        data: trendType.value === 'count'
          ? [stats.value.pending, stats.value.inProgress, stats.value.completed, 0, 0, 0, 0]
          : [0, 0, 0, 0, 0, 0, 0],
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79bbff' }
          ])
        }
      }
    ]
  }
  trendChart.setOption(option)
}

function initStatusChart() {
  if (!statusChartRef.value) return
  statusChart = echarts.init(statusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        data: [
          { value: stats.value.pending, name: '待确认', itemStyle: { color: '#E6A23C' } },
          { value: stats.value.inProgress, name: '执行中', itemStyle: { color: '#409EFF' } },
          { value: stats.value.completed, name: '已完成', itemStyle: { color: '#67C23A' } }
        ]
      }
    ]
  }
  statusChart.setOption(option)
}

function handleResize() {
  trendChart && trendChart.resize()
  statusChart && statusChart.resize()
}

watch(trendType, () => {
  nextTick(updateTrendChart)
})

onMounted(async () => {
  await loadStats()
  await loadRecentTasks()
  nextTick(() => {
    initTrendChart()
    initStatusChart()
  })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart && trendChart.dispose()
  statusChart && statusChart.dispose()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.info-row {
  margin-bottom: 20px;
}

.todo-list {
  max-height: 360px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background-color: #f5f7fa;
  margin: 0 -20px;
  padding: 12px 20px;
}

.todo-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}
</style>
