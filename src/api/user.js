import request from './request'

// 获取当前登录用户信息
export function getProfile() {
  return request.get('/user/me')
}

// 修改昵称、头像
export function updateProfile(data) {
  return request.put('/user/profile', data)
}

// 修改密码
export function changePassword(data) {
  return request.put('/user/password', data)
}
