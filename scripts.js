// ✅ 推薦卡片渲染模組
function generateStars(score) {
  if (score >= 180) return "★★★★★";
  if (score >= 140) return "★★★★";
  if (score >= 100) return "★★★";
  return "★★";
}

function playSound(type) {
  const sounds = {
    collect: "assets/sounds/magnet_lock.mp3"
  };
  try {
    new Audio(sounds[type]).play();
  } catch (err) {
    console.warn("音效播放失敗：", err.message);
  }
}

// ✅ 每日推薦卡片渲染
fetch("recommend.json")
  .then(res => res.json())
  .then(data => {
    const deck = document.getElementById("deckCards");
    data.forEach(token => {
      const card = document.createElement("div");
      card.className = "recommend-card theme-starship";

      const priceColor = token.changePct >= 0 ? "price-up" : "price-down";

      card.innerHTML = `
        <div class="star-tier">${generateStars(token.score)}</div>
        <h3>${token.name}</h3>
        <p class="token-price ${priceColor}">💰 價格：$${token.price.toFixed(2)}</p>
        <p>📈 漲跌：${token.changePct.toFixed(2)}%</p>
        <p>📦 成交量：$${(token.volume / 1e9).toFixed(2)}B</p>
        <p>🧬 類型：${token.persona}</p>
        <p>🏷️ 分類：${token.category}</p>
        <div class="reason-tooltip">${token.reason}</div>
        <button class="btn-collect">收藏 🔒</button>
      `;

      card.querySelector(".btn-collect").addEventListener("click", () => {
        playSound("collect"); // ✅ 僅在互動事件觸發音效
      });

      deck.appendChild(card);
    });
  });

// ✅ 推薦任務面板渲染
fetch("version.json")
  .then(res => res.json())
  .then(version => {
    const panel = document.getElementById("missionStatus");
    if (version?.recommendation) {
      const v = version.recommendation.version || "未標示";
      const time = version.recommendation.lastUpdate?.slice(0, 16).replace("T", " ");
      const status = version.recommendation.status || "未知";
      panel.innerHTML = `
        <p>🧠 推薦引擎版本：<strong>${v}</strong></p>
        <p>🕒 最近更新時間：${time}</p>
        <p>📣 狀態：${status}</p>
      `;
    } else {
      panel.innerHTML = `<p>🚫 推薦模組尚未啟動或 version.json 格式錯誤！</p>`;
    }
  });
