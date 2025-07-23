// ✅ 推薦分數計算模組
function calcScore(t) {
  const volScore = Math.log10((t.volume ?? 0) + 1) * 2;
  const changeScore = (t.changePct ?? 0) * 3;
  const priceScore = Math.log10((t.price ?? 0) + 1);
  return Math.round(volScore + changeScore + priceScore);
}

// 🌟 星級生成
function generateStars(score) {
  if (score >= 180) return "★★★★★";
  if (score >= 140) return "★★★★";
  if (score >= 100) return "★★★";
  return "★★";
}

// 🔊 音效播放
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

// 🛸 收藏儲存模組
function getGlowLevel(score) {
  if (score >= 180) return "high";
  if (score >= 140) return "mid";
  return "low";
}

function saveToFleet(token) {
  const fleet = JSON.parse(localStorage.recommendFleet || "[]");
  const duplicate = fleet.find(t => t.symbol === token.symbol);
  if (duplicate) return; // 避免重複收藏

  fleet.push({
    symbol: token.symbol,
    name: token.name,
    price: token.price,
    score: token.score,
    glowLevel: getGlowLevel(token.score),
    persona: token.persona ?? "🌀 未分類",
    timestamp: new Date().toISOString()
  });
  localStorage.recommendFleet = JSON.stringify(fleet);
}

// ✅ 清單渲染
fetch("tokens.json")
  .then(res => res.json())
  .then(tokens => {
    const list = document.getElementById("token-list");
    if (!list) return;
    list.innerHTML = "";

    tokens.forEach(t => {
      const price = typeof t.price === "number" ? `$${t.price.toFixed(2)}` : "N/A";
      const change = typeof t.changePct === "number" ? `${t.changePct.toFixed(2)}%` : "未知";
      const volume = typeof t.volume === "number" ? `${(t.volume / 1e9).toFixed(2)}B` : "未知";
      const priceColor = t.changePct >= 0 ? "price-up" : "price-down";

      const item = document.createElement("div");
      item.className = "token-item";
      item.innerHTML = `
        <h4>${t.name ?? "未命名"} (${t.symbol ?? "?"})</h4>
        <p class="${priceColor}">💰 ${price}</p>
        <p>📈 ${change}</p>
        <p>📦 ${volume}</p>
      `;
      list.appendChild(item);
    });
  });

// ✅ 推薦卡片渲染（前 30 名）
fetch("tokens.json")
  .then(res => res.json())
  .then(tokens => {
    const deck = document.getElementById("deckCards");
    if (!deck) return;

    const recommended = tokens
      .filter(t => typeof t.price === "number" && typeof t.volume === "number" && typeof t.changePct === "number")
      .map(t => ({ ...t, score: calcScore(t) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    deck.innerHTML = "";

    recommended.forEach(token => {
      const scoreText = typeof token.score === "number" ? token.score : "未計算";
      const priceColor = token.changePct >= 0 ? "price-up" : "price-down";

      const card = document.createElement("div");
      card.className = `recommend-card theme-starship glow-${getGlowLevel(token.score)}`;
      card.innerHTML = `
        <div class="star-tier">${generateStars(token.score)}</div>
        <h3>${token.name ?? "未命名"} (${token.symbol ?? "?"})</h3>
        <p class="token-price ${priceColor}">💰 價格：$${token.price.toFixed(2)}</p>
        <p>📈 漲跌：${token.changePct.toFixed(2)}%</p>
        <p>📦 成交量：$${(token.volume / 1e9).toFixed(2)}B</p>
        <p>⭐ 推薦分數：<strong>${scoreText}</strong></p>
        <button class="btn-collect">收藏 🔒</button>
      `;
      card.querySelector(".btn-collect").addEventListener("click", () => {
        playSound("collect");
        saveToFleet(token);
      });
      deck.appendChild(card);
    });
  });

// ✅ 引擎版本狀態顯示
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
