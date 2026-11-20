<!-- 開關燈按鈕：水豚側面剪影＋檯燈，點擊時水豚拉一下燈線，切換深淺色模式 -->

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { theme, toggleTheme } from '../utils/theme.js'

const { t } = useI18n()
const isDark = computed(() => theme.value === 'dark')
const label = computed(() => t(isDark.value ? 'common.themeToLight' : 'common.themeToDark'))

// 每次點擊重新播放拉線動畫：先移除 class，下一個畫格再加回去
const pulling = ref(false)
function onClick() {
  pulling.value = false
  requestAnimationFrame(() => {
    pulling.value = true
  })
  toggleTheme()
}
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :class="{ 'is-dark': isDark, 'is-pulling': pulling }"
    :aria-label="label"
    :aria-pressed="isDark"
    :title="label"
    @click="onClick"
    @animationend="pulling = false"
  >
    <svg viewBox="0 0 48 32" width="44" height="30" aria-hidden="true">
      <!-- 燈光：開燈時才顯示 -->
      <path class="glow" d="M32 13 L28.5 27 H45.5 L42 13 Z" />
      <!-- 檯燈：燈罩、燈桿、底座 -->
      <path class="lamp shade" d="M33.5 7 Q37 5.6 40.5 7 L43 12.5 H31 Z" />
      <line class="line" x1="37" y1="13" x2="37" y2="28" />
      <line class="line base" x1="33" y1="28.5" x2="41" y2="28.5" />
      <!-- 燈線與拉環：拉線時往下 -->
      <g class="cord">
        <line class="line thin" x1="32" y1="12.5" x2="32" y2="18.5" />
        <circle cx="32" cy="19.4" r="1" />
      </g>
      <!-- 坐著的水豚側面剪影（面向右）：圓圓的身體與頭、小耳朵 -->
      <path class="body" d="M4 29 C2 22 5 14 12 12 C15 11 17 9 20 8 C24 6.5 28 8 28 11.5 C28 14 26 15 23.5 15 C22 18 22 24 22 29 Z" />
      <circle class="body" cx="19.6" cy="7.6" r="1.4" />
      <circle class="eye" cx="24.2" cy="10" r="0.65" />
      <!-- 前腳：拉線時抬起伸向燈線 -->
      <line class="line arm" x1="21" y1="18" x2="21" y2="28.6" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  place-items: center;
  margin-left: 8px;
  padding: 2px;
  color: #fff;
  background: none;
  border: 0;
  border-radius: var(--radius);
  opacity: 0.85;
  cursor: pointer;
}
.theme-toggle:hover { opacity: 1; }
.theme-toggle:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* 全部單色白色；線條端點與轉角都用圓角 */
.body, .lamp, .cord circle { fill: currentColor; }
.lamp { stroke: currentColor; stroke-width: 1.2; stroke-linejoin: round; }
.line { stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
.line.thin { stroke-width: 0.8; }
.line.base { stroke-width: 2.2; }
.arm { stroke-width: 2.4; }
.eye { fill: var(--color-chrome); }

/* 燈光：開燈時淡淡的光束，關燈時消失；燈罩改成空心 */
.glow { fill: currentColor; opacity: 0.16; transition: opacity 0.3s; }
.is-dark .glow { opacity: 0; }
.is-dark .shade { fill: none; }

/* 拉線動畫：前腳以肩膀為軸抬起碰到燈線，燈線被往下拉，再一起回位 */
.arm { transform-box: view-box; transform-origin: 21px 18px; }
.is-pulling .arm { animation: reach 0.7s ease-in-out; }
.is-pulling .cord { animation: tug 0.7s ease-in-out; }

@keyframes reach {
  0%, 100% { transform: rotate(0); }
  35%, 60% { transform: rotate(-72deg); }
}
@keyframes tug {
  0%, 35%, 100% { transform: translateY(0); }
  55% { transform: translateY(2.5px); }
}

/* 使用者設定「減少動態效果」時不播放動畫 */
@media (prefers-reduced-motion: reduce) {
  .is-pulling .arm, .is-pulling .cord { animation: none; }
}
</style>
