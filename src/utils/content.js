import settings from '../data/settings.json'
import professor from '../data/professor.json'
import members from '../data/members.json'
import news from '../data/news.json'

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