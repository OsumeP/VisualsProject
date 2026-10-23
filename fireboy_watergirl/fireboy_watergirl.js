// Módulos de Matter.js usados en todo el proyecto
const { Engine, World, Composite, Bodies, Body, Events } = Matter;
let engine, world;

let estadoPantalla = "inicio"; // "inicio", "juego", "muerte", "gameover" o "victoria"
let estadoPendiente = null;    // Cambio de pantalla pedido durante un paso de física

let tiempoJuego = 0;           // Segundos de juego simulados (anima los shaders)
let tiempoPartidaMs = 0;       // Reloj de la partida: solo avanza mientras se juega
let acumuladorFisica = 0;      // Milisegundos reales aún no simulados

let tiempoEnPuertasMs = 0;     // Cuánto llevan ambos personajes en su puerta a la vez
let tiempoVictoriaMs = 0;      // Tiempo desde que se ganó (anima la entrada por la puerta)
let tiempoMuerteMs = 0;        // Tiempo desde que murió un personaje (anima el humo)
let resultado = null;          // Datos de la partida ganada: { tiempoMs, gemas, calificacion }

let imgInicio, imgBosque, fuente_juego;

function preload() {
  imgInicio = loadImage("Resources/images/startgame.png");
  imgBosque = loadImage("Resources/images/backgame.png");
  fuente_juego = loadFont("Resources/fonts/space.ttf");
  cargarSprites();
}

function setup() {
  // Lienzo del tamaño exacto del mapa
  createCanvas(CONFIG.ANCHO, CONFIG.ALTO, WEBGL);

  // Compilar los shaders cargados en las variables de texto
  shaderLiquido = createShader(vsPiscina, fsPiscina);
  textureMode(NORMAL); // Coordenadas de textura 0..1 en vertex() (las usa el shader de las piscinas)

  engine = Engine.create();
  world = engine.world;

  // Los eventos se registran una sola vez: sobreviven a los reinicios del nivel
  registrarEventosColision(engine);

  construirNivel(NIVEL_1);
}


function draw() {
  background(40);

  // NOTA EN WEBGL: el origen (0,0) está en el centro.
  // Los menús se dibujan desde el centro; el juego se traslada a la esquina superior izquierda.

  if (estadoPantalla === "inicio") {
    pantalla_inicio();
  } else if (estadoPantalla === "juego") {
    actualizarJuego();
    actualizarParticulas(min(deltaTime, CONFIG.MAX_DELTA_MS));
    dibujarEscenaJuego();
  } else if (estadoPantalla === "muerte") {
    // La física se detiene; el humo sigue y después aparece el game over
    tiempoMuerteMs += deltaTime;
    actualizarParticulas(min(deltaTime, CONFIG.MAX_DELTA_MS));
    dibujarEscenaJuego();
    if (tiempoMuerteMs >= CONFIG.ANIMACION_MUERTE_MS) estadoPantalla = "gameover";
  } else if (estadoPantalla === "gameover") {
    dibujarEscenaJuego(); // Última imagen de la partida, congelada de fondo
    pantalla_reinicio();
  } else if (estadoPantalla === "victoria") {
    tiempoVictoriaMs += deltaTime;
    actualizarParticulas(min(deltaTime, CONFIG.MAX_DELTA_MS));
    dibujarEscenaJuego();
    if (tiempoVictoriaMs >= CONFIG.ENTRADA_VICTORIA_MS) pantalla_victoria();
  }
}


  // ==========================================
  //  BUCLE DE JUEGO (paso de física fijo)
  // ==========================================

// Simula los pasos de física que correspondan al tiempo real transcurrido.
// Así el juego va a la misma velocidad a 30, 60 o 144 FPS.
function actualizarJuego() {
  acumuladorFisica += min(deltaTime, CONFIG.MAX_DELTA_MS);

  let pasos = 0;
  while (acumuladorFisica >= CONFIG.PASO_FISICA_MS && pasos < CONFIG.MAX_PASOS_POR_FRAME) {
    pasoDeJuego(CONFIG.PASO_FISICA_MS);
    acumuladorFisica -= CONFIG.PASO_FISICA_MS;
    pasos++;

    if (estadoPantalla !== "juego") break; // Murió alguien o ganaron: no seguir simulando
  }

  // Si el equipo va demasiado lento, descartamos el atraso en vez de acumularlo
  if (pasos === CONFIG.MAX_PASOS_POR_FRAME) acumuladorFisica = 0;
}

