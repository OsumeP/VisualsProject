// 1. Módulos obligatorios de Matter.js
const { Engine, World, Bodies, Body, Events } = Matter;
let engine, world;

let fireboy, watergirl;

// 2. Contenedores para almacenar lo que dibujaste en la imagen
let paredesYSuelos = []; // Todo lo verde
let piscinas = [];       // Todo lo MORADO (Lava, Agua, Ácido)
let listaPalancas = [];
let listaPlataformas = [];
let listaBotones = []; 

let tiempoJuego = 0;
let estadoPantalla = "inicio"; // Puede ser: "inicio", "juego" o "gameover"
let imgInicio;

function preload() {
  // Asegúrate de que el nombre coincida exactamente con tu archivo en la carpeta
  imgInicio = loadImage("Resources/images/startgame.png"); 
  imgBosque = loadImage("Resources/images/backgame.png");  
  fuente_juego = loadFont("Resources/fonts/space.ttf");
}

function setup() {
  // Ajustamos el lienzo al tamaño exacto de tu mapa analizado
  createCanvas(1019, 769, WEBGL); 

  // Compilar los shaders cargados en las variables de texto
  shaderLiquido = createShader(vsPiscina, fsPiscina);
  
  // Parte del movimiento
  engine = Engine.create();
  world = engine.world;
  
  inicializaEntorno();

  // Agregamos absolutamente todo al motor físico del mundo
  //World.add(world, [...paredesYSuelos, ...piscinas, ...botones, ...plataformas, sensorPalanca]);
  World.add(world, [...paredesYSuelos]);

  //  Eventos del juego
  Eventos_juego();

  
  // --- Personajes ---   
  // Nota: 65 = 'A', 68 = 'D', 87 = 'W'
  fireboy = new Personaje(100, 680, color(255, 50, 50), LEFT_ARROW, RIGHT_ARROW, UP_ARROW);
  fireboy.tipoElemento = 'fuego'; // <--- Identificador para las reglas

  watergirl = new Personaje(100, 550, color(50, 150, 255), 65, 68, 87);
  watergirl.tipoElemento = 'agua'; // <--- Identificador para las reglas
    
  // --- Piscinas ---
  piscinas.push(new Piscina(472, 725, 597, 744, 'lava'));
  piscinas.push(new Piscina(675, 725, 800, 744, 'agua'));
  piscinas.push(new Piscina(630, 570, 755, 584, 'acido'));
  
 
  // Los agregamos al mundo físico
  World.add(world, [fireboy, watergirl]);
}


function draw() {
  background(40);
  
  
  // NOTA EN WEBGL: El origen (0,0) está en el centro.
  // Para el juego usas tu traslación habitual, pero para los menús es más fácil trabajar desde el centro.
  
  if (estadoPantalla === "inicio") {
    pantalla_inicio();
  } else if (estadoPantalla === "juego") {
  
    // Actualizamos el motor físico SOLO si estamos jugando
    Engine.update(engine);
    tiempoJuego += 0.02;
    
    push();
    translate(-width / 2, -height / 2);
    pantalla_juego();
    pop();
  } else if (estadoPantalla === "gameover") {
    pantalla_reinicio();
  }
}



function mousePressed() {
  // Ajustamos el cursor al centro debido al canvas WEBGL
  let mX = mouseX - width / 2;
  let mY = mouseY - height / 2;
  
  if (estadoPantalla === "inicio") {
    // Detectamos si el click ocurre dentro del rango del botón Play circular (Centro en 0, 100)
    let d = dist(mX, mY, 0, 100);
    if (d < 45) { 
      estadoPantalla = "juego";
    }
  } else if (estadoPantalla === "gameover") {
    // Si hace click en la ventana de derrota, vuelve al menú principal
    estadoPantalla = "inicio";
  }
}

