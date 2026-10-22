  // ==========================================
  //  Clase Piscina
  // ==========================================

class Piscina {
  // tipo: 'lava' | 'agua' | 'acido'
  constructor(xIni, yIni, xFin, yFin, tipo) {
    this.tipo = tipo;
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;

    this.centroX = xIni + (this.ancho / 2);
    this.centroY = yIni + (this.alto / 2);

    if (this.tipo === 'lava') {
      this.colorShader = [1.0, 0.2, 0.0];
    } else if (this.tipo === 'agua') {
      this.colorShader = [0.0, 0.4, 1.0];
    } else if (this.tipo === 'acido') {
      this.colorShader = [0.1, 0.9, 0.1];
    } else {
      this.colorShader = [0.5, 0.0, 0.8];
    }

    this.cuerpo = Bodies.rectangle(this.centroX, this.centroY, this.ancho, this.alto, {
      label: 'piscina',
      isStatic: true,
      isSensor: true,
      collisionFilter: FILTRO.SENSOR
    });
    this.cuerpo.entidad = this;

    World.add(world, this.cuerpo);
  }

  alIniciarColision(otra) {
    if (otra instanceof Personaje && !otra.resisteLiquido(this.tipo)) {
      personajeMuere(otra);
    }
  }

  dibujar() {
    push();
    translate(this.centroX, this.centroY);

    shader(shaderLiquido);

    // Enviamos los datos al shader
    shaderLiquido.setUniform('uColor', this.colorShader);
    shaderLiquido.setUniform('time', tiempoJuego); // Segundos de juego

    rectMode(CENTER);
    rect(0, 0, this.ancho, this.alto);
    pop();
  }
}
