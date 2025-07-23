const fs = require("fs");

// 原始推薦幣種資料
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

// 分類邏輯
function classify(token) {
  if (token.score >= 9 && token.volume > 1_000_000_000) return "🔥 爆衝熱榜";
  if (token.score >= 8.5 && token.volume > 500_000_000) return "🌊 穩健主流";
  if (token.score >= 8.0) return "🧪 創意潛力";
  return "🧊 觀察中";
}

// 推薦理由邏輯
function generateReason(token) {
  const reasons = [];
  if (token.volume > 1_000_000_000) reasons.push("成交量暴增 🚀");
  if (token.score >= 9) reasons.push("分數極高 🔥");
  if (/pengu|ai|spark/i.test(token.symbol)) reasons.push("社群熱度高 🔊");
  if (/om|lab|chain/i.test(token.symbol)) reasons.push("反轉題材活躍 ⚙️");
  return reasons.length ? reasons.join(" + ") : "信號尚未明確，建議觀察 🧊";
}

// 加入分類與理由
const enrichedCoins = coins.map(token => ({
  ...token,
  category: classify(token),
  reason: generateReason(token)
}));

// 輸出成推薦資料
fs.writeFileSync("recommend.json", JSON.stringify(enrichedCoins, null, 2));
console.log("✅ 已生成推薦資料 recommend.json，含 category + reason");
