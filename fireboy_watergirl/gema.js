  // ==========================================
  //  Clase Gema
  // ==========================================

class Gema {
  // tipo: 'fuego' (roja, solo la recoge Fireboy) o 'agua' (azul, solo Watergirl)
  constructor(x, y, tipo) {
    this.x = x;
    this.y = y;
    this.tipo = tipo;
    this.color = (tipo === 'fuego') ? [255, 60, 40] : [60, 190, 255];

    this.recogida = false;
    this.tiempoDesdeRecogida = 0;   // ms, anima el destello al recogerla
    this.particulas = [];
    this.fase = random(TWO_PI);     // Para que no floten todas sincronizadas

    this.cuerpo = Bodies.circle(x, y, Gema.RADIO, {
      label: 'gema',
      isStatic: true,
      isSensor: true,
      collisionFilter: FILTRO.SENSOR
    });
    this.cuerpo.entidad = this;
    World.add(world, this.cuerpo);
  }

  alColisionActiva(otra) {
    if (!this.recogida && otra instanceof Personaje && otra.tipoElemento === this.tipo) {
      this.recoger();
    }
  }

  recoger() {
    this.recogida = true;
    reproducirSonido("gema");
    // Chispas que salen en todas direcciones
    for (let i = 0; i < 12; i++) {
      let angulo = TWO_PI * i / 12 + random(-0.2, 0.2);
      let rapidez = random(1.2, 2.6);
      this.particulas.push({ x: this.x, y: this.y, vx: cos(angulo) * rapidez, vy: sin(angulo) * rapidez });
    }
  }

  // Se llama en cada paso de física
  actualizar(dt) {
    if (!this.recogida) return;

    // El sensor se quita fuera del evento de colisión, ya con el paso terminado
    if (this.cuerpo) {
      World.remove(world, this.cuerpo);
      this.cuerpo = null;
    }

    this.tiempoDesdeRecogida += dt;
    for (let p of this.particulas) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
    }
  }

  dibujar() {
    if (this.recogida) {
      this.dibujarDestello();
      return;
    }

    // Flota suavemente y su brillo late
    let t = tiempoJuego * 3 + this.fase;
    let y = this.y + sin(t) * 2.5;
    let brillo = 0.5 + 0.5 * sin(t * 1.7);

    push();
    noStroke();
    let [r, g, b] = this.color;
    fill(r, g, b, 40 + 40 * brillo);
    ellipse(this.x, y, 34 + 6 * brillo);
    fill(r, g, b, 70);
    ellipse(this.x, y, 22);

    dibujarFormaGema(this.x, y, 1, this.color);
    pop();
  }

  dibujarDestello() {
    let progreso = this.tiempoDesdeRecogida / Gema.DURACION_DESTELLO_MS;
    if (progreso >= 1) return;

    let [r, g, b] = this.color;
    let alfa = 255 * (1 - progreso);
    push();
    noFill();
    stroke(255, 255, 255, alfa);
    strokeWeight(2);
    ellipse(this.x, this.y, 10 + 40 * progreso);

    noStroke();
    fill(r, g, b, alfa);
    for (let p of this.particulas) {
      ellipse(p.x, p.y, 4 * (1 - progreso) + 1);
    }
    pop();
  }
}

Gema.RADIO = 10;
Gema.DURACION_DESTELLO_MS = 500;

// Diamante facetado: corona arriba y punta abajo. escala 1 = unos 20 px de ancho.
// También lo usa el HUD para los iconos del contador.
function dibujarFormaGema(x, y, escala, colorBase) {
  let [r, g, b] = colorBase;
  push();
  translate(x, y);
  scale(escala);
  noStroke();

  // Cuerpo
  fill(r, g, b);
  beginShape();
  vertex(-10, -3);
  vertex(-5, -9);
  vertex(5, -9);
  vertex(10, -3);
  vertex(0, 10);
  endShape(CLOSE);

  // Facetas claras (corona) y oscuras (pabellón)
  fill(min(r + 90, 255), min(g + 90, 255), min(b + 90, 255));
  triangle(-5, -9, 5, -9, 0, -3);
  fill(r * 0.6, g * 0.6, b * 0.6);
  triangle(0, -3, 10, -3, 0, 10);

  // Reflejo
  fill(255, 255, 255, 200);
  triangle(-6, -6, -3, -8, -4, -4);
  pop();
}
