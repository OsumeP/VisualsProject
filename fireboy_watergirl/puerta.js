  // ==========================================
  //  Clase Puerta
  // ==========================================

class Puerta {
  // Esquinas de la HOJA de la puerta en el fondo (la parte que se desliza hacia arriba).
  // tipo: 'fuego' (puerta roja de Fireboy) o 'agua' (puerta azul de Watergirl)
  constructor(xIni, yIni, xFin, yFin, tipo) {
    this.tipo = tipo;
    this.x = xIni;
    this.y = yIni;
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;
    this.centroX = xIni + this.ancho / 2;

    this.ocupada = false;  // Su personaje está delante (se recalcula en cada paso)
    this.abertura = 0;     // 0 = cerrada, 1 = abierta del todo

    // Sensor en la parte baja de la hoja, donde quedan los personajes parados en el suelo
    let altoSensor = 40;
    this.cuerpo = Bodies.rectangle(this.centroX, yFin - altoSensor / 2, this.ancho, altoSensor, {
      label: 'puerta',
      isStatic: true,
      isSensor: true,
      collisionFilter: FILTRO.SENSOR
    });
    this.cuerpo.entidad = this;
    World.add(world, this.cuerpo);
  }

  antesDePasoFisica() {
    this.ocupada = false;
  }

  // Solo cuenta el personaje de su elemento y bastante centrado frente a la hoja
  alColisionActiva(otra) {
    if (otra instanceof Personaje && otra.tipoElemento === this.tipo &&
        abs(otra.cuerpo.position.x - this.centroX) <= Puerta.TOLERANCIA_X) {
      this.ocupada = true;
    }
  }

  // Se llama en cada paso de física
  actualizar() {
    this.abertura = acercarA(this.abertura, this.ocupada ? 1 : 0, Puerta.VELOCIDAD);
  }

  dibujar() {
    if (this.abertura <= 0) return; // Cerrada: el fondo ya la muestra tal cual

    push();
    noStroke();
    rectMode(CORNER);

    // Interior oscuro que aparece al abrirse
    fill(25, 18, 8);
    rect(this.x, this.y, this.ancho, this.alto);

    // La hoja sube: mostramos su parte inferior pegada arriba del marco,
    // recortándola del propio fondo para conservar el arte original
    let desplazamiento = this.alto * this.abertura;
    let visible = this.alto - desplazamiento;
    if (visible > 0.5) {
      image(imgFondo, this.x, this.y, this.ancho, visible,
            this.x, this.y + desplazamiento, this.ancho, visible);
    }
    pop();
  }
}

Puerta.TOLERANCIA_X = 14;  // Distancia máxima (px) del centro del personaje al centro de la puerta
Puerta.VELOCIDAD = 0.08;   // Cuánto se abre o cierra por paso de física
