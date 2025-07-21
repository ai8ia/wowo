// 🔧 快取常用 DOM 元素
const DOM = {
  list: document.getElementById("token-list"),
  reco: document.getElementById("recommended-coins"),
  search: document.getElementById("token-search"),
  loading: document.getElementById("token-loading"),
  status: document.getElementById("refresh-banner")
};

// 📊 趨勢分數計算公式
function calcScore(volume, change) {
  const volWeight = Math.min(volume / 1e9, 2);
  const changeWeight = change / 5;
  const score = (volWeight + changeWeight) * 1.5;
  return parseFloat(Math.max(5, Math.min(10, score)).toFixed(1));
}

// 🌟 推薦邏輯：強勢 + 高交易量
function getTopRecommendations(tokens) {
  return tokens.filter(t => t.score >= 8.5 && t.volume > 5e8).slice(0, 3);
}

// 🎨 通用幣種卡片
function renderTokenCard(token) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="trend-score">🔥 ${token.score}</div>
    <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    <p class="mt-2 text-yellow-400 underline text-sm">詳情分析 →</p>
  `;
  card.onclick = () => window.location.href = `token.html?id=${token.id}`;
  return card;
}

// 🧠 推薦幣種卡片：加上評估標籤
function renderRecommendedCard(token) {
  const label = token.change > 5
    ? "🌟 短期強勢"
    : token.change < -2
    ? "⚠️ 建議觀察"
    : "🌱 穩定成長";

  const card = document.createElement("div");
  card.className = "recommend-card";
  card.innerHTML = `
    <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
    <p class="text-sm text-gray-300 mb-2">${label}</p>
    <p>Trend Score: ${token.score}</p>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
  `;
  card.onclick = () => window.location.href = `token.html?id=${token.id}`;
  return card;
}

// 📦 呈現畫面
function renderAll(tokens) {
  DOM.list.innerHTML = "";
  DOM.reco.innerHTML = "";

  tokens.forEach(t => DOM.list.appendChild(renderTokenCard(t)));

  const recommended = getTopRecommendations(tokens);
  recommended.forEach(t => DOM.reco.appendChild(renderRecommendedCard(t)));

  localStorage.setItem("mcpRecommended", JSON.stringify(recommended.map(t => t.id)));
}

// 🌐 取得市場資料
async function fetchData() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30";

  try {
    DOM.loading.textContent = "⏳ 正在同步資料…";
    DOM.status.textContent = "📡 MCP 資料更新中…";

    const res = await fetch(url);
    const raw = await res.json();

    const tokens = raw.map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      volume: t.total_volume || 0,
      change: t.price_change_percentage_24h || 0,
      score: calcScore(t.total_volume || 0, t.price_change_percentage_24h || 0)
    }));

    window.tokensData = tokens;
    renderAll(tokens);

    DOM.loading.textContent = "";
    DOM.status.textContent = `✅ 資料已更新 (${new Date().toLocaleTimeString()})`;
  } catch (err) {
    console.error("📡 API 錯誤:", err);
    DOM.list.innerHTML = `<p class="text-red-400">⚠️ 資料載入失敗，請稍後重試。</p>`;
  }
}

// 🔍 搜尋功能綁定
function bindSearch() {
  DOM.search.addEventListener("input", () => {
    const q = DOM.search.value.toLowerCase();
    const filtered = (window.tokensData || []).filter(t =>
      t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)
    );
    renderAll(filtered);
  });
}

// 🚀 初始化與自動更新
function initMCP() {
  fetchData();
  bindSearch();
  setInterval(fetchData, 60000); // 每分鐘更新一次
}

initMCP();
