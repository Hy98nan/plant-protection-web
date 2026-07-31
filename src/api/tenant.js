import request from './request'

export function getTenantList(params) {
  return request({
    url: '/tenants',
    method: 'get',
    params
  })
}

export function getAllTenants() {
  return request({
    url: '/tenants/list',
    method: 'get'
  })
}

export function getTenant(id) {
  return request({
    url: `/tenants/${id}`,
    method: 'get'
  })
}

export function createTenant(data) {
  return request({
    url: '/tenants',
    method: 'post',
    data
  })
}

export function updateTenant(id, data) {
  return request({
    url: `/tenants/${id}`,
    method: 'put',
    data
  })
}

export function deleteTenant(id) {
  return request({
    url: `/tenants/${id}`,
    method: 'delete'
  })
}

export function updateTenantStatus(id, status) {
  return request({
    url: `/tenants/${id}/status`,
    method: 'post',
    data: { status }
  })
}

export function extendTrial(id, days) {
  return request({
    url: `/tenants/${id}/extend-trial`,
    method: 'post',
    data: { days }
  })
}
