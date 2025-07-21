// 🔗 取得幣種 ID
const detailContainer = document.getElementById("token-detail");
const tokenId = new URLSearchParams(window.location.search).get("id");

// 🧠 趨勢分數計算
function calculateTrendScore(volume, change) {
  const volumeWeight = Math.min(volume / 1e9, 2);
  const changeWeight = change / 5;
  return Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5));
}

// ⏳ 顯示載入骨架
function showSkeleton() {
  detailContainer.innerHTML = `
    <div class="animate-pulse space-y-4">
      <div class="h-8 w-1/2 bg-gray-700 rounded"></div>
      <div class="grid grid-cols-2 gap-4">
        <div class="h-20 bg-gray-700 rounded"></div>
        <div class="h-20 bg-gray-700 rounded"></div>
      </div>
    </div>
  `;
}

// ⚠️ 顯示錯誤訊息
function showError(message) {
  detailContainer.innerHTML = `
    <div class="bg-red-800 text-red-200 p-4 rounded animate-shake">
      <strong>載入失敗：</strong> ${message}
      <p class="text-sm text-gray-400 mt-1">請檢查網路或稍後重試。</p>
    </div>
  `;
}

// 🛠 debounce 函式
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// ♻️ fetch with retry/backoff + 快取
async function fetchWithRetry(url, key, retries = 3, delay = 1500) {
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      sessionStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn(`🔁 retry ${i + 1}:`, err.message);
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }

  throw new Error(`📛 無法載入資料：${key}`);
}

// 📦 推薦幣種載入
async function getRecommended(currentId) {
  const ids = JSON.parse(localStorage.getItem("mcpRecommended")) || [];
  const filtered = ids.filter(id => id !== currentId).slice(0, 3);
  const tokens = [];

  for (const id of filtered) {
    try {
      const info = await fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${id}`, `coin-${id}`);
      if (info) tokens.push(info);
    } catch (err) {
      console.warn(`❌ 推薦幣失敗：${id}`, err.message);
    }
  }

  return tokens;
}

// 📊 主幣資料載入
async function loadTokenDetail(id) {
  if (!id) return showError("無效的參數，請指定幣種 ID。");
  showSkeleton();

  try {
    const info = await fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${id}`, `coin-${id}`);
    const chart = await fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`, `chart-${id}`);

    const { market_data } = info;
    const volume = market_data?.total_volume?.usd || 0;
    const change = market_data?.price_change_percentage_24h || 0;
    const price = market_data?.current_price?.usd || 0;
    const marketCap = market_data?.market_cap?.usd || 0;
    const score = calculateTrendScore(volume, change).toFixed(1);
    const advice = score >= 8.5 ? "短期強勢" : score < 6.5 ? "建議觀察" : "穩定成長";

    const labels = chart.prices.map(p => new Date(p[0]).toLocaleDateString());
    const series = chart.prices.map(p => p[1]);

    detailContainer.innerHTML = `
      <div class="flex items-center gap-4 mb-4 animate-fadein">
        <img src="${info.image.small}" class="w-10 h-10" alt="${info.name}" />
        <h2 class="text-2xl font-bold text-yellow-400">${info.name} (${info.symbol.toUpperCase()})</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat"><strong>$${price.toFixed(2)}</strong><br>
          <span class="${change >= 0 ? 'text-green-400' : 'text-red-400'}">${change.toFixed(2)}%</span></div>
        <div class="stat">Market Cap<br>$${marketCap.toLocaleString()}</div>
        <div class="stat">Volume<br>$${volume.toLocaleString()}</div>
        <div class="stat">Trend Score<br><span class="text-yellow-300 font-bold">${score}</span></div>
      </div>
      <div class="bg-yellow-300 text-black rounded p-4 mb-6 animate-pulse">
        <h3 class="font-bold">🧠 MCP AI 評估</h3>
        <p class="text-sm mt-2">此幣目前狀態：<strong>${advice}</strong></p>
      </div>
      <div class="ct-chart ct-major-tenth mb-6" id="mcp-chart"></div>
    `;

    new Chartist.Line('#mcp-chart', {
      labels,
      series: [series]
    }, {
      showArea: true,
      fullWidth: true,
      chartPadding: { right: 20 },
      axisX: { labelInterpolationFnc: (val, i) => i % 2 === 0 ? val : null }
    });

    const recommended = await getRecommended(id);
    if (recommended.length > 0) {
      let html = `<h3 class="text-lg font-bold text-yellow-400 mb-2">🔗 推薦幣種</h3><ul class="text-sm text-gray-300 space-y-2">`;
      recommended.forEach(t => {
        const vol = t.market_data?.total_volume?.usd || 0;
        html += `<li>✅ <a href="token.html?id=${t.id}" class="text-cyan-300 underline">${t.name}</a> — Volume: $${vol.toLocaleString()}</li>`;
      });
      html += `</ul>`;
      detailContainer.innerHTML += html;
    }

  } catch (err) {
    showError(err.message || "系統發生異常");
  }
}

// 🚀 初始化
debounce(loadTokenDetail, 500)(tokenId);
