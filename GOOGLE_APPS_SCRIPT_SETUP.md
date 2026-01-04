# Google Apps Script 設置說明

## 📋 步驟 1：創建 Google Sheet

1. 打開 [Google Sheets](https://sheets.google.com)
2. 創建一個新的空白試算表
3. 記下試算表的 ID（在網址中，例如：`https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit` 中的 `ABC123XYZ456`）

## 📋 步驟 2：創建 Google Apps Script 專案

1. 打開 [Google Apps Script](https://script.google.com)
2. 點擊「新增專案」
3. 將 `google-apps-script.gs` 中的代碼複製到編輯器
4. **重要**：修改代碼中的 `SPREADSHEET_ID`：
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // 改成你的 Sheet ID
   ```
   例如：`const SPREADSHEET_ID = 'ABC123XYZ456';`

5. （可選）修改 Sheet 名稱和密碼：
   ```javascript
   const SHEET_NAME = 'Data'; // 可以改成你想要的 Sheet 名稱
   const PASSWORD = 'daven'; // 可以改成你想要的密碼
   ```

## 📋 步驟 3：部署為 Web App

1. 點擊右上角的「部署」→「新增部署作業」
2. 點擊「選取類型」旁邊的齒輪圖標 ⚙️ → 選擇「網頁應用程式」
3. 設置如下：
   - **說明**：拉霸機後端 API（可選）
   - **執行身分**：**我** ← 重要！
   - **具有存取權的使用者**：**任何人** ← 重要！
4. 點擊「部署」
5. **重要**：第一次部署需要授權：
   - 點擊「授權存取權」
   - 選擇你的 Google 帳號
   - 點擊「進階」→「前往 [專案名稱]（不安全）」
   - 點擊「允許」
6. 複製「網頁應用程式網址」（這是你的 API_URL）

## 📋 步驟 4：更新前端代碼

1. 打開 `index.html`
2. 找到這一行：
   ```javascript
   const API_URL = "https://script.google.com/macros/s/.../exec";
   ```
3. 替換成你剛複製的網址

## 📋 步驟 5：測試

1. 在 Apps Script 編輯器中，點擊「執行」→ 選擇 `test` 函數
2. 查看執行日誌，確認沒有錯誤
3. 在瀏覽器中打開你的網站，測試功能

## 🔧 Sheet 結構說明

Sheet 會自動創建以下結構：

| Key | Value | Type | LastUpdated | Notes |
|-----|-------|------|-------------|-------|
| weiweiCount | 0 | number | 2026-01-04T... | 威威被抽中次數 |
| xixiCount | 0 | number | 2026-01-04T... | 茜茜被抽中次數 |
| weiweiProbability | 50 | number | 2026-01-04T... | 威威概率（百分比） |

## 🔑 API 端點說明

### 1. 獲取配置
```
GET /exec?action=config
GET /exec?action=config&callback=jsonp_callback_123 (JSONP)
```

### 2. 更新統計
```
GET /exec?action=spin&result=威威
GET /exec?action=spin&result=茜茜
```

### 3. 更新概率（需要密碼）
```
GET /exec?action=probability&weiweiProbability=60&password=daven&updatedBy=user
```

## ⚠️ 常見問題

### Q: 出現「需要授權」錯誤？
A: 確保「執行身分」設置為「我」，並且已完成授權流程。

### Q: CORS 錯誤？
A: 確保「具有存取權的使用者」設置為「任何人」。

### Q: 出現「Unknown GET action」錯誤？
A: 檢查 action 參數是否正確（config、spin、probability）。

### Q: 密碼驗證失敗？
A: 檢查前端發送的 password 參數是否與代碼中的 PASSWORD 常數一致。

### Q: Sheet ID 找不到？
A: 確保 Sheet ID 正確，並且你對該 Sheet 有編輯權限。

## 🔒 安全性建議

1. **不要**在代碼中硬編碼敏感信息（已經設置了密碼保護）
2. 定期備份 Google Sheet 數據
3. 如果擔心安全，可以：
   - 修改密碼
   - 限制 Sheet 的存取權限
   - 使用更複雜的密碼

## 📝 更新部署

如果你修改了代碼：
1. 在 Apps Script 編輯器中保存
2. 點擊「部署」→「管理部署作業」
3. 點擊鉛筆圖標編輯
4. 選擇「新版本」
5. 點擊「部署」

這樣就可以更新你的 Web App 而不需要重新授權。

