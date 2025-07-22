const fs = require("fs");
const axios = require("axios");

(async () => {
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "volume_desc",
        per_page: 30
      }
    });

    const tokens = res.data.map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      total_volume: t.total_volume ?? 0,
      price_change_percentage_24h: t.price_change_percentage_24h ?? 0
    }));

    fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));

    const version = {
      version: `v${new Date().toISOString().slice(0, 10).replace(/-/g, ".")}`,
      updatedAt: new Date().toISOString(),
      source: "CoinGecko API",
      generatedBy: "GitHub Actions"
    };
    fs.writeFileSync("version.json", JSON.stringify(version, null, 2));
  } catch (err) {
    console.error("❌ 資料更新失敗", err.message);
    process.exit(1);
  }
})();
