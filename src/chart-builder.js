// 📊 模擬圖表資料（簡化假資料）
function mockVolumeChart(id) {
  const data = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    volume: Math.floor(Math.random() * 1e9)
  }));
  return data;
}

function mockChangeChart(id) {
  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    change: (Math.random() - 0.5) * 5
  }));
  return data;
}

function mockScoreChart(id) {
  const data = Array.from({ length: 10 }, (_, i) => ({
    point: `P${i + 1}`,
    score: parseFloat((Math.random() * 5 + 5).toFixed(1))
  }));
  return data;
}

// 📦 DOM
const infoEl = document.getElementById("token-info");
const volEl = document.getElementById("chart-volume");
const changeEl = document.getElementById("chart-change");
const scoreEl = document.getElementById("chart-score");

// 🔍 解析 URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  infoEl.innerHTML = `<p class="text-red-400">❌ 未指定代幣 ID</p>`;
} else {
  fetch("../tokens.json")
    .then(res => res.json())
    .then(tokens => {
      const token = tokens.find(t => t.id === id);
      if (!token) {
        infoEl.innerHTML = `<p class="text-red-400">❌ 找不到代幣：${id}</p>`;
        return;
      }

      infoEl.innerHTML = `
        <h2 class="text-yellow-300 font-bold">${token.name} (${token.symbol})</h2>
        <p>成交量：$${parseInt(token.total_volume).toLocaleString()}</p>
        <p>24h 漲跌：<span class="${token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${token.price_change_percentage_24h.toFixed(2)}%</span></p>
        <p class="trend-score">分數：${calcScore(token.total_volume, token.price_change_percentage_24h)}</p>
      `;

      const vol = mockVolumeChart(id);
      const change = mockChangeChart(id);
      const score = mockScoreChart(id);

      renderChart(volEl, "📈 成交量走勢", vol, d => `$${d.volume.toLocaleString()}`);
      renderChart(changeEl, "📉 24h 漲跌", change, d => `${d.change.toFixed(2)}%`);
      renderChart(scoreEl, "📊 趨勢分數分布", score, d => `${d.score}`);
    });
}

// 📈 渲染圖表函式（簡化版）
function renderChart(container, title, data, formatFn) {
  container.innerHTML = `<h3 class="text-yellow-300 font-bold mb-2">${title}</h3>`;
  data.forEach(item => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = `${Math.abs(item.volume || item.change || item.score) / 10}%`;
    bar.style.backgroundColor = "#ffd700";
    bar.style.marginBottom = "4px";
    bar.textContent = formatFn(item);
    container.appendChild(bar);
  });
}

// 📐 趨勢分數函式
function calcScore(volume, change) {
  const v = Math.min(volume / 1e9, 2);
  const c = change / 5;
  return parseFloat(Math.max(5, Math.min(10, (v + c) * 1.5)).toFixed(1));
}
