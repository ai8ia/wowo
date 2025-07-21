// 🔧 DOM 快取
const DOM = {
  list: document.getElementById("token-list"),
  reco: document.getElementById("recommended-coins"),
  search: document.getElementById("token-search"),
  loading: document.getElementById("token-loading"),
  status: document.getElementById("refresh-banner")
};

// 📊 趨勢分數演算法
function calcScore(volume, change) {
  const v = Math.min(volume / 1e9, 2);
  const c = change / 5;
  return parseFloat(Math.max(5, Math.min(10, (v + c) * 1.5)).toFixed(1));
}

// 🔍 推薦幣篩選
function getRecommendations(tokens) {
  return tokens.filter(t => t.score >= 8.5 && t.volume > 5e8).slice(0, 3);
}

// 🎨 幣種卡片
function renderCard(token) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `
    <div class="trend-score">🔥 ${token.score}</div>
    <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    <p class="mt-2 text-yellow-400 underline text-sm">詳情分析 →</p>
  `;
  el.onclick = () => window.location.href = `token.html?id=${token.id}`;
  return el;
}

// 🧠 推薦卡片
function renderReco(token) {
  const label = token.change > 5 ? "🌟 短期強勢" :
                token.change < -2 ? "⚠️ 建議觀察" : "🌱 穩定成長";
  const el = document.createElement("div");
  el.className = "recommend-card";
  el.innerHTML = `
    <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
    <p class="text-sm text-gray-300 mb-2">${label}</p>
    <p>Trend Score: ${token.score}</p>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
  `;
  el.onclick = () => window.location.href = `token.html?id=${token.id}`;
  return el;
}

// 📦 資料渲染
function render(tokens) {
  DOM.list.innerHTML = "";
  DOM.reco.innerHTML = "";
  tokens.forEach(t => DOM.list.appendChild(renderCard(t)));
  const recos = getRecommendations(tokens);
  recos.forEach(t => DOM.reco.appendChild(renderReco(t)));
  localStorage.setItem("mcpRecommended", JSON.stringify(recos.map(t => t.id)));
}

// 🌐 取得市場資料
async function fetchData() {
  try {
    DOM.loading.textContent = "⏳ 正在同步資料…";
    DOM.status.textContent = "📡 MCP 資料更新中…";

    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30");
    const raw = await res.json();

    const tokens = raw.map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      volume: t.total_volume || 0,
      change: t.price_change_percentage_24h || 0,
      score: calcScore(t.total_volume, t.price_change_percentage_24h)
    }));

    window.tokensData = tokens;
    render(tokens);

    DOM.loading.textContent = "";
    DOM.status.textContent = `✅ 資料已更新 (${new Date().toLocaleTimeString()})`;
  } catch (err) {
    console.error("🚨 資料錯誤:", err);
    DOM.list.innerHTML = `<p class="text-red-400">⚠️ 載入失敗，請稍後重試。</p>`;
  }
}

// 🔍 搜尋事件
DOM.search.addEventListener("input", () => {
  const q = DOM.search.value.toLowerCase();
  const filtered = (window.tokensData || []).filter(t =>
    t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)
  );
  render(filtered);
});

// 🚀 初始化
fetchData();
setInterval(fetchData, 60000); // 每 60 秒更新一次
