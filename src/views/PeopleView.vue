<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '../components/PageHeader.vue'
import MemberCard from '../components/MemberCard.vue'
import ScrollRow from '../components/ScrollRow.vue'
import defaultAvatar from '../assets/default-avatar.svg'
import { getAlumniGroups, getMemberGroups, getSetting, pick } from '../utils/content.js'

const {t, locale} = useI18n()
const base = import.meta.env.BASE_URL

//現任成員與校友名單
const memberGroups = getMemberGroups()
const alumniGroups = getAlumniGroups()

//校友區塊標題（中：級別 / 英：西元年）
function alumniTitle(classOf){
  const year = locale.value === 'zh' ? classOf : classOf+1911
  return t('degrees.alumni', { year })
}

//校友頭像
const avatar = (member) => (member.photo ? 
  `${base}images/members/${member.photo}` : defaultAvatar
)

const joinText = computed(() => getSetting('join_text', locale.value))
const email = computed(() => getSetting('email', locale.value))
</script>

<template>
  <PageHeader :title="t('nav.people')" eyebrow="Our People" />

  <div class="container content">
    <!-- 現任成員：格子排列 -->
    <section class="people-section">
      <h2 class="people-heading">{{ t('people.current') }}</h2>
      <div v-for="group in memberGroups" :key="group.key" class="member-group">
        <h3 class="group-title">{{ t(`people.groups.${group.key}`) }}</h3>
        <ul class="member-grid">
          <li v-for="member in group.items" :key="member.id">
            <MemberCard :id="member.id" :member="member" :label="t(`degrees.${member.degree}`)" />
          </li>
        </ul>
      </div>
    </section>

    <!-- 歷屆畢業生：每屆一列，放不下時左右拖拉 -->
    <section v-if="alumniGroups.length" class="people-section">
      <h2 class="people-heading">{{ t('people.alumni') }}</h2>
      <ScrollRow
        v-for="group in alumniGroups"
        :key="group.key"
        :label="alumniTitle(group.key)"
        :step="2"
        class="alumni-group"
      >
        <template #head>
          <h3 class="group-title">{{ alumniTitle(group.key) }}</h3>
        </template>

        <div v-for="member in group.items" :id="member.id" :key="member.id" class="alumni-card">
          <img :src="avatar(member)" alt="" class="alumni-avatar" loading="lazy" />
          <p class="alumni-name-zh">{{ member.name_zh }}</p>
          <p v-if="member.name_en" class="alumni-name-en">{{ member.name_en }}</p>
          <p class="alumni-degree">{{ t(`people.graduated.${member.degree}`) }}</p>
          <p v-if="pick(member, 'thesis_title', locale)" class="alumni-thesis" :title="pick(member, 'thesis_title', locale)">
            <a v-if="member.thesis_url" :href="member.thesis_url" target="_blank" rel="noopener">
              {{ pick(member, 'thesis_title', locale) }}
            </a>
            <template v-else>{{ pick(member, 'thesis_title', locale) }}</template>
          </p>
        </div>
      </ScrollRow>
    </section>

    <!-- 想加入實驗室？（join_text 空白時不顯示） -->
    <section v-if="joinText" id="join" class="join">
      <h2 class="join-title">{{ t('people.joinTitle') }}</h2>
      <p class="join-text">{{ joinText }}</p>
      <a v-if="email" :href="`mailto:${email}`" class="btn btn-primary">{{ email }}</a>
    </section>
  </div>
</template>

<style scoped>
.people-section + .people-section { margin-top: 64px; }
.people-heading { margin-bottom: 8px; font-size: 1.6rem; font-weight: 400; }
.group-title {
  margin: 32px 0 0;
  padding-top: 16px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-blue);
  border-top: 1px solid var(--color-rule);
}
.member-group .group-title { margin-bottom: 20px; }

/* 現任成員：格子自動依寬度決定一列幾位 */
.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 32px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 校友：每屆一個 ScrollRow，裡面是固定寬度的直式小卡片 */
.alumni-group .group-title { width: 100%; }
.alumni-card { width: 170px; text-align: center; }
.alumni-avatar {
  display: block;
  width: 96px;
  aspect-ratio: 1;
  margin: 0 auto 10px;
  object-fit: cover;
  background: var(--color-blue-soft);
  border: 1px solid var(--color-rule);
  border-radius: 50%;
}
.alumni-name-zh { margin: 0; font-family: var(--font-display); color: var(--color-navy); }
.alumni-name-en { margin: 0; font-size: 0.85rem; }
.alumni-degree { margin: 2px 0 0; font-size: 0.8rem; color: var(--color-text-muted); }

/* 論文題目：最多三行，超過用「…」截斷 */
.alumni-thesis {
  display: -webkit-box;
  margin: 8px 0 0;
  overflow: hidden;
  font-size: 0.8rem;
  line-height: 1.5;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 加入實驗室 */
.join {
  margin-top: 72px;
  padding: 40px;
  text-align: center;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius);
}
.join-title { font-size: 1.5rem; font-weight: 400; }
.join-text { max-width: 36em; margin: 12px auto 24px; color: var(--color-text-muted); }

@media (max-width: 720px) {
  .member-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .alumni-card { width: 140px; }
  .alumni-avatar { width: 80px; }
  .join { padding: 28px 20px; }
}
</style>