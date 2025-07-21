const DOM = {
  tokenList: document.getElementById("token-list"),
  recoContainer: document.getElementById("recommended-coins"),
  searchInput: document.getElementById("token-search"),
  loadingBanner: document.getElementById("token-loading"),
  refreshStatus: document.getElementById("refresh-banner")
};

function calculateTrendScore(volume, change) {
  const volumeWeight = Math.min(volume / 1e9, 2);
  const changeWeight = change / 5;
  return parseFloat(Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5)).toFixed(1));
}

function getRecommendedTokens(tokens) {
  return tokens.filter(t => t.score >= 8.5 && t.volume > 5e8).slice(0, 3);
}

function createTokenCard(token) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="trend-score">🔥 ${token.score}</div>
    <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    <p class="mt-2 text-yellow-400 underline text-sm">詳情分析 →</p>
  `;
  card.addEventListener("click", () => {
    window.location.href = `token.html?id=${token.id}`;
  });
  return card;
}

function createRecommendedCard(token) {
  const tag = token.change > 5
    ? "🌟 短期強勢"
    : token.change < -2
    ? "⚠️ 建議觀察"
    : "🌱 穩定成長";

  const card = document.createElement("div");
  card.className = "recommend-card";
  card.innerHTML = `
    <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
    <p class="text-sm text-gray-300 mb-2">${tag}</p>
    <p>Trend Score: ${token.score}</p>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
  `;
  card.addEventListener("click", () => {
    window.location.href = `token.html?id=${token.id}`;
  });
  return card;
}

function displayTokens(tokens) {
  DOM.tokenList.innerHTML = "";
  tokens.forEach(token => DOM.tokenList.appendChild(createTokenCard(token)));
}

function displayRecommended(tokens) {
  DOM.recoContainer.innerHTML = "";
  tokens.forEach(token => DOM.recoContainer.appendChild(createRecommendedCard(token)));
}

async function fetchMarketData() {
  const endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30";

  try {
    DOM.loadingBanner.textContent = "⏳ 正在同步資料…";
    DOM.refreshStatus.textContent = "📡 MCP 資料更新中…";

    const response = await fetch(endpoint);
    const data = await response.json();

    const tokens = data.map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      volume: t.total_volume || 0,
      change: t.price_change_percentage_24h || 0,
      score: calculateTrendScore(t.total_volume || 0, t.price_change_percentage_24h || 0)
    }));

    window.tokensData = tokens;
    const recommended = getRecommendedTokens(tokens);

    displayTokens(tokens);
    displayRecommended(recommended);

    localStorage.setItem("mcpRecommended", JSON.stringify(recommended.map(t => t.id)));

    DOM.loadingBanner.textContent = "";
    DOM.refreshStatus.textContent = `✅ 資料已更新 (${new Date().toLocaleTimeString()})`;
  } catch (error) {
    DOM.tokenList.innerHTML = `<p class="text-red-400">⚠️ 資料載入失敗，請稍後重試。</p>`;
    console.error("📡 API 錯誤:", error);
  }
}

function bindSearchFilter() {
  DOM.searchInput.addEventListener("input", () => {
    const q = DOM.searchInput.value.toLowerCase();
    const filtered = (window.tokensData || []).filter(t =>
      t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)
    );
    displayTokens(filtered);
  });
}

// 🧠 初始化與自動刷新
function init() {
  fetchMarketData();
  setInterval(fetchMarketData, 60000);
  bindSearchFilter();
}

init();
