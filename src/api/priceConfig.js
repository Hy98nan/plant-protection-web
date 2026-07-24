import request from './request.js'

export const getPriceConfigPage = (params) => {
  return request({
    url: '/price-configs/page',
    method: 'GET',
    params
  })
}

export const getPriceConfigById = (id) => {
  return request({
    url: `/price-configs/${id}`,
    method: 'GET'
  })
}

export const createPriceConfig = (data) => {
  return request({
    url: '/price-configs',
    method: 'POST',
    data
  })
}

export const updatePriceConfig = (id, data) => {
  return request({
    url: `/price-configs/${id}`,
    method: 'PUT',
    data
  })
}

export const deletePriceConfig = (id) => {
  return request({
    url: `/price-configs/${id}`,
    method: 'DELETE'
  })
}

export const calculatePrice = (params) => {
  return request({
    url: '/price-configs/calculate',
    method: 'GET',
    params
  })
}