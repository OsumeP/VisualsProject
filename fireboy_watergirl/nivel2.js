  // ==========================================
  //  DATOS DEL NIVEL 2 (Forest Temple)
  // ==========================================
// Solo datos: la construcción la hace construirNivel() en nivel.js.
// Las coordenadas son píxeles del fondo backgame.png (1019x769, origen arriba a la izquierda).
// Las conexiones entre elementos se hacen por id (ej: un botón indica qué plataforma mueve).

const NIVEL_2 = {
  id: 'nivel2',                              // Clave de los récords: no cambiarla
  nombre: 'Forest Temple',
  fondo: 'Resources/images/backgame_level2.png',    // Arte del nivel (las coordenadas de abajo son sus píxeles)

  // Con este tiempo o menos (y todas las gemas) se obtiene la calificación A
  tiempoObjetivoS: 60,

  // Posición inicial (centro del cuerpo) de cada personaje
  aparicion: {
    fuego: { x: 70, y: 670 },
    agua:  { x: 120, y: 670 }
  },

  // Bloques estáticos por esquinas: [xIni, yIni, xFin, yFin]
  paredes: [
    [0, 0, 1010, 30],       // Techo superior
    [0, 30, 30, 725],       // Pared izquierda
    [980, 30, 1010, 760],   // Pared derecha
    [30, 127, 443, 157],     //Nivel 2 izquierda
    [569, 127, 802, 157],   //Nivel 2 derecha
    [748, 157, 802, 179],   //Nivel 2 derecha
    [775, 179, 881, 209],   //Nivel 2 derecha



    [157, 410, 214, 439],   // nivel 3
    [214,424 ,980 ,439 ],   // nivel 3 largo
    [441,387 ,571 ,424 ],   // nivel 3 encima

    [772,414 ,853 ,424 ],   // nivel 3 otra
    [853, 333, 904, 424],   // nivel 3 otra
    [905, 257, 980, 424],   // nivel 3 otra

    [30, 465, 110, 569],   // nivel 4
    [110, 539, 880, 569],   // nivel 4

    [155, 656, 390, 672],   // nivel 5
    [568, 656, 779, 672],   // nivel 5

    [30, 736, 980, 760],   // nivel 6
    [30, 725, 163, 736],   // nivel 6
    [163, 736, 384, 760],   // nivel 6
    [384, 725, 576, 736],   // nivel 6
    [776, 725, 980, 760],   // nivel 6
    [906, 665, 980, 725],   // nivel 6
    [958 ,618 ,980, 665],   // nivel 6

  ],


  // Rampas triangulares por sus tres vértices: [x1, y1, x2, y2, x3, y3]
  rampas: [
    [802, 127,802, 179, 853, 179], // Nivel 2 derecha
    [213, 409, 213, 424, 231, 424], //nivel 3
    [415, 424, 442, 424, 442, 410], //nivel 3
    [570, 424, 570, 412, 593, 424], //nivel 3
    [743, 424, 772, 424, 772, 413], //nivel 3

    [879, 540, 879, 569, 910, 569],  //nivel 4

    [155, 642, 155, 656, 184, 656],  //nivel 5
    [392, 642, 366, 656, 392, 656],    //nivel 5
    [568, 642, 568, 656, 595, 656],    //nivel 5
    [778, 642, 778, 656, 752, 656],    //nivel 5

    [958, 665, 958, 618, 906, 665], //nivel 6

    //[, , , , , ],
    //[, , , , , ],                            

  ],

  // Piscinas. tipo: 'lava' | 'agua' | 'acido'
  // esquinas: [xIni, yBorde, xFin, yFondo] del hueco (el fondo es una pared de la lista de arriba).
  // talud: ancho de los lados inclinados; construirNivel() crea esas rampas para poder
  // entrar y salir caminando, como en el original.
  piscinas: [
    { esquinas: [214,413 ,441 ,424 ], tipo: 'acido',  talud: 11 }, //nivel 3 izquierda
    { esquinas: [571,414 ,772 ,425 ], tipo: 'acido',  talud: 11 }, //nivel 3 derecha   
    { esquinas: [163, 645, 384, 656], tipo: 'agua',  talud: 11 },
    { esquinas: [572, 645, 772, 656], tipo: 'lava', talud: 15 },
    { esquinas: [576, 723, 776, 736], tipo: 'agua',  talud: 11 },
    { esquinas: [163, 723, 384, 736], tipo: 'lava', talud: 15 }
  ],

  // Plataformas móviles. recorrido = cuántos píxeles bajan al activarse
  plataformas: [
    { id: 'vertical', esquinas: [495, 442, 513, 540],  velocidad: 2.0, recorrido: 80 },
    { id: 'derecha',   esquinas: [560, 133,655 ,151 ], velocidad: 2.0, recorrido: 80 }
  ],

  // Palancas: activan su plataforma cuando están hacia la 'izquierda'
  palancas: [
  ],

  // Cajas de piedra empujables, por esquinas [xIni, yIni, xFin, yFin] (deben ser cuadradas).
  // La del original está en el pasillo estrecho del cuarto nivel, sobre el bloque central.
  cajas: [
  ],
    
  // Gemas: [x, y] del centro. Rojas solo para Fireboy, azules solo para Watergirl.
  // Van unos 22 px sobre el suelo para recogerlas al pasar caminando.
  gemas: {
    fuego: [
      [624, 623],   // 
      [700, 623],   // 
      [209, 698],   // 
      [312, 698],   // 
      [386, 489],   // 
      [725, 489],   // 
      [468, 334],   // 
      [466, 77],   // 
    ],
    agua: [
      [213, 623],   // 
      [309, 623],   // 
      [624, 698],   // 
      [698, 698],   // 
      [261, 489],   // 
      [593, 489],   // 
      [515, 334],   // 
      [516, 77],   // 
    ]
  },

  // Puertas de salida: esquinas de la hoja de cada puerta en el fondo
  puertas: [
    { esquinas: [50, 60, 94, 120], tipo: 'fuego' },
    { esquinas: [128, 60, 172, 120], tipo: 'agua' }
  ],

  // Botones: activan su plataforma mientras alguien los pisa
  botones: [
    { esquinas: [241, 122, 281, 132], plataforma: 'derecha' },  // Botón tercer nivel
    { esquinas: [732, 122, 772, 132], plataforma: 'derecha' },   // Botón cuarto nivel
    { esquinas: [185, 537, 225, 547], plataforma: 'vertical' },  // Botón tercer nivel
    { esquinas: [783, 537, 823, 547], plataforma: 'vertical' }   // Botón cuarto nivel

  ]
  //pendulos: [
  //  [320, 200, 150, 110, 20],
  //  [680, 200, 150, 110, 20]
 // ]
};
