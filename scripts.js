const tokenList = document.getElementById("token-list");
const recoContainer = document.getElementById("recommended-coins");
const searchInput = document.getElementById("token-search");
const chainSelect = document.getElementById("chain-select");

// 熱度分數演算
function calculateTrendScore(token) {
  const volumeWeight = Math.min(token.total_volume / 1e9, 2);
  const changeWeight = token.price_change_percentage_24h / 5;
  return Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5));
}

// 推薦模組邏輯
function getRecommendedTokens(tokens) {
  return tokens
    .filter(t => t.score >= 8.5 && t.volume > 500000000)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// 顯示推薦幣種
function displayRecommended(recommended) {
  recoContainer.innerHTML = "";
  recommended.forEach(token => {
    const tag = token.change > 5 ? "🌟 短期強勢"
               : token.change < -2 ? "⚠️ 建議觀察"
               : "🌱 穩定成長";
    const div = document.createElement("div");
    div.className = "recommend-card";
    div.innerHTML = `
      <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
      <p class="text-sm text-gray-300 mb-2">${tag}</p>
      <p>Trend Score: ${token.score}</p>
      <p>Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">
        ${token.change.toFixed(2)}%</span></p>
    `;
    div.onclick = () => window.location.href = `token.html?id=${token.id}`;

    recoContainer.appendChild(div);
  });
}

// 顯示排行卡片
function displayTokens(data) {
  tokenList.innerHTML = "";
  data.forEach(token => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="trend-score">🔥 ${token.score}</div>
      <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
      <p>📈 Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">
        ${token.change.toFixed(2)}%</span></p>
      <p class="mt-2 text-yellow-400 underline text-sm">詳情分析</p>
    `;
    div.onclick = () => window.open(`https://www.coingecko.com/en/coins/${token.id}`, "_blank");
    tokenList.appendChild(div);
  });
}

// 載入 API 資料
async function loadTokensFromAPI() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=12&page=1&sparkline=false");
    const data = await res.json();

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
    displayRecommended(getRecommendedTokens(tokens));
  } catch (err) {
    tokenList.innerHTML = "<p class='text-red-400'>⚠️ 資料載入失敗。</p>";
  }
}

// 搜尋 + 鏈過濾
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = window.tokensData.filter(t => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q));
  displayTokens(filtered);
});

chainSelect.addEventListener("change", () => {
  const chain = chainSelect.value;
  const filtered = chain === "all"
    ? window.tokensData
    : window.tokensData.filter(t => t.chain === chain);
  displayTokens(filtered);
});

// 初始化
loadTokensFromAPI();
