import request from './request'

export function getLoginStats() {
  return request({
    url: '/logs/dashboard-stats',
    method: 'get'
  })
}