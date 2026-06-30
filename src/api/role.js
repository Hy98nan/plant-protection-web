import request from './request'

export function getRoleList(params) {
  return request({ url: '/roles', method: 'get', params })
}

export function getRoleDetail(id) {
  return request({ url: `/roles/${id}`, method: 'get' })
}

export function createRole(data) {
  return request({ url: '/roles', method: 'post', data })
}

export function updateRole(id, data) {
  return request({ url: `/roles/${id}`, method: 'put', data })
}

export function deleteRole(id) {
  return request({ url: `/roles/${id}`, method: 'delete' })
}

export function getAllEnabledRoles() {
  return request({ url: '/roles/enabled', method: 'get' })
}

export function assignMenus(roleId, menuIds) {
  return request({ url: `/roles/${roleId}/menus`, method: 'post', data: menuIds })
}

export function getRoleMenus(roleId) {
  return request({ url: `/roles/${roleId}/menus`, method: 'get' })
}

export function getAllMenuTree() {
  return request({ url: '/roles/menus/tree', method: 'get' })
}
