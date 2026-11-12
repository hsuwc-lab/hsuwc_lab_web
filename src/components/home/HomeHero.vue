<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProfessorRow, getSetting } from '../../utils/content.js'
import ScrollHint from './ScrollHint.vue'

const { t, locale } = useI18n()
const setting = (key) => getSetting(key, locale.value)

// 另一種語言：大標題用目前語言，副標用另一種
const otherLang = computed(() => (locale.value === 'zh' ? 'en' : 'zh'))

// 主持人：中文「姓名 職稱」在上、英文「Prof. 姓名」在下，不隨語言切換；沒有英文名就只顯示中文
const piName = getProfessorRow('name')
const piZh = [piName?.text_zh, getProfessorRow('title')?.text_zh].filter(Boolean).join(' ')
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-main">
        <h1 class="hero-title">{{ setting('lab_name') }}</h1>
        <p class="hero-sub">{{ getSetting('lab_name', otherLang) }}</p>
        <div class="hero-buttons hero-fade">
          <RouterLink :to="{ hash: '#research' }" class="btn btn-primary">
            {{ t('home.exploreResearch') }} <span aria-hidden="true">→</span>
          </RouterLink>
          <RouterLink :to="{ hash: '#news' }" class="btn btn-ghost">
            {{ t('home.latestNews') }}
          </RouterLink>
        </div>
      </div>

      <dl class="facts hero-fade">
        <div>
          <dt>{{ t('home.pi') }}</dt>
          <dd>
            <span class="pi-name">{{ piZh }}</span>
            <span v-if="piName?.text_en" class="pi-name-en">{{ t('common.profName', { name: piName.text_en }) }}</span>
          </dd>
        </div>
        <div v-if="setting('address')">
          <dt>{{ t('home.location') }}</dt>
          <dd>
            <span class="address">{{ setting('address') }}</span>
            <a v-if="setting('map_url')" :href="setting('map_url')" target="_blank" rel="noopener" class="map-link">
              {{ t('common.openMap') }}
            </a>
          </dd>
        </div>
      </dl>
    </div>
    <ScrollHint to="#research" />
  </section>
</template>

<style scoped>
.hero { background: var(--color-bg-soft); border-bottom: 1px solid var(--color-rule); }
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(260px, 30%, 340px);   /* 右欄只放主持人與地點，寬度固定範圍，讓標題有更多空間 */
  gap: 56px;
  align-items: end;
  padding-top: 72px;
  padding-bottom: 64px;
}
.hero-main { container-type: inline-size; }   /* 讓標題可以用 cqi（左欄寬度的百分比）設定字級 */
.hero-title { font-size: calc(clamp(2rem, 4.2vw, 3.2rem) * var(--home-scale)); line-height: 1.15; text-wrap: pretty; }
/* 英文名較長：720px 以上依左欄寬度縮小字級，盡量排成一行
   5.1cqi 約可讓目前的英文全名剛好一行；名稱變長時會自然換行，不會超出版面 */
@media (min-width: 721px) {
  .hero-title:lang(en) { font-size: min(calc(3.2rem * var(--home-scale)), 5.1cqi); }
}
.hero-sub { margin: 10px 0 18px; font-family: var(--font-display); font-style: italic; font-size: calc(clamp(1.05rem, 2vw, 1.3rem) * var(--home-scale)); color: var(--color-blue); }
.hero-buttons { display: flex; flex-wrap: wrap; gap: 12px; }

/* 右欄：左側細分隔線，主持人與地點上下排列 */
.facts { display: grid; gap: 28px; margin: 0; padding-left: 32px; border-left: 1px solid var(--color-rule); }
.facts dt {
  margin-bottom: 8px;
  font-size: calc(0.75rem * var(--home-scale));
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.facts dd { display: flex; flex-direction: column; gap: 2px; margin: 0; line-height: 1.5; }
.pi-name { font-family: var(--font-display); font-size: calc(1.35rem * var(--home-scale)); color: var(--color-navy); }
.pi-name-en { font-family: var(--font-display); font-style: italic; font-size: calc(1rem * var(--home-scale)); color: var(--color-text-muted); }
.address { font-size: calc(1rem * var(--home-scale)); }
.map-link { align-self: flex-start; margin-top: 4px; font-size: calc(0.85rem * var(--home-scale)); }

/* 電腦版收合效果：--progress 由 HomeView 提供（0 = 整頁，1 = 收合完成）
   只用 transform 與 opacity，捲動時不會觸發重排 */
@media (min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference) {
  /* Hero 黏在導覽列下方不動，研究領域從下方蓋上來，看起來就像 Hero 在縮短 */
  .hero {
    position: sticky;
    top: var(--nav-height);
    scroll-snap-align: none;   /* 停靠點改由外層舞台負責 */
    border-bottom: 0;          /* 分隔線改由研究領域上緣提供，避免兩條線疊在一起 */
  }
  .hero-inner { align-items: center; }

  /* 名稱區：往上移到上方 1/3 的中央，並縮小到 60%
     往上移的距離 = 畫面高度的 1/3，再補回按鈕淡出後留下的空間（約 20px） */
  .hero-main {
    transform-origin: left center;
    transform:
      translateY(calc(var(--progress) * (20px - (100vh - var(--nav-height)) / 3)))
      scale(calc(1 - 0.4 * var(--progress)));
  }

  /* 按鈕與右欄資訊：在前 40% 的進度內淡出 */
  .hero-fade { opacity: max(0, 1 - 2.5 * var(--progress)); }
  .facts { transform: translateY(calc(var(--progress) * -24px)); }

  /* 淡出後設為 hidden，滑鼠點不到、鍵盤 Tab 也不會停在看不見的按鈕上 */
  @supports (animation-timeline: view()) {
    .hero-fade {
      animation: hero-hide linear both;
      animation-timeline: --stage;
      animation-range: contain 0% contain 40%;
    }
  }
  .home-stage[data-collapsed] .hero-fade { visibility: hidden; }  /* JS 備援 */
}
@keyframes hero-hide {
  to { visibility: hidden; }
}

/* 960px 以下：單欄，右欄移到下方 */
@media (max-width: 960px) {
  .hero-inner { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  /* 主持人與地點左右並排，上方細分隔線 */
  .facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 40px;
    padding-left: 0;
    padding-top: 24px;
    border-left: 0;
    border-top: 1px solid var(--color-rule);
  }
}

/* 720px 以下：主持人與地點改回上下排列 */
@media (max-width: 720px) {
  .hero-inner { padding-top: 48px; padding-bottom: 48px; gap: 32px; }
  .facts { grid-template-columns: minmax(0, 1fr); gap: 24px; }
}
</style>