function pasoDeJuego(dt) {
  for (let p of personajes) p.antesDeFisica(dt);
  for (let caja of listaCajas) caja.antesDeFisica();

  Engine.update(engine, dt);

  for (let p of personajes) p.despuesDeFisica();

  for (let pal of listaPalancas) pal.actualizar();
  for (let plat of listaPlataformas) plat.actualizar();
  for (let puerta of listaPuertas) puerta.actualizar();
  for (let gema of listaGemas) gema.actualizar(dt);

  tiempoJuego += dt / 1000;
  tiempoPartidaMs += dt;

  comprobarVictoria(dt);

  // Los cambios de pantalla se aplican fuera de los eventos de colisión
  if (estadoPendiente) {
    estadoPantalla = estadoPendiente;
    estadoPendiente = null;
  }
}

// Llamado por las entidades (ej: una piscina) cuando un personaje muere:
// se convierte en humo y, al terminar la animación, aparece el game over
function personajeMuere(personaje) {
  if (personaje.muerto) return;
  personaje.muerto = true;
  emitirHumo(personaje.cuerpo.position.x, personaje.cuerpo.bounds.max.y, personaje.colorBrillo);
  tiempoMuerteMs = 0;
  estadoPendiente = "muerte";
}

// Se gana cuando cada personaje lleva un momento frente a su puerta, los dos a la vez
function comprobarVictoria(dt) {
  if (listaPuertas.length > 0 && listaPuertas.every(p => p.ocupada)) {
    tiempoEnPuertasMs += dt;
  } else {
    tiempoEnPuertasMs = 0;
  }

  if (tiempoEnPuertasMs >= CONFIG.ESPERA_VICTORIA_MS && !estadoPendiente) {
    let gemas = contarGemas();
    resultado = {
      tiempoMs: tiempoPartidaMs,
      gemas: gemas,
      calificacion: calificarPartida(tiempoPartidaMs, nivelActual.tiempoObjetivoS * 1000,
                                     gemas.recogidas, gemas.total)
    };
    tiempoVictoriaMs = 0;
    estadoPendiente = "victoria";
  }
}

// Calificación al estilo del original: A si se cumple el tiempo objetivo y se
// recogen todas las gemas, B si se cumple solo una de las dos, C si ninguna.
function calificarPartida(tiempoMs, objetivoMs, gemasRecogidas, totalGemas) {
  let cumplidos = 0;
  if (tiempoMs <= objetivoMs) cumplidos++;
  if (gemasRecogidas >= totalGemas) cumplidos++;
  return ['C', 'B', 'A'][cumplidos];
}

function iniciarPartida() {
  reiniciarNivel();
  tiempoPartidaMs = 0;
  tiempoEnPuertasMs = 0;
  resultado = null;
  limpiarParticulas();
  acumuladorFisica = 0;
  estadoPendiente = null;
  estadoPantalla = "juego";
}


  // ==========================================
  //  ENTRADA
  // ==========================================

function mousePressed() {
  // Ajustamos el cursor al centro debido al canvas WEBGL
  let mX = mouseX - width / 2;
  let mY = mouseY - height / 2;

  if (estadoPantalla === "inicio") {
    // Botón Play circular (centro en 0, 100)
    if (dist(mX, mY, 0, 100) < 45) {
      iniciarPartida();
    }
  } else if (estadoPantalla === "gameover" || pantallaVictoriaVisible()) {
    // Click en cualquier lado: volver al menú principal
    estadoPantalla = "inicio";
  }
}

function pantallaVictoriaVisible() {
  return estadoPantalla === "victoria" && tiempoVictoriaMs >= CONFIG.ENTRADA_VICTORIA_MS;
}

function keyPressed() {
  if (keyCode === CONFIG.TECLA_DEPURACION) {
    alternarDepuracion();
    return false; // Evita la acción por defecto del navegador para F2
  }

  if (estadoPantalla === "juego") {
    for (let p of personajes) p.revisarSalto(keyCode);
  } else if (estadoPantalla === "gameover" || pantallaVictoriaVisible()) {
    if (key === 'r' || key === 'R') {
      iniciarPartida();
    }
  }
}


  // ==========================================
  //  PANTALLA INICIO
  // ==========================================

function pantalla_inicio() {
  push();
  // En WEBGL, centramos la imagen en el origen (0,0)
  imageMode(CENTER);
  image(imgInicio, 0, 0, CONFIG.ANCHO, CONFIG.ALTO);

  // --- BOTÓN DE PLAY (Círculo Morado con triángulo Blanco) ---
  noStroke();
  fill(120, 40, 180); // Fondo morado
  ellipse(0, 100, 90, 90);

  fill(255); // Triángulo blanco de Play
  triangle(-10, 85, -10, 115, 15, 100);

  // --- RECUADRO DE INSTRUCCIONES ABAJO ---
  fill(50, 20, 80, 220); // Rectángulo morado oscuro semitransparente
  rectMode(CENTER);
  rect(0, 280, 800, 140, 15); // Bordes redondeados

  textAlign(CENTER, CENTER);
  textFont(fuente_juego);
  textSize(16);
  fill(255);
  text("¡Ayuda a estos dos heroes en su aventura! Evita los peligros.", 0, 245);
  text("Controles: Fireboy [Flechas del teclado]  |  Watergirl [A, W, D]", 0, 285);
  textSize(18);
  fill(255, 200, 0);
  text("HAZ CLICK EN EL BOTON DE PLAY PARA EMPEZAR", 0, 325);
  pop();
}

  // ==========================================
  //  PANTALLA JUEGO
  // ==========================================

