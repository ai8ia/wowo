// 即時代幣排行資料
const coins = [
  { name: 'Bitcoin', symbol: 'BTC', volume: '$30.1B', change: '+4.2%' },
  { name: 'Ethereum', symbol: 'ETH', volume: '$18.3B', change: '+3.5%' },
  { name: 'Solana', symbol: 'SOL', volume: '$5.8B', change: '+6.1%' },
];

const topContainer = document.getElementById('top-coins');
coins.forEach(coin => {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<h3 class="text-xl text-yellow-300 font-bold">${coin.name} (${coin.symbol})</h3>
                   <p>24h Volume: ${coin.volume}</p>
                   <p class="text-green-400">${coin.change}</p>`;
  topContainer.appendChild(div);
});

// AI 推薦模組資料
const recommended = [
  { name: 'Avalanche', symbol: 'AVAX', insight: '速度快、漲幅穩定，適合短期關注' },
  { name: 'Toncoin', symbol: 'TON', insight: '社群熱度上升，突破平均價位' }
];

const recoContainer = document.getElementById('recommended-coins');
recommended.forEach(token => {
  const div = document.createElement('div');
  div.className = 'recommend-card';
  div.innerHTML = `<h3 class="text-lg text-cyan-300 font-bold">${token.name} (${token.symbol})</h3>
                   <p class="mt-1 text-gray-300">${token.insight}</p>`;
  recoContainer.appendChild(div);
});

// 粒子動畫效果
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
  for (let i = 0; i < 100; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
