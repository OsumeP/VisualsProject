  // ==========================================
  //  Clase Plataforma Móvil
  // ==========================================

class PlataformaMovil {
  // recorrido: cuántos píxeles baja la plataforma cuando está activada
  constructor(xIni, yIni, xFin, yFin, velocidad, recorrido) {
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;

    // Posición inicial (arriba / reposo) y final (abajo / activada)
    this.posInicialY = yIni + (this.alto / 2);
    this.centroX = xIni + (this.ancho / 2);
    this.posFinalY = this.posInicialY + recorrido;

    this.velocidad = velocidad; // Píxeles por paso de física

    // Palancas y botones que la controlan: basta con que uno esté activo para bajarla
    this.activadores = [];

    // Cuerpo estático que movemos por código (no le afecta la gravedad)
    this.cuerpo = Bodies.rectangle(this.centroX, this.posInicialY, this.ancho, this.alto, {
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
    let destinoY = activada ? this.posFinalY : this.posInicialY;

    let actualY = this.cuerpo.position.y;
    let siguienteY = actualY;

    if (actualY < destinoY) {
      siguienteY = min(actualY + this.velocidad, destinoY);
    } else if (actualY > destinoY) {
      siguienteY = max(actualY - this.velocidad, destinoY);
    }

    Body.setPosition(this.cuerpo, { x: this.centroX, y: siguienteY });

    // Arrastramos a quien esté parado encima para que suba y baje con ella sin rebotar
    let desplazamiento = siguienteY - actualY;
    if (desplazamiento !== 0) {
      for (let p of personajes) {
        if (p.soporte === this.cuerpo) Body.translate(p.cuerpo, { x: 0, y: desplazamiento });
      }
    }
  }

  dibujar() {
    fill(255, 255, 0); // Amarillo característico
    dibujarCuerpo(this.cuerpo);
  }
}
