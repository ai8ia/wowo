// 📦 DOM 快取
const DOM = {
  list: document.getElementById("token-list"),
  reco: document.getElementById("recommended-list"),
  search: document.getElementById("search"),
  loading: document.getElementById("loading"),
  status: document.getElementById("status"),
  version: document.getElementById("version-info")
};

// 📈 趨勢分數計算公式
function calcScore(volume, change) {
  const v = Math.min(volume / 1e9, 2);
  const c = change / 5;
  return parseFloat(Math.max(5, Math.min(10, (v + c) * 1.5)).toFixed(1));
}

// 📄 渲染幣種卡片
function renderCard(t) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `
    <h3 class="text-yellow-300 font-bold">${t.name} (${t.symbol})</h3>
    <p>成交量：$${parseInt(t.total_volume).toLocaleString()}</p>
    <p>24h 漲跌：<span class="${t.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${t.price_change_percentage_24h.toFixed(2)}%</span></p>
    <p class="trend-score">分數：${calcScore(t.total_volume, t.price_change_percentage_24h)}</p>
    renderNFTCard(token, "starship"); // 或 "retro", "chip"

  `;
  return el;
}

// 🔍 推薦邏輯
function getRecommendations(tokens) {
  return tokens
    .filter(t => calcScore(t.total_volume, t.price_change_percentage_24h) >= 8)
    .slice(0, 3);
}

// 📊 渲染推薦卡片
function renderReco(t) {
  const el = document.createElement("div");
  el.className = "recommend-card";
  el.innerHTML = `
    <h4 class="text-yellow-300 font-bold">${t.name}</h4>
    <p>漲跌：<span class="${t.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${t.price_change_percentage_24h.toFixed(2)}%</span></p>
    <p>分數：${calcScore(t.total_volume, t.price_change_percentage_24h)}</p>
  `;
  return el;
}

// 🔎 搜尋事件綁定
DOM.search.addEventListener("input", () => {
  const q = DOM.search.value.toLowerCase();
  const filtered = (window.tokensData || []).filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.symbol.toLowerCase().includes(q)
  );
  render(filtered);
});

// 🧪 渲染主區塊
function render(tokens) {
  DOM.list.innerHTML = "";
  DOM.reco.innerHTML = "";
  tokens.forEach(t => DOM.list.appendChild(renderCard(t)));
  const recos = getRecommendations(tokens);
  recos.forEach(t => DOM.reco.appendChild(renderReco(t)));
  localStorage.setItem("mcpRecommended", JSON.stringify(recos.map(t => t.id)));
}

// 🚀 載入 tokens.json
async function fetchLocalData() {
  try {
    DOM.loading.textContent = "🔄 資料載入中…";
    DOM.status.textContent = "📁 來源：tokens.json";
    const res = await fetch("tokens.json");
    const tokens = await res.json();
    window.tokensData = tokens;
    render(tokens);
    
checkAlerts(tokens);

    DOM.loading.textContent = "";
    DOM.status.textContent = `✅ 共載入 ${tokens.length} 筆資料 · ${new Date().toLocaleTimeString("zh-TW")}`;
  } catch {
    DOM.list.innerHTML = `<p class="text-red-400">❌ 載入失敗</p>`;
  }
}

// 🧬 顯示 version.json
async function showVersionInfo() {
  try {
    const res = await fetch("version.json");
    const info = await res.json();
    const time = new Date(info.updatedAt).toLocaleString("zh-TW", {
      hour12: false,
      timeZone: "Asia/Taipei"
    });
    DOM.version.innerHTML = `
      <p>🧬 MCP ${info.version} · 資料更新：${time}</p>
      <p>📁 資料來源：${info.source} · 由 ${info.generatedBy}</p>
    `;
  } catch {
    console.warn("⚠️ version.json 無法解析");
  }
}

// 🔁 初始化並每 60 秒自動刷新
fetchLocalData();
showVersionInfo();
setInterval(() => {
  fetchLocalData();
  showVersionInfo();
}, 60000);
