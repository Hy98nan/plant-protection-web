import request from './request'

export function getSettlementList(params) {
  return request({ url: '/settlements', method: 'get', params })
}

export function getSettlementDetail(id) {
  return request({ url: `/settlements/${id}`, method: 'get' })
}

export function createSettlement(data) {
  return request({ url: '/settlements', method: 'post', data })
}

export function confirmSettlement(id) {
  return request({ url: `/settlements/${id}/confirm`, method: 'post' })
}

export function cancelSettlement(id) {
  return request({ url: `/settlements/${id}/cancel`, method: 'post' })
}

export function exportSettlement(params) {
  return request({ url: '/settlements/export', method: 'get', params, responseType: 'blob' })
}
