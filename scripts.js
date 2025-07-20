// 模擬加密幣資料
const coins = [
  { name: 'Bitcoin', symbol: 'BTC', volume: '$28.97B', change: '+4.2%' },
  { name: 'Ethereum', symbol: 'ETH', volume: '$16.55B', change: '+3.7%' },
  { name: 'Solana', symbol: 'SOL', volume: '$4.89B', change: '+6.1%' },
];

const container = document.getElementById('top-coins');
coins.forEach((coin) => {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<h3 class="text-xl font-bold text-yellow-300">${coin.name} (${coin.symbol})</h3>
                   <p>24h Volume: ${coin.volume}</p>
                   <p class="text-green-400">${coin.change}</p>`;
  container.appendChild(div);
});

// 粒子動畫腳本
const canvas = document.getElementById('particles-bg');
const ctx = canvas.getContext('2d');
let particlesArray = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= 0.01;
  }
  draw() {
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 120; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
