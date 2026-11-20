<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import { classYear, getThesisGroups } from '../utils/content.js'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const tabs = computed(() => [
  { label: t('nav.members'), to: { name: 'people' } },
  { label: t('nav.theses'), to: { name: 'theses' } },
])

// 論文題目與姓名不分語言，讀一次就好；只有標籤文字會隨語言變
const allGroups = getThesisGroups()
const all = allGroups.flatMap((group) => group.items)

// 統計與下拉選單選項：都依「全部論文」計算，不受篩選影響
const DEGREES = ['phd', 'ms']
const degrees = DEGREES.filter((degree) => all.some((item) => item.degree === degree))   // 只列出有資料的學位
const classes = allGroups.map((group) => group.key)                                       // 已經是新到舊
const counts = {
  phd: all.filter((item) => item.degree === 'phd').length,
  ms: all.filter((item) => item.degree === 'ms').length,
}

// 目前的篩選條件（網址裡都是字串，級別要轉成數字才能和資料比較）
const currentDegree = computed(() => route.query.degree || '')
const currentClass = computed(() => Number(route.query.class) || 0)

// 篩選後的分組；整組被篩空的不要
const groups = computed(() =>
  allGroups
    .filter((group) => !currentClass.value || group.key === currentClass.value)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !currentDegree.value || item.degree === currentDegree.value),
    }))
    .filter((group) => group.items.length),
)
const filteredCount = computed(() => groups.value.reduce((sum, group) => sum + group.items.length, 0))

// 分組標題，同成員頁：「115 級校友」／「Alumni, Class of 2026」
const groupTitle = (classOf) => t('degrees.alumni', { year: classYear(classOf, locale.value) })

// 中文題目在上、英文在下，比照論文標題保留原文，不隨語言切換
const titles = (member) => [member.thesis_title_zh, member.thesis_title_en].filter(Boolean)

function setFilter(key, value) {
  router.replace({ query: { ...route.query, [key]: value || undefined } })
}
</script>

<template>
  <PageHeader :title="t('nav.theses')" eyebrow="Our People" :tabs="tabs" />

  <div class="container content">
    <p v-if="!all.length" class="empty">{{ t('theses.none') }}</p>

    <template v-else>
      <p class="stats">{{ t('theses.stats', counts) }}</p>

      <div class="filters">
        <label>
          {{ t('theses.degree') }}
          <select :value="currentDegree" @change="setFilter('degree', $event.target.value)">
            <option value="">{{ t('filters.all') }}</option>
            <option v-for="degree in degrees" :key="degree" :value="degree">{{ t(`people.graduated.${degree}`) }}</option>
          </select>
        </label>
        <label>
          {{ t('theses.class') }}
          <select :value="currentClass || ''" @change="setFilter('class', $event.target.value)">
            <option value="">{{ t('filters.all') }}</option>
            <option v-for="classOf in classes" :key="classOf" :value="classOf">
              {{ t('theses.classOption', { year: classYear(classOf, locale) }) }}
            </option>
          </select>
        </label>
        <span class="filters-count">{{ t('filters.count', { n: filteredCount }) }}</span>
      </div>

      <section v-for="group in groups" :key="group.key" class="class-group">
        <h2 :id="`class-${group.key}`" class="group-title">{{ groupTitle(group.key) }}</h2>
        <ul class="thesis-list">
          <li v-for="member in group.items" :key="member.id" class="thesis-row">
            <span class="label label-blue thesis-degree">{{ t(`people.graduated.${member.degree}`) }}</span>
            <div class="thesis-body">
              <p
                v-for="(title, index) in titles(member)"
                :key="index"
                :class="index ? 'thesis-title-sub' : 'thesis-title'"
              >{{ title }}</p>
              <p class="thesis-author">
                {{ member.name_zh }}<template v-if="member.name_en">　{{ member.name_en }}</template>
              </p>
            </div>
            <a v-if="member.thesis_url" :href="member.thesis_url" target="_blank" rel="noopener" class="thesis-link">
              {{ t('theses.link') }} ↗
            </a>
          </li>
        </ul>
      </section>

      <p v-if="!groups.length" class="empty">
        {{ t('filters.empty') }}
        <RouterLink :to="{ name: 'theses' }">{{ t('filters.clear') }}</RouterLink>
      </p>
    </template>
  </div>
</template>

<style scoped>
.stats { margin-bottom: 20px; color: var(--color-text-muted); }

.class-group + .class-group { margin-top: 40px; }
/* 分組標題：同成員頁的屆別標題（小型大寫藍字） */
.group-title {
  margin-bottom: 4px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-blue);
}

/* 每篇論文一列：學位標籤｜題目與作者｜連結，列與列之間細線（同消息與獲獎） */
.thesis-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--color-rule); }
.thesis-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 20px;
  align-items: baseline;
  padding: 20px 4px;
  border-bottom: 1px solid var(--color-rule);
}
.thesis-degree { justify-self: start; }
.thesis-title { font-size: 1.05rem; line-height: 1.5; color: var(--color-text); }
.thesis-title-sub { margin-top: 2px; font-size: 0.95rem; line-height: 1.5; color: var(--color-text-muted); }
.thesis-author { margin-top: 6px; font-size: 0.9rem; color: var(--color-text-muted); }
.thesis-link { font-size: 0.9rem; white-space: nowrap; }

/* 720px 以下：上下堆疊 */
@media (max-width: 720px) {
  .thesis-row { grid-template-columns: minmax(0, 1fr); gap: 6px; }
}
</style>
