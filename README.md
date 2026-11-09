# 人機共生與智慧服務研究室網站

Human-AI Symbiosis & Smart Services Lab — Official Website

實驗室官方網站，提供教授介紹、研究著作、專欄、研究團隊、研究計畫與最新消息，支援中英文。

## 這個網站怎麼運作

- 網站內容（教授介紹、論文、成員、消息、計畫、專欄）都放在 **Google 試算表、Google 文件與雲端硬碟**
- GitHub Actions 每天自動把內容轉成網站資料，並部署到 **GitHub Pages**
- 沒有後端伺服器、沒有資料庫，日常更新不需要寫程式

## 我只是要更新內容

（內容維護方式完成後補上：試算表位置、填寫規則、照片放哪裡、如何立即更新網站）

## 我要改版面或程式

### 技術

- Vue 3、Vite、Vue Router、vue-i18n
- JavaScript、自行撰寫的 CSS（設計變數在 `src/styles/tokens.css`）
- 部署：GitHub Pages（GitHub Actions）

### 本機開發

（專案骨架建立後補上：安裝、啟動、建置指令）

### 專案文件

- `CLAUDE.md`：完整規格與設計決策（架構、頁面、視覺、資料欄位）
- `docs/reference/`：視覺參考稿，用瀏覽器直接開啟
- 資料欄位以 Google 試算表的「欄位規格」分頁為準；試算表變動時，`CLAUDE.md` 與本文件需同步更新
