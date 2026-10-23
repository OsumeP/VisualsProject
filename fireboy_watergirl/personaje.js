  // ==========================================
  //  Clase Personaje
  // ==========================================

class Personaje {
  // tipoElemento: 'fuego' (Fireboy) o 'agua' (Watergirl). Define controles, color y reglas.
  constructor(x, y, tipoElemento) {
    this.tipoElemento = tipoElemento;
    this.colorBrillo = (tipoElemento === 'fuego') ? [255, 120, 30] : [80, 190, 255];
    this.puedeActivarMecanismos = true; // Pisa botones y mueve palancas

    // Asignación de controles: listas de códigos de tecla
    let teclas = TECLAS[tipoElemento];
    this.teclasIzquierda = teclas.izquierda;
    this.teclasDerecha = teclas.derecha;
    this.teclasSalto = teclas.salto;

    // Estado del movimiento
    this.enSuelo = false;
    this.soporte = null;          // Cuerpo sobre el que está parado (ej: una plataforma móvil)
    this.tiempoCoyote = 0;        // ms que aún puede saltar tras dejar el suelo
    this.tiempoBufferSalto = 0;   // ms que sigue "guardado" un salto pulsado
    this.saltoEstePaso = false;
    this.direccion = 0;           // Entrada horizontal de este paso: -1, 0 o 1
    this.muerto = false;

    // Estado de la animación
    this.mirando = 1;             // 1 = derecha, -1 = izquierda
    this.estadoAnim = 'quieto';   // 'quieto' | 'correr' | 'saltar' | 'caer'
    this.tiempoAnimMs = 0;

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
    if (this.teclasSalto.includes(codigoTecla)) {
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
    if (this.teclasIzquierda.some(t => keyIsDown(t))) direccion -= 1;
    if (this.teclasDerecha.some(t => keyIsDown(t)))   direccion += 1;
    this.direccion = direccion;
    if (direccion !== 0) this.mirando = direccion;

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
      reproducirSonido("salto_" + this.tipoElemento);
    }

    // Quieto en el suelo: anulamos la gravedad para que no resbale en las rampas
    if (this.enSuelo && direccion === 0) {
      velY = 0;
      let g = engine.gravity;
      this.cuerpo.force.y -= this.cuerpo.mass * g.y * g.scale;
    }

    Body.setVelocity(this.cuerpo, { x: velX, y: velY });

    this.actualizarAnimacion(dt);
    this.emitirParticulas();
  }

  // Elige la animación según el movimiento; al cambiar de animación empieza desde el cuadro 0
  actualizarAnimacion(dt) {
    let nuevo;
    if (!this.enSuelo) nuevo = (this.cuerpo.velocity.y < -0.5) ? 'saltar' : 'caer';
    else nuevo = (this.direccion !== 0) ? 'correr' : 'quieto'; // Corre aunque empuje una caja

    if (nuevo !== this.estadoAnim) {
      this.estadoAnim = nuevo;
      this.tiempoAnimMs = 0;
    } else {
      this.tiempoAnimMs += dt;
    }
  }

  // Chispas que salen de la llama de Fireboy y gotas que caen de Watergirl
  emitirParticulas() {
    let x = this.cuerpo.position.x;
    let pies = this.cuerpo.bounds.max.y;
    let arrastreX = -this.cuerpo.velocity.x * 0.3; // Quedan atrás al moverse

    if (this.tipoElemento === 'fuego') {
      if (random() < 0.35) {
        emitirParticula({
          x: x + random(-9, 9), y: pies - 52 + random(-5, 5),
          vx: arrastreX + random(-0.3, 0.3), vy: random(-1.6, -0.6),
          gravedad: -0.02, vidaMs: random(350, 650),
          tam: random(2.5, 4), tamFinal: 0,
          color: [255, random(120, 210), 40]
        });
      }
    } else if (random() < (this.direccion !== 0 ? 0.25 : 0.08)) {
      emitirParticula({
        x: x + random(-11, 11), y: pies - 38 + random(-8, 8),
        vx: arrastreX + random(-0.3, 0.3), vy: random(-0.8, 0),
        gravedad: 0.12, vidaMs: random(400, 650),
        tam: random(2.5, 3.5), tamFinal: 1,
        color: [130, 215, 255]
      });
    }
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

  dibujar() {
    if (this.muerto) return; // Se convirtió en humo

    let el = this.tipoElemento;
    let x = this.cuerpo.position.x;
    let pies = this.cuerpo.bounds.max.y;
    let voltear = this.mirando < 0; // Los sprites miran a la derecha

    this.dibujarBrillo(x, pies);

    // Cuerpo (de pie o piernas corriendo) con las caderas arriba; la cabeza va encima,
    // tapando un poco el torso
    let animCuerpo = (this.estadoAnim === 'correr') ? 'cuerpo_correr' : 'cuerpo_quieto';
    let topeCuerpo = pies - altoSprite(el, animCuerpo);
    dibujarSprite(el, animCuerpo, cuadroPorTiempo(SPRITES[el][animCuerpo], this.tiempoAnimMs),
                  x, topeCuerpo, voltear);

    let animCabeza = 'cabeza_' + this.estadoAnim;
    dibujarSprite(el, animCabeza, cuadroPorTiempo(SPRITES[el][animCabeza], this.tiempoAnimMs),
                  x, topeCuerpo + Personaje.SOLAPE_CUELLO, voltear);
  }

  // Animación de entrar por la puerta al ganar (no se repite: termina vacía)
  dibujarGanando(ms) {
    let el = this.tipoElemento;
    dibujarSprite(el, 'ganar', cuadroPorTiempo(SPRITES[el].ganar, ms, false),
                  this.cuerpo.position.x, this.cuerpo.bounds.max.y);
  }

  // Halo suave alrededor del personaje, como en el original
  dibujarBrillo(x, pies) {
    let [r, g, b] = this.colorBrillo;
    push();
    noStroke();
    fill(r, g, b, 22);
    ellipse(x, pies - 30, 60, 72);
    fill(r, g, b, 28);
    ellipse(x, pies - 30, 44, 56);
    pop();
  }
}

Personaje.SOLAPE_CUELLO = 3; // Píxeles que la cabeza tapa del torso

// Acerca `valor` a `objetivo` como máximo `paso` unidades
function acercarA(valor, objetivo, paso) {
  if (valor < objetivo) return min(valor + paso, objetivo);
  if (valor > objetivo) return max(valor - paso, objetivo);
  return valor;
}
