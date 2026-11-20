<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '../components/PageHeader.vue'
import MemberCard from '../components/MemberCard.vue'
import ScrollRow from '../components/ScrollRow.vue'
import defaultAvatar from '../assets/default-avatar.svg'
import { classYear, getAlumniGroups, getMemberGroups, getSetting, getThesisGroups } from '../utils/content.js'

const {t, locale} = useI18n()
const base = import.meta.env.BASE_URL

const tabs = computed(() => [
  { label: t('nav.members'), to: { name: 'people' } },
  { label: t('nav.theses'), to: { name: 'theses' } },
])

//現任成員與校友名單
const memberGroups = getMemberGroups()
const alumniGroups = getAlumniGroups()

//有學位論文的屆別：只有這些屆的標題旁才顯示「學位論文 →」（規則和論文頁共用）
const thesisClasses = new Set(getThesisGroups().map((group) => group.key))

//校友區塊標題（中：級別 / 英：西元年）
function alumniTitle(classOf){
  return t('degrees.alumni', { year: classYear(classOf, locale.value) })
}

//校友頭像
const avatar = (member) => (member.photo ? 
  `${base}images/members/${member.photo}` : defaultAvatar
)

const joinText = computed(() => getSetting('join_text', locale.value))
const email = computed(() => getSetting('email', locale.value))

//複製 Email：成功後圖示換成打勾，2 秒後還原
const copied = ref(false)
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // 瀏覽器不允許複製（例如不是 https）時就不動作，使用者仍可自行反白複製
  }
}
</script>

<template>
  <PageHeader :title="t('nav.members')" eyebrow="Our People" :tabs="tabs" />

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
          <div class="alumni-head">
            <h3 class="group-title">{{ alumniTitle(group.key) }}</h3>
            <RouterLink
              v-if="thesisClasses.has(group.key)"
              :to="{ name: 'theses', hash: `#class-${group.key}` }"
              class="link-more"
            >{{ t('people.thesesLink') }} →</RouterLink>
          </div>
        </template>

        <div v-for="member in group.items" :id="member.id" :key="member.id" class="alumni-card">
          <img :src="avatar(member)" alt="" class="alumni-avatar" loading="lazy" />
          <p class="alumni-name-zh">{{ member.name_zh }}</p>
          <p v-if="member.name_en" class="alumni-name-en">{{ member.name_en }}</p>
          <p class="alumni-degree">{{ t(`people.graduated.${member.degree}`) }}</p>
        </div>
      </ScrollRow>
    </section>

    <!-- 想加入實驗室？（join_text 空白時不顯示） -->
    <section v-if="joinText" id="join" class="join">
      <h2 class="join-title">{{ t('people.joinTitle') }}</h2>
      <p class="join-text">{{ joinText }}</p>
      <div v-if="email" class="join-email">
        <span>{{ email }}</span>
        <button
          type="button"
          class="copy-btn"
          :aria-label="copied ? t('people.emailCopied') : t('people.copyEmail')"
          :title="copied ? t('people.emailCopied') : t('people.copyEmail')"
          @click="copyEmail"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path v-if="copied" d="M5 12.5l4.5 4.5L19 7.5" />
            <template v-else>
              <rect x="9" y="9" width="11" height="11" rx="1.5" />
              <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
            </template>
          </svg>
        </button>
      </div>
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
/* 屆別標題＋右側「學位論文 →」：以文字基線對齊 */
.alumni-head { display: flex; align-items: baseline; gap: 16px; width: 100%; }
/* 屆別字級放大，和旁邊同樣是藍色小字的「學位論文 →」拉開層級 */
.alumni-head .group-title { font-size: 1.05rem; }
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
/* pre-line：保留試算表儲存格內的換行 */
.join-text { max-width: 36em; margin: 12px auto 24px; color: var(--color-text-muted); white-space: pre-line; }
.join-email {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-navy);
  font-size: 1.05rem;
}
.copy-btn {
  display: inline-flex;
  padding: 6px;
  color: var(--color-blue);
  background: transparent;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}
.copy-btn:hover { background: var(--color-blue-soft); }
.copy-btn:focus-visible { outline: 2px solid var(--color-blue); outline-offset: 2px; }
.copy-btn svg { width: 18px; height: 18px; }

@media (max-width: 720px) {
  .member-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .alumni-card { width: 140px; }
  .alumni-avatar { width: 80px; }
  .join { padding: 28px 20px; }
}
</style>