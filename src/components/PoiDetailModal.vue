<template>
  <teleport to="body">
    <div v-if="poi" class="detail-mask" @click.self="close">
      <div class="detail-modal">
        <div class="detail-header">
          <h3>{{ poi.name }}</h3>
          <button class="close-btn" @click="close">×</button>
        </div>

        <div class="detail-body">
          <div class="meta-row">
            <span v-if="poi.rating" class="meta-item">
              评分：{{ poi.rating }}
            </span>
            <span v-if="poi.price" class="meta-item">
              人均：¥{{ poi.price }}/人
            </span>
          </div>

          <p v-if="poi.tags || poi.intro" class="detail-desc">
            {{ poi.tags || poi.intro }}
          </p>

          <p class="detail-address">
            {{ [poi.tips, poi.address].filter(Boolean).join(' · ') || '地址暂无' }}
          </p>

          <a
            v-if="amapUrl(poi)"
            :href="amapUrl(poi)"
            target="_blank"
            rel="noopener"
            class="amap-link"
          >
            在高德地图查看
          </a>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  poi: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function amapUrl(poi) {
  if (!poi.lng || !poi.lat) return ''

  const pos = `${poi.lng},${poi.lat}`
  const name = encodeURIComponent(poi.name || '')

  return `https://uri.amap.com/marker?position=${pos}&name=${name}&coordinate=gaode`
}
</script>

<style scoped>
.detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.detail-modal {
  width: 420px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.close-btn {
  border: none;
  background: #f3f4f6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
}

.detail-body {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  gap: 16px;
}

.meta-item {
  color: #f59e0b;
  font-weight: 600;
}

.detail-desc,
.detail-address {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.amap-link {
  color: #2563eb;
  text-decoration: none;
}

.amap-link:hover {
  text-decoration: underline;
}
</style>
