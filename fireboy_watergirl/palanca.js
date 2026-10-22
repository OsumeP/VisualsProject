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

  // El personaje la mueve hacia el lado al que camina al tocarla
  alIniciarColision(otra) {
    if (otra instanceof Personaje) {
      if (keyIsDown(otra.teclaIzquierda)) this.estado = 'izquierda';
      if (keyIsDown(otra.teclaDerecha)) this.estado = 'derecha';
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
