// 每個雲端試算表分頁要輸出哪些欄位、是什麼型別
// 只有這裡列出的欄位會寫進 JSON；試算表多出來的欄（備註、edit_url、誤放的個資）一律不輸出
//
// 型別：
//   text   文字（空白 → ''）
//   number 數字（空白 → null）
//   bool   核取方塊（→ true／false）
//   date   日期（→ 'YYYY-MM-DD'）
//
// from：在哪一份試算表（對應 config.js 的 SHEETS）
// hasId：這個分頁每一列都要有不重複的 id
// keep：哪些列要公開（沒寫就是全部）

export const TABS = {
  settings: {
    from: 'student',
    fields: { key: 'text', value_zh: 'text', value_en: 'text' },
  },
  professor: {
    from: 'student',
    fields: { section: 'text', key: 'text', order: 'number', period: 'text', text_zh: 'text', text_en: 'text' },
  },
  research: {
    from: 'student',
    hasId: true,
    fields: {
      id: 'text', order: 'number', title_zh: 'text', title_en: 'text', desc_zh: 'text', desc_en: 'text', icon: 'text',
    },
  },
  members: {
    from: 'student',
    hasId: true,
    keep: (row) => row.show, // 沒勾 show 的人，連姓名都不進 JSON
    fields: {
      id: 'text', name_zh: 'text', name_en: 'text', status: 'text', degree: 'text',
      entry_year: 'number', class_of: 'number', photo: 'text',
      thesis_title_zh: 'text', thesis_title_en: 'text', thesis_url: 'text', show: 'bool',
    },
  },
  projects: {
    from: 'student',
    hasId: true,
    fields: {
      id: 'text', status: 'text', title_zh: 'text', title_en: 'text', start: 'text', end: 'text',
      pi_zh: 'text', pi_en: 'text', funder_zh: 'text', funder_en: 'text', project_no: 'text', area: 'text',
      summary_zh: 'text', summary_en: 'text', description_zh: 'text', description_en: 'text',
      outcomes_zh: 'text', outcomes_en: 'text', member_ids: 'text',
    },
  },
  news: {
    from: 'student',
    hasId: true,
    fields: {
      id: 'text', date: 'date', category: 'text', title_zh: 'text', title_en: 'text',
      summary_zh: 'text', summary_en: 'text', link: 'text',
    },
  },
  publications: {
    from: 'professor',
    hasId: true,
    fields: {
      id: 'text', year: 'number', type: 'text', title: 'text', authors: 'text', venue: 'text', details: 'text',
      doi: 'text', url: 'text', author_role: 'text', index: 'text', area: 'text', tags: 'text',
    },
  },
  // columns（專欄）在 7（下）加入：內文要從 Google 文件轉出來
}