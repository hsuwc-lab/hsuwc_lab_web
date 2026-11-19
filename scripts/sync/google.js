import { GoogleAuth } from 'google-auth-library'

// 用 Google Service Account 登入。
// 金鑰檔的位置由環境變數 GOOGLE_APPLICATION_CREDENTIALS 指定，套件會自己去讀
// scopes：只要「唯讀」，程式就算寫錯也改不到試算表
const auth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly', // 7（下）照片、專欄用
  ],
})

// 一次讀回一份試算表的多個分頁
// 回傳 { 分頁名稱: [[標題列], [第 2 列], …] }
export async function readSheets(spreadsheetId, tabNames) {
  const client = await auth.getClient()

  const params = new URLSearchParams({
    valueRenderOption: 'UNFORMATTED_VALUE', // 數字是數字、核取方塊是 true／false，不是「顯示出來的文字」
    dateTimeRenderOption: 'SERIAL_NUMBER',  // 日期以「天數」回傳，不受儲存格格式影響
  })
  tabNames.forEach((name) => params.append('ranges', name)) // 分頁名稱就是「整個分頁」的範圍

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params}`
  const res = await client.request({ url })

  const result = {}
  res.data.valueRanges.forEach((range, i) => {
    result[tabNames[i]] = range.values ?? [] // 全空的分頁沒有 values
  })
  return result
}