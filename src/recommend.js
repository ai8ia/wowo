
const fs = require("fs");

// 設定推薦幣種資料
const coins = [
  {
    symbol: "SOL",
    score: 9.1,
    volume: 1220000000,
    trend: "技術強勁，短期看多",
    persona: "🔥 火星衝刺型 · 高波動高分"
  },
  {
    symbol: "PENGU",
    score: 8.7,
    volume: 840000000,
    trend: "資金活躍，AI持續加分",
    persona: "🌊 穩定延伸型 · 穩中帶快"
  },
  {
    symbol: "OM",
    score: 8.5,
    volume: 650000000,
    trend: "量能提升，預期走強",
    persona: "🧪 智能實驗型 · 抓準反轉"
  }
];

// 輸出為 JSON 檔案
fs.writeFileSync("recommend.json", JSON.stringify(coins, null, 2));

console.log("✅ 已更新推薦資料：recommend.json");
