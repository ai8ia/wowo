document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".logo");
  const header = document.querySelector("header");

  if (logo && header) {
    logo.style.opacity = "0";
    logo.style.transform = "scale(0.5)";
    header.insertAdjacentHTML("beforeend", `
      <h2 id="deck-status" class="text-sm text-yellow-300 mt-4 font-mono">🧠 Entering MCP Control Deck...</h2>
    `);

    // LOGO 發光進場動畫
    setTimeout(() => {
      logo.style.transition = "opacity 1s ease, transform 1s ease";
      logo.style.opacity = "1";
      logo.style.transform = "scale(1)";
    }, 300);

    // 艦橋文字淡入
    const deckText = document.getElementById("deck-status");
    if (deckText) {
      deckText.style.opacity = "0";
      setTimeout(() => {
        deckText.style.transition = "opacity 1s ease";
        deckText.style.opacity = "1";
      }, 600);
    }
  }
});
