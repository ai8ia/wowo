window.renderNFTCard = function(token, theme = "starship") {
  const card = document.createElement("div");
  card.className = "nft-card";

  const { id, name, symbol, image, price_change_percentage_24h } = token;
  const ts = new Date().toLocaleString("zh-TW");

  const content = {
    starship: `
      <svg viewBox="0 0 320 180">
        <rect width="100%" height="100%" fill="#0b0f1a"/>
        <text x="16" y="40" font-size="20" fill="#ffd700" font-family="Orbitron">${name}</text>
        <text x="16" y="70" font-size="14" fill="#88f">${symbol}</text>
        <text x="16" y="100" font-size="12" fill="#ccc">收藏時間：${ts}</text>
        <circle cx="280" cy="60" r="30" fill="#222" stroke="#ffd700" stroke-width="2"/>
        <text x="265" y="65" font-size="12" fill="#ffd700">${price_change_percentage_24h.toFixed(2)}%</text>
      </svg>
    `,
    retro: `
      <svg viewBox="0 0 320 180">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="20" y="40" font-size="20" fill="#333" font-family="Courier">${name}</text>
        <text x="20" y="70" font-size="12" fill="#666">${symbol} · ${price_change_percentage_24h.toFixed(2)}%</text>
        <rect x="240" y="40" width="60" height="60" fill="#333"/>
        <text x="20" y="140" font-size="12" fill="#999">Data Saved: ${ts}</text>
      </svg>
    `,
    chip: `
      <svg viewBox="0 0 320 180">
        <rect width="100%" height="100%" fill="#020612"/>
        <text x="20" y="40" font-size="18" fill="#0ff" font-family="Roboto Mono">${name}</text>
        <text x="20" y="70" font-size="12" fill="#ccc">幣代：${symbol} · 漲跌：${price_change_percentage_24h.toFixed(2)}%</text>
        <line x1="20" y1="100" x2="300" y2="100" stroke="#0ff" stroke-width="1" />
        <text x="20" y="130" font-size="10" fill="#999">📁 記憶儲存：${ts}</text>
      </svg>
    `
  };

  card.innerHTML = content[theme] || content["starship"];
  document.getElementById("favorites-deck").appendChild(card);
};
