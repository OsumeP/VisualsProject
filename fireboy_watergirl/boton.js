  // ==========================================
  //  Clase Botón
  // ==========================================

class Boton {
  // Esquinas del sensor. arte (opcional): [xIni, yIni, xFin, yFin] de la tapa del botón
  // cuando el fondo ya lo trae dibujado; al pisarlo, esa tapa se dibuja hundida.
  constructor(xIni, yIni, xFin, yFin, arte) {
    this.arte = arte || null;
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
    if (otra && otra.puedeActivarMecanismos) {
      this.estaPisado = true;
    }
  }

  dibujar() {
    if (this.arte) {
      this.dibujarSobreElFondo();
      return;
    }
    push();
    if (this.estaPisado) {
      fill(0, 150, 255); // Azul más brillante al presionarse
    } else {
      fill(0, 100, 250); // Azul normal en reposo
    }
    dibujarCuerpo(this.cuerpo);
    pop();
  }

  // El fondo ya muestra el botón suelto; pisado, su tapa se aplasta hacia abajo
  dibujarSobreElFondo() {
    if (!this.estaPisado) return;
    let [x1, y1, x2, y2] = this.arte;
    let w = x2 - x1, h = y2 - y1, hundido = Boton.HUNDIDO;
    // Lo que queda libre arriba se tapa con la pared de al lado (los ladrillos se repiten cada 40 px)
    image(imgFondo, x1, y1, w, hundido, x1 + Boton.PERIODO_PARED, y1, w, hundido);
    image(imgFondo, x1, y1 + hundido, w, h - hundido, x1, y1, w, h);
  }
}

Boton.HUNDIDO = 4;          // Píxeles que baja la tapa al pisarlo
Boton.PERIODO_PARED = 40;   // Periodo horizontal de los ladrillos del fondo
