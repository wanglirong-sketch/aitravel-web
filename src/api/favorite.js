import request from './request'

/**
 * 获取当前用户收藏列表
 * type 可选：1 景点 2 美食 3 游玩项目 4 购物
 */
export function getFavorites(type) {
  return request.get('/favorites', {
    params: type ? { type } : {}
  })
}

/**
 * 获取收藏统计
 */
export function getFavoriteStats() {
  return request.get('/favorites/stats')
}

/**
 * 判断是否已收藏
 */
export function checkFavorite(params) {
  return request.get('/favorites/check', { params })
}

/**
 * 添加收藏
 */
export function addFavorite(data) {
  return request.post('/favorites', data)
}

/**
 * 按收藏记录 ID 删除
 */
export function deleteFavorite(id) {
  return request.delete(`/favorites/${id}`)
}

/**
 * 按点位唯一标识删除
 */
export function deleteFavoriteByKey(params) {
  return request.delete('/favorites/by-key', { params })
}
