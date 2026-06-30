import request from './request'

export function getBatteryList(params) {
  return request({ url: '/batteries', method: 'get', params })
}

export function getBatteryDetail(id) {
  return request({ url: `/batteries/${id}`, method: 'get' })
}

export function createBattery(data) {
  return request({ url: '/batteries', method: 'post', data })
}

export function updateBattery(id, data) {
  return request({ url: `/batteries/${id}`, method: 'put', data })
}

export function deleteBattery(id) {
  return request({ url: `/batteries/${id}`, method: 'delete' })
}
