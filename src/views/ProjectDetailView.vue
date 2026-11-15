<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import MemberCard from '../components/MemberCard.vue'
import {
  formatMonth, getMember, getProject, getProjectPublications, getResearchArea,
  paperLink, pick, splitList,
} from '../utils/content.js'

const { t, locale } = useI18n()
const route = useRoute()

const crumbs = computed(() => [{ label: t('nav.projects'), to: { name: 'projects' } }])

const project = computed(() => getProject(route.params.id))
const text = (field) => pick(project.value, field, locale.value)   // 少寫一點重複的 pick

const period = computed(() =>
  `${formatMonth(project.value?.start)} – ${formatMonth(project.value?.end) || t('projects.present')}`,
)
// 研究領域（可能多個）：對不到 research 的不列；一個都沒有時顯示「其他領域」
const areas = computed(() => {
  const found = splitList(project.value?.area).map((id) => getResearchArea(id)).filter(Boolean)
  if (found.length) return found.map((item) => ({ id: item.id, title: pick(item, 'title', locale.value) }))
  return [{ id: 'other', title: t('projects.otherArea') }]
})

// 計畫介紹：沒有詳細介紹時改用摘要
const description = computed(() => text('description') || text('summary'))

// 參與成員：依 member_ids 找人；找不到或設為不顯示的不列
const members = computed(() =>
  splitList(project.value?.member_ids)
    .map((id) => getMember(id))
    .filter((member) => member && member.show),
)

// 成員卡片上的身分文字
function memberLabel(member) {
  if (member.status === 'alumni') {
    const year = locale.value === 'zh' ? member.class_of : member.class_of + 1912
    return t('degrees.alumni', { year })
  }
  return t(`degrees.${member.degree}`)
}

// 研究團隊頁有列出這位成員時才加連結（交換生、專題生校友不在研究團隊頁上）
function memberLink(member) {
  const listed = member.status === 'current' || ['phd', 'ms'].includes(member.degree)
  return listed ? { name: 'people', hash: `#${member.id}` } : null
}

const publications = computed(() =>
  project.value
    ? getProjectPublications(project.value.id).map((item) => ({ ...item, link: paperLink(item) }))
    : [],
)
</script>

<template>
  <template v-if="project">
    <PageHeader :title="text('title')" :eyebrow="t(`projects.status.${project.status}`)" :crumbs="crumbs" />

    <div class="container content detail">
      <aside class="detail-side">
        <dl class="facts">
          <div><dt>{{ t('projects.period') }}</dt><dd>{{ period }}</dd></div>
          <div v-if="text('pi')"><dt>{{ t('projects.pi') }}</dt><dd>{{ text('pi') }}</dd></div>
          <div v-if="text('funder')"><dt>{{ t('projects.funder') }}</dt><dd>{{ text('funder') }}</dd></div>
          <div v-if="project.project_no"><dt>{{ t('projects.projectNo') }}</dt><dd>{{ project.project_no }}</dd></div>
          <div>
            <dt>{{ t('projects.area') }}</dt>
            <dd>
              <!-- 每個領域一個連結，點了回列表並篩選；其他領域連到 ?area=other -->
              <template v-for="(item, index) in areas" :key="item.id">
                <span v-if="index">、</span>
                <RouterLink :to="{ name: 'projects', query: { area: item.id } }">{{ item.title }}</RouterLink>
              </template>
            </dd>
          </div>
        </dl>
      </aside>

      <div class="detail-main">
        <section v-if="description" class="detail-section">
          <h2 class="detail-heading">{{ t('projects.description') }}</h2>
          <p class="detail-text">{{ description }}</p>
        </section>

        <section v-if="text('outcomes')" class="detail-section">
          <h2 class="detail-heading">{{ t('projects.outcomes') }}</h2>
          <p class="detail-text">{{ text('outcomes') }}</p>
        </section>

        <section v-if="members.length" class="detail-section">
          <h2 class="detail-heading">{{ t('projects.members') }}</h2>
          <ul class="member-grid">
            <li v-for="member in members" :key="member.id">
              <MemberCard :member="member" :label="memberLabel(member)" :to="memberLink(member)" />
            </li>
          </ul>
        </section>

        <section v-if="publications.length" class="detail-section">
          <h2 class="detail-heading">{{ t('projects.publications') }}</h2>
          <ul class="pub-list">
            <li v-for="item in publications" :key="item.id">
              <p class="pub-title">{{ item.title }}</p>
              <p class="pub-info">{{ item.authors }} · <em>{{ item.venue }}</em> · {{ item.year }}</p>
              <a v-if="item.link" :href="item.link" target="_blank" rel="noopener">{{ t('publications.read') }} ↗</a>
            </li>
          </ul>
          <RouterLink :to="{ name: 'publications' }" class="more">{{ t('projects.allPublications') }} →</RouterLink>
        </section>

        <RouterLink :to="{ name: 'projects' }" class="back">← {{ t('projects.back') }}</RouterLink>
      </div>
    </div>
  </template>

  <template v-else>
    <PageHeader :title="t('projects.notFound')" :crumbs="crumbs" />
    <div class="container content">
      <RouterLink :to="{ name: 'projects' }">← {{ t('projects.back') }}</RouterLink>
    </div>
  </template>
</template>

<style scoped>
.detail { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 64px; align-items: start; }

.detail-side { position: sticky; top: calc(var(--nav-height) + 24px); }
.facts { display: grid; gap: 16px; margin: 0; padding-top: 16px; border-top: 2px solid var(--color-navy); }
.facts dt { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); }
.facts dd { margin: 2px 0 0; }

.detail-section + .detail-section { margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--color-rule); }
.detail-heading { margin-bottom: 12px; font-family: inherit; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-blue); }
.detail-text { max-width: 42em; line-height: 1.8; white-space: pre-line; }   /* 試算表裡的換行在頁面上也換行 */

.member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 28px 16px; margin: 0; padding: 0; list-style: none; }

.pub-list { margin: 0; padding: 0; list-style: none; }
.pub-list li + li { margin-top: 20px; }
.pub-title { margin: 0; font-weight: 600; }
.pub-info { margin: 2px 0 4px; font-size: 0.9rem; color: var(--color-text-muted); }
.more { display: inline-block; margin-top: 20px; font-size: 0.9rem; }

.back { display: inline-block; margin-top: 48px; }

@media (max-width: 720px) {
  .detail { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .detail-side { position: static; }
  .member-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>