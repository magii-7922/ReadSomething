# 手賬評記

個人書評／影評／遊戲評網站。公開瀏覽，僅登入帳號可編輯。手機與電腦透過 Supabase 同步資料。

## 功能

- 首頁打卡表（一個月／一整年）與各分類願望清單
- 願望清單劃掉後自動進入撰寫評論頁
- 書評、影評、遊戲評（含評分篩選與自訂標籤）
- 影評票根、遊戲截圖上傳
- Day／Night 模式（手賬點陣／星座連線背景）

## 設定

1. 建立 [Supabase](https://supabase.com) 專案
2. 在 SQL Editor 執行設定腳本：  
   - 全新專案：[`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)  
   - 已建過表／打卡出現 category 錯誤：整份執行 [`supabase/RUN_THIS.sql`](supabase/RUN_THIS.sql)  
   - 新增活動評：整份執行 [`supabase/ADD_EVENT.sql`](supabase/ADD_EVENT.sql)  
   - 正在看置頂＋評論序號：整份執行 [`supabase/ADD_WATCHING_SERIAL.sql`](supabase/ADD_WATCHING_SERIAL.sql)
3. Authentication → Users 建立你的 Email 帳號（只開一個）
4. 複製環境變數：

```bash
cp .env.local.example .env.local
```

填入 `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

5. 啟動：

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 部署

建議部署到 Vercel，並在專案環境變數中設定同上兩個 key。
