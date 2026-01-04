# 🔧 修復 Sheet 訪問錯誤

## ❌ 當前錯誤

```
{"ok":false,"error":"讀取配置失敗: Error: 無法訪問 Google Sheet: Error: Unexpected error while getting the method or property openById on object SpreadsheetApp."}
```

## 🚀 快速解決方案（三選一）

### 方案 1：使用簡化版（推薦 - 最快）

**不需要 Google Sheet，使用內建存儲！**

1. 打開 Google Apps Script 編輯器
2. **刪除所有現有代碼**
3. 複製 `google-apps-script-simple.gs` 中的所有代碼
4. 保存並重新部署

**優點：**
- ✅ 不需要創建 Google Sheet
- ✅ 不需要設置 Sheet ID
- ✅ 立即可用
- ✅ 功能完全相同

**缺點：**
- ⚠️ 數據存儲在 Apps Script 的 PropertiesService 中（足夠使用）
- ⚠️ 如需備份數據，需要手動導出

---

### 方案 2：修復 Sheet 訪問（需要 Sheet）

**如果你需要將數據存儲在 Google Sheet 中：**

#### 步驟 1：創建並獲取 Sheet ID

1. 打開 [Google Sheets](https://sheets.google.com)
2. 創建新的空白試算表
3. 從網址複製 Sheet ID：
   ```
   https://docs.google.com/spreadsheets/d/[這裡就是ID]/edit
   ```
   例如：`1ABC123xyz456DEF789`

#### 步驟 2：設置權限

**重要！** 在 Sheet 中：
1. 點擊右上角「共用」
2. 確保你的 Google 帳號有「編輯者」權限
3. 如果 Sheet 是你創建的，應該已經有權限

#### 步驟 3：更新代碼

在 Apps Script 編輯器中：
1. 找到這一行：
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   ```
2. 改成：
   ```javascript
   const SPREADSHEET_ID = '你的實際SheetID'; // 例如：'1ABC123xyz456DEF789'
   ```
3. **確保 ID 在引號內，沒有多餘空格**

#### 步驟 4：測試訪問

在 Apps Script 編輯器中：
1. 運行 `diagnoseSheetAccess` 函數
2. 查看執行日誌（「檢視」→「執行記錄」）
3. 如果看到 ✅，表示設置成功

#### 步驟 5：重新部署

1. 保存代碼
2. 「部署」→「管理部署作業」
3. 編輯 → 選擇「新版本」→「部署」

---

### 方案 3：診斷當前問題

在 Apps Script 編輯器中運行診斷函數：

1. 選擇函數：`diagnoseSheetAccess`
2. 點擊「執行」
3. 查看「執行記錄」中的詳細錯誤信息
4. 根據錯誤信息解決問題

## 🔍 常見問題檢查清單

- [ ] **SPREADSHEET_ID 已設置？**
  - 檢查：不是 `'YOUR_SPREADSHEET_ID'`
  - 檢查：ID 在引號內
  - 檢查：沒有多餘空格

- [ ] **Sheet ID 格式正確？**
  - 格式：通常是長字母數字組合
  - 例如：`1ABC123xyz456DEF789`

- [ ] **有 Sheet 訪問權限？**
  - 在 Sheet 中點擊「共用」
  - 確認你的帳號有「編輯者」權限

- [ ] **Sheet 存在？**
  - 確認 Sheet 沒有被刪除
  - 嘗試在瀏覽器中打開 Sheet

- [ ] **已重新部署？**
  - 修改代碼後必須重新部署
  - 使用「新版本」部署

## 💡 推薦做法

**對於快速測試：** 使用方案 1（簡化版）

**對於生產環境：** 使用方案 2（Sheet 版本）以便：
- 查看歷史數據
- 備份數據
- 多人協作

## 🆘 仍然無法解決？

1. **檢查執行日誌：**
   - 運行 `diagnoseSheetAccess` 函數
   - 查看詳細錯誤信息

2. **嘗試簡化版：**
   - 先使用 `google-apps-script-simple.gs`
   - 確保 API 正常工作
   - 再切換回 Sheet 版本

3. **檢查部署設置：**
   - 執行身份：**我**
   - 存取權限：**任何人**
   - 確保已完成授權

## 📝 測試 API

設置完成後，測試你的 API：

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

應該返回：
```json
{
  "ok": true,
  "weiweiCount": 0,
  "xixiCount": 0,
  "weiweiProbability": 50,
  "lastUpdated": "..."
}
```