function keyPressed() {
  if (estadoPantalla === "juego") {
    fireboy.revisarSalto(keyCode);
    watergirl.revisarSalto(keyCode);
  } else if (estadoPantalla === "gameover") {
    // Si presionan la R (Código 82)
    if (keyCode === 82 || key === 'r' || key === 'R') {
      reiniciarNivel(); // Llama a tu función física que resetea las posiciones de Matter
      estadoPantalla = "juego";
    }
  }
}


function Eventos_juego(){

    Events.on(engine, 'beforeUpdate', function() {
      for (let bot of listaBotones) {
        bot.estaPisado = false; 
      }
    });
    // --- DETECTAR SI PISAN EL BOTÓN
    Events.on(engine, 'collisionActive', function(event) {
      let pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        let bodyA = pairs[i].bodyA;
        let bodyB = pairs[i].bodyB;
  
        for (let bot of listaBotones) {
          if ((bodyA === fireboy.cuerpo && bodyB === bot.cuerpo) || (bodyB === fireboy.cuerpo && bodyA === bot.cuerpo) ||
              (bodyA === watergirl.cuerpo && bodyB === bot.cuerpo) || (bodyB === watergirl.cuerpo && bodyA === bot.cuerpo)) {
            bot.estaPisado = true;
          }
        }
      }
    });    
    
    Events.on(engine, 'collisionStart', function(event) {
    let pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
      let bodyA = pairs[i].bodyA;
      let bodyB = pairs[i].bodyB;
      
     ///////////////////////////
      // Evaluamos cada piscina registrada en tu juego
      for (let p of piscinas) {
        
        // REGLA PARA FIREBOY
        if ((bodyA === fireboy.cuerpo && bodyB === p.cuerpo) || (bodyB === fireboy.cuerpo && bodyA === p.cuerpo)) {
          // Fireboy muere si toca Agua o Ácido
          if (p.tipo === 'agua' || p.tipo === 'acido') {
            //println("¡Fireboy murió en la piscina de " + p.tipo + "!");
            reiniciarNivel();
            estadoPantalla = "gameover";
          }
        }
        
        // REGLA PARA WATERGIRL
        if ((bodyA === watergirl.cuerpo && bodyB === p.cuerpo) || (bodyB === watergirl.cuerpo && bodyA === p.cuerpo)) {
          // Watergirl muere si toca Lava o Ácido
          if (p.tipo === 'lava' || p.tipo === 'acido') {
            //println("¡Watergirl murió en la piscina de " + p.tipo + "!");
            reiniciarNivel();
            estadoPantalla = "gameover";
          }
        }
      }
      ///////////////////////////
      
    // Dentro de tu bucle for de pairs en collisionStart:
    for (let pal of listaPalancas) {
      if ((bodyA === fireboy.cuerpo && bodyB === pal.cuerpoSensor) || (bodyB === fireboy.cuerpo && bodyA === pal.cuerpoSensor)) {
        // Si Fireboy la toca caminando a la izquierda (tecla LEFT presionada)
        if (keyIsDown(LEFT_ARROW)) {
          pal.estado = 'izquierda';
        }
        // Si la empuja hacia la derecha (tecla RIGHT presionada)
        if (keyIsDown(RIGHT_ARROW)) {
          pal.estado = 'derecha';
        }
      }
      // Repetir la misma validación para watergirl con sus códigos de tecla (65 para 'A' y 68 para 'D')
      if ((bodyA === watergirl.cuerpo && bodyB === pal.cuerpoSensor) || (bodyB === watergirl.cuerpo && bodyA === pal.cuerpoSensor)) {
        if (keyIsDown(65)) pal.estado = 'izquierda';
        if (keyIsDown(68)) pal.estado = 'derecha';
      }
    }

    }
  });
}

