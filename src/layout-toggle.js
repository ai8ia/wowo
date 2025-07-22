function setLayout(mode) {
  const body = document.body;
  body.classList.remove("layout-grid", "layout-list", "layout-scroll");
  body.classList.add("layout-" + mode);
  localStorage.setItem("layoutMode", mode);

  // ✅ 模式提示
  const status = document.getElementById("status");
  if (status) {
    status.innerHTML = `🧩 已切換至 <strong>${mode.toUpperCase()}</strong> 模式 ✔️`;
  }

  // ✅ 高亮目前按鈕
  document.querySelectorAll("[data-layout]").forEach(btn => {
    btn.classList.remove("active-layout");
    if (btn.dataset.layout === mode) {
      btn.classList.add("active-layout");
    }
  });
}

function initLayoutPanel() {
  const saved = localStorage.getItem("layoutMode") || "grid";
  setLayout(saved);

  document.querySelectorAll("[data-layout]").forEach(btn => {
    btn.onclick = () => setLayout(btn.dataset.layout);
  });
}

document.addEventListener("DOMContentLoaded", initLayoutPanel);