function dibujarEscenaJuego() {
  push();
  translate(-width / 2, -height / 2);
  dibujarJuego();
  dibujarHUD();
  if (modoDepuracion) dibujarDepuracion();
  pop();
}

// Solo dibuja: toda la lógica está en pasoDeJuego()
function dibujarJuego() {
  noStroke();

  // Sombra del escenario
  fill(0, 0, 0, 100);
  for (let p of paredesYSuelos) {
    push(); translate(4, 4); dibujarCuerpo(p); pop();
  }

  // Escenario (queda tapado por el fondo; útil si se quita la imagen)
  fill(255, 127, 39);
  for (let p of paredesYSuelos) dibujarCuerpo(p);

  image(imgBosque, 0, 0);

  for (let bot of listaBotones) bot.dibujar();
  for (let pal of listaPalancas) pal.dibujar();
  for (let plat of listaPlataformas) plat.dibujar();
  for (let puerta of listaPuertas) puerta.dibujar();
  for (let gema of listaGemas) gema.dibujar();
  for (let caja of listaCajas) caja.dibujar();

  // Shaders de Piscinas y Personajes
  for (let pisc of piscinas) pisc.dibujar();
  resetShader();

  // Al ganar, los personajes entran por su puerta
  for (let p of personajes) {
    if (estadoPantalla === "victoria") p.dibujarGanando(tiempoVictoriaMs);
    else p.dibujar();
  }
  dibujarParticulas();
}

  // ==========================================
  //  PANTALLA GAMEOVER
  // ==========================================

// En WEBGL, borrar la profundidad hace que lo siguiente se dibuje por encima de todo
function dibujarEncimaDeTodo() {
  drawingContext.clear(drawingContext.DEPTH_BUFFER_BIT);
}

function pantalla_reinicio() {
  dibujarEncimaDeTodo();
  push();
  // Fondo oscuro transparente sobre la última imagen del juego
  fill(0, 0, 0, 180);
  rectMode(CENTER);
  rect(0, 0, width, height);

  // Cuadro de diálogo estilo madera
  fill(139, 69, 19, 240); // Marrón madera
  stroke(255, 200, 0);
  strokeWeight(4);
  rect(0, 0, 580, 350, 20);

  noStroke();
  textAlign(CENTER, CENTER);
  textFont(fuente_juego);
  fill(255, 215, 0); // Dorado
  textSize(42);
  text("GAME OVER", 0, -100);

  fill(255);
  textSize(24);
  text("PRESIONA R PARA VOLVER A INTENTAR", 0, 20);

  fill(200);
  textSize(18);
  text("O haz click en cualquier lado para ir al menu", 0, 80); // La fuente no tiene tildes
  pop();
}

  // ==========================================
  //  PANTALLA VICTORIA
  // ==========================================

function pantalla_victoria() {
  dibujarEncimaDeTodo();
  push();
  fill(0, 0, 0, 160);
  rectMode(CENTER);
  rect(0, 0, width, height);

  // Cuadro de diálogo estilo madera (como el de game over)
  fill(139, 69, 19, 240);
  stroke(255, 200, 0);
  strokeWeight(4);
  rect(0, 0, 580, 420, 20);

  noStroke();
  textAlign(CENTER, CENTER);
  textFont(fuente_juego);

  fill(255, 215, 0);
  textSize(38);
  text("NIVEL COMPLETADO", 0, -150);

  fill(255);
  textSize(24);
  text("TIEMPO: " + formatearTiempo(resultado.tiempoMs), 0, -90);
  textSize(16);
  fill(220);
  text("OBJETIVO: " + formatearTiempo(nivelActual.tiempoObjetivoS * 1000), 0, -62);

  fill(255);
  textSize(24);
  text("GEMAS: " + resultado.gemas.recogidas + " / " + resultado.gemas.total, 0, -22);

  // Calificación grande, con color según la nota
  let colores = { A: [255, 215, 0], B: [200, 200, 210], C: [205, 127, 50] };
  textSize(20);
  fill(255);
  text("CALIFICACION", 0, 22);
  fill(...colores[resultado.calificacion]);
  textSize(72);
  text(resultado.calificacion, 0, 77);

  fill(255);
  textSize(18);
  text("PRESIONA R PARA JUGAR DE NUEVO", 0, 150);
  fill(200);
  textSize(16);
  text("O haz click en cualquier lado para ir al menu", 0, 180);
  pop();
}
