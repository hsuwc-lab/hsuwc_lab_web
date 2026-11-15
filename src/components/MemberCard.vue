<script setup>
import { RouterLink } from 'vue-router'
import defaultAvatar from '../assets/default-avatar.svg'

// 從外面傳進來的資料
const props = defineProps({
  member: { type: Object, required: true },   // members.json 的一列
  label: { type: String, default: '' },       // 身分文字，由外面決定（碩士生、113 級校友…）
  to: { type: Object, default: null },        // 有給就整張卡片可以點
})

const base = import.meta.env.BASE_URL
const photo = props.member.photo ? `${base}images/members/${props.member.photo}` : defaultAvatar
</script>

<template>
  <component :is="to ? RouterLink : 'div'" :to="to || undefined" class="member-card">
    <img :src="photo" alt="" class="member-avatar" loading="lazy" />
    <p class="member-name">{{ member.name_zh }}</p>
    <p v-if="member.name_en" class="member-name-en">{{ member.name_en }}</p>
    <p v-if="label" class="member-label">{{ label }}</p>
  </component>
</template>

<style scoped>
.member-card { display: block; text-align: center; color: inherit; text-decoration: none; }
.member-avatar {
  display: block;
  width: 120px;
  aspect-ratio: 1;
  margin: 0 auto 12px;
  object-fit: cover;
  background: var(--color-blue-soft);
  border: 1px solid var(--color-rule);
  border-radius: 50%;
}
.member-name { margin: 0; font-family: var(--font-display); font-size: 1.05rem; color: var(--color-navy); }
.member-name-en { margin: 0; font-size: 0.85rem; color: var(--color-text); }
.member-label { margin: 4px 0 0; font-size: 0.8rem; color: var(--color-text-muted); }
a.member-card:hover .member-name { color: var(--color-blue); text-decoration: underline; }
</style>