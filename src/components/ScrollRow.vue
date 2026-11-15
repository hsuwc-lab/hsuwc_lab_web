<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// script 裡用不到 props（只有 template 用），所以不用 const props = 接住
defineProps({
  label: { type: String, default: '' },   // 給螢幕閱讀器的說明，例如「現任成員，可左右捲動」
  step: { type: Number, default: 1 },     // 按一次箭頭捲幾格
})

const { t } = useI18n()

const track = ref(null)          // 捲動的那一列
const bar = ref(null)            // 下方的捲動條
const scrollable = ref(false)    // 內容是否超出（需要捲動）
const atStart = ref(true)
const atEnd = ref(false)
const thumbWidth = ref(100)      // 捲動條滑塊寬度（%）
const thumbLeft = ref(0)         // 捲動條滑塊位置（%）

// 依目前捲動位置，更新箭頭與捲動條
function update() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  scrollable.value = max > 2
  atStart.value = el.scrollLeft <= 2
  atEnd.value = el.scrollLeft >= max - 2
  thumbWidth.value = Math.max((el.clientWidth / el.scrollWidth) * 100, 12)
  thumbLeft.value = max > 0 ? (el.scrollLeft / max) * (100 - thumbWidth.value) : 0
}

// 一格的寬度（含間距）：量第一個子元素，間距從 CSS 的 gap 讀
function itemWidth() {
  const el = track.value
  const first = el?.firstElementChild
  if (!first) return 0
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  return first.getBoundingClientRect().width + gap
}

function scrollItems(count) {
  track.value.scrollBy({ left: itemWidth() * count, behavior: 'smooth' })
}

// 鍵盤左右鍵
function onKeydown(event) {
  if (event.key === 'ArrowRight') { scrollItems(1); event.preventDefault() }
  if (event.key === 'ArrowLeft') { scrollItems(-1); event.preventDefault() }
}

// 拖曳或點擊捲動條
let dragging = false
function seek(clientX) {
  const rect = bar.value.getBoundingClientRect()
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
  const el = track.value
  el.scrollTo({ left: ratio * (el.scrollWidth - el.clientWidth) })
}
function onBarDown(event) {
  dragging = true
  bar.value.setPointerCapture(event.pointerId)
  seek(event.clientX)
}
function onBarMove(event) {
  if (dragging) seek(event.clientX)
}
function onBarUp() {
  dragging = false
}

onMounted(() => {
  update()
  window.addEventListener('resize', update)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', update)
})
</script>

<template>
  <div class="scroll-row">
    <!-- 上方：左邊放使用者給的標題（head 插槽），右邊是箭頭 -->
    <div class="scroll-head">
      <div><slot name="head" /></div>
      <div v-if="scrollable" class="arrows">
        <button type="button" :disabled="atStart" :aria-label="t('common.scrollPrev')" @click="scrollItems(-step)">←</button>
        <button type="button" :disabled="atEnd" :aria-label="t('common.scrollNext')" @click="scrollItems(step)">→</button>
      </div>
    </div>

    <!-- 捲動的一列：裡面放使用者給的內容（預設插槽） -->
    <div
      ref="track"
      class="track"
      data-scroll-row
      :tabindex="scrollable ? 0 : undefined"
      :aria-label="label || undefined"
      @scroll="update"
      @keydown="onKeydown"
    >
      <slot />
    </div>

    <div
      v-if="scrollable"
      ref="bar"
      class="bar"
      aria-hidden="true"
      @pointerdown="onBarDown"
      @pointermove="onBarMove"
      @pointerup="onBarUp"
      @pointercancel="onBarUp"
    >
      <div class="thumb" :style="{ width: thumbWidth + '%', left: thumbLeft + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.scroll-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-bottom: 24px; }
.arrows { display: flex; flex: none; gap: 8px; }
.arrows button {
  width: calc(36px * var(--home-scale));
  height: calc(36px * var(--home-scale));
  color: var(--color-navy);
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: 50%;
  cursor: pointer;
}
.arrows button:disabled { opacity: 0.35; cursor: default; }

/* 橫向捲動：每次停在完整的格子上；隱藏瀏覽器自己的捲動條 */
.track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.track::-webkit-scrollbar { display: none; }

/* 插槽放進來的每一格：寬度由使用者決定，這裡只管「不要被壓縮」和「對齊」 */
.track > :slotted(*) { flex-shrink: 0; scroll-snap-align: start; }

.bar { position: relative; height: 4px; margin-top: 20px; background: var(--color-rule); border-radius: 2px; cursor: pointer; touch-action: none; }
.thumb { position: absolute; top: 0; bottom: 0; background: var(--color-navy); border-radius: 2px; }

@media (prefers-reduced-motion: reduce) { .track { scroll-behavior: auto; } }
@media (max-width: 720px) { .arrows { display: none; } }   /* 手機用手指滑 */
</style>