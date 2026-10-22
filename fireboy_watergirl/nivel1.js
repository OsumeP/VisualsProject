  // ==========================================
  //  DATOS DEL NIVEL 1 (Forest Temple)
  // ==========================================
// Solo datos: la construcción la hace construirNivel() en nivel.js.
// Las coordenadas son píxeles del fondo backgame.png (1019x769, origen arriba a la izquierda).
// Las conexiones entre elementos se hacen por id (ej: un botón indica qué plataforma mueve).

const NIVEL_1 = {

  // Posición inicial (centro del cuerpo) de cada personaje
  aparicion: {
    fuego: { x: 100, y: 680 },
    agua:  { x: 100, y: 550 }
  },

  // Bloques estáticos por esquinas: [xIni, yIni, xFin, yFin]
  paredes: [
    [0, 0, 1010, 30],       // R1: Techo superior
    [0, 30, 30, 730],       // R2: Pared izquierda
    [980, 30, 1010, 760],   // R3: Pared derecha

    [0, 725, 472, 760],     // R4: Suelo inferior izquierdo
    [472, 744, 597, 760],   // R5: Fondo piscina de lava
    [597, 725, 680, 760],   // R6: Isla separadora inferior
    [680, 744, 805, 760],   // R7: Fondo piscina de agua
    [800, 724, 980, 760],   // R8: Suelo inferior derecho
    [905, 680, 980, 730],   // R9: Escalón inferior derecho
    [932, 647, 980, 685],   // R9: Escalón inferior derecho arriba
    [30, 621, 340, 651],    // R10: Plataforma segundo piso watergirl

    [30, 182, 160, 290],    // R11: Bloque superior cuarto nivel
    [30, 284, 882, 315],    // R12: Plataforma cuarto nivel
    [750, 314, 882, 340],   // Cuarto nivel
    [490, 235, 673, 287],   // Cuarto nivel

    [30, 518, 440, 548],    // R14: Plataforma baja izquierda 2 nivel
    [440, 570, 630, 600],   // R14: Plataforma baja izquierda
    [630, 584, 758, 600],   // Fondo piscina de ácido
    [758, 570, 855, 600],   // Lado derecho piscina de ácido

    [128, 390, 520, 417],   // R13: Plataforma flotante central tercer nivel arriba
    [495, 415, 980, 445],   // Tercer nivel abajo
    [934, 445, 980, 524],   // Tercer nivel derecha
    [850, 445, 934, 470],   // Tercer nivel derecha

    [285, 158, 980, 190],   // Quinto nivel (piso de las puertas)
    [285, 190, 420, 240],
    [285, 135, 370, 160],
    [260, 105, 320, 135],
    [700, 130, 780, 160],

    [619, 600, 650, 624]    // Parte de abajo de la piscina de ácido
  ],

  // Rampas triangulares por sus tres vértices: [x1, y1, x2, y2, x3, y3]
  rampas: [
    [650, 624, 650, 600, 680, 592],
    [619, 624, 619, 600, 596, 600],
    [905, 680, 932, 685, 932, 647],  // Derecha abajo

    [440, 548, 392, 548, 440, 600],  // Segundo nivel
    [440, 518, 440, 570, 495, 570],  // Segundo nivel

    [520, 390, 520, 415, 550, 415],  // Tercer nivel arriba

    [495, 417, 495, 445, 465, 417],  // Tercer nivel abajo
    [850, 470, 934, 470, 934, 524],  // Tercer nivel abajo
    [850, 470, 850, 445, 830, 445],  // Tercer nivel abajo

    [855, 570, 855, 600, 885, 600],

    [673, 290, 673, 235, 730, 290],
    [725, 315, 750, 315, 750, 340],
    [260, 105, 260, 135, 232, 135],
    [320, 135, 320, 105, 345, 135],
    [370, 160, 370, 135, 400, 160],
    [285, 135, 260, 135, 285, 160],
    [780, 158, 780, 130, 810, 158],
    [700, 158, 700, 130, 670, 158]
  ],

  // Piscinas (sensores). tipo: 'lava' | 'agua' | 'acido'
  piscinas: [
    { esquinas: [472, 725, 597, 744], tipo: 'lava' },
    { esquinas: [675, 725, 800, 744], tipo: 'agua' },
    { esquinas: [630, 570, 755, 584], tipo: 'acido' }
  ],

  // Plataformas móviles. recorrido = cuántos píxeles bajan al activarse
  plataformas: [
    { id: 'izquierda', esquinas: [30, 395, 128, 412],  velocidad: 2.0, recorrido: 80 },
    { id: 'derecha',   esquinas: [882, 315, 980, 332], velocidad: 2.0, recorrido: 80 }
  ],

  // Palancas: activan su plataforma cuando están hacia la 'izquierda'
  palancas: [
    { x: 275, y: 520, estado: 'derecha', plataforma: 'izquierda' }
  ],

  // Botones: activan su plataforma mientras alguien los pisa
  botones: [
    { esquinas: [265, 385, 305, 395], plataforma: 'derecha' },  // Botón tercer nivel
    { esquinas: [760, 280, 800, 290], plataforma: 'derecha' }   // Botón cuarto nivel
  ]
};
