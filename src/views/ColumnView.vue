<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="container">
    <h1>{{ t('nav.column') }}</h1>
  </div>
</template>
