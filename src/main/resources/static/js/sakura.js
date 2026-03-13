(function () {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#FFB7C5', '#FF9EB5', '#FFC0CB', '#FFD1DC', '#F4A7B9'];
  const COUNT = 28;
  const petals = [];

  function newPetal(spreadY) {
    const size = 7 + Math.random() * 10;
    return {
      x: Math.random() * canvas.width,
      y: spreadY !== undefined ? Math.random() * canvas.height : -size * 2,
      size,
      vy: 0.8 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.6,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: (Math.random() - 0.5) * 0.04,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.018 + Math.random() * 0.022,
      swingAmp: 0.5 + Math.random() * 1.0,
      opacity: 0.55 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  for (let i = 0; i < COUNT; i++) petals.push(newPetal(true));

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    // Forme : deux courbes de Bézier → pétale de sakura
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(
       p.size * 0.9, -p.size * 0.4,
       p.size * 0.6,  p.size * 0.6,
       0,             p.size
    );
    ctx.bezierCurveTo(
      -p.size * 0.6,  p.size * 0.6,
      -p.size * 0.9, -p.size * 0.4,
       0,            -p.size
    );
    ctx.fill();

    // Nervure centrale légère
    ctx.globalAlpha = p.opacity * 0.25;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.8);
    ctx.lineTo(0, p.size * 0.8);
    ctx.stroke();

    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of petals) {
      p.swing += p.swingSpeed;
      p.x += p.vx + Math.sin(p.swing) * p.swingAmp;
      p.y += p.vy;
      p.angle += p.angleSpeed;

      if (p.y > canvas.height + p.size * 2) {
        Object.assign(p, newPetal());
        p.x = Math.random() * canvas.width;
      }

      drawPetal(p);
    }

    requestAnimationFrame(loop);
  }

  loop();
})();
