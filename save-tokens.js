const fs = require("fs");
const axios = require("axios");

// 📊 推薦分數計算
function computeScore(volume, change) {
  const volScore = Math.log10(volume + 1) - 6;
  const changeScore = Math.abs(change) * 2;
  return Math.min(10, parseFloat((volScore + changeScore).toFixed(1)));
}

// 🎭 角色分類邏輯
function classifyPersona(score, change) {
  if (score >= 9 && change > 2) return "🔥 火星衝刺型";
  if (score < 5 && change < 0) return "🧊 冰晶防禦型";
  if (change < -3) return "🌧️ 技術修正型";
  return "🛰️ 穩健探索型";
}

// 💬 推薦理由生成
function generateReason(name, volume, change) {
  const volStr = `${Math.round(volume / 1e9)}B`;
  const changeStr = `${change.toFixed(2)}%`;
  const trend = change >= 0 ? "上升" : "回落";
  return `${name} 成交量約 ${volStr}，24h ${trend} ${changeStr}，具短期觀察價值。`;
}

// 🌟 光暈特效等級
function classifyGlowLevel(volume) {
  if (volume > 100e9) return "🌟 超高強度";
  if (volume > 10e9) return "🔥 高強度";
  return "🔆 中強度";
}

(async () => {
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "volume_desc",
        per_page: 30
      }
    });

    const tokens = res.data.map(t => {
      const { id, name, symbol, current_price, total_volume, price_change_percentage_24h } = t;
      const volume = total_volume ?? 0;
      const change = price_change_percentage_24h ?? 0;
      const score = computeScore(volume, change);
      const persona = classifyPersona(score, change);
      const reason = generateReason(name, volume, change);
      const glowLevel = classifyGlowLevel(volume);

      return {
        id,
        name,
        symbol: symbol.toUpperCase(),
        price: current_price ?? 0,
        volume,
        price_change_percentage_24h: change,
        score,
        persona,
        previousPersona: persona,
        reason,
        glowLevel
      };
    });

    fs.writeFileSync("public/tokens.json", JSON.stringify(tokens, null, 2));
    console.log(`✅ 已儲存 ${tokens.length} 筆推薦模組資料到 public/tokens.json`);

    const version = {
      version: `v${new Date().toISOString().slice(0, 10).replace(/-/g, ".")}`,
      updatedAt: new Date().toISOString(),
      source: "CoinGecko API",
      generatedBy: "GitHub Actions"
    };
    fs.writeFileSync("version.json", JSON.stringify(version, null, 2));
    console.log("🧬 version.json 已產生");
  } catch (err) {
    console.error("❌ 錯誤：無法抓取資料", err.message);
    process.exit(1);
  }
})();
