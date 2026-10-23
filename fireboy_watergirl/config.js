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

  TECLA_DEPURACION: 113,    // F2
  TECLA_PAUSA: 80,          // P (Escape también pausa)
  TECLA_SILENCIO: 77,       // M

  ESPERA_VICTORIA_MS: 500,   // Tiempo que ambos deben estar en su puerta para ganar
  ENTRADA_VICTORIA_MS: 900,  // Duración de la animación de entrar por la puerta
  ANIMACION_MUERTE_MS: 1300  // Humo antes de mostrar el game over
};

// Movimiento de los personajes. Las velocidades están en píxeles por paso de física
// (1 paso = 1/60 s); los tiempos, en milisegundos.
const FISICA_PERSONAJE = {
  ANCHO: 30,
  ALTO: 30,
  CHAFLAN: 4,             // Esquinas redondeadas: no se enganchan en uniones y rampas

  VELOCIDAD_MAX: 4,
  ACEL_SUELO: 0.8,        // Cuánto cambia la velocidad X por paso al caminar
  FRENO_SUELO: 1.2,       // ... al soltar la tecla en el suelo
  ACEL_AIRE: 0.5,         // ... en el aire (menos control)

  FUERZA_SALTO: 8,        // Velocidad Y inicial del salto (unos 115 px de altura)
  COYOTE_MS: 90,          // Aún se puede saltar este tiempo después de dejar el suelo
  BUFFER_SALTO_MS: 110,   // Un salto pulsado justo antes de aterrizar se ejecuta al tocar suelo

  DISTANCIA_SUELO: 2,     // Píxeles bajo los pies en los que se considera "apoyado"
  DISTANCIA_AJUSTE: 8     // Al bajar rampas, se pega al suelo si está a esta distancia o menos
};

// Teclas de cada personaje según su elemento (cada acción admite varias teclas)
const TECLAS = {
  fuego: { izquierda: [37],     derecha: [39],     salto: [38] },      // Flechas
  agua:  { izquierda: [65, 70], derecha: [68, 72], salto: [87, 84] }   // A, D, W  o  F, H, T
};

// Categorías de colisión (bits). Dos cuerpos chocan solo si la máscara de cada uno
// incluye la categoría del otro.
const CATEGORIA = {
  ESCENARIO: 0x0001,  // Paredes, suelos, rampas, plataformas móviles
  PERSONAJE: 0x0002,
  CAJA:      0x0004,  // Piedras empujables
  SENSOR:    0x0008   // Piscinas, botones, palancas
};

// Filtros listos para pasar en las opciones de los cuerpos de Matter.js.
// Los personajes NO chocan entre sí: en el original Fireboy y Watergirl se atraviesan.
const FILTRO = {
  ESCENARIO: { category: CATEGORIA.ESCENARIO, mask: CATEGORIA.PERSONAJE | CATEGORIA.CAJA },
  PERSONAJE: { category: CATEGORIA.PERSONAJE, mask: CATEGORIA.ESCENARIO | CATEGORIA.CAJA | CATEGORIA.SENSOR },
  SENSOR:    { category: CATEGORIA.SENSOR,    mask: CATEGORIA.PERSONAJE | CATEGORIA.CAJA },
  CAJA:      { category: CATEGORIA.CAJA,
               mask: CATEGORIA.ESCENARIO | CATEGORIA.PERSONAJE | CATEGORIA.SENSOR | CATEGORIA.CAJA }
};
