<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'

const { t } = useI18n()

// 用 computed 包起來：切換語言時文字才會跟著更新
const crumbs = computed(() => [{ label: t('nav.professor'), to: { name: 'professor' } }])
const tabs = computed(() => [
  { label: t('nav.profile'), to: { name: 'professor' } },
  { label: t('nav.column'), to: { name: 'column' } },
  { label: t('nav.publications'), to: { name: 'publications' } },
])
</script>

<template>
  <PageHeader
    :title="t('nav.column')"
    eyebrow="Professor"
    :crumbs="crumbs"
    :tabs="tabs"
  />
  <div class="container content">（內容第六部分製作）</div>
</template>