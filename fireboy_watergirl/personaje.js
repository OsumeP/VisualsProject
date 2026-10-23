  // ==========================================
  //  Clase Personaje
  // ==========================================

class Personaje {
  // tipoElemento: 'fuego' (Fireboy) o 'agua' (Watergirl). Define controles, color y reglas.
  constructor(x, y, tipoElemento) {
    this.tipoElemento = tipoElemento;
    this.color = (tipoElemento === 'fuego') ? color(255, 50, 50) : color(50, 150, 255);
    this.puedeActivarMecanismos = true; // Pisa botones y mueve palancas

    // Asignación de controles
    let teclas = TECLAS[tipoElemento];
    this.teclaIzquierda = teclas.izquierda;
    this.teclaDerecha = teclas.derecha;
    this.teclaSalto = teclas.salto;

    // Estado del movimiento
    this.enSuelo = false;
    this.soporte = null;          // Cuerpo sobre el que está parado (ej: una plataforma móvil)
    this.tiempoCoyote = 0;        // ms que aún puede saltar tras dejar el suelo
    this.tiempoBufferSalto = 0;   // ms que sigue "guardado" un salto pulsado
    this.saltoEstePaso = false;

    let f = FISICA_PERSONAJE;
    this.cuerpo = Bodies.rectangle(x, y, f.ANCHO, f.ALTO, {
      label: 'personaje',
      chamfer: { radius: f.CHAFLAN },
      inertia: Infinity,   // No rota al chocar
      friction: 0,         // Sin fricción: no se pega a las paredes; el frenado lo hacemos por código
      frictionStatic: 0,
      frictionAir: 0,
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

  // Se llama desde keyPressed(): guarda el salto unos ms por si aún no toca el suelo
  revisarSalto(codigoTecla) {
    if (codigoTecla === this.teclaSalto) {
      this.tiempoBufferSalto = FISICA_PERSONAJE.BUFFER_SALTO_MS;
    }
  }

  // Antes de Engine.update: entrada, aceleración y salto
  antesDeFisica(dt) {
    let f = FISICA_PERSONAJE;

    this.tiempoCoyote = this.enSuelo ? f.COYOTE_MS : max(this.tiempoCoyote - dt, 0);
    this.tiempoBufferSalto = max(this.tiempoBufferSalto - dt, 0);

    // --- Movimiento horizontal con aceleración ---
    let direccion = 0;
    if (keyIsDown(this.teclaIzquierda)) direccion -= 1;
    if (keyIsDown(this.teclaDerecha))   direccion += 1;

    let velX = this.cuerpo.velocity.x;
    let velY = this.cuerpo.velocity.y;
    let objetivo = direccion * f.VELOCIDAD_MAX;
    let cambio;
    if (!this.enSuelo) cambio = f.ACEL_AIRE;
    else if (direccion !== 0) cambio = f.ACEL_SUELO;
    else cambio = f.FRENO_SUELO;
    velX = acercarA(velX, objetivo, cambio);

    // --- Salto: solo apoyado (o dentro del tiempo coyote) ---
    this.saltoEstePaso = false;
    if (this.tiempoBufferSalto > 0 && this.tiempoCoyote > 0) {
      velY = -f.FUERZA_SALTO;
      this.tiempoBufferSalto = 0;
      this.tiempoCoyote = 0;
      this.enSuelo = false;
      this.soporte = null;
      this.saltoEstePaso = true;
    }

    // Quieto en el suelo: anulamos la gravedad para que no resbale en las rampas
    if (this.enSuelo && direccion === 0) {
      velY = 0;
      let g = engine.gravity;
      this.cuerpo.force.y -= this.cuerpo.mass * g.y * g.scale;
    }

    Body.setVelocity(this.cuerpo, { x: velX, y: velY });
  }

  // Después de Engine.update: detecta el suelo y, al bajar rampas, lo mantiene pegado
  despuesDeFisica() {
    let f = FISICA_PERSONAJE;
    let estabaEnSuelo = this.enSuelo;
    let suelo = this.buscarSuelo(f.DISTANCIA_AJUSTE);
    let subiendo = this.saltoEstePaso || this.cuerpo.velocity.y < -1;

    // Apoyado si el suelo está muy cerca, o si venía caminando y el suelo "se alejó"
    // un poco (bajando una rampa): en ese caso lo pegamos en vez de dejarlo dar saltitos.
    if (suelo && !subiendo && (suelo.distancia <= f.DISTANCIA_SUELO || estabaEnSuelo)) {
      if (suelo.distancia > 1) {
        Body.translate(this.cuerpo, { x: 0, y: suelo.distancia - 1 });
      }
      this.enSuelo = true;
      this.soporte = suelo.cuerpo;
    } else {
      this.enSuelo = false;
      this.soporte = null;
    }
  }

  // Busca un cuerpo sólido justo bajo los pies (3 puntos: izquierda, centro, derecha).
  // Devuelve { distancia, cuerpo } o null si no hay nada a menos de distanciaMax píxeles.
  buscarSuelo(distanciaMax) {
    let b = this.cuerpo.bounds;
    let xs = [b.min.x + 3, this.cuerpo.position.x, b.max.x - 3];
    let solidos = cuerposSolidos();

    for (let d = 1; d <= distanciaMax; d++) {
      for (let x of xs) {
        let encontrados = Matter.Query.point(solidos, { x: x, y: b.max.y + d });
        if (encontrados.length > 0) return { distancia: d, cuerpo: encontrados[0] };
      }
    }
    return null;
  }

  // opacidad: 0..255 (se desvanece al entrar por la puerta)
  dibujar(opacidad = 255) {
    fill(red(this.color), green(this.color), blue(this.color), opacidad);
    dibujarCuerpo(this.cuerpo);
  }
}

// Acerca `valor` a `objetivo` como máximo `paso` unidades
function acercarA(valor, objetivo, paso) {
  if (valor < objetivo) return min(valor + paso, objetivo);
  if (valor > objetivo) return max(valor - paso, objetivo);
  return valor;
}
