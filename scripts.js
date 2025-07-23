// 🔊 MCP 控制台聲音模組
window.soundDeck = {
  audio: null,
  volume: 0.7,
  muted: false,
  track: "assets/sound/mcp-bgm.mp3",

  init() {
    this.audio = new Audio(this.track);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.play();
  },

  setVolume(v) {
    this.volume = Math.min(Math.max(v, 0), 1);
    this.audio.volume = this.volume;
    this.audio.muted = false;
    this.muted = false;
  },

  mute() {
    this.audio.muted = true;
    this.muted = true;
  },

  unmute() {
    this.audio.muted = false;
    this.audio.volume = this.volume;
    this.muted = false;
  },

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
};

// 🧠 MCP 控制台資料載入邏輯
fetch("tokens.json")
  .then(r => r.json())
  .then(tokens => {
    window.tokenList = tokens;
    render(tokens);
    checkAlerts(tokens);
    renderFavoritesDeck(currentTheme);
    document.getElementById("loading").textContent = "";
    soundDeck.init();
  });

fetch("version.json")
  .then(res => res.json())
  .then(version => {
    const status = version.recommendation?.status || "未啟動";
    const time = version.recommendation?.lastUpdate?.slice(0, 16).replace("T", " ");
    document.getElementById("missionStatus").innerHTML = `
      <p>🧠 推薦引擎版本：<strong>${version.recommendation.version}</strong></p>
      <p>🕒 最近更新時間：${time}</p>
      <p>📣 狀態：${status}</p>
    `;
  });

fetch("recommend.json")
  .then(res => res.json())
  .then(data => {
    const summary = document.getElementById("missionSummary");
    data.forEach(token => {
      const li = document.createElement("li");
      li.innerHTML = `✅ <strong>${token.symbol}</strong>｜${token.category}｜${token.reason}`;
      summary.appendChild(li);
    });
  });



function render(tokens) {
  const grid = document.getElementById("token-list");
  const recommend = document.getElementById("recommended-list");
  const search = document.getElementById("search");

  function renderCard(t) {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3 class="text-yellow-300 font-bold">${t.name} (${t.symbol})</h3>
      <p>成交量：$${parseInt(t.total_volume).toLocaleString()}</p>
      <p>24h 漲跌：<span class="${t.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">${t.price_change_percentage_24h.toFixed(2)}%</span></p>
      <p class="trend-score">分數：${calcScore(t.total_volume, t.price_change_percentage_24h)}</p>
    `;

    const favBtn = document.createElement("button");
    favBtn.textContent = "🧠 收藏";
    favBtn.className = "favorite-btn";
    favBtn.onclick = () => saveToFavorites(t);
    el.appendChild(favBtn);

    grid.appendChild(el);
  }

  const top = tokens.filter(t => calcScore(t.total_volume, t.price_change_percentage_24h) >= 90);
  top.forEach(t => {
    const theme = window.currentTheme || "starship";
    renderRecommendedCard(t, theme);
  });

  search.oninput = e => {
    const keyword = e.target.value.toLowerCase();
    grid.innerHTML = "";
    tokens.filter(t => t.name.toLowerCase().includes(keyword) || t.symbol.toLowerCase().includes(keyword))
          .forEach(renderCard);
  };

  tokens.forEach(renderCard);
}

function calcScore(volume, change) {
  const v = Math.log10(volume);
  const pct = Math.abs(change);
  return Math.round(v * 10 + pct);
}

let currentTheme = localStorage.getItem("themeMode") || "starship";
document.getElementById("theme-selector").onchange = e => {
  currentTheme = e.target.value;
  renderFavoritesDeck(currentTheme);
};
