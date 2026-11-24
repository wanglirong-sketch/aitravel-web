<template>
  <div class="pois">
    <FilterBar
      v-model:city="city"
      v-model:keyword="keyword"
      @change="load"
    />

    <div v-if="loading" class="empty">加载中…</div>
    <div v-else-if="error" class="empty">{{ error }}</div>
    <div v-else-if="!list.length" class="empty">
      没有找到相关点位，换个关键词或城市试试
    </div>

    <div v-else class="grid">
      <PoiCard
        v-for="p in list"
        :key="p.id || `${p.lng}_${p.lat}`"
        :poi="p"
        @select="openDetail"
      />
    </div>

    <PoiDetailModal :poi="selected" @close="closeDetail" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PoiCard from '../components/PoiCard.vue'
import FilterBar from '../components/FilterBar.vue'
import PoiDetailModal from '../components/PoiDetailModal.vue'
import { getOnlinePois } from '../api/poi'

const route = useRoute()

const city = ref('')

function getRouteKey() {
  return typeof route.query.key === 'string' ? route.query.key.trim() : ''
}

const keyword = ref(getRouteKey())
const list = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref(null)

const type = () => Number(route.meta.type)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getOnlinePois({
      city: city.value || undefined,
      type: type(),
      key: keyword.value.trim() || undefined
    })
    list.value = data || []
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function openDetail(poi) {
  selected.value = poi
}

function closeDetail() {
  selected.value = null
}

// 分类切换时清空城市；关键词跟随地址参数
watch(
  () => route.meta.type,
  () => {
    city.value = ''
    load()
  }
)

// 首页搜索跳转过来时，回填关键词并重新加载
watch(
  () => route.query.key,
  (key) => {
    keyword.value = typeof key === 'string' ? key.trim() : ''
    load()
  }
)

onMounted(load)
</script>

<style scoped>
.pois {
  min-height: 400px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.empty {
  padding: 60px 0;
  text-align: center;
  color: #9ca3af;
}
</style>
