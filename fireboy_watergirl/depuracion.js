  // ==========================================
  //  MODO DEPURACIÓN (tecla F2)
  // ==========================================
// Dibuja el contorno de todos los cuerpos de Matter.js encima del fondo para
// comprobar que la física coincide con el arte:
//   verde = escenario estático, amarillo = sensores, magenta = cuerpos dinámicos

let modoDepuracion = false;

function alternarDepuracion() {
  modoDepuracion = !modoDepuracion;
}

// Se llama dentro del translate del juego (coordenadas del nivel)
function dibujarDepuracion() {
  push();
  noFill();
  strokeWeight(1.5);

  let cuerpos = Composite.allBodies(world);
  for (let cuerpo of cuerpos) {
    if (cuerpo.isSensor) stroke(255, 255, 0);
    else if (cuerpo.isStatic) stroke(0, 255, 0);
    else stroke(255, 0, 255);
    dibujarCuerpo(cuerpo);
  }

  // Panel de información
  noStroke();
  fill(0, 0, 0, 180);
  rectMode(CORNER);
  rect(40, 40, 230, 92, 6);

  fill(255);
  textFont(fuente_juego);
  textSize(13);
  textAlign(LEFT, TOP);
  text(`FPS: ${nf(frameRate(), 1, 0)}`, 50, 48);
  text(`Cuerpos: ${cuerpos.length}`, 50, 66);
  text(`Pantalla: ${estadoPantalla}`, 50, 84);
  text(`Mouse: ${round(mouseX)}, ${round(mouseY)}`, 50, 102);
  pop();
}
