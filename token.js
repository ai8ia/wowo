// 📦 解析 URL 參數
const params = new URLSearchParams(window.location.search);
const tokenId = params.get("id");

// 📁 載入 tokens.json
async function fetchToken() {
  try {
    const res = await fetch("tokens.json");
    const data = await res.json();
    const token = data.find(t => t.id === tokenId);

    if (!token) {
      document.getElementById("token-detail").innerHTML = `<p class="text-red-400">❌ 找不到代幣資料</p>`;
      return;
    }

    renderToken(token, data);
  } catch (err) {
    console.error("🔴 載入錯誤", err);
    document.getElementById("token-detail").innerHTML = `<p class="text-red-400">❌ 詳頁載入失敗，請稍後再試</p>`;
  }
}

// 🎨 渲染內容
function renderToken(token, allTokens) {
  const el = document.getElementById("token-detail");
  const score = calcScore(token.total_volume ?? 0, token.price_change_percentage_24h ?? 0);
  const advice = getAdvice(score);

  el.innerHTML = `
    <h2 class="text-2xl font-bold text-yellow-300 mb-2">${token.name} (${token.symbol})</h2>
    <p class="text-green-300 text-lg mb-1">成交量：$${(token.total_volume ?? 0).toLocaleString()}</p>
    <p class="mb-1">24h 漲跌：<span class="${token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${token.price_change_percentage_24h.toFixed(2)}%</span></p>
    <p class="italic text-sm text-gray-400 mb-4">AI 分析：${advice}</p>
    <div class="ct-chart ct-golden-section mb-6" id="price-chart"></div>

    <h3 class="text-lg font-bold text-yellow-300 mt-6 mb-2">🔗 類似幣種推薦</h3>
    <div id="related-tokens" class="grid gap-4 mb-8"></div>

    <button onclick="location.href='index.html'" class="bg-yellow-400 text-gray-900 px-4 py-2 rounded text-sm hover:bg-yellow-300 transition">← 返回主控台</button>
  `;

  renderChart(token);
  renderRecommendations(token, allTokens);
}

// 📊 模擬價格走勢
function renderChart(token) {
  const base = token.price_change_percentage_24h ?? 0;
  const mock = [100, 100 + base, 100 - base / 2, 100 + base * 0.8, 100 + base];

  new Chartist.Line('#price-chart', {
    labels: ['週一', '週二', '週三', '週四', '週五'],
    series: [mock]
  }, {
    showArea: true,
    fullWidth: true,
    chartPadding: { right: 40 },
    lineSmooth: Chartist.Interpolation.cardinal({ tension: 0.3 })
  });
}

// 🧬 類似幣種推薦
function renderRecommendations(current, allTokens) {
  const related = allTokens
    .filter(t => t.id !== current.id)
    .filter(t => Math.abs((t.total_volume ?? 0) - (current.total_volume ?? 0)) < 5e9)
    .slice(0, 3);

  const container = document.getElementById("related-tokens");

  related.forEach(t => {
    const score = calcScore(t.total_volume ?? 0, t.price_change_percentage_24h ?? 0);
    container.innerHTML += `
      <div class="border border-gray-800 p-3 rounded hover:bg-gray-800 transition cursor-pointer" onclick="location.href='token.html?id=${t.id}'">
        <h4 class="text-yellow-300 font-bold">${t.name} (${t.symbol})</h4>
        <p class="text-sm text-gray-300 mb-1">趨勢分數：${score}</p>
        <p>24h 漲跌：<span class="${t.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${t.price_change_percentage_24h.toFixed(2)}%</span></p>
      </div>
    `;
  });
}

// 📈 趨勢與評估
function calcScore(volume, change) {
  const v = Math.min(volume / 1e9, 2);
  const c = change / 5;
  return parseFloat(Math.max(5, Math.min(10, (v + c) * 1.5)).toFixed(1));
}

function getAdvice(score) {
  if (score >= 8.5) return "📈 技術強勁、交易量活躍，短期看多";
  if (score <= 6) return "🧐 價格震盪大、量能不足，建議觀察";
  return "🌿 穩定中，中長線持有建議";
}

// 🚀 初始化
fetchToken();
