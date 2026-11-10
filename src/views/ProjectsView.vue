<script setup>
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'

const { t } = useI18n()
</script>

<template>
  <PageHeader :title="t('nav.projects')" eyebrow="Research" />
  <div class="container content">（內容第六部分製作）</div>
</template>