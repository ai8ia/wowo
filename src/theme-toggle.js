function setTheme(mode) {
  document.body.classList.remove("theme-galaxy", "theme-bridge", "theme-chip");
  document.body.classList.add("theme-" + mode);
  localStorage.setItem("themeMode", mode);
}

function initThemePanel() {
  const saved = localStorage.getItem("themeMode") || "galaxy";
  setTheme(saved);
  document.querySelectorAll("[data-theme]").forEach(button => {
    button.onclick = () => setTheme(button.dataset.theme);
  });
}

document.addEventListener("DOMContentLoaded", initThemePanel);
