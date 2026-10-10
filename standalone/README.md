# 單檔版「手賬評記」

這個資料夾只有一個 [`index.html`](index.html)，可直接上傳 GitHub 並用 GitHub Pages 開站。

## 上傳到 GitHub Pages（最簡單）

1. 在 GitHub 新建倉庫（例如 `shouzhang-review`）
2. 把 `index.html` 上傳到倉庫**根目錄**（檔名必須是 `index.html`）
3. 倉庫 → **Settings** → **Pages**
4. Source 選 **Deploy from a branch** → Branch 選 `main` → folder `/ (root)` → Save
5. 幾分鐘後開啟：`https://你的帳號.github.io/倉庫名/`

也可把整個 `standalone` 資料夾內容丟進倉庫根目錄。

## 使用方式

- 第一次點「登入」設定一組**本機編輯密碼**
- 資料存在瀏覽器 `localStorage`（換電腦／清快取會消失）
- 登入後可在首頁**匯出／匯入 JSON**做備份
- 功能含：書／影／遊戲／演出、打卡分色、願望清單滑動、草稿、日夜模式

## 注意

- 這份是**靜態單檔**，不會自動接你現有的 Supabase 雲端資料
- 若要手機電腦雲端同步，請繼續用專案根目錄的 Next.js + Supabase 版本
