const tokenList = document.getElementById("token-list");
const recoContainer = document.getElementById("recommended-coins");
const searchInput = document.getElementById("token-search");

function calculateTrendScore(volume, change) {
  const volumeWeight = Math.min(volume / 1e9, 2);
  const changeWeight = change / 5;
  return Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5));
}

function getRecommendedTokens(tokens) {
  return tokens.filter(t => t.score >= 8.5 && t.volume > 5e8).slice(0, 3);
}

function displayTokens(data) {
  tokenList.innerHTML = "";
  data.forEach(token => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="trend-score">🔥 ${token.score}</div>
      <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
      <p>Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
      <p class="mt-2 text-yellow-400 underline text-sm">詳情分析 →</p>
    `;
    div.onclick = () => window.location.href = `token.html?id=${token.id}`;
    tokenList.appendChild(div);
  });
}

function displayRecommended(recommended) {
  recoContainer.innerHTML = "";
  recommended.forEach(token => {
    const tag = token.change > 5 ? "🌟 短期強勢" : token.change < -2 ? "⚠️ 建議觀察" : "🌱 穩定成長";
    const div = document.createElement("div");
    div.className = "recommend-card";
    div.innerHTML = `
      <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
      <p class="text-sm text-gray-300 mb-2">${tag}</p>
      <p>Trend Score: ${token.score}</p>
      <p>Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    `;
    div.onclick = () => window.location.href = `token.html?id=${token.id}`;
    recoContainer.appendChild(div);
  });
}

async function loadTokensFromAPI() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30");
  const data = await res.json();

  const tokens = data.map(t => ({
    id: t.id,
    name: t.name,
    symbol: t.symbol.toUpperCase(),
    volume: t.total_volume || 0,
    change: t.price_change_percentage_24h || 0,
    score: calculateTrendScore(t.total_volume || 0, t.price_change_percentage_24h || 0).toFixed(1)
  }));

  window.tokensData = tokens;
  displayTokens(tokens);
  displayRecommended(getRecommendedTokens(tokens));
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = window.tokensData.filter(t =>
    t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)
  );
  displayTokens(filtered);
});

loadTokensFromAPI();
