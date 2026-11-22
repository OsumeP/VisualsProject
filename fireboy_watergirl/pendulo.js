  // ==========================================
  //  Clase Péndulo (tronco colgante)
  // ==========================================
// Tronco colgado de una cadena, con un eje en su centro sobre el que puede girar
// libremente (incluso dar la vuelta entera). Está quieto hasta que un personaje interactúa:
//
//   * Balanceo (ángulo θ de la cadena, radio R hasta el centro del tronco):
//         θ'' = -(g / R)·(sin θ + μ·Σx / R) - c·θ'
//     con la gravedad de Matter.js. Σx suma la distancia horizontal de los personajes al
//     centro: el conjunto busca quedar bajo el ancla, así que pararse a un lado desplaza el
//     tronco hacia el otro. Al caer encima y al caminar sobre él (acelerar empuja el tronco
//     hacia atrás) le transmiten parte de su velocidad: así se puede "bombear" el columpio.
//
//   * Giro de la tabla (ángulo φ sobre su centro, positivo = horario):
//         I·φ'' = Σ m·g·x  -  M·g·r·sin φ  -  fricción del eje  -  c·I·φ'
//     El peso de cada personaje hace torque según la distancia horizontal x de sus pies al
//     eje (a la izquierda gira antihorario, a la derecha horario), y caer encima le da un
//     impulso m·(x·vy - y·vx). El eje tiene fricción de Coulomb proporcional a la carga:
//     cerca del centro el torque no la vence y la tabla no se mueve; cerca del borde sí, y
//     la tabla se voltea con impulso suficiente para dar vueltas completas. Cuando está muy
//     inclinada, quien está encima resbala (esResbaladizo). El centro de masa del tronco
//     queda un poco bajo el eje (r): sin nadie encima, poco a poco vuelve a horizontal.
//
// El tronco es un cuerpo estático que movemos por código (como las plataformas móviles),
// no un cuerpo dinámico unido con un Constraint: así no lo desestabilizan los choques,
// se reinicia igual siempre y sabemos cuánto se movió para arrastrar a quien va encima.
// Las masas son relativas: el tronco pesa 1 y cada personaje RELACION_MASA.

class Pendulo {
  // datos: { ancla: [x, y], largo, ancho, alto, anguloInicial }
  //   ancla:          centro de la bola de la que cuelga la cadena
  //   largo:          largo de la cadena en reposo, desde el ancla hasta el borde superior del tronco
  //   ancho, alto:    tamaño del tronco
  //   anguloInicial:  opcional, en grados (positivo = hacia la derecha). Por defecto, quieto.
  constructor(datos) {
    this.ancla = { x: datos.ancla[0], y: datos.ancla[1] };
    this.ancho = datos.ancho;
    this.alto = datos.alto;
    this.radio = datos.largo + datos.alto / 2;  // R: del ancla al eje (centro del tronco)

    this.angulo = radians(datos.anguloInicial || 0);  // θ: 0 = colgando recto hacia abajo
    this.velocidadAngular = 0;                        // θ', en rad/s
    this.giro = 0;                                    // φ: giro de la tabla (positivo = horario)
    this.velocidadGiro = 0;                           // φ', en rad/s

    // Momento de inercia del tronco (masa 1) respecto a su centro, en px²
    this.inerciaTronco = (this.ancho ** 2 + this.alto ** 2) / 12;

    this.velAnterior = new Map(); // Velocidad X de cada personaje encima en el paso anterior

    let pos = this.posicionTronco();
    this.cuerpo = Bodies.rectangle(pos.x, pos.y, this.ancho, this.alto, {
      label: 'pendulo',
      isStatic: true,
      collisionFilter: FILTRO.ESCENARIO
    });
    this.cuerpo.entidad = this;
    World.add(world, this.cuerpo);
  }

  // Gravedad del mundo de Matter.js en píxeles/s² (gravity.scale está en px/ms²)
  gravedad() {
    return engine.gravity.y * engine.gravity.scale * 1e6;
  }

  // Centro del tronco (su eje), en el extremo de la cadena
  posicionTronco() {
    return {
      x: this.ancla.x + this.radio * sin(this.angulo),
      y: this.ancla.y + this.radio * cos(this.angulo)
    };
  }

  // Inclinación de la superficie sobre la que se pisa, entre -90° y 90°
  // (volteada 180°, la cara de abajo pasa a ser la de arriba)
  pendiente() {
    let p = (this.giro + HALF_PI) % PI;
    if (p < 0) p += PI;
    return p - HALF_PI;
  }

  // Consultado por Personaje: con la tabla muy inclinada, quien está encima resbala
  esResbaladizo() {
    return abs(this.pendiente()) > Pendulo.PENDIENTE_RESBALA;
  }

