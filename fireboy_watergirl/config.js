  // ==========================================
  //  CONFIGURACIÓN GENERAL DEL JUEGO
  // ==========================================
// Solo valores literales: este archivo se evalúa antes de que p5 arranque, por eso
// las teclas van como códigos numéricos y no con constantes como LEFT_ARROW.

const CONFIG = {
  ANCHO: 1019,
  ALTO: 769,

  // Paso fijo de la física: la simulación avanza igual sin importar los FPS
  PASO_FISICA_MS: 1000 / 60,
  MAX_PASOS_POR_FRAME: 5,   // Si el equipo se atrasa mucho, se descarta el tiempo sobrante
  MAX_DELTA_MS: 250,        // Evita un "salto" enorme al volver de otra pestaña

  TECLA_DEPURACION: 113     // F2
};

// Teclas de cada personaje según su elemento
const TECLAS = {
  fuego: { izquierda: 37, derecha: 39, salto: 38 },  // Flechas
  agua:  { izquierda: 65, derecha: 68, salto: 87 }   // A, D, W
};

// Categorías de colisión (bits). Dos cuerpos chocan solo si la máscara de cada uno
// incluye la categoría del otro.
const CATEGORIA = {
  ESCENARIO: 0x0001,  // Paredes, suelos, rampas, plataformas móviles
  PERSONAJE: 0x0002,
  CAJA:      0x0004,  // Reservada para las piedras empujables (Fase 5)
  SENSOR:    0x0008   // Piscinas, botones, palancas
};

// Filtros listos para pasar en las opciones de los cuerpos de Matter.js.
// Los personajes NO chocan entre sí: en el original Fireboy y Watergirl se atraviesan.
const FILTRO = {
  ESCENARIO: { category: CATEGORIA.ESCENARIO, mask: CATEGORIA.PERSONAJE | CATEGORIA.CAJA },
  PERSONAJE: { category: CATEGORIA.PERSONAJE, mask: CATEGORIA.ESCENARIO | CATEGORIA.CAJA | CATEGORIA.SENSOR },
  SENSOR:    { category: CATEGORIA.SENSOR,    mask: CATEGORIA.PERSONAJE | CATEGORIA.CAJA }
};
