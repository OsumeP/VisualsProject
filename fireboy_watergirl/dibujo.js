  // ==========================================
  //  DIBUJA CUERPO
  // ==========================================
// Dibuja cualquier cuerpo de Matter.js uniendo sus vértices.
// Usa el fill/stroke que esté activo en ese momento.

function dibujarCuerpo(cuerpo) {
  if (cuerpo.vertices && cuerpo.vertices.length > 0) {
    beginShape();
    for (let i = 0; i < cuerpo.vertices.length; i++) {
      // Coordenadas exactas de cada esquina calculada por Matter.js
      vertex(cuerpo.vertices[i].x, cuerpo.vertices[i].y);
    }
    endShape(CLOSE); // Une el último punto con el primero para cerrar la figura
  }
  else {
    rectMode(CENTER);
    rect(cuerpo.position.x, cuerpo.position.y, cuerpo.bounds.max.x - cuerpo.bounds.min.x, cuerpo.bounds.max.y - cuerpo.bounds.min.y);
  }
}
