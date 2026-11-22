  // ==========================================
  //  DATOS DEL NIVEL 2 (Forest Temple)
  // ==========================================
// Solo datos: la construcción la hace construirNivel() en nivel.js.
// Las coordenadas son píxeles del fondo backgame_level2.png (1013x761, origen arriba a la izquierda).
// Ese fondo lo genera herramientas/preparar_nivel2.py a partir de la captura original
// backgame_level2_ref.png, quitando lo que ahora se mueve (troncos, compuerta, puente).
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

  // Plataformas móviles. desplazamiento = [dx, dy] desde el reposo hasta la posición activada.
  // tapa = zona del fondo que se redibuja encima: la parte de la barra metida en la pared no se ve.
  plataformas: [
    // Compuerta del cuarto piso: sube y se esconde en el techo
    { id: 'compuerta', esquinas: [495, 440, 516, 539], velocidad: 2.0, desplazamiento: [0, -52],
      tapa: [489, 386, 522, 440] },
    // Puente del piso de las puertas: sale de la pared derecha y cubre el hueco
    { id: 'puente', esquinas: [561, 128, 691, 152], velocidad: 2.0, desplazamiento: [-118, 0],
      tapa: [569, 120, 700, 160] }
  ],

  // Troncos colgantes sobre las piscinas de ácido (ver pendulo.js). Están quietos hasta que
  // un personaje los mueve: se balancean al caer o caminar encima y se inclinan con su peso.
  // ancla = centro de la bola del fondo; largo = cadena hasta el borde superior del tronco.
  pendulos: [
    { ancla: [324, 192], largo: 144, ancho: 100, alto: 21 },
    { ancla: [686, 192], largo: 144, ancho: 100, alto: 21 }
  ],

  // Palancas: activan su plataforma cuando están hacia la 'izquierda'
  palancas: [
  ],

  // Cajas de piedra empujables, por esquinas [xIni, yIni, xFin, yFin] (deben ser cuadradas).
  // La del original está en el pasillo estrecho del cuarto nivel, sobre el bloque central.
  cajas: [
  ],
    
  // Gemas: [x, y] del centro. Rojas solo para Fireboy, azules solo para Watergirl.
  // Posiciones medidas en la captura del juego original (Resources/images/nivel2.png).
  gemas: {
    fuego: [
      [632, 631],   // Sobre la piscina de lava del quinto piso
      [709, 631],
      [219, 708],   // Sobre la piscina de lava del suelo
      [322, 708],
      [400, 502],   // Cuarto piso
      [735, 502],
      [477, 347],   // Sobre el bloque central, entre los troncos
      [477, 89]     // Sobre el hueco del piso de las puertas
    ],
    agua: [
      [224, 630],   // Sobre la piscina de agua del quinto piso
      [328, 630],
      [637, 708],   // Sobre la piscina de agua del suelo
      [715, 708],
      [276, 502],   // Cuarto piso
      [611, 502],
      [534, 347],   // Sobre el bloque central, entre los troncos
      [534, 89]     // Sobre el hueco del piso de las puertas
    ]
  },

  // Puertas de salida: esquinas de la hoja de cada puerta en el fondo
  puertas: [
    { esquinas: [50, 60, 94, 120], tipo: 'fuego' },
    { esquinas: [128, 60, 172, 120], tipo: 'agua' }
  ],

  // Botones: activan su plataforma mientras alguien los pisa.
  // arte = tapa del botón dibujado en el fondo, que se hunde al pisarlo.
  botones: [
    { esquinas: [240, 120, 278, 131], plataforma: 'puente',    arte: [247, 110, 271, 120] },  // Piso de las puertas, izquierda
    { esquinas: [730, 120, 768, 131], plataforma: 'puente',    arte: [737, 110, 761, 120] },  // Piso de las puertas, derecha
    { esquinas: [188, 530, 226, 541], plataforma: 'compuerta', arte: [195, 522, 219, 532] },  // Cuarto piso, izquierda
    { esquinas: [782, 530, 820, 541], plataforma: 'compuerta', arte: [789, 522, 813, 532] }   // Cuarto piso, derecha
  ]
};