// Tipo puede ser: 'pared', 'piscina', 'boton', etc.
function agregarBloquePorEsquinas(xIni, yIni, xFin, yFin, tipo) {
  let ancho = xFin - xIni;
  let alto = yFin - yIni;
  let centroX = xIni + (ancho / 2);
  let centroY = yIni + (alto / 2);
  
  if (tipo === 'pared') {
    let cuerpo = Bodies.rectangle(centroX, centroY, ancho, alto, { isStatic: true });
    paredesYSuelos.push(cuerpo);
    World.add(world, cuerpo);
  } else if (tipo === 'boton') {
    let cuerpo = Bodies.rectangle(centroX, centroY, ancho, alto, { isStatic: true, isSensor: true });
    botones.push(cuerpo);
    World.add(world, cuerpo);
  }


}

function agregarRampaPorPuntos(x1, y1, x2, y2, x3, y3) {
  // 1. Agrupamos tus tres coordenadas de Paint en una lista de vértices
  let vertices = [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 }
  ];

  // 2. Calculamos el centro matemático inicial de los tres puntos
  let centroX = (x1 + x2 + x3) / 3;
  let centroY = (y1 + y2 + y3) / 3;

  // 3. Creamos el triángulo físico estático
  let rampa = Matter.Bodies.fromVertices(centroX, centroY, vertices, { isStatic: true });

  // 4. TRUCO DE CORRECCIÓN: Obligamos a Matter.js a alinearse milimétricamente
  // con las coordenadas originales de Paint, cancelando cualquier desfase interno.
  let desfasarX = centroX - rampa.position.x;
  let desfasarY = centroY - rampa.position.y;
  Matter.Body.setPosition(rampa, { x: centroX + desfasarX, y: centroY + desfasarY });

  // 5. Guardamos en tu arreglo de colisiones y lo inyectamos al mundo físico
  paredesYSuelos.push(rampa);
  World.add(world, rampa);
}


