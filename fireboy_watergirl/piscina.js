  // ==========================================
  //  Clase Piscina
  // ==========================================

class Piscina {
  // tipo: 'lava' | 'agua' | 'acido'
  // talud: ancho de los lados inclinados del hueco (se dibuja como trapecio)
  constructor(xIni, yIni, xFin, yFin, tipo, talud = 0) {
    this.tipo = tipo;
    this.xIni = xIni;
    this.yIni = yIni;
    this.xFin = xFin;
    this.yFin = yFin;
    this.talud = talud;

    if (this.tipo === 'lava') {
      this.colorShader = [1.0, 0.2, 0.0];
    } else if (this.tipo === 'agua') {
      this.colorShader = [0.0, 0.4, 1.0];
    } else if (this.tipo === 'acido') {
      this.colorShader = [0.1, 0.9, 0.1];
    } else {
      this.colorShader = [0.5, 0.0, 0.8];
    }

    // El sensor empieza unos píxeles bajo el borde: pararse en la orilla no mata,
    // hay que hundirse en el líquido.
    let ySensor = yIni + Piscina.MARGEN_SUPERFICIE;
    this.cuerpo = Bodies.rectangle((xIni + xFin) / 2, (ySensor + yFin) / 2, xFin - xIni, yFin - ySensor, {
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
    shader(shaderLiquido);

    // Enviamos los datos al shader
    shaderLiquido.setUniform('uColor', this.colorShader);
    shaderLiquido.setUniform('time', tiempoJuego); // Segundos de juego

    // Trapecio con coordenadas de textura (u, v) en 0..1 para las ondas del shader
    beginShape();
    vertex(this.xIni, this.yIni, 0, 0, 0);
    vertex(this.xFin, this.yIni, 0, 1, 0);
    vertex(this.xFin - this.talud, this.yFin, 0, 1, 1);
    vertex(this.xIni + this.talud, this.yFin, 0, 0, 1);
    endShape(CLOSE);
    pop();
  }
}

Piscina.MARGEN_SUPERFICIE = 3;
