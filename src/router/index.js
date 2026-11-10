import i18n from '../locales/index.js'
import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import IntroView from '../views/IntroView.vue'
import HomeView from '../views/HomeView.vue'
import ProfessorView from '../views/ProfessorView.vue'
import ColumnView from '../views/ColumnView.vue'
import ColumnDetailView from '../views/ColumnDetailView.vue'
import PublicationsView from '../views/PublicationsView.vue'
import PeopleView from '../views/PeopleView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import NewsView from '../views/NewsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { hasSeenIntro } from '../utils/introSeen.js'
import { preferredLanguage } from '../utils/language.js'
import { getSetting } from '../utils/content.js' 

const routes = [
  // 進站判斷：第一次到 Intro，之後直接到首頁
  {
    path: '/',
    redirect: () => (hasSeenIntro() ? `/${preferredLanguage()}/` : '/intro'),
  },
  { path: '/intro', name: 'intro', component: IntroView },

  // 正式頁面：網址第一層是語言，共用 MainLayout
  {
    path: '/:lang(zh|en)',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'professor', name: 'professor', component: ProfessorView, meta: { titleKey: 'nav.profile' } },
      { path: 'professor/column', name: 'column', component: ColumnView, meta: { titleKey: 'nav.column' } },
      { path: 'professor/column/:id', name: 'column-detail', component: ColumnDetailView, meta: { titleKey: 'nav.column' } },
      { path: 'professor/publications', name: 'publications', component: PublicationsView, meta: { titleKey: 'nav.publications' } },
      { path: 'people', name: 'people', component: PeopleView, meta: { titleKey: 'nav.people' } },
      { path: 'projects', name: 'projects', component: ProjectsView, meta: { titleKey: 'nav.projects' } },
      { path: 'projects/:id', name: 'project-detail', component: ProjectDetailView, meta: { titleKey: 'nav.projects' } },
      { path: 'news', name: 'news', component: NewsView, meta: { titleKey: 'nav.news' } },
      // 語言正確但頁面不存在，例如 /zh/abc
      { path: ':pathMatch(.*)*', name: 'not-found-in-lang', component: NotFoundView, meta: { titleKey: 'common.notFound' } },
    ],
  },

  // 其他所有網址，例如 /fr/
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { titleKey: 'common.notFound' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 換頁時的捲動位置
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition          // 按上一頁：回到原本位置
    if (to.hash) return { el: to.hash, top: 80 }      // 網址有 #join：捲到該區塊
    return { top: 0 }                                 // 其他：回到頁面頂端
  },
})

// 每次換頁前，依網址的語言切換介面文字與 <html lang>
// 網址沒有語言時（Intro、找不到頁面），改用瀏覽器語言
// 換頁後，更新瀏覽器分頁標題
router.afterEach((to) => {
  const lang = i18n.global.locale.value
  const fullName = getSetting('lab_name', lang)
  const shortName = getSetting('lab_short_name', lang) || fullName
  const titleKey = to.meta.titleKey

  document.title = titleKey ? `${i18n.global.t(titleKey)}｜${shortName}` : fullName
})

export default router