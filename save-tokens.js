// 📦 安裝前請先執行：npm install axios fs path
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 🔁 每次更新的間隔（毫秒）例如：30 分鐘 = 1800000
const UPDATE_INTERVAL = 30 * 60 * 1000;

// 📡 API 來源
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const PARAMS = {
  vs_currency: 'usd',
  order: 'volume_desc',
  per_page: 30,
  page: 1
};

// 📂 儲存路徑
const OUTPUT_FILE = path.join(__dirname, 'tokens.json');

// 🧬 資料清洗
function simplifyToken(t) {
  return {
    id: t.id,
    name: t.name,
    symbol: t.symbol,
    total_volume: t.total_volume,
    price_change_percentage_24h: t.price_change_percentage_24h
  };
}

// 🚀 更新函數
async function updateTokens() {
  try {
    const res = await axios.get(API_URL, { params: PARAMS });
    const tokens = res.data.map(simplifyToken);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tokens, null, 2));
    console.log(`✅ ${new Date().toLocaleString()} 已更新 tokens.json`);
  } catch (err) {
    console.error(`❌ 更新失敗：${err.message}`);
  }
}

// ⏱️ 啟動定時任務
updateTokens(); // 啟動時立即執行一次
setInterval(updateTokens, UPDATE_INTERVAL);
