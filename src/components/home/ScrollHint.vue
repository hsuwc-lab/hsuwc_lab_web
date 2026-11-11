<script setup>
// 首頁區段底部的「往下」提示：一個細線箭頭，點擊後捲到下一個區段
// 只在電腦版「一區塊一頁」時顯示（條件同 base.css 第 11 節）；父層區段需為定位元素
import { useI18n } from 'vue-i18n'

defineProps({
  to: { type: String, required: true },  // 下一個區段的 id，例如 '#research'
})

const { t } = useI18n()
</script>

<template>
  <RouterLink :to="{ hash: to }" class="scroll-hint" :aria-label="t('home.nextSection')">
    <svg viewBox="0 0 24 12" width="24" height="12" aria-hidden="true">
      <path d="M2 2l10 8 10-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </RouterLink>
</template>

<style scoped>
.scroll-hint { display: none; }

@media (min-width: 961px) and (min-height: 640px) {
  .scroll-hint {
    position: absolute;
    bottom: 8px;
    left: 50%;
    display: grid;
    place-items: center;
    width: 44px;          /* 點擊範圍比箭頭大，比較好按 */
    height: 32px;
    margin-left: -22px;   /* 用 margin 置中，transform 留給下方的動畫 */
    color: var(--color-text-muted);
    opacity: 0.7;
  }
  .scroll-hint:hover,
  .scroll-hint:focus-visible { color: var(--color-navy); opacity: 1; }
}

/* 進頁 1 秒後輕輕往下點三次就停，不一直跳動；開啟「減少動態效果」時不動 */
@media (min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference) {
  .scroll-hint svg { animation: hint-nudge 2.4s ease-in-out 1s 3; }
}
@keyframes hint-nudge {
  0%, 100% { transform: none; }
  50% { transform: translateY(4px); }
}
</style>
