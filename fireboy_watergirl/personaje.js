  // ==========================================
  //  Clase Personaje
  // ==========================================

class Personaje {
  // tipoElemento: 'fuego' (Fireboy) o 'agua' (Watergirl). Define controles, color y reglas.
  constructor(x, y, tipoElemento) {
    this.tipoElemento = tipoElemento;
    this.color = (tipoElemento === 'fuego') ? color(255, 50, 50) : color(50, 150, 255);

    // Asignación de controles
    let teclas = TECLAS[tipoElemento];
    this.teclaIzquierda = teclas.izquierda;
    this.teclaDerecha = teclas.derecha;
    this.teclaSalto = teclas.salto;

    this.fuerzaSalto = -8; // Velocidad del salto hacia arriba (eje Y negativo)

    // Creamos su cuerpo físico de Matter.js directamente aquí dentro
    this.cuerpo = Bodies.rectangle(x, y, 30, 30, {
      label: 'personaje',
      inertia: Infinity, // Evita que el personaje rote/gire al chocar
      friction: 0.1,
      collisionFilter: FILTRO.PERSONAJE
    });
    this.cuerpo.entidad = this; // Enlace cuerpo -> entidad para el enrutador de colisiones

    World.add(world, this.cuerpo);
  }

  // Indica si el personaje sobrevive al contacto con un líquido
  resisteLiquido(tipoLiquido) {
    if (tipoLiquido === 'acido') return false;
    if (tipoLiquido === 'lava') return this.tipoElemento === 'fuego';
    if (tipoLiquido === 'agua') return this.tipoElemento === 'agua';
    return true;
  }

  // Se llama en cada paso de física
  actualizarMovimiento() {
    let velX = 0;

    if (keyIsDown(this.teclaIzquierda)) velX = -4; // Camina a la izquierda
    if (keyIsDown(this.teclaDerecha))   velX = 4;  // Camina a la derecha

    // Mantenemos la velocidad en Y provocada por la gravedad, cambiando solo X
    Body.setVelocity(this.cuerpo, { x: velX, y: this.cuerpo.velocity.y });
  }

  // Método para ejecutar el salto (Se llama desde el keyPressed() global)
  revisarSalto(codigoTecla) {
    if (codigoTecla === this.teclaSalto) {
      Body.setVelocity(this.cuerpo, { x: this.cuerpo.velocity.x, y: this.fuerzaSalto });
    }
  }

  dibujar() {
    fill(this.color);
    dibujarCuerpo(this.cuerpo);
  }
}
