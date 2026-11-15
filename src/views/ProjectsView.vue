<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { formatMonth, getProjects, getResearchArea, getResearchAreas, pick, splitList } from '../utils/content.js'

const {t, locale} = useI18n()
const route = useRoute()
const router = useRouter()

// 計畫屬於哪些領域：area 可以填多個（半形逗號分隔），只留 research 裡有的；一個都沒有就算「其他」
const AREA_IDS = new Set(getResearchAreas().map((area) => area.id))
function areaKeys(project) {
  const keys = splitList(project.area).filter((id) => AREA_IDS.has(id))
  return keys.length ? keys : ['other']
}

//下拉選單
const usedAreas = new Set(getProjects().flatMap(areaKeys))
const areaOptions = computed(() => {
  const options = getResearchAreas()
    .filter((area) => usedAreas.has(area.id))
    .map((area) => ({ id: area.id, title: pick(area, 'title', locale.value) }))
  if (usedAreas.has('other')) options.push({ id: 'other', title: t('projects.otherArea') })
  return options
})
const currentArea = computed(() => route.query.area || '')

// 整理成畫面要用的樣子
const projects = computed(() =>
  getProjects()
    .filter((project) => !currentArea.value || areaKeys(project).includes(currentArea.value))
    .map((project) => ({
      id: project.id,
      status: project.status,
      title: pick(project, 'title', locale.value),
      period: `${formatMonth(project.start)} – ${formatMonth(project.end) || t('projects.present')}`,
      pi: pick(project, 'pi', locale.value),
      funder: pick(project, 'funder', locale.value),
      projectNo: project.project_no,
      summary: pick(project, 'summary', locale.value),
      areas: areaKeys(project).map((key) =>
        key === 'other' ? t('projects.otherArea') : pick(getResearchArea(key), 'title', locale.value),
      ),
    })),
)

// 分成執行中、已結案兩組；沒有計畫的組不顯示
const groups = computed(() =>
  ['ongoing', 'completed']
    .map((status) => ({ status, items: projects.value.filter((project) => project.status === status) }))
    .filter((group) => group.items.length),
)

function setArea(value) {
  router.replace({ query: { ...route.query, area: value || undefined } })
}
</script>

<template>
  <PageHeader :title="t('nav.projects')" eyebrow="Research" />

  <div class="container content">
    <div class="filters">
      <label>
        {{ t('projects.area') }}
        <select :value="currentArea" @change="setArea($event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="area in areaOptions" :key="area.id" :value="area.id">{{ area.title }}</option>
        </select>
      </label>
      <span class="filters-count">{{ t('filters.count', { n: projects.length }) }}</span>
    </div>

    <section v-for="group in groups" :key="group.status" class="project-group">
      <h2 class="group-title">{{ t(`projects.status.${group.status}`) }}</h2>
      <ul class="project-list">
        <li v-for="project in group.items" :key="project.id" class="project">
          <p class="project-area">{{ project.areas.join('、') }}</p>
          <h3 class="project-title">
            <RouterLink :to="{ name: 'project-detail', params: { id: project.id } }">{{ project.title }}</RouterLink>
          </h3>
          <dl class="project-meta">
            <div><dt>{{ t('projects.period') }}</dt><dd>{{ project.period }}</dd></div>
            <div v-if="project.pi"><dt>{{ t('projects.pi') }}</dt><dd>{{ project.pi }}</dd></div>
            <div v-if="project.funder"><dt>{{ t('projects.funder') }}</dt><dd>{{ project.funder }}</dd></div>
            <div v-if="project.projectNo"><dt>{{ t('projects.projectNo') }}</dt><dd>{{ project.projectNo }}</dd></div>
          </dl>
          <p v-if="project.summary" class="project-summary">{{ project.summary }}</p>
        </li>
      </ul>
    </section>

    <p v-if="!projects.length" class="empty">
      {{ t('filters.empty') }}
      <RouterLink :to="{ name: 'projects' }">{{ t('filters.clear') }}</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.project-group + .project-group { margin-top: 56px; }
.group-title { margin-bottom: 8px; font-size: 1.6rem; font-weight: 400; }

.project-list { margin: 0; padding: 0; list-style: none; border-top: 2px solid var(--color-navy); }
.project { padding: 28px 0; border-bottom: 1px solid var(--color-rule); }
.project-area { margin: 0 0 6px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; color: var(--color-blue); }
.project-title { font-size: 1.3rem; font-weight: 400; line-height: 1.45; }
.project-title a { color: var(--color-navy); text-decoration: none; }
.project-title a:hover { color: var(--color-blue); text-decoration: underline; }

.project-meta { display: flex; flex-wrap: wrap; gap: 6px 28px; margin: 12px 0 0; font-size: 0.9rem; }
.project-meta div { display: flex; gap: 8px; }
.project-meta dt { color: var(--color-text-muted); }
.project-meta dd { margin: 0; }

.project-summary { max-width: 46em; margin: 12px 0 0; color: var(--color-text-muted); }
</style>