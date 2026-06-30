// 任务状态（统一三端定义）
export const TASK_STATUS = {
  DRAFT: { key: 'DRAFT', label: '草稿', type: 'info', color: '#909399' },
  PENDING: { key: 'PENDING', label: '待分配', type: 'warning', color: '#E6A23C' },
  ASSIGNED: { key: 'ASSIGNED', label: '待确认', type: 'warning', color: '#E6A23C' },
  CONFIRMED: { key: 'CONFIRMED', label: '已确认', type: 'primary', color: '#409EFF' },
  EXECUTING: { key: 'EXECUTING', label: '执行中', type: 'success', color: '#67C23A' },
  COMPLETED: { key: 'COMPLETED', label: '已完成', type: 'success', color: '#67C23A' },
  INTERRUPTED: { key: 'INTERRUPTED', label: '已中断', type: 'danger', color: '#F56C6C' },
  CANCELLED: { key: 'CANCELLED', label: '已取消', type: 'info', color: '#909399' }
}

export const TASK_STATUS_LIST = Object.values(TASK_STATUS)

// 任务类型
export const TASK_TYPES = [
  { key: 'spray', label: '喷洒作业' },
  { key: 'sow', label: '播种作业' },
  { key: 'fertilize', label: '施肥作业' },
  { key: 'survey', label: '巡检作业' }
]

// 优先级
export const PRIORITY_LEVELS = [
  { key: 'low', label: '低', color: '#909399' },
  { key: 'medium', label: '中', color: '#E6A23C' },
  { key: 'high', label: '高', color: '#F56C6C' },
  { key: 'urgent', label: '紧急', color: '#F56C6C' }
]

// 无人机状态
export const DRONE_STATUS = {
  IDLE: { key: 'idle', label: '空闲', type: 'success' },
  WORKING: { key: 'working', label: '作业中', type: 'primary' },
  MAINTAINING: { key: 'maintaining', label: '维护中', type: 'warning' },
  REPAIRED: { key: 'repaired', label: '已维修', type: 'info' },
  SCRAPPED: { key: 'scrapped', label: '已报废', type: 'danger' }
}

// 电池状态
export const BATTERY_STATUS = {
  NORMAL: { key: 'normal', label: '正常', type: 'success' },
  CHARGING: { key: 'charging', label: '充电中', type: 'primary' },
  DEGRADED: { key: 'degraded', label: '衰减', type: 'warning' },
  DAMAGED: { key: 'damaged', label: '损坏', type: 'danger' }
}

// 结算状态
export const SETTLEMENT_STATUS = {
  PENDING: { key: 'pending', label: '待结算', type: 'warning' },
  SETTLED: { key: 'settled', label: '已结算', type: 'success' },
  CANCELLED: { key: 'cancelled', label: '已取消', type: 'info' }
}

// 角色列表
export const ROLE_OPTIONS = [
  { key: 'SUPER_ADMIN', label: '超级管理员' },
  { key: 'ADMIN', label: '管理员' },
  { key: 'DISPATCHER', label: '调度员' },
  { key: 'PILOT', label: '飞手' },
  { key: 'FINANCE', label: '财务' }
]

// 角色中文映射
export const ROLE_MAP = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  DISPATCHER: '调度员',
  PILOT: '飞手',
  FINANCE: '财务'
}
