# 🚀 快速設置指南

## ⚠️ 當前錯誤：無法訪問 Google Sheet

你遇到的錯誤表示 `SPREADSHEET_ID` 尚未正確設置。

## 📝 解決步驟

### 步驟 1：創建 Google Sheet

1. 打開 [Google Sheets](https://sheets.google.com)
2. 點擊「空白」創建新試算表
3. **重要**：記下 Sheet ID（在網址中）

**如何找到 Sheet ID？**

網址格式：
```
https://docs.google.com/spreadsheets/d/[這裡就是Sheet ID]/edit
```

例如：
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789/edit
```
Sheet ID 就是：`1ABC123xyz456DEF789`

### 步驟 2：設置 Sheet ID

1. 打開 Google Apps Script 編輯器
2. 找到代碼頂部的這一行：
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   ```
3. 替換成你的 Sheet ID：
   ```javascript
   const SPREADSHEET_ID = '1ABC123xyz456DEF789'; // 你的實際 Sheet ID
   ```
4. 保存代碼（Ctrl+S 或 Cmd+S）

### 步驟 3：設置權限

**重要**：確保你對該 Sheet 有**編輯權限**！

1. 在 Google Sheet 中，點擊右上角的「共用」
2. 確保你的 Google 帳號有「編輯者」權限
3. 如果 Sheet 是你創建的，應該已經有權限

### 步驟 4：重新部署

1. 在 Apps Script 編輯器中，點擊「部署」→「管理部署作業」
2. 點擊鉛筆圖標（編輯）
3. 選擇「新版本」
4. 點擊「部署」

### 步驟 5：測試

訪問你的 API URL（不帶參數）：
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

應該會返回：
```json
{
  "ok": true,
  "weiweiCount": 0,
  "xixiCount": 0,
  "weiweiProbability": 50,
  "lastUpdated": "2026-01-04T..."
}
```

## 🔍 常見問題

### Q: 仍然出現「無法訪問 Google Sheet」錯誤？

**檢查清單：**
- ✅ Sheet ID 是否正確複製（沒有多餘空格）
- ✅ Sheet ID 是否在引號內：`'你的SheetID'`
- ✅ 你對該 Sheet 是否有編輯權限
- ✅ Sheet 是否存在（沒有被刪除）

### Q: 如何確認 Sheet ID 是否正確？

在 Apps Script 編輯器中運行這個測試函數：
```javascript
function testSheetAccess() {
  try {
    const sheet = SpreadsheetApp.openById('你的SheetID');
    Logger.log('✅ Sheet 訪問成功！');
    Logger.log('Sheet 名稱: ' + sheet.getName());
  } catch (error) {
    Logger.log('❌ 錯誤: ' + error.toString());
  }
}
```

### Q: 可以自動創建 Sheet 嗎？

**可以！** 如果你有權限，代碼會自動：
1. 在指定的 Spreadsheet 中創建名為 "Data" 的 Sheet
2. 初始化數據結構
3. 設置初始值

### Q: 如何更改 Sheet 名稱？

修改代碼中的：
```javascript
const SHEET_NAME = 'Data'; // 改成你想要的名稱
```

## 📋 完整配置檢查清單

- [ ] 已創建 Google Sheet
- [ ] 已複製 Sheet ID
- [ ] 已在代碼中設置 `SPREADSHEET_ID`
- [ ] 已保存代碼
- [ ] 已重新部署 Web App
- [ ] 已測試訪問 API URL
- [ ] API 返回 `ok: true`

## 🎯 下一步

設置完成後，更新 `index.html` 中的 `API_URL`：
```javascript
const API_URL = "你的部署URL";
```

然後就可以正常使用拉霸機了！

