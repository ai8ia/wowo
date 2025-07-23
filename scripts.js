// 🔧 推薦分數計算模組
function calcScore(t) {
  const volScore = Math.log10(t.volume + 1) * 2;
  const changeScore = t.changePct * 3;
  const priceScore = Math.log10(t.price + 1);
  return Math.round(volScore + changeScore + priceScore);
}

// 🌟 推薦星級顯示
function generateStars(score) {
  if (score >= 180) return "★★★★★";
  if (score >= 140) return "★★★★";
  if (score >= 100) return "★★★";
  return "★★";
}

// 🔊 音效播放模組
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

// ✅ 自動推薦卡片渲染模組
fetch("tokens.json")
  .then(res => {
    if (!res.ok) throw new Error("載入失敗：" + res.status);
    return res.json();
  })
  .then(tokens => {
    const deck = document.getElementById("deckCards");
    if (!deck) return console.warn("❌ deckCards 容器不存在");

    const recommended = tokens
      .map(t => ({ ...t, score: calcScore(t) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    deck.innerHTML = ""; // 清空舊卡片

    recommended.forEach(token => {
      const priceColor = token.changePct >= 0 ? "price-up" : "price-down";
      const card = document.createElement("div");
      card.className = "recommend-card theme-starship";
      card.innerHTML = `
        <div class="star-tier">${generateStars(token.score)}</div>
        <h3>${token.name} (${token.symbol})</h3>
        <p class="token-price ${priceColor}">💰 價格：$${token.price.toFixed(2)}</p>
        <p>📈 漲跌：${token.changePct.toFixed(2)}%</p>
        <p>📦 成交量：$${(token.volume / 1e9).toFixed(2)}B</p>
        <p>⭐ 推薦分數：${token.score}</p>
        <button class="btn-collect">收藏 🔒</button>
      `;
      card.querySelector(".btn-collect").addEventListener("click", () => {
        playSound("collect");
      });
      deck.appendChild(card);
    });
  })
  .catch(err => {
    console.error("🚨 自動推薦錯誤：", err.message);
    const deck = document.getElementById("deckCards");
    if (deck) {
      deck.innerHTML = `<p style="color:#f88;">❌ 無法載入自動推薦資料：${err.message}</p>`;
    }
  });

// ✅ 推薦引擎版本渲染
fetch("version.json")
  .then(res => res.json())
  .then(version => {
    const panel = document.getElementById("missionStatus");
    if (!panel) return;
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
