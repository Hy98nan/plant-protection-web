import request from './request'

export function getFarmlandList(params) {
  return request({ url: '/farmlands', method: 'get', params })
}

export function getFarmlandDetail(id) {
  return request({ url: `/farmlands/${id}`, method: 'get' })
}

export function createFarmland(data) {
  return request({ url: '/farmlands', method: 'post', data })
}

export function updateFarmland(id, data) {
  return request({ url: `/farmlands/${id}`, method: 'put', data })
}

export function deleteFarmland(id) {
  return request({ url: `/farmlands/${id}`, method: 'delete' })
}

export function getFarmlandOptions() {
  return request({ url: '/farmlands/options', method: 'get' })
}
