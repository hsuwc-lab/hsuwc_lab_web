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

@media (max-width: 720px) {
  .areas { grid-template-columns: minmax(0, 1fr); }
  .area, .area + .area { padding: 24px 0; border-left: 0; }
  .area + .area { border-top: 1px solid var(--color-rule); }
}
</style>