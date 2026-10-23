  // ==========================================
  //  PARTÍCULAS (chispas, gotas, humo)
  // ==========================================
// Efectos puramente visuales: se actualizan con el tiempo real de cada frame
// (siguen moviéndose durante la animación de muerte, cuando la física está detenida).

let particulas = [];

// Valores por defecto de una partícula. Velocidades en píxeles por 1/60 s.
const PARTICULA_BASE = {
  vx: 0, vy: 0,
  gravedad: 0,        // Se suma a vy cada 1/60 s (negativa = sube, como el fuego)
  arrastre: 1,        // vx y vy se multiplican por esto cada 1/60 s
  vidaMs: 600,
  tam: 4, tamFinal: 0,
  color: [255, 255, 255],
  alfa: 255
};

function emitirParticula(opciones) {
  particulas.push(Object.assign({}, PARTICULA_BASE, opciones, { edadMs: 0 }));
}

function actualizarParticulas(dtMs) {
  let f = dtMs / (1000 / 60);
  for (let p of particulas) {
    p.edadMs += dtMs;
    let arrastre = pow(p.arrastre, f);
    p.vx *= arrastre;
    p.vy = p.vy * arrastre + p.gravedad * f;
    p.x += p.vx * f;
    p.y += p.vy * f;
  }
  particulas = particulas.filter(p => p.edadMs < p.vidaMs);
}

function dibujarParticulas() {
  push();
  noStroke();
  for (let p of particulas) {
    let t = p.edadMs / p.vidaMs;
    fill(p.color[0], p.color[1], p.color[2], p.alfa * (1 - t));
    ellipse(p.x, p.y, lerp(p.tam, p.tamFinal, t));
  }
  pop();
}

function limpiarParticulas() {
  particulas = [];
}

// Nube de humo cuando un personaje muere (como en el original)
function emitirHumo(x, y, colorElemento) {
  for (let i = 0; i < 26; i++) {
    let gris = random(70, 150);
    emitirParticula({
      x: x + random(-12, 12), y: y + random(-25, 5),
      vx: random(-0.9, 0.9), vy: random(-1.6, -0.3),
      gravedad: -0.01, arrastre: 0.97,
      vidaMs: random(900, 1400),
      tam: random(8, 14), tamFinal: random(24, 34),
      color: [gris, gris, gris], alfa: 200
    });
  }
  // Algunas chispas del color del personaje
  for (let i = 0; i < 12; i++) {
    let angulo = random(TWO_PI);
    emitirParticula({
      x: x, y: y - 15,
      vx: cos(angulo) * random(1, 3), vy: sin(angulo) * random(1, 3) - 1,
      gravedad: 0.08, arrastre: 0.95,
      vidaMs: random(400, 700), tam: 4, tamFinal: 1,
      color: colorElemento
    });
  }
}
