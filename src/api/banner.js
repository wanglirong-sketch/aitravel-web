import request from './request'

export function listBanners() {
  return request.get('/admin/banners')
}

export function createBanner(data) {
  return request.post('/admin/banners', data)
}

export function updateBanner(id, data) {
  return request.put(`/admin/banners/${id}`, data)
}

export function deleteBanner(id) {
  return request.delete(`/admin/banners/${id}`)
}

export function uploadBannerImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/banners/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function listPublicBanners() {
  return request.get('/banners/public')
}
