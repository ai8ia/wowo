const fs = require("fs");

const coins = ["solana", "pengu", "om"];

coins.forEach(symbol => {
  const labels = [...Array(30)].map((_, i) => `Day ${i + 1}`);
  const price = labels.map(() => +(Math.random() * 100).toFixed(2));
  const volume = labels.map(() => Math.floor(Math.random() * 2_000_000_000));
  const score = labels.map(() => +(Math.random() * 4 + 5).toFixed(1)); // Range: 5.0 ~ 9.0

  const data = { labels, price, volume, score };
  fs.writeFileSync(`./chart-data/${symbol}.json`, JSON.stringify(data, null, 2));
});

console.log("✅ 已完成三幣種資料輸出 ➝ chart-data/*.json");

