  // ==========================================
  //  DATOS DEL NIVEL 3 (Forest Temple)
  // ==========================================
// Solo datos: la construcción la hace construirNivel() en nivel.js.
// Las coordenadas son píxeles del fondo backgame_level3.png (1013x761, origen arriba a la izquierda).
// Ese fondo lo genera herramientas/preparar_nivel3.py a partir de la captura original
// backgame_level3_ref.png, quitando lo que ahora se mueve (troncos, compuerta, puente).
// Las conexiones entre elementos se hacen por id (ej: un botón indica qué plataforma mueve).

const NIVEL_3 = {
  id: 'nivel3',                              // Clave de los récords: no cambiarla
  nombre: 'Forest Temple',
  fondo: 'Resources/images/backgame_level3.png',    // Arte del nivel (las coordenadas de abajo son sus píxeles)

  // Con este tiempo o menos (y todas las gemas) se obtiene la calificación A
  tiempoObjetivoS: 60,

  // Posición inicial (centro del cuerpo) de cada personaje
  aparicion: {
    fuego: { x: 52, y: 667 },
    agua:  { x: 923, y: 667 }
  },

  // Bloques estáticos por esquinas: [xIni, yIni, xFin, yFin]
  paredes: [
    [0, 0, 1010, 30],       // Techo superior
    [0, 30, 30, 725],       // Pared izquierda
    [980, 30, 1010, 760],   // Pared derecha

    [133, 103, 462, 133], //superior izquierda
    [546, 103, 881, 133],   //superior derecha 
    [234, 133, 264, 463],   //vertical izquierda
    [749, 133, 779, 463],    //vertical derecha
    [264, 346, 394, 362],   //plataforma fuego arriba
    [621, 346, 749, 363],    //plataforma agua arriba
    [495, 207, 525, 462],    //vertical central
    [159, 464, 851, 493],    //horizontal principal
    [30, 386, 161, 414],    //plataforma viento1
    [854, 386, 980, 414],    //plataforma viento2

 
    [30, 515, 84, 576],    //bloque nivel2 izq
    [30, 578, 418, 594],    //bloque nivel2 izq
    [84, 564, 165, 576],     //bloque nivel2 izq
    [363, 564, 418, 576],     //bloque nivel2 izq
    [594, 578, 980, 594],     //bloque nivel2 der
    [594, 563, 652, 576],     //bloque nivel2 der
    [850, 563, 980, 576],    //bloque nivel2 der
    [930, 517, 980, 576],    //bloque nivel2 der

    [30, 733, 980, 750],     // bloque inferior
    [30, 720, 164, 732],    //bloque nivel1 izq
    [440, 644, 572, 728],    //cubo central nivel 1
    [875, 720, 980, 732],     //bloque nivel1 der
    [905,364,980,383],  //bloque nivel1 der
    [30,364,107,383],

  ],


  // Rampas triangulares por sus tres vértices: [x1, y1, x2, y2, x3, y3]
  rampas: [

    [441,644 ,441,726, 359,726],
    [571,644 ,571,726, 658,726],
    [158, 464,158, 490, 135, 490],
    [853, 464,853, 490, 875, 490],    
    [492, 411, 492, 462, 444, 462],
    [524, 411, 524, 462, 572, 462],
    [492, 208, 492, 280, 415, 280],    
    [520, 208, 520, 280, 593, 280],    
    [416, 285, 466, 285, 466, 336],    
    [550, 285, 595, 285, 556, 336], 

    //rampas piscinas
    [162, 719, 162, 732, 182, 732], 
    [362, 719, 343, 732, 360, 732],

    [648, 719, 650, 732, 673, 732],
    [880, 719, 880, 732, 857, 732],
    //rampas nivel2
    [161, 564, 161, 579, 187, 579],
    [366, 563, 366, 579, 343, 579],
    
    [650, 564, 649, 579, 672, 579],
    [851, 563, 846, 579, 832, 579],
    
    [622, 335, 619, 348, 647, 348],                    
    [750, 335, 725, 348, 750, 348],                    

    [263, 335, 264, 346, 281, 346],                    
    [391, 335, 391, 346, 369, 346],                    

  ],

  // Piscinas. tipo: 'lava' | 'agua' | 'acido'
  // esquinas: [xIni, yBorde, xFin, yFondo] del hueco (el fondo es una pared de la lista de arriba).
  // talud: ancho de los lados inclinados; construirNivel() crea esas rampas para poder
  // entrar y salir caminando, como en el original.
  piscinas: [
    { esquinas: [165,719 ,360 ,731 ], tipo: 'lava',  talud: 11 }, //nivel 3 izquierda
    { esquinas: [656,719 ,874 ,731 ], tipo: 'agua',  talud: 11 }, //nivel 3 derecha   
    { esquinas: [168, 566, 360, 578], tipo: 'agua',  talud: 11 },
    { esquinas: [658, 566, 845, 578], tipo: 'lava', talud: 15 },
    { esquinas: [627, 335, 759, 347], tipo: 'agua',  talud: 11 },
    { esquinas: [267,335,385,347], tipo: 'lava', talud: 15 }
  ],

  // Plataformas móviles. desplazamiento = [dx, dy] desde el reposo hasta la posición activada.
  // tapa = zona del fondo que se redibuja encima: la parte de la barra metida en la pared no se ve.
  plataformas: [
  ],

  // Troncos colgantes sobre las piscinas de ácido (ver pendulo.js). Están quietos hasta que
  // un personaje los mueve: se balancean al caer o caminar encima y se inclinan con su peso.
  // ancla = centro de la bola del fondo; largo = cadena hasta el borde superior del tronco.
  pendulos: [
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
      [939,144],   // Sobre el viento
      [939,221],   // Sobre el viento
      [939,299],  // Sobre el viento
      [697,554],   // Sobre la piscina segundo nivel
      [787,554],   // Sobre la piscina segundo nivel
      [221,694],   // Sobre la piscina de abajo
      [295,694],   // Sobre la piscina de abajo
      [376,654],   // en nivel 1
      [682,69],   // el mas alto
      [298,321],   // Sobre la piscina pequeña
      [595,244],   // Sobre  plataforma rombo

    ],
    agua: [
      [66,143],   // Sobre el viento
      [66,221],   // Sobre el viento
      [66,299],   // Sobre el viento
      [224,554],   // Sobre la piscina segundo nivel
      [299,554],   // Sobre la piscina segundo nivel
      [699,694],   // Sobre la piscina de abajo
      [810,694],   // Sobre la piscina de abajo
      [630,654],   // en nivel 1
      [323,69],   // Sel mas alto
      [720,321],   // Sobre la piscina pequeña
      [400,244],   // Sobre plataforma rombo
      
    ]
  },

  // Puertas de salida: esquinas de la hoja de cada puerta en el fondo
  puertas: [
    { esquinas: [306, 400, 350, 460], tipo: 'fuego' },
    { esquinas: [660, 400, 704, 460], tipo: 'agua' }
  ],

  // Botones: activan su plataforma mientras alguien los pisa.
  // arte = tapa del botón dibujado en el fondo, que se hunde al pisarlo.
  botones: [
  ]
};

