const tokenList = document.getElementById("token-list");
const searchInput = document.getElementById("token-search");
const chainSelect = document.getElementById("chain-select");

// 模擬幣種資料
const tokens = [
  { name: "AVAX", symbol: "AVAX", volume: 1234567890, change: 6.2, score: 9.7, chain: "ethereum" },
  { name: "SOL", symbol: "SOL", volume: 950000000, change: -3.1, score: 8.9, chain: "solana" },
  { name: "TON", symbol: "TON", volume: 780000000, change: 4.5, score: 9.3, chain: "ethereum" },
];

function displayTokens(data) {
  tokenList.innerHTML = "";
  data.forEach(token => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="trend-score">🔥 ${token.score}</div>
      <h3 class="text-xl font-bold text-cyan-300 mb-2">${token.name} (${token.symbol})</h3>
      <p>📈 Volume: $${token.volume.toLocaleString()}</p>
      <p>Change: <span class="${token.change >= 0 ? 'text-green-400' : 'text-red-400'}">${token.change}%</span></p>
      <button class="text-yellow-400 mt-2 underline text-sm">詳情分析</button>
    `;
    tokenList.appendChild(div);
  });
}

displayTokens(tokens);

// 搜尋 & 鏈選擇邏輯
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = tokens.filter(t => t.name.toLowerCase().includes(query) || t.symbol.toLowerCase().includes(query));
  displayTokens(filtered);
});

chainSelect.addEventListener("change", () => {
  const chain = chainSelect.value;
  const filtered = chain === "all" ? tokens : tokens.filter(t => t.chain === chain);
  displayTokens(filtered);
});
