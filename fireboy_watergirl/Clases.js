  // ==========================================
  //  Clase Personaje 
  // ==========================================

class Personaje {
  // El constructor recibe la posición inicial, el color y la configuración de controles
  constructor(x, y, colorPersonaje, teclaIzq, teclaDer, teclaArr) {
    this.color = colorPersonaje;
    this.tipo_elemento = "ninguno";
    
    // Asignación de controles
    this.teclaIzquierda = teclaIzq;
    this.teclaDerecha = teclaDer;
    this.teclaSalto = teclaArr;
    
    this.fuerzaSalto = -8; // Velocidad del salto hacia arriba (eje Y negativo)
    
    // Creamos su cuerpo físico de Matter.js directamente aquí dentro
    this.cuerpo = Bodies.rectangle(x, y, 30, 30, { 
      inertia: Infinity, // Evita que el personaje rote/gire al chocar
      friction: 0.1 
    });
    
    // Lo agregamos automáticamente al mundo físico global
    World.add(world, this.cuerpo);
  }

  // Método para actualizar las caminatas (Se llama continuamente en draw())
  actualizarMovimiento() {
    let velX = 0;
    
    if (keyIsDown(this.teclaIzquierda)) velX = -4; // Camina a la izquierda
    if (keyIsDown(this.teclaDerecha))   velX = 4;  // Camina a la derecha
    
    // Mantenemos la velocidad en Y provocada por la gravedad, cambiando solo X
    Body.setVelocity(this.cuerpo, { x: velX, y: this.cuerpo.velocity.y });
  }

  // Método para ejecutar el salto (Se llama desde el keyPressed() global)
  revisarSalto(codigoTecla) {
    if (codigoTecla === this.teclaSalto) {
      Body.setVelocity(this.cuerpo, { x: this.cuerpo.velocity.x, y: this.fuerzaSalto });
    }
  }

  // Método para dibujar en pantalla usando la función auxiliar dibujarCuerpo
  dibujar() {
    fill(this.color);
    dibujarCuerpo(this.cuerpo); // Reutiliza tu función que dibuja vértices o rectángulos
  }
}


  // ==========================================
  //  Clase piscina 
  // ==========================================

class Piscina {
  constructor(xIni, yIni, xFin, yFin, tipo) {
    this.tipo = tipo;
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;
    
    this.centroX = xIni + (this.ancho / 2);
    this.centroY = yIni + (this.alto / 2); 
    
    if (this.tipo === 'lava') {
      this.colorShader = [1.0, 0.2, 0.0];
    } else if (this.tipo === 'agua') {
      this.colorShader = [0.0, 0.4, 1.0];
    } else if (this.tipo === 'acido') {
      this.colorShader = [0.1, 0.9, 0.1];
    } else {
      this.colorShader = [0.5, 0.0, 0.8];
    }
    
    this.cuerpo = Bodies.rectangle(this.centroX, this.centroY, this.ancho, this.alto, { 
      isStatic: true, 
      isSensor: true 
    });
    
    World.add(world, this.cuerpo);
  }
  dibujar() {
    push();
    translate(this.centroX, this.centroY);
    
    shader(shaderLiquido);
    
    // Enviamos los datos al shader
    shaderLiquido.setUniform('uColor', this.colorShader);
    shaderLiquido.setUniform('time', tiempoJuego); // <-- Usamos nuestra variable controlada
    
    rectMode(CENTER);
    rect(0, 0, this.ancho, this.alto);
    pop();
  }
}

  // ==========================================
  //  Clase palanca
  // ==========================================

class Palanca {
 constructor(x, y, orientacionInicial, plataformaAsociada) { // <-- Recibe la plataforma
 this.x = x;
 this.y = y;
 this.estado = orientacionInicial; 
 
 // Guardamos la referencia de la plataforma que va a controlar
 this.plataforma = plataformaAsociada; 
 
 this.anguloActual = (this.estado === 'derecha') ? QUARTER_PI : -QUARTER_PI;
 this.objetivoAngulo = this.anguloActual;

 this.cuerpoSensor = Bodies.rectangle(x, y, 40, 20, { 
 isStatic: true, 
 isSensor: true 
 });
 World.add(world, this.cuerpoSensor);
 }

 actualizar() {
 this.objetivoAngulo = (this.estado === 'derecha') ? QUARTER_PI : -QUARTER_PI;
 this.anguloActual = lerp(this.anguloActual, this.objetivoAngulo, 0.15);
 
 // ¡EL PUENTE EN ACCIÓN! 
 // La palanca le avisa de forma directa a su plataforma si debe activarse
 let estaActivada = (this.estado === 'izquierda');
 this.plataforma.actualizar(estaActivada); 
 }

