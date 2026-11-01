  // ==========================================
  //  HUD (reloj y contador de gemas)
  // ==========================================
// Se dibuja dentro del translate del juego (coordenadas del nivel).

// Centro de la placa de madera del reloj en el fondo
const RELOJ = { x: 502, y: 11, tamano: 22 };

// Convierte milisegundos a "mm:ss" (tope en 99:59, como un reloj de dos dígitos)
function formatearTiempo(ms) {
  let totalSegundos = min(floor(ms / 1000), 99 * 60 + 59);
  let minutos = floor(totalSegundos / 60);
  let segundos = totalSegundos % 60;
  return nf(minutos, 2) + ":" + nf(segundos, 2);
}

// Altavoz dibujado en el fondo (esquina superior derecha): click = silenciar
const ALTAVOZ = { x: 975, y: 21, radioClick: 16 };

function clicEnAltavoz(x, y) {
  return dist(x, y, ALTAVOZ.x, ALTAVOZ.y) <= ALTAVOZ.radioClick;
}

// semicirculo amarillo abajo mitad pantalla: click = llama pantalla de escape
const BOTONAMARILLO = { x: 504, y: 759, radioClick: 16 };

function clicEnBotonAmarillo(x, y) {
  return dist(x, y, BOTONAMARILLO.x, BOTONAMARILLO.y) <= BOTONAMARILLO.radioClick;
}

function dibujarHUD() {
  dibujarReloj(formatearTiempo(tiempoPartidaMs));
  dibujarEstadoSonido();
  dibujarContadorGemas('fuego', 48);
  dibujarContadorGemas('agua', 140);
  dibujarBotonAmarillo();
}

// Icono de gema + "recogidas/total", sobre el techo de piedra (esquina superior izquierda)
function dibujarContadorGemas(tipo, x) {
  let { recogidas, total } = contarGemas(tipo);
  let colorGema = (tipo === 'fuego') ? [255, 60, 40] : [60, 190, 255];

  push();
  dibujarFormaGema(x, 14, 0.8, colorGema);

  textFont(fuente_juego);
  textSize(16);
  textAlign(LEFT, CENTER);
  let texto = recogidas + "/" + total;
  fill(20, 15, 5);
  for (let [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) text(texto, x + 14 + dx, 13 + dy);
  fill(255);
  text(texto, x + 14, 13);
  pop();
}

function dibujarReloj(texto) {
  push();
  textFont(fuente_juego);
  textSize(RELOJ.tamano);
  textAlign(CENTER, CENTER);

  // En WEBGL el texto no admite stroke(): simulamos el borde oscuro
  // dibujando el texto desplazado en varias direcciones
  fill(40, 20, 0);
  for (let [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    text(texto, RELOJ.x + dx, RELOJ.y + dy);
  }

  fill(255, 200, 40); // Dorado
  text(texto, RELOJ.x, RELOJ.y);
  pop();
}

// Ondas junto al altavoz si hay sonido; una X roja si está silenciado.
// Solo rellenos (en WEBGL las líneas quedan por delante de los menús).
function dibujarEstadoSonido() {
  push();
  noStroke();
  translate(ALTAVOZ.x + 12, ALTAVOZ.y);
  if (audio.silenciado) {
    fill(230, 40, 30);
    rectMode(CENTER);
    for (let angulo of [QUARTER_PI, -QUARTER_PI]) {
      push();
      rotate(angulo);
      rect(0, 0, 14, 3.5, 1);
      pop();
    }
  } else {
    // Dos arcos hechos de puntos
    fill(255, 200, 40);
    for (let radio of [4, 8]) {
      for (let a = -0.9; a <= 0.91; a += 0.3) ellipse(radio * cos(a), radio * sin(a), 2.4);
    }
  }
  pop();
}

// Circulo para el boton amarillo de abajo
function dibujarBotonAmarillo() {
  if (clicEnBotonAmarillo(mouseX, mouseY)) {
    push();
    noStroke();
    
    // Calculamos el pulso del brillo basado en el tiempo de juego
    // Multiplicamos por 4 para que la animación sea fluida y rítmica
    let t = tiempoJuego * 4;
    let brillo = 0.5 + 0.1 * sin(t); // Oscila suavemente entre 0.0 y 1.0

    // 1. Amplía y reduce las dimensiones:
    // El tamaño base horizontal es 58 y el vertical 42. El pulso le suma hasta 8px y 6px respectivamente.
    let ancho = 50 + 8 * brillo;
    let alto = 50 + 6 * brillo;

    // 2. Modifica la opacidad de fondo:
    // La opacidad mínima base será 80 (cuando reduce) y la máxima 160 (cuando amplía)
    let opacidad = 80 + 80 * brillo;
    
    fill(0, 255, 50, opacidad); 
    
    // Nos posicionamos manteniendo el ajuste de altura (-4) para que calce en el fondo
    translate(BOTONAMARILLO.x, BOTONAMARILLO.y);
    
    // Dibujamos el arco con el tamaño dinámico que oscila en el tiempo
    arc(0, 0, ancho, alto, PI, TWO_PI); 
    pop();
  }
}
