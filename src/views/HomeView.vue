<script setup>
import HomeHero from '../components/home/HomeHero.vue'
import HomeResearch from '../components/home/HomeResearch.vue'
import HomeTeam from '../components/home/HomeTeam.vue'
import HomeNews from '../components/home/HomeNews.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'

// Hero 收合效果的啟用條件，必須和下方 <style> 的 media query 一致
const COLLAPSE_QUERY = '(min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)'

// 收合進度超過這個值時，按鈕與右欄資訊改為不可點擊（和 HomeHero 淡出結束的時間點相同）
const HIDE_AT = 0.4

const stage = ref(null)

// ── 備援：瀏覽器不支援 CSS scroll-driven animations 時，改用 JS 計算 --progress ──
let media = null
let observer = null
let frame = 0
let start = 0      // 開始收合時的捲動位置
let distance = 1   // 從開始到收合完成要捲動的距離

// 量測位置：只在尺寸改變時做，捲動時不讀版面，避免卡頓
function measure() {
  const el = stage.value
  if (!el || !media.matches) return
  const hero = el.firstElementChild
  const stickyTop = parseFloat(getComputedStyle(hero).top) || 0
  start = el.getBoundingClientRect().top + window.scrollY - stickyTop
  distance = Math.max(1, el.offsetHeight - hero.offsetHeight)
  update()
}

// 依捲動位置算出 0～1 的進度，寫進 CSS 變數
function update() {
  frame = 0
  const el = stage.value
  if (!el || !media.matches) return
  const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
  el.style.setProperty('--progress', progress.toFixed(4))
  el.toggleAttribute('data-collapsed', progress >= HIDE_AT)
}

// 捲動事件可能一秒觸發上百次，用 requestAnimationFrame 合併成每個畫面最多算一次
function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  document.documentElement.classList.add('snap-page')

  if (CSS.supports('animation-timeline: view()')) return  // 支援的瀏覽器全部交給 CSS

  media = window.matchMedia(COLLAPSE_QUERY)
  window.addEventListener('scroll', onScroll, { passive: true })
  // 視窗大小、語言切換造成區塊高度改變時，重新量測
  observer = new ResizeObserver(measure)
  observer.observe(stage.value)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('snap-page')
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <!-- 舞台：包住 Hero 與研究領域，電腦版在這裡做收合效果 -->
  <div ref="stage" class="home-stage">
    <HomeHero />
    <HomeResearch />
  </div>
  <HomeTeam />
  <HomeNews />
</template>

<style scoped>
/* 註冊 --progress 為數字，CSS 動畫才能在 0～1 之間平滑變化（未註冊的變數只能跳換） */
@property --progress {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

@keyframes stage-progress {
  from { --progress: 0; }
  to { --progress: 1; }
}

/* 只在電腦版、且使用者沒有開啟「減少動態效果」時啟用 */
@media (min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference) {
  /* 第一個停靠點：Hero 整頁 */
  .home-stage { scroll-snap-align: start; }

  @supports (animation-timeline: view()) {
    .home-stage {
      /* 以舞台本身在畫面中的位置作為時間軸；上方扣掉導覽列高度 */
      view-timeline: --stage block;
      view-timeline-inset: var(--nav-height) 0px;
      /* contain：舞台頂端碰到導覽列下緣 → 舞台底端碰到畫面底部，正好是收合的捲動距離 */
      animation: stage-progress linear both;
      animation-timeline: --stage;
      animation-range: contain 0% contain 100%;
    }
  }
}
</style>