 dibujar() {
 push();
 translate(this.x, this.y);
 fill(250, 130, 0);
 rectMode(CENTER);
 rect(0, 5, 40, 10);
 rotate(this.anguloActual);
 rect(0, -15, 6, 30); 
 pop();
 }
}


  // ==========================================
  //  Clase plataforma movil
  // ==========================================
class PlataformaMovil {
  constructor(xIni, yIni, xFin, yFin, velocidad) {
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;
    
    // Guardamos la posición inicial (Donde empieza arriba/reposo)
    this.posInicialY = yIni + (this.alto / 2);
    this.centroX = xIni + (this.ancho / 2);
    
    // Definimos qué tan abajo llegará la plataforma cuando se active por completo
    this.rangoMovimientoY = 80; // Ajusta cuántos píxeles bajará
    this.posFinalY = this.posInicialY + this.rangoMovimientoY;
    
    this.velocidad = velocidad; // Velocidad del desplazamiento mecánico
    this.progresoDestinoY = this.posInicialY; // Hacia dónde se desplaza actualmente

    // Creamos la plataforma física cinemática (no le afecta la gravedad, la movemos por código)
    this.cuerpo = Bodies.rectangle(this.centroX, this.posInicialY, this.ancho, this.alto, { 
      isStatic: true // Al inicio es estática para soportar peso estable
    });
    World.add(world, this.cuerpo);
  }

  // Recibe si la palanca vinculada está activada o no
  actualizar(palancaActivada) {
    // Si la palanca cambió de estado, fijamos su nuevo destino vertical
    if (palancaActivada) {
      this.progresoDestinoY = this.posFinalY; // Bajar rampa
    } else {
      this.progresoDestinoY = this.posInicialY; // Subir rampa
    }

    // Calculamos la posición Y actual de la plataforma física
    let actualY = this.cuerpo.position.y;
    let siguienteY = actualY;

    if (actualY < this.progresoDestinoY) {
      siguienteY = min(actualY + this.velocidad, this.progresoDestinoY);
    } else if (actualY > this.progresoDestinoY) {
      siguienteY = max(actualY - this.velocidad, this.progresoDestinoY);
    }

    // IMPORTANTE: Para que Matter.js arrastre de forma correcta los pies del jugador al bajar/subir,
    // actualizamos la posición física del cuerpo usando su método de cinemática
    Body.setPosition(this.cuerpo, { x: this.centroX, y: siguienteY });
  }

  dibujar() {
    fill(255, 255, 0); // Amarillo característico
    dibujarCuerpo(this.cuerpo);
  }
}

  // ==========================================
  //  Clase Boton
  // ==========================================

class Boton {
  constructor(xIni, yIni, xFin, yFin, plataformaAsociada) {
    this.ancho = xFin - xIni;
    this.alto = yFin - yIni;
    this.centroX = xIni + (this.ancho / 2);
    this.centroY = yIni + (this.alto / 2);
    
    this.plataforma = plataformaAsociada; // Conexión a la plataforma derecha
    this.estaPisado = false; // Estado dinámico en cada frame

    // Creamos el cuerpo físico estático tipo SENSOR
    this.cuerpo = Bodies.rectangle(this.centroX, this.centroY, this.ancho, this.alto, { 
      isStatic: true, 
      isSensor: true 
    });
    World.add(world, this.cuerpo);
  }

  dibujar() {
    push();
    // Si está pisado, lo dibujamos un poco más abajo o cambiamos ligeramente su tono azul
    if (this.estaPisado) {
      fill(0, 150, 255); // Azul más brillante al presionarse
    } else {
      fill(0, 100, 250); // Azul normal en reposo
    }
    dibujarCuerpo(this.cuerpo);
    pop();
  }
}


  // ==========================================
  //  DIBUJA CUERPO 
  // ==========================================

function dibujarCuerpo(cuerpo) {
  // Si el cuerpo físico tiene vértices (puntos), los unimos uno a uno
  if (cuerpo.vertices && cuerpo.vertices.length > 0) {
    beginShape();
    for (let i = 0; i < cuerpo.vertices.length; i++) {
      // Tomamos las coordenadas exactas de cada esquina calculada por Matter.js
      vertex(cuerpo.vertices[i].x, cuerpo.vertices[i].y);
    }
    endShape(CLOSE); // CLOSE une automáticamente el último punto con el primero para cerrar la figura
  }
  else {
   
    rectMode(CENTER);
    rect(cuerpo.position.x, cuerpo.position.y, cuerpo.bounds.max.x - cuerpo.bounds.min.x, cuerpo.bounds.max.y - cuerpo.bounds.min.y);
  }
}
