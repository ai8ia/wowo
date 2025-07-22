window.saveToFavorites = function(token) {
  const saved = JSON.parse(localStorage.getItem("mcpFavorites") || "[]");
  if (!saved.find(t => t.id === token.id)) {
    saved.push(token);
    localStorage.setItem("mcpFavorites", JSON.stringify(saved));
    renderNFTCard(token, window.currentTheme || "starship");
  }
};

window.renderFavoritesDeck = function(theme = "starship") {
  const deck = document.getElementById("favorites-deck");
  deck.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("mcpFavorites") || "[]");
  saved.forEach(token => renderNFTCard(token, theme));
};

window.clearFavorites = function() {
  localStorage.removeItem("mcpFavorites");
  document.getElementById("favorites-deck").innerHTML = "";
};

window.renderNFTCard = function(token, theme) {
  const { name, symbol, price_change_percentage_24h } = token;
  const ts = new Date().toLocaleString("zh-TW");
  const card = document.createElement("div");
  card.className = "nft-card";

  const content = {
    starship: `...`, // 原樣式略
    retro: `...`,
    chip: `...`
  };

  card.innerHTML = content[theme] || content["starship"];
  document.getElementById("favorites-deck").appendChild(card);
};

window.renderRecommendedCard = function(token, theme) {
  const { name, symbol, price_change_percentage_24h } = token;
  const ts = new Date().toLocaleString("zh-TW");
  const card = document.createElement("div");
  card.className = "nft-card";

  const content = {
    starship: `...`, // 可與 renderNFTCard 相同或略作區別
    retro: `...`,
    chip: `...`
  };

  card.innerHTML = content[theme] || content["starship"];
  document.getElementById("recommended-list").appendChild(card);
};

window.renderRecommendations = function(tokenList) {
  const theme = localStorage.getItem("themeMode") || "starship";
  const list = document.getElementById("recommended-list");
  list.innerHTML = "";
  tokenList.forEach(token => renderRecommendedCard(token, theme));
};