function inicializaEntorno(){

  // --- A. CREAR ELEMENTOS (Paredes y Suelos Estáticos) ---

  agregarBloquePorEsquinas(0, 0, 1010, 30, 'pared');          // R1: Techo superior
  agregarBloquePorEsquinas(0, 30, 30, 730, 'pared');         // R2: Pared izquierda (Ajustada)
  agregarBloquePorEsquinas(980, 30, 1010, 760, 'pared');     // R3: Pared derecha (Ajustada)
  
  agregarBloquePorEsquinas(0, 725, 472, 760, 'pared');       // R4: Suelo inferior izquierdo
  agregarBloquePorEsquinas(472, 744, 597, 760, 'pared');     // R5: Fondo piscina de lava
  agregarBloquePorEsquinas(597, 725, 680, 760, 'pared');     // R6: Isla separadora inferior
  agregarBloquePorEsquinas(680, 744, 805, 760, 'pared');     // R7: Fondo piscina de agua
  agregarBloquePorEsquinas(800, 724, 980, 760, 'pared');     // R8: Suelo inferior derecho
  agregarBloquePorEsquinas(905, 680, 980, 730, 'pared');     // R9: Escalón inferior derecho
  agregarBloquePorEsquinas(932,647, 980, 685, 'pared');     // R9: Escalón inferior derecho arriba  
  agregarBloquePorEsquinas(30, 621, 340, 651, 'pared');      // R10: Plataforma segundo piso watergirl
  
  agregarBloquePorEsquinas(30, 182, 160, 290, 'pared');      // R11: Bloque superior cuarto nivel
  agregarBloquePorEsquinas(30, 284, 882, 315, 'pared');      // R12: Plataforma cuarto nivel
  agregarBloquePorEsquinas(750,314,882 ,340, 'pared');        //cuarto nivel  
  agregarBloquePorEsquinas(490,235,673,287, 'pared');        //cuarto nivel
  

  agregarBloquePorEsquinas(30, 518, 440, 548, 'pared');      // R14: Plataforma baja izquierda 2 nivel
  agregarBloquePorEsquinas(440, 570, 630, 600, 'pared');      // R14: Plataforma baja izquierda
  agregarBloquePorEsquinas(630, 584, 758, 600, 'pared');     // R7: Fondo piscina de acido
  agregarBloquePorEsquinas(758, 570, 855, 600, 'pared');     //lado derecho piscina de acido  
  
  agregarBloquePorEsquinas(128, 390, 520, 417, 'pared');     // R13: Plataforma flotante central tercer nivel arriba
  agregarBloquePorEsquinas(495, 415, 980, 445, 'pared');     // tercer nivel abajo
  agregarBloquePorEsquinas(934, 445, 980, 524, 'pared');     //  Tercer nivel derecha
  agregarBloquePorEsquinas(850, 445, 934, 470, 'pared');     //  Tercer nivel derecha
  
  agregarBloquePorEsquinas(285,158,980,190, 'pared');     //
  agregarBloquePorEsquinas(285,190,420,240, 'pared');     //
  agregarBloquePorEsquinas(285,135,370,160, 'pared');     //
  agregarBloquePorEsquinas(260,105,320,135, 'pared');     //  
  agregarBloquePorEsquinas(700,130,780,160, 'pared');     //  
  
  agregarBloquePorEsquinas(619,600,650,624, 'pared');     //una parte de abajo
  agregarRampaPorPuntos(650, 624, 650, 600, 680, 592); //
  agregarRampaPorPuntos(619, 624, 619, 600, 596, 600); //
  // --- A. CREAR ELEMENTOS RAMPA TRIANGULOS  
  // t1: Simplemente le pasas los tres puntos (x,y) seguidos
  agregarRampaPorPuntos(905, 680, 932, 685, 932, 647); //derecha abajo
  
  agregarRampaPorPuntos(440, 548, 392, 548, 440, 600); //sedundo nivel
  agregarRampaPorPuntos(440, 518, 440, 570, 495, 570); //segundo nivel
  
  agregarRampaPorPuntos(520, 390, 520, 415, 550, 415);//tercer nivel arriba
  
  agregarRampaPorPuntos(495, 417, 495, 445, 465, 417);//tercer nivel abajo
  agregarRampaPorPuntos(850, 470, 934, 470, 934, 524);  //tercer nivel abajo
  agregarRampaPorPuntos(850, 470, 850, 445, 830, 445);  //tercer nivel abajo
  
  
  agregarRampaPorPuntos(855, 570, 855, 600, 885, 600);
  

  agregarRampaPorPuntos(673,290,673,235,730,290);
  agregarRampaPorPuntos(725,315,750,315,750,340);
  agregarRampaPorPuntos(260,105,260,135,232,135);
  agregarRampaPorPuntos(320,135,320,105,345,135);
  agregarRampaPorPuntos(370,160,370,135,400,160);
  agregarRampaPorPuntos(285,135,260,135,285,160);
  agregarRampaPorPuntos(780,158,780,130,810,158);
  agregarRampaPorPuntos(700,158,700,130,670,158);  
  

  // 1. Creamos las plataformas 
  let platIzquierda = new PlataformaMovil(30, 395, 128, 412, 2.0);

  let platDerecha = new PlataformaMovil(882, 315, 980, 332, 2.0); // Plataforma 2  
  
  listaPlataformas.push(platIzquierda);
  listaPlataformas.push(platDerecha);

  // 2. Enlazamos la palanca a la plataforma izquierda
  listaPalancas.push(new Palanca(275, 520, 'derecha', platIzquierda)); 

  // 3. Creamos los botones usando la clase y les ASOCIAMOS la plataforma derecha (platDerecha)
  listaBotones.push(new Boton(265, 385, 305, 395, platDerecha)); // Botón tercer nivel
  
  listaBotones.push(new Boton(760, 280, 800, 290, platDerecha)); // Botón cuarto nivel
  
}


function reiniciarNivel() {
  // Teletransporta los cuerpos físicos a sus posiciones seguras del inicio
  Body.setPosition(fireboy.cuerpo, { x: 100, y: 680 });
  Body.setPosition(watergirl.cuerpo, { x: 100, y: 550 });
  
  // Resetea sus velocidades instantáneamente para que no mantengan la inercia de la caída
  Body.setVelocity(fireboy.cuerpo, { x: 0, y: 0 });
  Body.setVelocity(watergirl.cuerpo, { x: 0, y: 0 });
}


  // ==========================================
  //  PANTALLA INICIO
  // ==========================================

