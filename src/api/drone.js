import request from './request'

export function getDroneList(params) {
  return request({ url: '/drones', method: 'get', params })
}

export function getDroneDetail(id) {
  return request({ url: `/drones/${id}`, method: 'get' })
}

export function createDrone(data) {
  return request({ url: '/drones', method: 'post', data })
}

export function updateDrone(id, data) {
  return request({ url: `/drones/${id}`, method: 'put', data })
}

export function deleteDrone(id) {
  return request({ url: `/drones/${id}`, method: 'delete' })
}

export function getDroneOptions() {
  return request({ url: '/drones/options', method: 'get' })
}