  // Se llama en cada paso de física, después de Engine.update (dt en ms)
  actualizar(dt) {
    let s = dt / 1000;
    let R = this.radio;
    let g = this.gravedad();
    let m = Pendulo.RELACION_MASA;
    let centro = this.cuerpo.position;

    // --- Personajes encima: impulsos, peso e inercia que aportan ---
    let encima = personajes.filter(p => p.soporte === this.cuerpo);
    let sumaX = 0;
    let inercia = this.inerciaTronco;
    let velAhora = new Map();
    for (let p of encima) {
      // El peso se apoya en los pies: distancia del punto de apoyo al eje
      let x = p.cuerpo.position.x - centro.x;
      let y = p.cuerpo.bounds.max.y - centro.y;
      let velX = p.velocidadPrevia.x / s;      // px/s
      let velY = p.velocidadPrevia.y / s;

      if (this.velAnterior.has(p)) {
        // Al caminar, el impulso que el personaje gana con los pies lo pierde el tronco
        this.velocidadAngular -= Pendulo.EMPUJE_CAMINAR * (velX - this.velAnterior.get(p)) / R;
      } else {
        // Acaba de caer encima: empuja el balanceo con su velocidad horizontal...
        let velTronco = R * this.velocidadAngular * cos(this.angulo);
        this.velocidadAngular += Pendulo.EMPUJE_ATERRIZAJE * (velX - velTronco) / R;
        // ...y hace girar la tabla con el impacto (momento angular m·(x·vy - y·vx))
        this.velocidadGiro += Pendulo.EMPUJE_GIRO * m * (x * velY - y * velX) /
                              (this.inerciaTronco + m * (x * x + y * y));
      }
      velAhora.set(p, velX);
      sumaX += x;
      inercia += m * (x * x + y * y);
    }
    this.velAnterior = velAhora;

    // --- Balanceo: péndulo con el peso de los personajes y rozamiento ---
    let aceleracion = -(g / R) * (sin(this.angulo) + m * sumaX / R)
                      - Pendulo.AMORTIGUACION * this.velocidadAngular;
    this.velocidadAngular += aceleracion * s;  // Euler semi-implícito
    this.angulo += this.velocidadAngular * s;
    this.angulo = constrain(this.angulo, -Pendulo.ANGULO_MAX, Pendulo.ANGULO_MAX);
    if (abs(this.angulo) === Pendulo.ANGULO_MAX) this.velocidadAngular = 0;

    // --- Giro de la tabla: torque del peso de los personajes contra el del tronco ---
    let torque = m * g * sumaX - g * Pendulo.DESCENTRO_MASA * sin(this.giro);

    // Fricción del eje (Coulomb), proporcional a la carga de los personajes: quieta, la
    // tabla no gira hasta que el torque supera la fricción estática; girando, la frena
    // la fricción dinámica (un poco menor)
    let friccionEstatica = Pendulo.FRICCION_EJE * m * g * encima.length;
    if (this.velocidadGiro === 0 && abs(torque) <= friccionEstatica) {
      torque = 0;
    } else if (friccionEstatica > 0) {
      let sentido = (this.velocidadGiro !== 0) ? Math.sign(this.velocidadGiro) : Math.sign(torque);
      torque -= sentido * friccionEstatica * Pendulo.FRICCION_DINAMICA;
    }

    let velGiroAntes = this.velocidadGiro;
    let acelGiro = torque / inercia - Pendulo.AMORTIGUACION_GIRO * this.velocidadGiro;
    this.velocidadGiro += acelGiro * s;
    // La fricción frena hasta detener, pero no invierte el giro: ahí se queda quieta
    if (friccionEstatica > 0 && velGiroAntes !== 0 && Math.sign(this.velocidadGiro) !== Math.sign(velGiroAntes)) {
      this.velocidadGiro = 0;
    }
    this.giro += this.velocidadGiro * s;
    // Tras varias vueltas, el ángulo vuelve a -180°..180° (sin cambiar la orientación)
    if (this.giro > PI) this.giro -= TWO_PI;
    if (this.giro < -PI) this.giro += TWO_PI;

    // --- Mover el cuerpo y llevar consigo a quien va encima ---
    let centroAntes = { x: centro.x, y: centro.y };
    let giroAntes = this.cuerpo.angle;
    let centroAhora = this.posicionTronco();
    Body.setPosition(this.cuerpo, centroAhora);
    Body.setAngle(this.cuerpo, this.giro);

    // Cada personaje sigue al punto de la tabla que tiene bajo los pies. Si la tabla está
    // muy inclinada no: resbala por ella (o la tabla gira y lo empuja) con la física normal.
    if (this.esResbaladizo()) return;
    for (let p of encima) {
      let pie = { x: p.cuerpo.position.x, y: p.cuerpo.bounds.max.y };
      let local = rotarPunto(pie.x - centroAntes.x, pie.y - centroAntes.y, -giroAntes);
      let nuevo = rotarPunto(local.x, local.y, this.giro);
      p.arrastrar(centroAhora.x + nuevo.x - pie.x, centroAhora.y + nuevo.y - pie.y);
    }
  }