function pantalla_inicio() {
  push();
  // En WEBGL, centramos la imagen en el origen (0,0)
  imageMode(CENTER);
  image(imgInicio, 0, 0, 1019, 769);
  
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
  
  // Texto de ayuda (Ajusta tamaño y alineación para WEBGL)
  textAlign(CENTER, CENTER);
  textFont(fuente_juego);   
  textSize(16);
  fill(255);
  text("¡Ayuda a estos dos heroes en su aventura! Evita los peligros.", 0, 245);
  text("Controles: Fireboy [Flechas del teclado]  |  Watergirl [W, A, S, D]", 0, 285);
  textSize(18);
  fill(255, 200, 0);
  text("HAZ CLICK EN EL BOTON DE PLAY PARA EMPEZAR", 0, 325);
  pop();
}

  // ==========================================
  //  PANTALLA JUEGO
  // ==========================================

// --- PANTALLA 2: JUEGO (Tu código actual agrupado) ---
function pantalla_juego() {
  
  
  fireboy.actualizarMovimiento();
  watergirl.actualizarMovimiento();
  
  noStroke();
 
  // Controles
   fill(0, 0, 0, 100); // Negro con transparencia (alfa = 100)
  
  for (let p of paredesYSuelos) {
    push();  translate(4, 4); dibujarCuerpo(p);  pop(); //desplaza para la sombra
  }
//*************  
  //image(imgBosque, 0, 0);  //para ir mirando
  
  // Dibujar escenario (Paredes)
  fill(255, 127, 39); //verde
  for (let p of paredesYSuelos) dibujarCuerpo(p);

//*********
 image(imgBosque, 0, 0);
 
  // --- REGLA COOPERATIVA: EVALUAR BOTONES ---
  let activarPlataforma2 = false;
  
  for (let bot of listaBotones) {
    // Si este botón en particular está siendo pisado, encendemos la señal
    if (bot.estaPisado) {
      activarPlataforma2 = true;
    }
    bot.dibujar();
  }

  // Actualizar de manera específica la Plataforma 2 (Derecha) con el resultado cooperativo
  listaPlataformas[1].actualizar(activarPlataforma2);

  // Actualizar y dibujar palancas (Ellas actualizan automáticamente a la Plataforma 1)
  for (let pal of listaPalancas) {
    pal.actualizar();
    pal.dibujar();
  }

  // Dibujar todas las plataformas mecánicas amarillas en su Y correspondiente
  for (let plat of listaPlataformas) {
    plat.dibujar();
  }
  
  // Shaders de Piscinas y Personajes
  for (let pisc of piscinas) { pisc.dibujar(); }
  resetShader();
  fireboy.dibujar();
  watergirl.dibujar();
}

// ==========================================
  //  PANTALLA GAMEOVER
  // ==========================================

function pantalla_reinicio() {
  push();
  // Fondo oscuro transparente para congelar la última imagen del juego de fondo
  fill(0, 0, 0, 180);
  rectMode(CENTER);
  rect(0, 0, width, height);
  
  // Cuadro de diálogo estilo madera
  fill(139, 69, 19, 240); // Marrón madera
  stroke(255, 200, 0);
  strokeWeight(4);
  rect(0, 0, 450, 350, 20);
  
  // Textos del Menú
  noStroke();
  textAlign(CENTER, CENTER);
  textFont(fuente_juego);  
  fill(255, 215, 0); // Dorado
  textSize(42);
  text("GAME OVER", 0, -100);
  
  // Botón volver a intentar
  fill(255);
  textSize(24);
  text("PRESIONA R PARA VOLVER A INTENTAR", 0, 20);
  
  fill(200);
  textSize(18);
  text("O haz click en cualquier lado para ir al menú", 0, 80);
  pop();
}
