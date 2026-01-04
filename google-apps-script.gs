// ====== 拉霸機 Google Apps Script 後端 ======
// 
// 使用說明：
// 1. 創建一個新的 Google Apps Script 專案
// 2. 創建一個 Google Sheet 用於存儲數據
// 3. 將此代碼複製到 Apps Script 編輯器
// 4. 修改下面的 SPREADSHEET_ID 和 SHEET_NAME
// 5. 部署為 Web App（執行身份：任何人，存取權限：任何人）

// ====== 配置 ======
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // 改成你的 Google Sheet ID
const SHEET_NAME = 'Data'; // Sheet 名稱
const PASSWORD = 'daven'; // 密碼

// ====== 主函數：處理 GET 請求 ======
function doGet(e) {
  try {
    // 安全處理參數
    e = e || {};
    e.parameter = e.parameter || {};
    
    const action = e.parameter.action;
    const callback = e.parameter.callback; // JSONP callback
    
    let result;
    
    // 如果沒有提供 action，默認返回配置（方便測試）
    if (!action) {
      result = getConfig();
    } else {
      // 根據 action 執行相應操作
      switch(action) {
        case 'config':
          result = getConfig();
          break;
        case 'spin':
          result = updateStats(e.parameter.result);
          break;
        case 'probability':
          result = updateProbability(
            e.parameter.weiweiProbability,
            e.parameter.password,
            e.parameter.updatedBy || 'unknown'
          );
          break;
        default:
          result = { 
            ok: false, 
            error: 'Unknown GET action: ' + action,
            availableActions: ['config', 'spin', 'probability'],
            usage: {
              config: '?action=config',
              spin: '?action=spin&result=威威 或 ?action=spin&result=茜茜',
              probability: '?action=probability&weiweiProbability=50&password=daven'
            }
          };
      }
    }
    
    // 如果提供了 callback，使用 JSONP 模式
    if (callback) {
      return ContentService.createTextOutput(
        callback + '(' + JSON.stringify(result) + ')'
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // 標準 JSON 響應
    // 注意：Google Apps Script Web App 部署為"任何人"訪問時會自動處理 CORS
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResult = { ok: false, error: error.toString() };
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
    
    if (callback) {
      return ContentService.createTextOutput(
        callback + '(' + JSON.stringify(errorResult) + ')'
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== 處理 POST 請求（備用） ======
function doPost(e) {
  // POST 請求處理邏輯與 GET 相同
  const params = e.parameter || {};
  const mockE = { parameter: params };
  return doGet(mockE);
}

// ====== 獲取配置和統計 ======
function getConfig() {
  try {
    const sheet = getSheet();
    const data = getDataFromSheet(sheet);
    
    return {
      ok: true,
      weiweiCount: data.weiweiCount || 0,
      xixiCount: data.xixiCount || 0,
      weiweiProbability: data.weiweiProbability || 50,
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    return { ok: false, error: '讀取配置失敗: ' + error.toString() };
  }
}

// ====== 更新統計（抽獎結果） ======
function updateStats(result) {
  try {
    if (result !== '威威' && result !== '茜茜') {
      return { ok: false, error: '無效的結果: ' + result };
    }
    
    const sheet = getSheet();
    const data = getDataFromSheet(sheet);
    
    // 更新統計
    if (result === '威威') {
      data.weiweiCount = (data.weiweiCount || 0) + 1;
    } else {
      data.xixiCount = (data.xixiCount || 0) + 1;
    }
    
    data.lastUpdated = new Date().toISOString();
    
    // 寫回 Sheet
    saveDataToSheet(sheet, data);
    
    return {
      ok: true,
      message: '統計已更新',
      weiweiCount: data.weiweiCount,
      xixiCount: data.xixiCount
    };
  } catch (error) {
    return { ok: false, error: '更新統計失敗: ' + error.toString() };
  }
}

// ====== 更新概率 ======
function updateProbability(weiweiProb, password, updatedBy) {
  try {
    // 驗證密碼
    if (!password || password !== PASSWORD) {
      return { ok: false, error: '密碼錯誤' };
    }
    
    // 驗證概率值
    const prob = parseInt(weiweiProb);
    if (isNaN(prob) || prob < 0 || prob > 100) {
      return { ok: false, error: '概率必須在 0-100 之間' };
    }
    
    const sheet = getSheet();
    const data = getDataFromSheet(sheet);
    
    // 更新概率
    data.weiweiProbability = prob;
    data.lastUpdated = new Date().toISOString();
    data.lastUpdatedBy = updatedBy;
    
    // 寫回 Sheet
    saveDataToSheet(sheet, data);
    
    return {
      ok: true,
      message: '概率已更新',
      weiweiProbability: prob,
      xixiProbability: 100 - prob
    };
  } catch (error) {
    return { ok: false, error: '更新概率失敗: ' + error.toString() };
  }
}

// ====== 獲取 Sheet 對象 ======
function getSheet() {
  try {
    // 檢查 SPREADSHEET_ID 是否已設置
    if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
      throw new Error('請先設置 SPREADSHEET_ID！\n\n步驟：\n1. 創建一個 Google Sheet\n2. 從網址中複製 Sheet ID（例如：https://docs.google.com/spreadsheets/d/ABC123XYZ/edit 中的 ABC123XYZ）\n3. 在代碼頂部將 SPREADSHEET_ID 改為你的 Sheet ID');
    }
    
    // 嘗試打開 Sheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (openError) {
      throw new Error('無法打開 Google Sheet。\n\n可能的原因：\n1. Sheet ID 不正確\n2. 你沒有訪問該 Sheet 的權限\n3. Sheet 不存在\n\n請檢查：\n- Sheet ID: ' + SPREADSHEET_ID + '\n- 確保你對該 Sheet 有編輯權限');
    }
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // 如果 Sheet 不存在，創建它
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      initializeSheet(sheet);
    }
    
    // 如果是空 Sheet，初始化數據
    if (sheet.getLastRow() < 2) {
      initializeSheet(sheet);
    }
    
    return sheet;
  } catch (error) {
    throw new Error('無法訪問 Google Sheet: ' + error.toString());
  }
}

// ====== 初始化 Sheet ======
function initializeSheet(sheet) {
  // 設置表頭
  sheet.getRange(1, 1, 1, 5).setValues([[
    'Key', 'Value', 'Type', 'LastUpdated', 'Notes'
  ]]);
  
  // 設置初始數據
  const initialData = [
    ['weiweiCount', '0', 'number', new Date().toISOString(), '威威被抽中次數'],
    ['xixiCount', '0', 'number', new Date().toISOString(), '茜茜被抽中次數'],
    ['weiweiProbability', '50', 'number', new Date().toISOString(), '威威概率（百分比）']
  ];
  
  sheet.getRange(2, 1, initialData.length, 5).setValues(initialData);
  
  // 格式化表頭
  sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  sheet.getRange(1, 1, 1, 5).setBackground('#4285f4');
  sheet.getRange(1, 1, 1, 5).setFontColor('#ffffff');
}

// ====== 從 Sheet 讀取數據 ======
function getDataFromSheet(sheet) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  const data = {
    weiweiCount: 0,
    xixiCount: 0,
    weiweiProbability: 50
  };
  
  // 跳過表頭，從第2行開始讀取
  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    const value = values[i][1];
    
    if (key === 'weiweiCount') {
      data.weiweiCount = parseInt(value) || 0;
    } else if (key === 'xixiCount') {
      data.xixiCount = parseInt(value) || 0;
    } else if (key === 'weiweiProbability') {
      data.weiweiProbability = parseInt(value) || 50;
    }
  }
  
  return data;
}

// ====== 保存數據到 Sheet ======
function saveDataToSheet(sheet, data) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  const now = new Date().toISOString();
  
  // 更新現有行
  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    
    if (key === 'weiweiCount') {
      sheet.getRange(i + 1, 2).setValue(data.weiweiCount);
      sheet.getRange(i + 1, 4).setValue(now);
    } else if (key === 'xixiCount') {
      sheet.getRange(i + 1, 2).setValue(data.xixiCount);
      sheet.getRange(i + 1, 4).setValue(now);
    } else if (key === 'weiweiProbability') {
      sheet.getRange(i + 1, 2).setValue(data.weiweiProbability);
      sheet.getRange(i + 1, 4).setValue(now);
    }
  }
}

