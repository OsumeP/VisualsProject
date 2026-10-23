  // ==========================================
  //  ANIMACIONES DE SPRITES
  // ==========================================
// Las tiras de Resources/sprites/ y sus medidas (SPRITES, en sprites_datos.js) las genera
// herramientas/preparar_sprites.py. Cada animación tiene un punto de anclaje: el cuello en
// las cabezas, las caderas en el cuerpo y los pies en "ganar".

let imagenesSprites = {}; // imagenesSprites[elemento][animacion] = p5.Image

// Se llama desde preload()
function cargarSprites() {
  for (let elemento in SPRITES) {
    imagenesSprites[elemento] = {};
    for (let anim in SPRITES[elemento]) {
      imagenesSprites[elemento][anim] = loadImage("Resources/sprites/" + SPRITES[elemento][anim].archivo);
    }
  }
}

// Índice del cuadro que toca tras `ms` milisegundos de animación.
// Con bucle = false se queda en el último cuadro.
function cuadroPorTiempo(datos, ms, bucle = true) {
  let n = floor(ms / 1000 * datos.fps);
  return bucle ? n % datos.cuadros : min(n, datos.cuadros - 1);
}

// Dibuja un cuadro de la animación con su ancla en (x, y). voltear = mirar a la izquierda.
function dibujarSprite(elemento, anim, indice, x, y, voltear = false) {
  let d = SPRITES[elemento][anim];
  let img = imagenesSprites[elemento][anim];
  let e = d.escala;

  push();
  translate(x, y);
  if (voltear) scale(-1, 1);
  image(img, -d.anclaX * e, -d.anclaY * e, d.ancho * e, d.alto * e,
        indice * d.ancho, 0, d.ancho, d.alto);
  pop();
}

// Alto en pantalla de un cuadro de la animación
function altoSprite(elemento, anim) {
  let d = SPRITES[elemento][anim];
  return d.alto * d.escala;
}
