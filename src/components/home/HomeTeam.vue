<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrentMembers, getProfessor, getProfessorRow } from '../../utils/content.js'
import defaultAvatar from '../../assets/default-avatar.svg'
import ScrollHint from './ScrollHint.vue'

const { t, locale } = useI18n()
const base = import.meta.env.BASE_URL

// 左欄：教授
const professor = computed(() => {
  const nameRow = getProfessorRow('name')
  return {
    nameZh: nameRow?.text_zh || '',
    nameEn: nameRow?.text_en || '',
    title: getProfessor('title', locale.value),
    photo: getProfessor('photo', locale.value),
  }
})

// 右欄：現任成員（已排好序）
const members = computed(() =>
  getCurrentMembers().map((member) => ({
    id: member.id,
    nameZh: member.name_zh,
    nameEn: member.name_en,
    degree: t(`degrees.${member.degree}`),
    photo: member.photo,
  })),
)

// ---- 橫向捲動控制 ----
const track = ref(null)          // 對應到 template 裡 ref="track" 的元素
const scrollable = ref(false)    // 內容是否超出容器（需要捲動）
const atStart = ref(true)
const atEnd = ref(false)
const thumbWidth = ref(100)      // 捲動條滑塊寬度（%）
const thumbLeft = ref(0)         // 捲動條滑塊位置（%）

// 依目前捲動位置，更新箭頭與捲動條
function update() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  scrollable.value = max > 2
  atStart.value = el.scrollLeft <= 2
  atEnd.value = el.scrollLeft >= max - 2
  thumbWidth.value = Math.max((el.clientWidth / el.scrollWidth) * 100, 12)
  thumbLeft.value = max > 0 ? (el.scrollLeft / max) * (100 - thumbWidth.value) : 0
}

// 一格的寬度（含間距）
function itemWidth() {
  const item = track.value?.querySelector('.person')
  return item ? item.getBoundingClientRect().width + 16 : 0
}

function scrollItems(count) {
  track.value.scrollBy({ left: itemWidth() * count, behavior: 'smooth' })
}

// 鍵盤左右鍵
function onKeydown(event) {
  if (event.key === 'ArrowRight') { scrollItems(1); event.preventDefault() }
  if (event.key === 'ArrowLeft') { scrollItems(-1); event.preventDefault() }
}

// 拖曳或點擊捲動條
const bar = ref(null)
let dragging = false
function seek(clientX) {
  const rect = bar.value.getBoundingClientRect()
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
  const el = track.value
  el.scrollTo({ left: ratio * (el.scrollWidth - el.clientWidth) })
}
function onBarDown(event) {
  dragging = true
  bar.value.setPointerCapture(event.pointerId)
  seek(event.clientX)
}
function onBarMove(event) {
  if (dragging) seek(event.clientX)
}
function onBarUp() {
  dragging = false
}

// 元件出現時先計算一次；視窗大小改變時重算；元件消失時移除監聽
onMounted(() => {
  update()
  window.addEventListener('resize', update)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', update)
})
</script>

<template>
  <section id="team" class="section">
    <div class="container duo">
      <!-- 左欄：指導教授 -->
      <div class="col">
        <p class="eyebrow">Faculty</p>
        <h2 class="section-title">{{ t('home.meetProfessor') }}</h2>
        <div class="prof">
          <img v-if="professor.photo" :src="`${base}images/professor/${professor.photo}`" alt="" class="prof-photo" />
          <div v-else class="prof-photo prof-photo-empty" aria-hidden="true"></div>
          <div>
            <h3 class="prof-name">{{ professor.nameZh }}</h3>
            <p v-if="professor.nameEn" class="prof-name-en">{{ professor.nameEn }}</p>
            <p class="prof-title">{{ professor.title }}</p>
            <RouterLink :to="{ name: 'professor' }" class="btn btn-ghost">
              {{ t('home.viewProfile') }} <span aria-hidden="true">→</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 右欄：研究團隊 -->
      <div class="col col-team">
        <div class="team-head">
          <div>
            <p class="eyebrow">Our People</p>
            <h2 class="section-title">{{ t('home.meetTeam') }}</h2>
          </div>
          <div v-if="scrollable" class="arrows">
            <button type="button" :disabled="atStart" :aria-label="t('home.previous')" @click="scrollItems(-4)">←</button>
            <button type="button" :disabled="atEnd" :aria-label="t('home.next')" @click="scrollItems(4)">→</button>
          </div>
        </div>

        <div
          ref="track"
          class="track"
          tabindex="0"
          :aria-label="t('home.teamList')"
          @scroll="update"
          @keydown="onKeydown"
        >
          <div v-for="member in members" :key="member.id" class="person">
            <img :src="member.photo ? `${base}images/members/${member.photo}` : defaultAvatar" alt="" class="avatar" />
            <p class="person-name">{{ member.nameZh }}</p>
            <!-- 沒有英文名時保留一行空白，讓每格的學籍身分對齊同一高度 -->
            <p class="person-name-en" :aria-hidden="!member.nameEn">{{ member.nameEn || ' ' }}</p>
            <p class="person-degree">{{ member.degree }}</p>
          </div>

          <RouterLink :to="{ name: 'people', hash: '#join' }" class="person person-join">
            <div class="avatar" aria-hidden="true">+</div>
            <p class="person-name">{{ t('home.joinUs') }}</p>
            <p class="person-degree">{{ t('home.viewTeam') }}</p>
          </RouterLink>
        </div>

        <div
          v-if="scrollable"
          ref="bar"
          class="bar"
          aria-hidden="true"
          @pointerdown="onBarDown"
          @pointermove="onBarMove"
          @pointerup="onBarUp"
          @pointercancel="onBarUp"
        >
          <div class="thumb" :style="{ width: thumbWidth + '%', left: thumbLeft + '%' }"></div>
        </div>
      </div>
    </div>
    <ScrollHint to="#news" />
  </section>
