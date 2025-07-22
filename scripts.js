// 🔧 DOM 快取
const DOM = {
  list: document.getElementById("token-list"),
  reco: document.getElementById("recommended-coins"),
  search: document.getElementById("token-search"),
  loading: document.getElementById("token-loading"),
  status: document.getElementById("refresh-banner"),
  source: document.getElementById("data-source"),
  priceBox: document.getElementById("live-price")
};

// ⭐ 收藏管理
const favorites = new Set(JSON.parse(localStorage.getItem("mcpFavorites") || "[]"));

// 📊 趨勢分數演算法
function calcScore(volume, change) {
  const v = Math.min(volume / 1e9, 2);
  const c = change / 5;
  return parseFloat(Math.max(5, Math.min(10, (v + c) * 1.5)).toFixed(1));
}

function showUpdateTimestamp() {
  const time = new Date();
  const timestamp = time.toLocaleString("zh-TW", {
    hour12: false,
    timeZone: "Asia/Taipei"
  });
  const el = document.getElementById("update-time");
  if (el) el.textContent = `📡 資料更新時間：${timestamp}`;
}
showUpdateTimestamp();



// 🧠 AI 評估層
function getAdvice(score) {
  if (score >= 8.5) return "📈 技術強勁、交易量活躍，短期看多";
  if (score <= 6) return "🧐 價格震盪大、量能不足，建議觀察";
  return "🌿 穩定中，中長線持有建議";
}

// 🚨 預警提示
function checkAlerts(token) {
  if (token.change >= 10) showBanner(`🚀 ${token.name} 爆漲 ${token.change.toFixed(2)}%`);
  if (token.change <= -10) showBanner(`📉 ${token.name} 暴跌 ${token.change.toFixed(2)}%`);
}
function showBanner(msg) {
  const el = document.createElement("div");
  el.className = "alert-banner bg-red-900 text-yellow-200 p-2 mb-2 animate-shake";
  el.textContent = msg;
  document.body.prepend(el);
  setTimeout(() => el.remove(), 5000);
}

// 📡 即時價格更新（Binance）
function connectLivePrice(symbol = "BTCUSDT") {
  const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
  socket.onmessage = e => {
    const { c: current } = JSON.parse(e.data);
    DOM.priceBox.textContent = `$${parseFloat(current).toFixed(2)}`;
  };
  socket.onerror = () => {
    DOM.priceBox.textContent = "❌ 錯誤";
  };
}

// 🧾 推薦邏輯
function getRecommendations(tokens) {
  return tokens.filter(t => t.score >= 8.5 && t.volume > 5e8).slice(0, 3);
}

// 🎨 主幣種卡片
function renderCard(token) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `
    <div class="trend-score">🔥 ${token.score}</div>
    <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    <p class="mt-2 text-yellow-400 underline text-sm">詳情分析 →</p>
    <button class="mt-2 text-sm ${favorites.has(token.id) ? 'text-yellow-300' : 'text-gray-400'}">⭐ 收藏</button>
  `;
  el.querySelector("button").onclick = e => {
    e.stopPropagation();
    favorites.has(token.id) ? favorites.delete(token.id) : favorites.add(token.id);
    localStorage.setItem("mcpFavorites", JSON.stringify([...favorites]));
    fetchData(); // 重新渲染
  };
  el.onclick = () => window.location.href = `token.html?id=${token.id}`;
  checkAlerts(token);
  return el;
}

// 🌟 推薦卡片
function renderReco(token) {
  const label = token.change > 5 ? "🌟 短期強勢" :
                token.change < -2 ? "⚠️ 建議觀察" : "🌱 穩定成長";
  const el = document.createElement("div");
  el.className = "recommend-card";
  el.innerHTML = `
    <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
    <p class="text-sm text-gray-300 mb-1">${label}</p>
    <p>Trend Score: ${token.score}</p>
    <p>Volume: $${token.volume.toLocaleString()}</p>
    <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    <p class="text-xs italic text-gray-400">${getAdvice(token.score)}</p>
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

// 🌐 API 資料載入（Gecko → Lore）
async function fetchData() {
  const geckoURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30";
  const loreURL = "https://api.coinlore.net/api/tickers/?limit=30";

  DOM.loading.textContent = "🔄 抓取中…";
  DOM.status.textContent = "📡 嘗試 CoinGecko → CoinLore";

  let tokens = [];

  try {
    const res = await fetch(geckoURL);
    const raw = await res.json();
    tokens = raw.map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      volume: t.total_volume,
      change: t.price_change_percentage_24h,
      score: calcScore(t.total_volume, t.price_change_percentage_24h)
    }));
    DOM.status.textContent = `✅ 來源：CoinGecko（${new Date().toLocaleTimeString()})`;
  } catch {
    try {
      const res = await fetch(loreURL);
      const raw = await res.json();
      tokens = raw.data.map(t => ({
        id: String(t.id),
        name: t.name,
        symbol: t.symbol,
        volume: t.volume_usd,
        change: t.percent_change_24h,
        score: calcScore(t.volume_usd, t.percent_change_24h)
      }));
      DOM.status.textContent = `✅ 來源：CoinLore（${new Date().toLocaleTimeString()})`;
    } catch (err2) {
      DOM.list.innerHTML = `<p class="text-red-400">❌ 資料載入失敗</p>`;
      return;
    }
  }

  window.tokensData = tokens;
  render(tokens);
  DOM.loading.textContent = "";
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
setInterval(fetchData, 60000);
connectLivePrice("BTCUSDT");
