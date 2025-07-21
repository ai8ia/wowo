function showDebugBanner(message, color = "#4b5563") {
  const banner = document.createElement("div");
  banner.style.position = "fixed";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.width = "100%";
  banner.style.padding = "8px";
  banner.style.backgroundColor = color;
  banner.style.color = "#fff";
  banner.style.fontSize = "13px";
  banner.style.textAlign = "center";
  banner.textContent = message;
  document.body.appendChild(banner);
}

function displayTokens(data) {
  tokenList.innerHTML = "";
  console.log(`📦 代幣筆數：${data.length}`);
  data.forEach(token => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="trend-score">🔥 ${token.score}</div>
      <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
      <p>Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
      <p class="mt-2 text-yellow-400 underline text-sm">詳情分析 →</p>
    `;
    div.onclick = () => window.location.href = `token.html?id=${token.id}`;
    tokenList.appendChild(div);
    console.log(`✅ 插入代幣卡片：${token.name} (${token.symbol})`);
  });
}

function displayRecommended(recommended) {
  recoContainer.innerHTML = "";
  recommended.forEach(token => {
    const tag = token.change > 5 ? "🌟 短期強勢"
               : token.change < -2 ? "⚠️ 建議觀察"
               : "🌱 穩定成長";
    const div = document.createElement("div");
    div.className = "recommend-card";
    div.innerHTML = `
      <h3 class="text-lg font-bold text-yellow-300">${token.name} (${token.symbol})</h3>
      <p class="text-sm text-gray-300 mb-2">${tag}</p>
      <p>Trend Score: ${token.score}</p>
      <p>Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change.toFixed(2)}%</span></p>
    `;
    div.onclick = () => window.location.href = `token.html?id=${token.id}`;
    recoContainer.appendChild(div);
    console.log(`🎯 推薦幣種：${token.name}`);
  });
}

async function loadTokensFromAPI() {
  try {
    showDebugBanner("MCP 控制台已啟動 ✔");
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=30");
    const data = await res.json();

    const tokens = data.map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      volume: t.total_volume || 0,
      change: t.price_change_percentage_24h || 0,
      score: calculateTrendScore(t.total_volume || 0, t.price_change_percentage_24h || 0).toFixed(1)
    }));

    console.log("📡 API 呼叫成功");
    window.tokensData = tokens;
    displayTokens(tokens);
    displayRecommended(getRecommendedTokens(tokens));
  } catch (err) {
    showDebugBanner("⚠️ 資料載入失敗，請檢查 API 或路徑", "#b91c1c");
    tokenList.innerHTML = "<p class='text-red-400'>⚠️ 資料載入失敗，請稍後重試。</p>";
    console.error("🔴 MCP 控制台載入錯誤:", err);
  }
}