</template>

<style scoped>
/* 左右雙欄，中間細分隔線 */
.duo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 56px; }   /* 右欄較寬，讓四格頭像放得下較大尺寸 */
.col-team { padding-left: 56px; border-left: 1px solid var(--color-rule); min-width: 0; }

.prof { display: grid; grid-template-columns: calc(190px * var(--home-scale)) minmax(0, 1fr); gap: 24px; margin-top: 24px; }
.prof-photo { width: calc(190px * var(--home-scale)); aspect-ratio: 4 / 5; object-fit: cover; border-radius: var(--radius); }
.prof-photo-empty { background: var(--color-blue-soft); border: 1px solid var(--color-rule); }
.prof-name { font-size: calc(1.6rem * var(--home-scale)); font-weight: 600; }
.prof-title { margin: 4px 0 20px; font-size: calc(1rem * var(--home-scale)); color: var(--color-text-muted); }

.team-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-bottom: 24px; }
.arrows { display: flex; gap: 8px; }
.arrows button {
  width: calc(36px * var(--home-scale));
  height: calc(36px * var(--home-scale));
  color: var(--color-navy);
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: 50%;
  cursor: pointer;
}
.arrows button:disabled { opacity: 0.35; cursor: default; }

/* 橫向捲動：一次四格，每次停在完整的格子上；隱藏瀏覽器自己的捲動條 */
.track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.track::-webkit-scrollbar { display: none; }
.person {
  flex: 0 0 calc((100% - 48px) / 4);   /* 四格加三個間距剛好佔滿 */
  scroll-snap-align: start;
  text-align: center;
  color: inherit;
  text-decoration: none;
}
.avatar {
  display: grid;
  place-items: center;
  width: min(calc(120px * var(--home-scale)), 100%);   /* 960～1100px 之間格子較窄時，避免頭像超出格子 */
  aspect-ratio: 1;
  margin: 0 auto 12px;
  object-fit: cover;
  font-family: var(--font-display);
  font-size: calc(2rem * var(--home-scale));
  color: var(--color-navy);
  background: var(--color-blue-soft);
  border: 1px solid var(--color-rule);
  border-radius: 50%;
}
.person-name { font-size: calc(1.05rem * var(--home-scale)); font-weight: 600; line-height: 1.4; }
.person-degree { margin-top: 2px; font-size: calc(0.875rem * var(--home-scale)); color: var(--color-text-muted); }

/* Join us：虛線圓框 */
.person-join .avatar { font-family: var(--font-sans); color: var(--color-blue); background: var(--color-bg); border: 1px dashed var(--color-blue); }
.person-join .person-name, .person-join .person-degree { color: var(--color-blue); }
.person-join:hover .avatar { background: var(--color-blue-soft); }

/* 可拖曳的捲動條 */
.bar { position: relative; height: 4px; margin-top: 20px; background: var(--color-rule); border-radius: 2px; cursor: pointer; touch-action: none; }
.thumb { position: absolute; top: 0; bottom: 0; background: var(--color-navy); border-radius: 2px; }

@media (prefers-reduced-motion: reduce) { .track { scroll-behavior: auto; } }

@media (max-width: 960px) {
  .duo { grid-template-columns: minmax(0, 1fr); gap: 48px; }
  .col-team { padding-left: 0; padding-top: 48px; border-left: 0; border-top: 1px solid var(--color-rule); }
}
@media (max-width: 720px) {
  .prof { grid-template-columns: minmax(0, 1fr); }
  .person { flex-basis: calc((100% - 32px) / 2.5); }   /* 手機約顯示兩個半 */
  /* 手機版維持原本的尺寸 */
  .prof-photo { width: 150px; }
  .prof-name { font-size: 1.4rem; }
  .prof-title { margin: 2px 0 18px; font-size: 0.9rem; }
  .avatar { width: 96px; margin-bottom: 10px; font-size: 1.6rem; }
  .person-name { font-size: 0.95rem; }
  .person-degree { margin-top: 0; font-size: 0.8rem; }
  .arrows { display: none; }                          /* 手機用手指滑 */
}
</style>