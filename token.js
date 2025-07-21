const detailContainer = document.getElementById("token-detail");
const tokenId = new URLSearchParams(window.location.search).get("id");

// 熱度演算法：成交量 + 漲跌幅加權
function calculateTrendScore(volume, change) {
  const volumeWeight = Math.min(volume / 1e9, 2);
  const changeWeight = change / 5;
  return Math.max(5, Math.min(10, (volumeWeight + changeWeight) * 1.5));
}

// 類似幣種推薦（差距在 ±1.2）
async function getSimilarTokens(currentToken) {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50");
  const data = await res.json();

  const currentScore = calculateTrendScore(
    currentToken.market_data.total_volume.usd,
    currentToken.market_data.price_change_percentage_24h
  );

  return data
    .filter(t => t.id !== currentToken.id)
    .filter(t => {
      const score = calculateTrendScore(t.total_volume, t.price_change_percentage_24h);
      return Math.abs(score - currentScore) <= 1.2;
    })
    .slice(0, 3);
}

// 詳頁渲染主流程
async function loadTokenDetail(id) {
  try {
    const infoRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const info = await infoRes.json();

    const chartRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`);
    const chartData = await chartRes.json();

    const volume = info.market_data.total_volume.usd || 0;
    const change = info.market_data.price_change_percentage_24h || 0;
    const score = calculateTrendScore(volume, change).toFixed(1);
    const advice =
      score >= 8.5 ? "短期強勢" :
      score < 6.5 ? "建議觀察" : "穩定成長";

    const prices = chartData.prices.map(p => p[1]);
    const labels = chartData.prices.map(p => new Date(p[0]).toLocaleDateString());

    detailContainer.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <img src="${info.image.small}" class="w-10 h-10" />
        <h2 class="text-2xl font-bold text-yellow-400">${info.name} (${info.symbol.toUpperCase()})</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat"><strong>$${info.market_data.current_price.usd.toFixed(2)}</strong><br>
          <span class="${change >= 0 ? 'text-green-400' : 'text-red-400'}">${change.toFixed(2)}%</span></div>
        <div class="stat">Market Cap<br>$${info.market_data.market_cap.usd.toLocaleString()}</div>
        <div class="stat">Volume<br>$${volume.toLocaleString()}</div>
        <div class="stat">Trend Score<br><span class="text-yellow-300 font-bold">${score}</span></div>
      </div>

      <div class="bg-yellow-300 text-black rounded p-4 mb-6">
        <h3 class="font-bold">🧠 MCP AI 評估</h3>
        <p class="text-sm mt-2">根據 MCP 模型分析，此幣被判定為：<strong>${advice}</strong></p>
      </div>

      <canvas id="priceChart" height="160" class="mb-6"></canvas>
    `;

    // 畫出七日走勢圖
    new Chart(document.getElementById("priceChart"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Price (USD)",
          data: prices,
          borderColor: "#00ffcc",
          backgroundColor: "#00ffcc33",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          x: { ticks: { color: "#bbb" } },
          y: { ticks: { color: "#bbb" } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    // 類似幣種推薦區塊
    const similar = await getSimilarTokens(info);
    let recoHTML = `<h3 class="text-lg font-bold text-yellow-400 mb-2">🔗 類似幣種推薦</h3><ul class="text-sm text-gray-300 space-y-2">`;
    similar.forEach(t => {
      recoHTML += `<li>✅ <a href="token.html?id=${t.id}" class="text-cyan-300 underline">${t.name}</a> — Volume: $${t.total_volume.toLocaleString()}</li>`;
    });
    recoHTML += `</ul>`;
    detailContainer.innerHTML += recoHTML;

  } catch (err) {
    console.error("🔴 MCP 詳頁載入錯誤:", err);
    console.error("🔴 錯誤原因：", err);
    detailContainer.innerHTML = `<p class="text-red-400">⚠️ 資料載入失敗，請檢查代幣 ID 是否正確。</p>`;
  }
}

loadTokenDetail(tokenId);
