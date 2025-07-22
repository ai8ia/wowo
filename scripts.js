// 🧠 MCP 控制台資料載入邏輯
fetch("tokens.json")
  .then(r => r.json())
  .then(tokens => {
    render(tokens);
    checkAlerts(tokens);         // 🚨 全域警示提示模組
    renderFavoritesDeck();       // 🎴 NFT 收藏卡片渲染（預設主題）
    document.getElementById("loading").textContent = "";
  });

function render(tokens) {
  const grid = document.getElementById("token-list");
  const recommend = document.getElementById("recommended-list");
  const search = document.getElementById("search");

  function renderCard(t) {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3 class="text-yellow-300 font-bold">${t.name} (${t.symbol})</h3>
      <p>成交量：$${parseInt(t.total_volume).toLocaleString()}</p>
      <p>24h 漲跌：<span class="${t.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${t.price_change_percentage_24h.toFixed(2)}%</span></p>
      <p class="trend-score">分數：${calcScore(t.total_volume, t.price_change_percentage_24h)}</p>
    `;

    // 🧠 收藏按鈕模組
    const favBtn = document.createElement("button");
    favBtn.textContent = "🧠 收藏";
    favBtn.className = "favorite-btn";
    favBtn.onclick = () => saveToFavorites(t);
    el.appendChild(favBtn);

    grid.appendChild(el);
  }

  // 🚀 推薦幣種篩選邏輯
  const top = tokens.filter(t => calcScore(t.total_volume, t.price_change_percentage_24h) >= 90);
  top.forEach(t => {
    const el = document.createElement("div");
    el.className = "recommend-card";
    el.innerHTML = `
      <h3 class="text-yellow-300 font-bold">${t.name} (${t.symbol})</h3>
      <p>漲跌：${t.price_change_percentage_24h.toFixed(2)}%</p>
      <p class="trend-score">推薦分數：${calcScore(t.total_volume, t.price_change_percentage_24h)}</p>
    `;
    recommend.appendChild(el);
  });

  // 📥 搜尋事件綁定
  search.oninput = e => {
    const keyword = e.target.value.toLowerCase();
    grid.innerHTML = "";
    tokens.filter(t => t.name.toLowerCase().includes(keyword) || t.symbol.toLowerCase().includes(keyword))
          .forEach(renderCard);
  };

  // 📦 預設渲染所有幣種卡片
  tokens.forEach(renderCard);
}

// 🔢 推薦分數算法：成交量 + 漲跌加權
function calcScore(volume, change) {
  const v = Math.log10(volume);
  const pct = Math.abs(change);
  return Math.round(v * 10 + pct);
}

// 🎨 NFT 收藏主題切換邏輯
let currentTheme = "starship";
document.getElementById("theme-selector").onchange = e => {
  currentTheme = e.target.value;
  renderFavoritesDeck(currentTheme);
};
