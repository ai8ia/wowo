const tokenList = document.getElementById("token-list");
const searchInput = document.getElementById("token-search");
const chainSelect = document.getElementById("chain-select");

// 模擬 MCP 熱度分數邏輯
function calculateTrendScore(token) {
  const volumeWeight = Math.min(token.total_volume / 1000000000, 2);
  const changeWeight = token.price_change_percentage_24h / 5;
  return Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5));
}

// 取得 CoinGecko 即時資料
async function loadTokensFromAPI() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=12&page=1&sparkline=false');
    const data = await res.json();

    // 加入模擬鏈屬性
    const tokens = data.map(t => ({
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      volume: t.total_volume,
      change: t.price_change_percentage_24h,
      score: calculateTrendScore(t).toFixed(1),
      chain: Math.random() > 0.5 ? "ethereum" : "solana",
      id: t.id
    }));

    window.tokensData = tokens;
    displayTokens(tokens);
  } catch (err) {
    tokenList.innerHTML = '<p class="text-red-400">⚠️ 資料載入失敗，請稍候再試。</p>';
  }
}

// 顯示卡片
function displayTokens(data) {
  tokenList.innerHTML = "";
  data.forEach(token => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="trend-score">🔥 ${token.score}</div>
      <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
      <p>📈 Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
      <button class="text-yellow-400 mt-2 underline text-sm" onclick="window.open('https://www.coingecko.com/en/coins/${token.id}', '_blank')">詳情分析</button>
    `;
    tokenList.appendChild(div);
  });
}

// 搜尋 + 鏈過濾
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = window.tokensData.filter(t => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q));
  displayTokens(filtered);
});

chainSelect.addEventListener("change", () => {
  const chain = chainSelect.value;
  const filtered = chain === "all" ? window.tokensData : window.tokensData.filter(t => t.chain === chain);
  displayTokens(filtered);
});

// 載入資料
loadTokensFromAPI();
