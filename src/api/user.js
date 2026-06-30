import request from './request'

export function getUserList(params) {
  return request({ url: '/users', method: 'get', params })
}

export function getUserDetail(id) {
  return request({ url: `/users/${id}`, method: 'get' })
}

export function createUser(data) {
  return request({ url: '/users', method: 'post', data })
}

export function updateUser(id, data) {
  return request({ url: `/users/${id}`, method: 'put', data })
}

export function deleteUser(id) {
  return request({ url: `/users/${id}`, method: 'delete' })
}

export function resetPassword(id, data) {
  return request({ url: `/users/${id}/reset-password`, method: 'post', data })
}

export function assignRoles(userId, roleIds) {
  return request({ url: `/users/${userId}/roles`, method: 'post', data: roleIds })
}

export function getUserRoles(userId) {
  return request({ url: `/users/${userId}/roles`, method: 'get' })
}
