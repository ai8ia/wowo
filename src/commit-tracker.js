document.addEventListener("DOMContentLoaded", async () => {
  const footer = document.querySelector("footer");
  if (!footer) return;

  try {
    const res = await fetch("git.json");
    const info = await res.json();

    const el = document.createElement("p");
    el.className = "text-xs text-gray-400";
    el.innerHTML = `🟢 MCP 更新於：<span class="font-mono">${info.commit}</span> · ${new Date(info.updatedAt).toLocaleString("zh-TW")}`;
    footer.appendChild(el);
  } catch {
    console.warn("git.json 無法載入");
  }
});