  dibujar() {
    let pos = this.cuerpo.position;

    // La cadena llega al eje del tronco; el tronco se dibuja encima y la tapa
    this.dibujarCadena(pos.x, pos.y);

    push();
    translate(pos.x, pos.y);
    rotate(this.cuerpo.angle);
    if (Pendulo.imagen) {
      // El recorte del tronco es un poco más grande que su cuerpo (contorno y hojas)
      let img = Pendulo.imagen;
      let w = this.ancho + 2;
      let h = img.height * w / img.width;
      image(img, -w / 2, -this.alto / 2 - Pendulo.DESFASE_IMAGEN, w, h);
    } else {
      noStroke();
      fill(110, 60, 20);
      rectMode(CENTER);
      rect(0, 0, this.ancho, this.alto, 3);
    }
    // Perno del eje
    noStroke();
    fill(35);
    ellipse(0, 0, 8, 8);
    fill(170);
    ellipse(0, 0, 5, 5);
    pop();
  }

  // Eslabones a lo largo de la cadena, alternando de frente y de canto (solo rellenos:
  // en WEBGL las líneas con stroke() quedan por delante de todo)
  dibujarCadena(xFin, yFin) {
    let dx = xFin - this.ancla.x;
    let dy = yFin - this.ancla.y;
    let largo = Math.hypot(dx, dy);

    push();
    noStroke();
    rectMode(CENTER);
    translate(this.ancla.x, this.ancla.y);
    rotate(-atan2(dx, dy)); // El eje +Y local queda a lo largo de la cadena
    let paso = Pendulo.PASO_ESLABON;
    let i = 0;
    for (let d = Pendulo.RADIO_BOLA + paso / 2; d < largo; d += paso, i++) {
      if (i % 2 === 0) {
        fill(35);  rect(0, d, 8, paso + 2, 2);
        fill(190); rect(0, d, 6, paso, 2);
        fill(70);  rect(0, d, 2, paso - 4, 1);
      } else {
        fill(35);  rect(0, d, 4, paso + 2, 1);
        fill(160); rect(0, d, 2, paso, 1);
      }
    }
    pop();
  }
}

Pendulo.imagen = null;                    // Se carga en preload (Resources/images/tronco.png)
Pendulo.DESFASE_IMAGEN = 3;               // La imagen empieza 3 px sobre el tronco (trae un trozo de cadena)
Pendulo.RELACION_MASA = 0.3;              // Masa de un personaje comparada con la del tronco

// Balanceo
Pendulo.EMPUJE_ATERRIZAJE = 0.3;          // Fracción de la velocidad del personaje que recibe al caer encima
Pendulo.EMPUJE_CAMINAR = 0.25;            // Fracción del cambio de velocidad al caminar que lo empuja hacia atrás
Pendulo.AMORTIGUACION = 0.5;              // Rozamiento del balanceo (1/s): más alto = se detiene antes
Pendulo.ANGULO_MAX = Math.PI / 3;         // La cadena nunca pasa de 60°

// Giro de la tabla (sin límite: puede dar vueltas completas)
Pendulo.DESCENTRO_MASA = 5;               // px que el centro de masa del tronco queda bajo el eje
                                          //   (lo que la regresa a horizontal cuando nadie la pisa)
Pendulo.FRICCION_EJE = 25;                // Fricción estática del eje, como brazo de palanca en px:
                                          //   un personaje a menos de 25 px del centro no la gira
Pendulo.FRICCION_DINAMICA = 0.6;          // Fracción de la fricción estática que queda al girar
Pendulo.EMPUJE_GIRO = 1;                  // Fracción del impacto al caer encima que se vuelve giro
Pendulo.AMORTIGUACION_GIRO = 0.6;         // Rozamiento viscoso del eje (1/s)
Pendulo.PENDIENTE_RESBALA = Math.PI / 4;  // Desde 45° de inclinación, quien está encima resbala

// Dibujo de la cadena
Pendulo.RADIO_BOLA = 9;                   // La cadena sale del borde de la bola del ancla
Pendulo.PASO_ESLABON = 7;

function cargarImagenesPendulo() {
  Pendulo.imagen = loadImage('Resources/images/tronco.png');
}

// Gira el vector (x, y) un ángulo dado (positivo = horario en pantalla, como rotate() de p5)
function rotarPunto(x, y, angulo) {
  let c = cos(angulo), s = sin(angulo);
  return { x: x * c - y * s, y: x * s + y * c };
}