// ====== 診斷函數：檢查 Sheet 訪問 ======
function diagnoseSheetAccess() {
  Logger.log('=== 診斷 Sheet 訪問 ===');
  Logger.log('SPREADSHEET_ID: ' + SPREADSHEET_ID);
  Logger.log('SHEET_NAME: ' + SHEET_NAME);
  
  // 檢查是否設置
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
    Logger.log('❌ SPREADSHEET_ID 未設置！');
    return;
  }
  
  try {
    Logger.log('\n嘗試打開 Sheet...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ Sheet 打開成功！');
    Logger.log('Sheet 名稱: ' + spreadsheet.getName());
    Logger.log('Sheet URL: ' + spreadsheet.getUrl());
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (sheet) {
      Logger.log('✅ Sheet "' + SHEET_NAME + '" 存在');
      Logger.log('行數: ' + sheet.getLastRow());
    } else {
      Logger.log('⚠️ Sheet "' + SHEET_NAME + '" 不存在，將在首次使用時創建');
    }
    
    Logger.log('\n✅ 診斷完成：一切正常！');
  } catch (error) {
    Logger.log('❌ 錯誤: ' + error.toString());
    Logger.log('\n可能的原因：');
    Logger.log('1. Sheet ID 不正確');
    Logger.log('2. 沒有訪問該 Sheet 的權限');
    Logger.log('3. Sheet 已被刪除');
    Logger.log('\n解決方法：');
    Logger.log('1. 檢查 Sheet ID 是否正確');
    Logger.log('2. 確保你對該 Sheet 有編輯權限');
    Logger.log('3. 在 Sheet 中點擊「共用」，確保你的帳號有權限');
  }
}

// ====== 測試函數（可選） ======
function test() {
  // 先診斷
  diagnoseSheetAccess();
  
  // 測試獲取配置
  Logger.log('\n\n=== 測試獲取配置 ===');
  Logger.log(getConfig());
  
  // 測試更新統計
  Logger.log('\n\n=== 測試更新統計（威威） ===');
  Logger.log(updateStats('威威'));
  
  // 測試更新概率
  Logger.log('\n\n=== 測試更新概率 ===');
  Logger.log(updateProbability('60', 'daven', 'test-user'));
  
  Logger.log('\n\n=== 最終配置 ===');
  Logger.log(getConfig());
}

