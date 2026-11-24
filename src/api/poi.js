import request from './request'

// 库内点位列表
// city 城市、type 类型（1景点 2美食 3项目 4购物）、key 关键词、tag 标签
export function getPois(params) {
  return request.get('/pois', { params })
}

// 库内点位详情
export function getPoiDetail(id) {
  return request.get('/pois/' + id)
}

// 规则检索（走 PoiService.search，支持自然语言）
export function searchPois(q) {
  return request.get('/pois/search', { params: { q } })
}

// 在线点位（高德实时数据）
// city 城市、type 类型（1景点 2美食 3项目 4购物）、key 关键词
// 拍照打卡页复用 type=1（景点/公园/地标）
export function getOnlinePois(params) {
  return request.get('/pois/online', { params })
}


/**
 * 生成点位唯一 key。
 * 后端 POI 优先用 id；在线 POI 没有 id 时，用高德 id / 名称地址 / 经纬度兜底。
 */
export function getPoiKey(poi) {
  if (!poi) return ''

  if (poi.poiKey) return String(poi.poiKey)
  if (poi.id != null && poi.id !== '') return `poi_${poi.id}`
  if (poi.uid) return `amap_${poi.uid}`
  if (poi.lng != null && poi.lat != null) {
    return `geo_${Number(poi.lng).toFixed(6)}_${Number(poi.lat).toFixed(6)}`
  }
  if (poi.name && poi.address) return `addr_${poi.name}_${poi.address}`
  if (poi.name) return `name_${poi.name}`

  return ''
}

/**
 * 把卡片原始 POI 整理成后端收藏接口需要的字段。
 */
export function buildFavoritePayload(poi) {
  return {
    poiId: poi.id != null && poi.id !== '' ? Number(poi.id) : null,
    poiKey: getPoiKey(poi),
    poiType: Number(poi.type ?? poi.poiType ?? 0) || null,
    name: poi.name || '',
    tags: poi.tags || '',
    intro: poi.intro || '',
    cover: poi.cover || '',
    rating: poi.rating != null && poi.rating !== '' ? Number(poi.rating) : null,
    price: poi.price != null && poi.price !== '' ? Number(poi.price) : null,
    tips: poi.tips || '',
    address: poi.address || '',
    lng: poi.lng != null && poi.lng !== '' ? Number(poi.lng) : null,
    lat: poi.lat != null && poi.lat !== '' ? Number(poi.lat) : null
  }
}
