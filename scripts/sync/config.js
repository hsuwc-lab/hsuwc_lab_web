// 同步腳本的設定：雲端換帳號或搬檔案時只改這裡

export const SHEETS = {
    student: '1kVig3wSdNYFmOBTRUqK_64si4oVn0AcI2zHSc2mvOqI', // 網站資料－學生維護
    professor: '12XABB6MNVTZaW79UyWU43q-Syeo-8BWy-S7NAjl9mIo', // 網站資料－教授維護
}

// 照片資料夾的 id（網址 folders/ 後面那段，? 之前）
export const FOLDERS = {
  memberPhotos: '1SEQxmi5-Bu1GQgNpzofNqMUfxUH7YjlP', // 成員照片
  professorPhotos: '1jY_RKoEA6bxD8wEF-N37ngWHa6ruHbXo', // 教授照片
}

// 照片裁切後的尺寸（像素）：成員 1:1、教授 4:5，約是網頁顯示大小的 3 倍，手機上也清楚
export const PHOTO_SIZES = {
  member: { width: 600, height: 600 },
  professor: { width: 800, height: 1000 },
}

// 輸出位置（相對於 repo 根目錄）
export const DATA_DIR = 'src/data'
export const IMAGES_DIR = 'public/images'