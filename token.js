const detailContainer = document.getElementById("token-detail");
const tokenId = new URLSearchParams(window.location.search).get("id");

// 🧠 trend score 計算
function calculateTrendScore(volume, change) {
  const volumeWeight = Math.min(volume / 1e9, 2);
  const changeWeight = change / 5;
  return Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5));
}

// 🛠 debounce 函式
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// ♻️ fetch with retry/backoff 快取
async function fetchWithRetry(url, key, retries = 3, delay = 1500) {
  // 嘗試使用快取
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) throw new Error("Too Many Requests");
      const data = await res.json();
      sessionStorage.setItem(key, JSON.stringify(data)); // 暫存快取
      return data;
    } catch (err) {
      console.warn(`🔁 retry ${i + 1}: ${key}`, err.message);
      await new Promise(r => setTimeout(r, delay * (i + 1))); // exponential backoff
    }
  }

  throw new Error("📛 無法取得資料：" + key);
}

// 📦 推薦幣種
async function getRecommendedFromStorage(currentId) {
  const ids = JSON.parse(localStorage.getItem("mcpRecommended")) || [];
  const filtered = ids.filter(id => id !== currentId).slice(0, 3);
  const tokens = [];

  for (const id of filtered) {
    try {
      const info = await fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${id}`, `coin-${id}`);
      if (info) tokens.push(info);
    } catch (err) {
      console.error("❌ 推薦幣失敗", err.message);
    }
  }

  return tokens;
}

// 📊 主幣詳情
async function loadTokenDetail(id) {
  try {
    const info = await fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${id}`, `coin-${id}`);
    const chartData = await fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`, `chart-${id}`);

    const volume = info.market_data?.total_volume?.usd || 0;
    const change = info.market_data?.price_change_percentage_24h || 0;
    const price = info.market_data?.current_price?.usd || 0;
    const marketCap = info.market_data?.market_cap?.usd || 0;
    const score = calculateTrendScore(volume, change).toFixed(1);
    const advice = score >= 8.5 ? "短期強勢" : score < 6.5 ? "建議觀察" : "穩定成長";

    const labels = chartData.prices.map(p => new Date(p[0]).toLocaleDateString());
    const series = chartData.prices.map(p => p[1]);

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

    const similar = await getRecommendedFromStorage(id);
    if (similar.length > 0) {
      let html = `<h3 class="text-lg font-bold text-yellow-400 mb-2">🔗 推薦幣種</h3><ul class="text-sm text-gray-300 space-y-2">`;
      similar.forEach(t => {
        const vol = t.market_data?.total_volume?.usd || 0;
        html += `<li>✅ <a href="token.html?id=${t.id}" class="text-cyan-300 underline">${t.name}</a> — Volume: $${vol.toLocaleString()}</li>`;
      });
      html += `</ul>`;
      detailContainer.innerHTML += html;
    }

  } catch (err) {
    detailContainer.innerHTML = `<div class="text-red-400 animate-shake">⚠️ 資料載入失敗，請稍後再試。</div>`;
  }
}

// 🧨 初始化
const debouncedLoad = debounce(loadTokenDetail, 1000);
debouncedLoad(tokenId);
