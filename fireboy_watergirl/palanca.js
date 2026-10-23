  // ==========================================
  //  Clase Palanca
  // ==========================================

class Palanca {
  // orientacionInicial: 'izquierda' | 'derecha'. Está activa cuando apunta a la izquierda.
  constructor(x, y, orientacionInicial) {
    this.x = x;
    this.y = y;
    this.estado = orientacionInicial;

    this.anguloActual = (this.estado === 'derecha') ? QUARTER_PI : -QUARTER_PI;
    this.objetivoAngulo = this.anguloActual;

    this.cuerpoSensor = Bodies.rectangle(x, y, 40, 20, {
      label: 'palanca',
      isStatic: true,
      isSensor: true,
      collisionFilter: FILTRO.SENSOR
    });
    this.cuerpoSensor.entidad = this;
    World.add(world, this.cuerpoSensor);
  }

  // Consultado por la plataforma asociada
  estaActivo() {
    return this.estado === 'izquierda';
  }

  // Quien la toca la empuja hacia el lado al que se mueve (sirve aunque ya estuviera encima)
  alColisionActiva(otra) {
    if (otra && otra.puedeActivarMecanismos) {
      let velX = otra.cuerpo.velocity.x;
      if (velX < -1) this.estado = 'izquierda';
      if (velX > 1) this.estado = 'derecha';
    }
  }

  // Se llama en cada paso de física: anima la manija hacia su ángulo objetivo
  actualizar() {
    this.objetivoAngulo = (this.estado === 'derecha') ? QUARTER_PI : -QUARTER_PI;
    this.anguloActual = lerp(this.anguloActual, this.objetivoAngulo, 0.15);
  }

  dibujar() {
    push();
    translate(this.x, this.y);
    fill(250, 130, 0);
    rectMode(CENTER);
    rect(0, 5, 40, 10);
    rotate(this.anguloActual);
    rect(0, -15, 6, 30);
    pop();
  }
}
