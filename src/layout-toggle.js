function setLayout(mode) {
  document.body.classList.remove("layout-grid", "layout-list", "layout-scroll");
  document.body.classList.add("layout-" + mode);
  localStorage.setItem("layoutMode", mode);
}

function initLayoutPanel() {
  const saved = localStorage.getItem("layoutMode") || "grid";
  setLayout(saved);

  document.querySelectorAll("[data-layout]").forEach(button => {
    button.onclick = () => setLayout(button.dataset.layout);
  });
}

document.addEventListener("DOMContentLoaded", initLayoutPanel);

