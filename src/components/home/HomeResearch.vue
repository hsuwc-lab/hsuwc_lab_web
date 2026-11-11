<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import research from '../../data/research.json'
import { getSetting, pick } from '../../utils/content.js'
import ResearchIcon from '../ResearchIcon.vue'

const { t, locale } = useI18n()

const areas = computed(() =>
  [...research]
    .sort((a, b) => a.order - b.order)
    .map((area) => ({
      id: area.id,
      icon: area.icon,
      title: pick(area, 'title', locale.value),
      desc: pick(area, 'desc', locale.value),
    })),
)
</script>

<template>
  <section id="research" class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">Our Focus</p>
          <h2 class="section-title">{{ t('home.researchAreas') }}</h2>
          <p class="section-intro">{{ getSetting('research_intro', locale) }}</p>
        </div>
      </div>

      <div class="areas">
        <RouterLink
          v-for="area in areas"
          :key="area.id"
          :to="{ name: 'projects', query: { area: area.id } }"
          class="area"
        >
          <ResearchIcon :name="area.icon" />
          <h3 class="area-title">{{ area.title }}</h3>
          <p class="area-desc">{{ area.desc }}</p>
          <span class="area-more">{{ t('home.relatedProjects') }} →</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 三欄，上方一條深藍粗線，欄與欄之間細線分隔 */
.areas { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 2px solid var(--color-navy); }
.area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: calc(28px * var(--home-scale)) calc(28px * var(--home-scale)) calc(28px * var(--home-scale)) 0;
  color: inherit;
  text-decoration: none;
}
.area + .area { padding-left: calc(28px * var(--home-scale)); border-left: 1px solid var(--color-rule); }
.area-title { font-size: calc(1.25rem * var(--home-scale)); font-weight: 600; line-height: 1.3; }
.area-desc { flex: 1; color: var(--color-text-muted); }
.area-more { font-size: calc(0.875rem * var(--home-scale)); color: var(--color-blue); }
.area:hover .area-title { color: var(--color-blue); }
.area:hover .area-more { text-decoration: underline; }

/* 電腦版收合效果：研究領域從下方蓋到 Hero 上，收合完成時佔畫面下方 2/3 */
@media (min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference) {
  .section {
    position: relative;
    z-index: 1;                              /* 疊在黏住的 Hero 上面 */
    min-height: calc((100vh - var(--nav-height)) * 2 / 3);
    padding-top: clamp(24px, 4vh, 48px);
    padding-bottom: clamp(24px, 4vh, 48px);
    background: var(--color-bg);             /* 不透明，才蓋得住 Hero */
    border-top: 1px solid var(--color-rule);
    /* 第二個停靠點：研究領域底部對齊畫面底部 = 收合完成
       內容比 2/3 高時區塊會自動長高，卡片仍完整顯示，只是 Hero 留下的空間少一點 */
    scroll-snap-align: end;
  }
}

@media (max-width: 720px) {
  .areas { grid-template-columns: minmax(0, 1fr); }
  .area, .area + .area { padding: 24px 0; border-left: 0; }
  .area + .area { border-top: 1px solid var(--color-rule); }
}
</style>