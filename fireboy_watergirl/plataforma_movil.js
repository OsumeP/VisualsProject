  // ==========================================
  //  Clase Plataforma Móvil
  // ==========================================
// Barra que se desliza en línea recta entre su posición de reposo y la de activada
// (hacia abajo, hacia arriba o de lado), mientras alguno de sus activadores esté activo.
//
// opciones:
//   velocidad:      píxeles por paso de física
//   desplazamiento: [dx, dy] desde el reposo hasta la posición activada
//   tapa:           [xIni, yIni, xFin, yFin] opcional: zona del fondo que se vuelve a dibujar
//                   encima de la plataforma, para que parezca que se esconde dentro de la pared

class PlataformaMovil {
  constructor(xIni, yIni, xFin, yFin, opciones) {
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;

    // Posición de reposo (centro) y desplazamiento hasta la posición activada
    this.inicio = { x: xIni + this.ancho / 2, y: yIni + this.alto / 2 };
    let [dx, dy] = opciones.desplazamiento;
    this.desplazamiento = { x: dx, y: dy };
    this.largoRecorrido = Math.hypot(dx, dy);

    this.velocidad = opciones.velocidad; // Píxeles por paso de física
    this.tapa = opciones.tapa || null;

    this.progreso = 0;        // 0 = en reposo, 1 = activada del todo
    this.moviendose = false;

    // Palancas y botones que la controlan: basta con que uno esté activo para moverla
    this.activadores = [];

    // Cuerpo estático que movemos por código (no le afecta la gravedad)
    this.cuerpo = Bodies.rectangle(this.inicio.x, this.inicio.y, this.ancho, this.alto, {
      label: 'plataforma',
      isStatic: true,
      collisionFilter: FILTRO.ESCENARIO
    });
    this.cuerpo.entidad = this;
    World.add(world, this.cuerpo);
  }

  // activador: cualquier objeto con un método estaActivo()
  agregarActivador(activador) {
    this.activadores.push(activador);
  }

  // Se llama en cada paso de física, después de Engine.update
  actualizar() {
    let activada = this.activadores.some(a => a.estaActivo());
    let destino = activada ? 1 : 0;
    let paso = (this.largoRecorrido > 0) ? this.velocidad / this.largoRecorrido : 1;
    let siguiente = acercarA(this.progreso, destino, paso);

    let actual = this.cuerpo.position;
    let nueva = {
      x: this.inicio.x + this.desplazamiento.x * siguiente,
      y: this.inicio.y + this.desplazamiento.y * siguiente
    };
    let mov = { x: nueva.x - actual.x, y: nueva.y - actual.y };

    // Si al avanzar aplastaría a alguien (ej: una compuerta que baja sobre un personaje),
    // espera a que se quite
    if ((mov.x !== 0 || mov.y !== 0) && this.aplastaria(mov)) {
      mov = { x: 0, y: 0 };
    } else {
      this.progreso = siguiente;
    }

    // Sonido al arrancar (no en cada paso del recorrido)
    let moviendose = mov.x !== 0 || mov.y !== 0;
    if (moviendose && !this.moviendose) reproducirSonido("plataforma");
    this.moviendose = moviendose;
    if (!moviendose) return;

    Body.setPosition(this.cuerpo, nueva);

    // Arrastramos a quien esté parado encima para que se mueva con ella sin rebotar
    for (let p of personajes) {
      if (p.soporte === this.cuerpo) p.arrastrar(mov.x, mov.y);
    }
  }

  // ¿Se metería más de unos píxeles dentro de un personaje (que no va encima) o de una caja?
  aplastaria(mov) {
    let b = this.cuerpo.bounds;
    let nuevos = {
      min: { x: b.min.x + mov.x, y: b.min.y + mov.y },
      max: { x: b.max.x + mov.x, y: b.max.y + mov.y }
    };
    let obstaculos = [
      ...personajes.filter(p => p.soporte !== this.cuerpo).map(p => p.cuerpo),
      ...listaCajas.map(c => c.cuerpo)
    ];
    return obstaculos.some(o => solapamiento(nuevos, o.bounds) > PlataformaMovil.TOLERANCIA);
  }

  // Barra amarilla con borde oscuro y franja clara, como las del juego original
  dibujar() {
    let b = this.cuerpo.bounds;
    let x = b.min.x, y = b.min.y, w = b.max.x - b.min.x, h = b.max.y - b.min.y;
    let horizontal = w >= h;
    // Margen de la franja central: más ancho en los extremos de la barra
    let mLargo = min(6, (horizontal ? w : h) / 4);
    let mCorto = min(5, (horizontal ? h : w) / 3);
    let [mx, my] = horizontal ? [mLargo, mCorto] : [mCorto, mLargo];

    push();
    noStroke();
    rectMode(CORNER);
    fill(40, 30, 5);                  // Contorno
    rect(x - 1, y - 1, w + 2, h + 2, 2);
    fill(240, 190, 30);               // Marco amarillo
    rect(x + 1, y + 1, w - 2, h - 2, 2);
    fill(150, 110, 10);               // Sombra de la franja
    rect(x + mx - 1, y + my - 1, w - 2 * mx + 2, h - 2 * my + 2, 2);
    fill(225, 225, 215);              // Franja clara
    rect(x + mx, y + my, w - 2 * mx, h - 2 * my, 2);
    pop();

    // La parte que está dentro de la pared queda tapada por el propio fondo
    if (this.tapa) {
      let [tx1, ty1, tx2, ty2] = this.tapa;
      image(imgFondo, tx1, ty1, tx2 - tx1, ty2 - ty1, tx1, ty1, tx2 - tx1, ty2 - ty1);
    }
  }
}

// Píxeles que se permite meter la plataforma dentro de un personaje antes de detenerse
// (un poco de margen para que no la frene alguien que solo la está tocando)
PlataformaMovil.TOLERANCIA = 2;

// Cuánto se meten dos rectángulos {min, max} uno dentro del otro (0 si no se tocan):
// el menor de los solapamientos en X y en Y
function solapamiento(a, b) {
  let sx = min(a.max.x, b.max.x) - max(a.min.x, b.min.x);
  let sy = min(a.max.y, b.max.y) - max(a.min.y, b.min.y);
  return max(0, min(sx, sy));
}
