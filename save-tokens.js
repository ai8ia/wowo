// save-tokens.js
const fs = require('fs');
const axios = require('axios');

(async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30&page=1';
  const res = await axios.get(url);
  const tokens = res.data.map(t => ({
    id: t.id,
    name: t.name,
    symbol: t.symbol,
    total_volume: t.total_volume,
    price_change_percentage_24h: t.price_change_percentage_24h
  }));

  fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
  console.log('✅ tokens.json 已儲存完成');
})();
