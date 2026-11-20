import { TABS } from './schema.js'

const DEGREES = ['phd', 'ms', 'exchange', 'undergrad']
const ICONS = ['users', 'chip', 'heart', 'chart', 'book', 'cart']
const PROFESSOR_BASICS = ['name', 'title', 'photo'] // 教授「基本資料」一定要有的 3 列

// 檢查全部資料，回傳 { errors: […], warnings: […] }
export function validate(data) {
  const errors = []
  const warnings = []

  // 1. 每個分頁：數字欄不能是 NaN；有 id 的分頁，id 不能空白或重複
  for (const [tab, { fields, hasId }] of Object.entries(TABS)) {
    const rows = data[tab]
    for (const row of rows) {
      for (const [name, type] of Object.entries(fields)) {
        if (type === 'number' && Number.isNaN(row[name])) {
          errors.push(`${tab}：${describe(row)} 的 ${name} 不是數字`)
        }
      }
    }
    if (hasId) {
      rows.filter((row) => !row.id).forEach((row) => errors.push(`${tab}：有一列沒有 id（${describe(row)}）`))
      findDuplicates(rows.map((row) => row.id)).forEach((id) => errors.push(`${tab}：id 重複 ${id}`))
    }
  }

  // 2. members：id 結尾的學位要和 degree 一致
  for (const m of data.members) {
    if (!DEGREES.includes(m.degree)) warnings.push(`members：${m.id} 的 degree「${m.degree}」不在選項裡`)
    else if (m.id && !m.id.endsWith(`-${m.degree}`)) errors.push(`members：${m.id} 的結尾和 degree「${m.degree}」不一致`)
  }

  // 3. projects：member_ids 都要找得到成員（包含未公開的，因為這時還沒拿掉）
  const memberIds = new Set(data.members.map((m) => m.id))
  for (const p of data.projects) {
    splitList(p.member_ids)
      .filter((id) => !memberIds.has(id))
      .forEach((id) => errors.push(`projects：${p.id} 的 member_ids 有不存在的成員 ${id}`))
  }

  // 4. area 對不到 research 只警告：前端會歸在「其他領域」
  const areaIds = new Set(data.research.map((r) => r.id))
  for (const tab of ['projects', 'publications']) {
    for (const row of data[tab]) {
      splitList(row.area)
        .filter((id) => !areaIds.has(id))
        .forEach((id) => warnings.push(`${tab}：${row.id} 的 area「${id}」不在 research 裡，會顯示為其他領域`))
    }
  }
  for (const r of data.research) {
    if (!ICONS.includes(r.icon)) warnings.push(`research：${r.id} 的 icon「${r.icon}」不在選項裡`)
  }

  // 5. professor：「基本資料」的 name、title、photo 三列一定要存在（內容可以空白）
  const basics = data.professor.filter((row) => row.section === '基本資料').map((row) => row.key)
  PROFESSOR_BASICS.filter((key) => !basics.includes(key)).forEach((key) =>
    errors.push(`professor：「基本資料」少了 key 為 ${key} 的那一列`),
  )

  // 6. news、columns：日期必須是 YYYY-MM-DD（排序靠它）
  for (const tab of ['news', 'columns']) {
    for (const row of data[tab]) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
        errors.push(`${tab}：${row.id} 的日期「${row.date}」格式不對，要寫成 2026-11-18`)
      }
    }
  }

  // 7. columns：author_ids 要找得到成員（空白代表教授）
  for (const c of data.columns) {
    splitList(c.author_ids)
      .filter((id) => !memberIds.has(id))
      .forEach((id) => warnings.push(`columns：${c.id} 的作者 ${id} 不在 members 裡`))
  }

  return { errors, warnings }
}

// 報錯時用來說明「是哪一筆」：有 id 用 id，沒有就用名稱或標題
function describe(row) {
  return row.id || row.name_zh || row.title_zh || row.title || row.key || row.section || '（無法辨識的列）'
}

// 「a, b,c」→ ['a', 'b', 'c']
function splitList(text) {
  return String(text ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// 找出重複出現的值（空白不算，空白由「沒有 id」那條報）
function findDuplicates(values) {
  const seen = new Set()
  const dup = new Set()
  for (const v of values) {
    if (!v) continue
    if (seen.has(v)) dup.add(v)
    seen.add(v)
  }
  return [...dup]
}