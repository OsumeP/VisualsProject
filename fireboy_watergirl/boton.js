  // ==========================================
  //  Clase Botón
  // ==========================================

class Boton {
  constructor(xIni, yIni, xFin, yFin) {
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;
    this.centroX = xIni + (this.ancho / 2);
    this.centroY = yIni + (this.alto / 2);

    this.estaPisado = false; // Se recalcula en cada paso de física

    this.cuerpo = Bodies.rectangle(this.centroX, this.centroY, this.ancho, this.alto, {
      label: 'boton',
      isStatic: true,
      isSensor: true,
      collisionFilter: FILTRO.SENSOR
    });
    this.cuerpo.entidad = this;
    World.add(world, this.cuerpo);
  }

  // Consultado por la plataforma asociada
  estaActivo() {
    return this.estaPisado;
  }

  // Antes de cada paso se apaga; collisionActive lo vuelve a encender si alguien sigue encima
  antesDePasoFisica() {
    this.estaPisado = false;
  }

  alColisionActiva(otra) {
    if (otra instanceof Personaje) {
      this.estaPisado = true;
    }
  }

  dibujar() {
    push();
    if (this.estaPisado) {
      fill(0, 150, 255); // Azul más brillante al presionarse
    } else {
      fill(0, 100, 250); // Azul normal en reposo
    }
    dibujarCuerpo(this.cuerpo);
    pop();
  }
}
