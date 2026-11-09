<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
</script>

<template>
  <div class="container">
    <h1>{{ t('nav.projects') }}</h1>
    <p>id：{{ route.params.id }}</p>
  </div>
</template>
