import request from './request'

export function getPilotList(params) {
  return request({ url: '/pilots', method: 'get', params })
}

export function getPilotDetail(id) {
  return request({ url: `/pilots/${id}`, method: 'get' })
}

export function createPilot(data) {
  return request({ url: '/pilots', method: 'post', data })
}

export function updatePilot(id, data) {
  return request({ url: `/pilots/${id}`, method: 'put', data })
}

export function deletePilot(id) {
  return request({ url: `/pilots/${id}`, method: 'delete' })
}

export function getPilotOptions() {
  return request({ url: '/pilots/options', method: 'get' })
}

export function getAvailableUsers() {
  return request({ url: '/pilots/available-users', method: 'get' })
}

export function uploadLicenseImage(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({ url: `/pilots/${id}/license-image`, method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function approveAudit(id, data) {
  return request({ url: `/pilots/${id}/audit/approve`, method: 'put', data })
}

export function rejectAudit(id, data) {
  return request({ url: `/pilots/${id}/audit/reject`, method: 'put', data })
}
