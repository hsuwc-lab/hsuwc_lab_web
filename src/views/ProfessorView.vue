<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import defaultAvatar from '../assets/default-avatar.svg'
import { getProfessor, getProfessorRow, getProfessorSection, getSetting } from '../utils/content.js'

const { t, locale } = useI18n()
const base = import.meta.env.BASE_URL

const tabs = computed(() => [
  { label: t('nav.profile'), to: { name: 'professor' } },
  { label: t('nav.column'), to: { name: 'column' } },
  { label: t('nav.publications'), to: { name: 'publications' } },
])

// 姓名不隨語言改變，所以不用 computed
const nameRow = getProfessorRow('name')
const nameZh = nameRow?.text_zh || ''
const nameEn = nameRow?.text_en || ''

const title = computed(() => getProfessor('title', locale.value))
const photo = computed(() => {
  const file = getProfessor('photo', locale.value)
  return file ? `${base}images/professor/${file}` : defaultAvatar
})

// 右欄各區塊：id 對應試算表 section，label 對應介面文字，layout 決定怎麼排
//   text：一段一段的文字
//   period：左邊期間、右邊內容（學歷、經歷）
//   list：項目清單
const SECTIONS = [
  { id: '簡介', label: 'professor.bio', layout: 'text' },
  { id: '學歷', label: 'professor.education', layout: 'period' },
  { id: '經歷', label: 'professor.experience', layout: 'period' },
  { id: '研究專長', label: 'professor.expertise', layout: 'list' },
  { id: '開設課程', label: 'professor.courses', layout: 'list' },
  { id: '學術服務', label: 'professor.service', layout: 'list' },
  { id: 'Office Hours', label: 'professor.officeHours', layout: 'text' },
]

const sections = computed(() =>
  SECTIONS
    .map((section) => ({ ...section, items: getProfessorSection(section.id, locale.value) }))
    .filter((section) => section.items.length > 0),
)

// 左欄聯絡資訊：教授的聯絡資訊＋實驗室地址與地圖
const contacts = computed(() => getProfessorSection('聯絡資訊', locale.value))
const address = computed(() => getSetting('address', locale.value))
const mapUrl = computed(() => getSetting('map_url', locale.value))
</script>

<template>
  <PageHeader :title="t('nav.profile')" eyebrow="Professor" :tabs="tabs" />

  <div class="container content profile">
    <aside class="profile-side">
      <img :src="photo" alt="" class="profile-photo" />
      <h2 class="profile-name">{{ nameZh }}</h2>
      <p v-if="nameEn" class="profile-name-en">{{ t('common.profName', { name: nameEn }) }}</p>
      <p class="profile-title">{{ title }}</p>

      <div v-if="contacts.length || address" class="profile-contact">
        <h3 class="side-heading">{{ t('professor.contact') }}</h3>
        <p v-for="(item, index) in contacts" :key="index">{{ item.text }}</p>
        <p v-if="address">
          {{ address }}
          <a v-if="mapUrl" :href="mapUrl" target="_blank" rel="noopener">{{ t('common.openMap') }}</a>
        </p>
      </div>
    </aside>

    <div class="profile-main">
      <section v-for="section in sections" :key="section.id" class="profile-section">
        <h2 class="profile-heading">{{ t(section.label) }}</h2>

        <template v-if="section.layout === 'text'">
          <p v-for="(item, index) in section.items" :key="index" class="profile-text">{{ item.text }}</p>
        </template>

        <dl v-else-if="section.layout === 'period'" class="timeline">
          <div v-for="(item, index) in section.items" :key="index" class="timeline-row">
            <dt>{{ item.period }}</dt>
            <dd>{{ item.text }}</dd>
          </div>
        </dl>

        <ul v-else class="profile-list">
          <li v-for="(item, index) in section.items" :key="index">{{ item.text }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 64px;
  align-items: start;
}

/* 左欄：捲動時跟著停在畫面上 */
.profile-side { position: sticky; top: calc(var(--nav-height) + 24px); }
.profile-photo {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  background: var(--color-blue-soft);
  border-radius: var(--radius);
}
.profile-name { margin-top: 20px; font-size: 1.6rem; font-weight: 400; }
.profile-name-en { font-family: var(--font-display); font-style: italic; font-size: 1.05rem; color: var(--color-blue); }
.profile-title { margin-top: 4px; color: var(--color-text-muted); }

.profile-contact { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-rule); font-size: 0.9rem; }
.profile-contact p { margin: 0 0 6px; overflow-wrap: anywhere; }
.side-heading, .profile-heading {
  margin-bottom: 12px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-blue);
}

/* 右欄各區塊 */
.profile-section + .profile-section { margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--color-rule); }
.profile-text { max-width: 42em; margin: 0 0 12px; line-height: 1.8; }

.timeline { margin: 0; }
.timeline-row { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 16px; padding: 6px 0; }
.timeline-row dt { font-variant-numeric: tabular-nums; color: var(--color-text-muted); }
.timeline-row dd { margin: 0; }

.profile-list { margin: 0; padding-left: 1.2em; }
.profile-list li { margin-bottom: 4px; }

/* 720px 以下：單欄，照片縮小 */
@media (max-width: 720px) {
  .profile { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .profile-side { position: static; }
  .profile-photo { width: 180px; }
  .timeline-row { grid-template-columns: minmax(0, 1fr); gap: 0; }
}
</style>