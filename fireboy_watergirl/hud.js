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

function dibujarHUD() {
  dibujarReloj(formatearTiempo(tiempoPartidaMs));
  dibujarContadorGemas('fuego', 48);
  dibujarContadorGemas('agua', 140);
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
