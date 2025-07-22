// ⛑️ MCP 警示模組：偵測 ±10% 幣種漲跌並提示
export function checkAlerts(tokens) {
  const warned = new Set(JSON.parse(localStorage.getItem("mcpAlerts") || "[]"));

  tokens.forEach(t => {
    const pct = t.price_change_percentage_24h;
    if (Math.abs(pct) >= 10 && !warned.has(t.id)) {
      showAlert(`🚨 ${t.name} ${pct > 0 ? "漲幅" : "跌幅"}達 ${pct.toFixed(2)}%`);
      warned.add(t.id);
    }
  });

  localStorage.setItem("mcpAlerts", JSON.stringify([...warned]));
}

// 🛑 顯示浮動警示卡片
function showAlert(msg) {
  const alert = document.createElement("div");
  alert.className = "alert-card";
  alert.textContent = msg;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

