import request from './request'

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteFile(path) {
  return request({ url: `/file/delete?path=${encodeURIComponent(path)}`, method: 'delete' })
}

export function getFileUrl(path) {
  return `/api/file/download?path=${encodeURIComponent(path)}`
}
