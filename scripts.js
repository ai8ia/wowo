// ✅ 推薦分數計算模組
function calcScore(t) {
  const volScore = Math.log10(t.volume + 1) * 2;
  const changeScore = t.changePct * 3;
  const priceScore = Math.log10(t.price + 1);
  return Math.round(volScore + changeScore + priceScore);
}

// 🌟 推薦星級生成
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

// ✅ 所有代幣清單渲染
fetch("tokens.json")
  .then(res => res.json())
  .then(tokens => {
    const list = document.getElementById("token-list");
    if (!list) return console.warn("❌ token-list 容器不存在");

    list.innerHTML = "";
    tokens.forEach(t => {
      if (!t.name || !t.price || !t.changePct || !t.volume) return;
      const priceColor = t.changePct >= 0 ? "price-up" : "price-down";
      const item = document.createElement("div");
      item.className = "token-item";
      item.innerHTML = `
        <h4>${t.name} (${t.symbol})</h4>
        <p class="${priceColor}">💰 $${t.price.toFixed(2)}</p>
        <p>📈 ${t.changePct.toFixed(2)}%</p>
        <p>📦 ${(t.volume / 1e9).toFixed(2)}B</p>
      `;
      list.appendChild(item);
    });
  })
  .catch(err => {
    console.error("❌ 所有代幣載入失敗：", err.message);
    const list = document.getElementById("token-list");
    if (list) {
      list.innerHTML = `<p style="color:#f88;">🚫 無法載入代幣清單：${err.message}</p>`;
    }
  });

// ✅ 推薦卡片自動渲染（前 30 名高分幣種）
fetch("tokens.json")
  .then(res => res.json())
  .then(tokens => {
    const deck = document.getElementById("deckCards");
    if (!deck) return console.warn("❌ deckCards 容器不存在");

    const recommended = tokens
      .map(t => ({ ...t, score: calcScore(t) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    deck.innerHTML = "";

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
        <p>⭐ 推薦分數：<strong>${token.score}</strong></p>
        <button class="btn-collect">收藏 🔒</button>
      `;
      card.querySelector(".btn-collect").addEventListener("click", () => {
        playSound("collect");
      });
      deck.appendChild(card);
    });
  })
  .catch(err => {
    console.error("❌ 推薦載入失敗：", err.message);
    const deck = document.getElementById("deckCards");
    if (deck) {
      deck.innerHTML = `<p style="color:#f88;">🚫 無法載入推薦資料：${err.message}</p>`;
    }
  });

// ✅ 推薦引擎版本狀態顯示
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
