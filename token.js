const detailContainer = document.getElementById("token-detail");
const params = new URLSearchParams(window.location.search);
const tokenId = params.get("id");

async function loadTokenDetail(id) {
  try {
    const infoRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const info = await infoRes.json();

    const chartRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`);
    const chartData = await chartRes.json();

    const prices = chartData.prices.map(p => p[1]);
    const labels = chartData.prices.map(p => new Date(p[0]).toLocaleDateString());

    const trendScore = Math.max(5, Math.min(10, (info.market_data.total_volume.usd / 1e9 + info.market_data.price_change_percentage_24h / 5) * 1.5)).toFixed(1);

    detailContainer.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <img src="${info.image.small}" class="w-10 h-10" />
        <h2 class="text-2xl font-bold text-yellow-400">${info.name} (${info.symbol.toUpperCase()})</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat"><strong>$${info.market_data.current_price.usd.toFixed(2)}</strong><br>
          <span class="${info.market_data.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">
            ${info.market_data.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
        <div class="stat">Market Cap<br>$${info.market_data.market_cap.usd.toLocaleString()}</div>
        <div class="stat">Volume<br>$${info.market_data.total_volume.usd.toLocaleString()}</div>
        <div class="stat">Trend Score<br><span class="text-yellow-300 font-bold">${trendScore}</span></div>
      </div>

      <div class="bg-yellow-300 text-black rounded p-4 mb-6">
        <h3 class="font-bold">🧠 MCP AI 評估</h3>
        <p class="text-sm mt-2">根據過去 24h 表現與成交量，此幣為：
          <strong>${trendScore >= 8.5 ? '短期強勢' : trendScore < 6.5 ? '建議觀察' : '穩定成長'}</strong>
        </p>
      </div>

      <canvas id="priceChart" height="160" class="mb-6"></canvas>
    `;

    // Chart.js 呈現 7 日走勢
    new Chart(document.getElementById("priceChart"), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price (USD)',
          data: prices,
          borderColor: '#00ffcc',
          backgroundColor: '#00ffcc11',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          x: { ticks: { color: '#aaa' } },
          y: { ticks: { color: '#aaa' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

  } catch (err) {
    detailContainer.innerHTML = `<p class="text-red-400">⚠️ 無法載入詳頁資料。</p>`;
  }
}

loadTokenDetail(tokenId);
