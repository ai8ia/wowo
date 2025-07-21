// 📦 載入代幣 ID
const params = new URLSearchParams(window.location.search);
const tokenId = params.get("id");

// 📁 載入資料（本地 tokens.json）
async function fetchToken() {
  const res = await fetch("tokens.json");
  const data = await res.json();

  const token = data.find(t => t.id === tokenId);
  if (!token) {
    document.getElementById("token-detail").innerHTML = `<p class="text-red-400">❌ 無此代幣資料</p>`;
    return;
  }

  renderToken(token);
}

// 🎨 詳頁渲染
function renderToken(token) {
  const el = document.getElementById("token-detail");
  const advice = getAdvice(calcScore(token.total_volume ?? 0, token.price_change_percentage_24h ?? 0));

  el.innerHTML = `
    <h2 class="text-2xl font-bold text-yellow-300 mb-2">${token.name} (${token.symbol})</h2>
    <p class="text-green-300 text-lg mb-1">成交量：$${(token.total_volume ?? 0).toLocaleString()}</p>
    <p class="mb-1">24h 漲跌：<span class="${token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${token.price_change_percentage_24h.toFixed(2)}%</span></p>
    <p class="italic text-sm text-gray-400 mb-4">AI 分析：${advice}</p>
    <div class="ct-chart ct-golden-section mb-6" id="price-chart"></div>
    <p class="text-sm text-gray-500">📊 價格走勢為模擬資料，可連接真實 API 資料。</p>
  `;

  renderChart();
}

// 📊 模擬 Chartist 圖表
function renderChart() {
  new Chartist.Line('#price-chart', {
    labels: ['週一', '週二', '週三', '週四', '週五'],
    series: [[45, 48, 50, 47, 53]]
  }, {
    showArea: true,
    fullWidth: true,
    chartPadding: { right: 40 },
    lineSmooth: Chartist.Interpolation.cardinal({ tension: 0.3 })
  });
}

// 📈 趨勢分數與評估
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
