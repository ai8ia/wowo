function setTheme(mode) {
  document.body.classList.remove("theme-galaxy", "theme-bridge", "theme-chip");
  document.body.classList.add("theme-" + mode);
  localStorage.setItem("themeMode", mode);
  window.currentTheme = mode;

  // 🔁 同步推薦艙重渲染
  if (window.tokenList && typeof renderRecommendedCard === "function") {
    const rec = document.getElementById("recommended-list");
    rec.innerHTML = "";
    tokenList.forEach(token => renderRecommendedCard(token, mode));
  }

  // 🔁 同步收藏艦橋主題更新
  if (typeof renderFavoritesDeck === "function") {
    renderFavoritesDeck(mode);
  }
}

function initThemePanel() {
  const saved = localStorage.getItem("themeMode") || "starship";
  setTheme(saved);

  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.onclick = () => setTheme(btn.dataset.theme);
  });
}

document.addEventListener("DOMContentLoaded", initThemePanel);
