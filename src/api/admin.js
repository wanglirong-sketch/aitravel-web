import request from './request'

// 用户列表，keyword 可为空
export function listAdminUsers(keyword) {
  return request.get('/admin/users', {
    params: keyword ? { keyword } : {}
  })
}

// 删除用户
export function deleteAdminUser(id) {
  return request.delete(`/admin/users/${id}`)
}
