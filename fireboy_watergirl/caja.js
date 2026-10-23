  // ==========================================
  //  Clase Caja (piedra empujable)
  // ==========================================

class Caja {
  constructor(xIni, yIni, xFin, yFin) {
    this.lado = xFin - xIni;
    this.puedeActivarMecanismos = true; // Pisa botones y mueve palancas
    this.empujada = false;              // Algún personaje la empuja de lado (se recalcula cada paso)

    // Cuerpo dinámico pesado: los personajes la mueven despacio y no la hacen rebotar
    this.cuerpo = Bodies.rectangle(xIni + this.lado / 2, yIni + this.lado / 2, this.lado, this.lado, {
      label: 'caja',
      chamfer: { radius: 2 },
      inertia: Infinity,   // No rueda: solo se desliza
      density: 0.003,      // ~6 veces la masa de un personaje
      friction: 0,         // El frenado lo controlamos en antesDeFisica()
      frictionStatic: 0,
      frictionAir: 0,
      collisionFilter: FILTRO.CAJA
    });
    this.cuerpo.entidad = this;
    World.add(world, this.cuerpo);
  }

  antesDePasoFisica() {
    this.empujada = false;
  }

  // Solo cuenta como empuje un personaje que la toca de lado (no uno parado encima)
  // y que se está moviendo hacia ella (apoyarse quieto no la empuja)
  alColisionActiva(otra) {
    if (otra instanceof Personaje) {
      let pieDelPersonaje = otra.cuerpo.bounds.max.y;
      let techoDeLaCaja = this.cuerpo.bounds.min.y;
      let deLado = pieDelPersonaje > techoDeLaCaja + 4;

      let lado = Math.sign(this.cuerpo.position.x - otra.cuerpo.position.x); // +1: personaje a la izquierda
      let haciaLaCaja = otra.cuerpo.velocity.x * lado > 0.1;

      if (deLado && haciaLaCaja) this.empujada = true;
    }
  }

  // Antes de Engine.update: limita la velocidad de empuje y la frena si nadie la empuja
  antesDeFisica() {
    let v = this.cuerpo.velocity;
    let velX = constrain(v.x, -Caja.VELOCIDAD_MAX, Caja.VELOCIDAD_MAX);
    if (!this.empujada) velX = acercarA(velX, 0, Caja.FRENO);
    Body.setVelocity(this.cuerpo, { x: velX, y: v.y });
  }

  dibujar() {
    let m = this.lado / 2;
    push();
    translate(this.cuerpo.position.x, this.cuerpo.position.y);
    rectMode(CENTER);

    // Bloque de piedra con borde oscuro
    stroke(25, 20, 10);
    strokeWeight(3);
    fill(205, 205, 200);
    rect(0, 0, this.lado, this.lado, 3);

    // Vetas de la piedra
    stroke(160, 160, 155);
    strokeWeight(1);
    line(-m + 6, -m / 3, m - 10, -m / 3 + 4);
    line(-m + 10, m / 4, m - 6, m / 4 - 3);
    line(-m / 3, -m + 6, -m / 3 + 5, -m / 3);

    // Esquinas doradas
    noStroke();
    fill(240, 190, 30);
    let e = 10, b = m - 2;
    triangle(-b, -b, -b + e, -b, -b, -b + e);
    triangle(b, -b, b - e, -b, b, -b + e);
    triangle(b, b, b - e, b, b, b - e);
    triangle(-b, b, -b + e, b, -b, b - e);
    pop();
  }
}

Caja.VELOCIDAD_MAX = 2;   // Píxeles por paso al empujarla (caminar normal = 4)
Caja.FRENO = 0.4;         // Cuánto pierde de velocidad X por paso cuando nadie la empuja
