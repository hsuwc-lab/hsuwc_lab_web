import settings from '../data/settings.json'
import professor from '../data/professor.json'
import members from '../data/members.json'
import news from '../data/news.json'
import columns from '../data/columns.json'
import publications from '../data/publications.json'

// 取出某列資料在指定語言的欄位；該語言空白時改用另一種語言
// 例：pick(row, 'title', 'en') 會先找 title_en，沒有就找 title_zh
export function pick(row, field, lang) {
  if (!row) return ''
  const other = lang === 'zh' ? 'en' : 'zh'
  return row[`${field}_${lang}`] || row[`${field}_${other}`] || ''
}

// 取出 settings 中某個 key 的值
export function getSetting(key, lang) {
  const row = settings.find((item) => item.key === key)
  return pick(row, 'value', lang)
}

// 取出教授基本資料某一列，不做語言後備
export function getProfessorRow(key) {
  return professor.find((item) => item.section === '基本資料' && item.key === key)
}

// 取出教授「基本資料」某一項（name、title、photo、short_bio）
export function getProfessor(key, lang) {
  return pick(getProfessorRow(key), 'text', lang)
}

// 全部身分的排序：博士生 → 碩士生 → 交換生 → 專題生（研究團隊頁也會用到）
const DEGREE_ORDER = { phd: 0, ms: 1, exchange: 2, undergrad: 3 }

// 首頁只顯示現任的博士生與碩士生；同身分依入學年由早到晚
const HOME_DEGREES = ['phd', 'ms']

export function getCurrentMembers() {
  return members
    .filter((member) => member.status === 'current' && member.show && HOME_DEGREES.includes(member.degree))
    .sort((a, b) =>
      (DEGREE_ORDER[a.degree] ?? 9) - (DEGREE_ORDER[b.degree] ?? 9) ||
      a.entry_year - b.entry_year,
    )
}

// 最新的3則消息，依日期由新到舊
export function getLatestNews(count = 3) {
  return [...news]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count)
}

// 教授某個區塊（簡介、學歷…）的全部項目，依 order 排序；內容空白的列不要
export function getProfessorSection(section, lang) {
  return professor
    .filter((item) => item.section === section)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({ period: item.period, text: pick(item, 'text', lang) }))
    .filter((item) => item.text)
}

// 把「a,b,c」拆成 ['a', 'b', 'c']；空白就是 []
export function splitList(value) {
  if (!value) return []
  return value.split(',').map((part) => part.trim()).filter(Boolean)
}

// 已上架的專欄，由新到舊
export function getColumns() {
  return columns
    .filter((column) => column.publish)
    .sort((a, b) => b.date.localeCompare(a.date))
}

// 依 id 取一篇專欄；找不到（或未上架）回傳 undefined
export function getColumn(id) {
  return getColumns().find((column) => column.id === id)
}

// 依 id 取一位成員（專欄作者、計畫成員會用到）
export function getMember(id) {
  return members.find((member) => member.id === id)
}

// 著作：年份新到舊，同年依標題
export function getPublications() {
  return [...publications].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
}

// 「閱讀論文」連結：有 doi 用 doi.org，否則用 url，都沒有回傳空字串
export function paperLink(publication) {
  if (publication.doi) return `https://doi.org/${publication.doi}`
  return publication.url || ''
}