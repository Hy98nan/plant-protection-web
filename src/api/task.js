import request from './request'

export function getTaskList(params) {
  return request({ url: '/tasks', method: 'get', params })
}

export function getTaskDetail(id) {
  return request({ url: `/tasks/${id}`, method: 'get' })
}

export function createTask(data) {
  return request({ url: '/tasks', method: 'post', data })
}

export function saveDraft(data) {
  return request({ url: '/tasks/draft', method: 'post', data })
}

export function publishDraft(id) {
  return request({ url: `/tasks/${id}/publish`, method: 'post' })
}

export function updateTask(id, data) {
  return request({ url: `/tasks/${id}`, method: 'put', data })
}

export function deleteTask(id) {
  return request({ url: `/tasks/${id}`, method: 'delete' })
}

export function confirmTask(id) {
  return request({ url: `/tasks/${id}/confirm`, method: 'post' })
}

export function startTask(id) {
  return request({ url: `/tasks/${id}/start`, method: 'post' })
}

export function completeTask(id, data) {
  return request({ url: `/tasks/${id}/end`, method: 'post', data })
}

export function cancelTask(id, data) {
  return request({ url: `/tasks/${id}/cancel`, method: 'post', data })
}

export function assignPilot(id, data) {
  return request({ url: `/tasks/${id}/assign`, method: 'post', data })
}

export function reassignPilot(id, data) {
  return request({ url: `/tasks/${id}/reassign`, method: 'post', data })
}

export function getTaskStatistics() {
  return request({ url: '/tasks/statistics', method: 'get' })
}

export function getTaskTrend(params) {
  return request({ url: '/tasks/trend', method: 'get', params })
}

export function getTaskExceptions(taskId) {
  return request({ url: `/task-exceptions/task/${taskId}`, method: 'get' })
}

export function handleTaskException(id, params) {
  return request({ url: `/task-exceptions/${id}/handle`, method: 'put', params })
}
