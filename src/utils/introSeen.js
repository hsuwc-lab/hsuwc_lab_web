// 記錄訪客是否看過 Intro。瀏覽器不允許儲存時，當作已看過，避免卡在 Intro
const KEY = 'intro-seen'

export function hasSeenIntro() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // 無法儲存就算了，不影響使用
  }
}