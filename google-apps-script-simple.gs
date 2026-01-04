// ====== 拉霸機 Google Apps Script 後端（簡化版 - 不使用外部 Sheet） ======
// 
// 此版本使用 PropertiesService 存儲數據，不需要創建 Google Sheet
// 更簡單快速，適合測試或小規模使用
//
// 部署說明：
// 1. 將此代碼複製到 Apps Script 編輯器
// 2. 部署為 Web App（執行身份：我，存取權限：任何人）

// ====== 配置 ======
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
        case 'reset':
          result = resetStats(e.parameter.password);
          break;
        default:
          result = { 
            ok: false, 
            error: 'Unknown GET action: ' + action,
            availableActions: ['config', 'spin', 'probability', 'reset'],
            usage: {
              config: '?action=config',
              spin: '?action=spin&result=威威 或 ?action=spin&result=茜茜',
              probability: '?action=probability&weiweiProbability=50&password=daven',
              reset: '?action=reset&password=carol'
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
  const params = e.parameter || {};
  const mockE = { parameter: params };
  return doGet(mockE);
}

// ====== 獲取 PropertiesService ======
function getProperties() {
  return PropertiesService.getScriptProperties();
}

// ====== 獲取配置和統計 ======
function getConfig() {
  try {
    const props = getProperties();
    
    return {
      ok: true,
      weiweiCount: parseInt(props.getProperty('weiweiCount') || '0'),
      xixiCount: parseInt(props.getProperty('xixiCount') || '0'),
      weiweiProbability: parseInt(props.getProperty('weiweiProbability') || '50'),
      lastUpdated: props.getProperty('lastUpdated') || new Date().toISOString()
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
    
    const props = getProperties();
    let weiweiCount = parseInt(props.getProperty('weiweiCount') || '0');
    let xixiCount = parseInt(props.getProperty('xixiCount') || '0');
    
    // 更新統計
    if (result === '威威') {
      weiweiCount++;
    } else {
      xixiCount++;
    }
    
    // 保存
    props.setProperties({
      'weiweiCount': weiweiCount.toString(),
      'xixiCount': xixiCount.toString(),
      'lastUpdated': new Date().toISOString()
    });
    
    return {
      ok: true,
      message: '統計已更新',
      weiweiCount: weiweiCount,
      xixiCount: xixiCount
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
    
    const props = getProperties();
    
    // 保存
    props.setProperties({
      'weiweiProbability': prob.toString(),
      'lastUpdated': new Date().toISOString(),
      'lastUpdatedBy': updatedBy
    });
    
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

// ====== 重置統計 ======
function resetStats(password) {
  try {
    // 驗證密碼
    if (!password || password !== 'carol') {
      return { ok: false, error: '密碼錯誤' };
    }
    
    const props = getProperties();
    
    // 重置統計數據（保留概率設置）
    props.setProperties({
      'weiweiCount': '0',
      'xixiCount': '0',
      'lastUpdated': new Date().toISOString(),
      'lastResetBy': 'web-user',
      'lastResetAt': new Date().toISOString()
    });
    
    return {
      ok: true,
      message: '統計已重置',
      weiweiCount: 0,
      xixiCount: 0
    };
  } catch (error) {
    return { ok: false, error: '重置統計失敗: ' + error.toString() };
  }
}

// ====== 測試函數 ======
function test() {
  Logger.log('=== 測試簡化版 API ===');
  
  Logger.log('\n1. 獲取配置:');
  Logger.log(getConfig());
  
  Logger.log('\n2. 更新統計（威威）:');
  Logger.log(updateStats('威威'));
  
  Logger.log('\n3. 更新概率:');
  Logger.log(updateProbability('60', 'daven', 'test-user'));
  
  Logger.log('\n4. 重置統計:');
  Logger.log(resetStats('carol'));
  
  Logger.log('\n5. 最終配置:');
  Logger.log(getConfig());
}

// ====== 重置數據（可選） ======
function resetData() {
  const props = getProperties();
  props.deleteAllProperties();
  Logger.log('數據已重置');
}

