import request from './request'


//获取验证码图片
export function getCaptcha() {
  return request.get('/auth/captcha')
}
// 登录：phone + password
export function login(data) {
  return request.post('/auth/login', data)
}

// 注册：phone + password + nickname
export function register(data) {
  return request.post('/auth/register', data)
}

// 刷新令牌
export function refreshToken(token) {
  return request.post('/auth/refresh?refreshToken=' + encodeURIComponent(token))
}

// 当前登录用户 id
export function getMe() {
  return request.get('/user/me')
}
