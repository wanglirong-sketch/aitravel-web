import request from './request'

// 保存行程，body 是完整的 plan JSON
export function createItinerary(plan) {
  return request.post('/itineraries', plan)
}

// 我的行程列表
export function myItineraries() {
  return request.get('/itineraries')
}

// 兼容列表页导入名
export function listItineraries() {
  return myItineraries()
}

// 行程详情
export function getItinerary(id) {
  return request.get('/itineraries/' + id)
}

// 覆盖整份行程（微调应用时用）
export function replaceItinerary(id, plan) {
  return request.put('/itineraries/' + id, plan)
}

// 更新整份行程，兼容详情页导入名
export function updateItinerary(id, data) {
  return replaceItinerary(id, data)
}

// 删除行程
export function deleteItinerary(id) {
  return request.delete('/itineraries/' + id)
}

// 修改单个节点
export function updateItem(id, itemId, body) {
  return request.put('/itineraries/' + id + '/items/' + itemId, body)
}
