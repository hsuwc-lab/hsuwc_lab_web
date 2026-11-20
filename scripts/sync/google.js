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

// 列出一個資料夾裡的所有檔案 → [{ id, name, mimeType }, …]
// Google 一次最多給 1000 筆，檔案更多時會給「下一頁」的 pageToken，所以用迴圈一頁一頁拿
export async function listFolder(folderId) {
  const client = await auth.getClient()
  const files = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`, // 在這個資料夾裡、且不在垃圾桶
      fields: 'nextPageToken, files(id, name, mimeType)', // 只要這幾個欄位，回應比較小
      pageSize: '1000',
    })
    if (pageToken) params.set('pageToken', pageToken)
    const res = await client.request({ url: `https://www.googleapis.com/drive/v3/files?${params}` })
    files.push(...res.data.files)
    pageToken = res.data.nextPageToken
  } while (pageToken)
  return files
}

// 下載一個檔案的原始內容（照片）→ Buffer
export async function downloadFile(fileId) {
  const client = await auth.getClient()
  const res = await client.request({
    url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, // alt=media：要檔案內容，不是檔案資訊
    responseType: 'arraybuffer', // 照片是二進位資料，不能當文字讀
  })
  return Buffer.from(res.data)
}

// 把 Google 文件匯出成 Markdown 文字
export async function exportDocMarkdown(fileId) {
  const client = await auth.getClient()
  const res = await client.request({
    url: `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/markdown`,
    responseType: 'text',
  })
  return res.data
}