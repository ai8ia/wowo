const detailContainer = document.getElementById("token-detail");
const params = new URLSearchParams(window.location.search);
const tokenId = params.get("id");

async function loadTokenDetail(id) {
  try {
    // 取得幣種基本資訊
    const infoRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const info = await infoRes.json();

    // 取得 7 日價格資料
    const chartRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`);
    const chartData = await chartRes.json();
    const prices = chartData.prices.map(p => p[1]);
    const labels = chartData.prices.map(p => new Date(p[0]).toLocaleDateString());

    // MCP 熱度分數演算
    const volume = info.market_data.total_volume.usd || 0;
    const change = info.market_data.price_change_percentage_24h || 0;
    const trendScore = Math.max(5, Math.min(10, (volume / 1e9 + change / 5) * 1.5)).toFixed(1);

    const label = trendScore >= 8.5 ? "短期強勢"
                : trendScore < 6.5 ? "建議觀察"
                : "穩定成長";



    async function getSimilarTokens(currentToken) {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&page=1&sparkline=false");
  const data = await res.json();

  const currentChain = currentToken.platforms?.ethereum ? "ethereum" :
                       currentToken.platforms?.solana ? "solana" : "unknown";

  const currentScore = Math.max(5, Math.min(10, (currentToken.market_data.total_volume.usd / 1e9 + currentToken.market_data.price_change_percentage_24h / 5) * 1.5));

  const similar = data.filter(t => {
    if (t.id === currentToken.id) return false;
    const chain = Math.random() > 0.5 ? "ethereum" : "solana"; // 暫時模擬鏈別
    const score = Math.max(5, Math.min(10, (t.total_volume / 1e9 + t.price_change_percentage_24h / 5) * 1.5));
    return chain === currentChain && Math.abs(score - currentScore) <= 1.2;
  }).slice(0, 3);

  return similar;
}

    // 詳頁內容渲染
    detailContainer.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <img src="${info.image.small}" class="w-10 h-10" />
        <h2 class="text-2xl font-bold text-yellow-400">${info.name} (${info.symbol.toUpperCase()})</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat">
          <strong>$${info.market_data.current_price.usd.toFixed(2)}</strong><br>
          <span class="${change >= 0 ? 'text-green-400' : 'text-red-400'}">
            ${change.toFixed(2)}%
          </span>
        </div>
        <div class="stat">Market Cap<br>$${info.market_data.market_cap.usd.toLocaleString()}</div>
        <div class="stat">Volume<br>$${volume.toLocaleString()}</div>
        <div class="stat">Trend Score<br><span class="text-yellow-300 font-bold">${trendScore}</span></div>
      </div>

      <div class="bg-yellow-300 text-black rounded p-4 mb-6">
        <h3 class="font-bold">🧠 MCP AI 評估</h3>
        <p class="text-sm mt-2">根據成交量與 24h 漲幅，系統判斷為：<strong>${label}</strong></p>
      </div>

      <canvas id="priceChart" height="160" class="mb-6"></canvas>
    `;

    // Chart.js 畫圖
    new Chart(document.getElementById("priceChart"), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price (USD)',
          data: prices,
          borderColor: '#00ffcc',
          backgroundColor: '#00ffcc33',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          x: { ticks: { color: '#bbb' } },
          y: { ticks: { color: '#bbb' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

  } catch (err) {
    detailContainer.innerHTML = `<p class="text-red-400">⚠️ 資料載入失敗，請確認幣種 ID 是否正確。</p>`;
  }
}

loadTokenDetail(tokenId);
