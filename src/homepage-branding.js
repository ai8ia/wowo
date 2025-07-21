window.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".hero-logo");
  const headline = document.querySelector(".hero-headline");
  const subtitle = document.querySelector(".hero-subtitle");

  if (logo) {
    logo.style.transform = "scale(1.1)";
    logo.style.transition = "transform 1s ease-in-out";
  }

  if (headline) {
    headline.style.opacity = 0;
    setTimeout(() => {
      headline.style.opacity = 1;
      headline.style.transition = "opacity 1s ease-in";
    }, 500);
  }

  if (subtitle) {
    subtitle.style.opacity = 0;
    setTimeout(() => {
      subtitle.style.opacity = 1;
      subtitle.style.transition = "opacity 1s ease-in";
    }, 800);
  }
});

