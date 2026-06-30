import request from './request'

export function getPerformanceReport(params) {
  return request({ url: '/reports/pilot-performance', method: 'get', params })
}

export function getDroneUsageReport(params) {
  return request({ url: '/reports/drone-utilization', method: 'get', params })
}

export function getPesticideReport(params) {
  return request({ url: '/reports/pesticide-consumption', method: 'get', params })
}

export function getMonthlyReport(params) {
  return request({ url: '/reports/monthly-analysis', method: 'get', params })
}

export function exportReport(type, params) {
  return request({ url: `/reports/${type}/export`, method: 'get', params, responseType: 'blob' })
}
