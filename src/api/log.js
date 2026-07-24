import request from './request'

export const pageLoginLog = (params) => {
  return request({
    url: '/logs/login/page',
    method: 'get',
    params
  })
}

export const pageOperationLog = (params) => {
  return request({
    url: '/logs/operation/page',
    method: 'get',
    params
  })
}
