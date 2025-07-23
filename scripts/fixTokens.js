// scripts/fixTokens.js
// 自動修復 tokens.json 欄位結構，防止 undefined 報錯

const fs = require('fs');
const path = require('path');

// 檔案路徑
const tokensPath = path.join(__dirname, '../public/tokens.json');

// 讀取原始資料
let rawData;
try {
  rawData = fs.readFileSync(tokensPath, 'utf-8');
} catch (err) {
  console.error('❌ 無法讀取 tokens.json：', err.message);
  process.exit(1);
}

// 試著解析 JSON
let tokens;
try {
  tokens = JSON.parse(rawData);
} catch (err) {
  console.error('❌ JSON 格式錯誤：', err.message);
  process.exit(1);
}

// 補全欄位
const fixed = tokens.map((item, idx) => ({
  symbol: item.symbol || `UNKNOWN_${idx + 1}`,
  score: typeof item.score === 'number' && !isNaN(item.score) ? item.score : 0,
  volume: typeof item.volume === 'number' ? item.volume : 0,
  trend: item.trend || '尚無趨勢說明',
  persona: item.persona || '🌀 未分類角色',
  reason: item.reason || '系統尚未提供推薦解釋',
}));

// 寫入修復後結果
try {
  fs.writeFileSync(tokensPath, JSON.stringify(fixed, null, 2));
  console.log(`✅ 修復完成，共處理 ${fixed.length} 筆資料`);
} catch (err) {
  console.error('❌ 寫入失敗：', err.message);
}
