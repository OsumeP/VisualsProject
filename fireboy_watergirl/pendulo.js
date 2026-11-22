// Asegúrate de incluir Constraint en la primera línea de tu código:
// const { Engine, World, Bodies, Body, Events, Constraint } = Matter;

class Pendulo {
  constructor(anclaX, anclaY, largoCuerda, anchoTronco, altoTronco) {
    this.ancla = { x: anclaX, y: anclaY };

    // 1. EL TRONCO (Cuerpo físico dinámico)
    this.tronco = Bodies.rectangle(
      anclaX, 
      anclaY + largoCuerda, 
      anchoTronco, 
      altoTronco, 
      {
        density: 0.005,      // Peso suficiente para que no salga volando al pisarlo
        friction: 0.8,       // Alta fricción para que los personajes no resbalen
        frictionAir: 0.01,   // Un poco de resistencia al aire para que se frene solo
        inertia: Infinity    // <--- CLAVE: Evita que el tronco gire sobre sí mismo y se vuelque
      }
    );

    // 2. LA CUERDA (Une el techo con el centro superior del tronco)
    this.cuerda = Matter.Constraint.create({
      pointA: this.ancla,
      bodyB: this.tronco,
      pointB: { x: 0, y: -altoTronco / 2 }, // Se engancha al borde superior del tronco
      stiffness: 0.9, // Rigidez de la cadena (0.9 = casi no se estira)
      length: largoCuerda
    });

    // Agregamos ambos al mundo de Matter.js
    World.add(world, [this.tronco, this.cuerda]);
  }

  dibujar() {
    let pos = this.tronco.position;

    push();
    // Dibujar el punto de anclaje en el techo (el círculo gris de la imagen)
    fill(180);
    stroke(50);
    strokeWeight(2);
    ellipse(this.ancla.x, this.ancla.y, 14, 14);

    // Dibujar la cadena desde el techo hasta el tronco
    stroke(200);
    strokeWeight(3);
    line(this.ancla.x, this.ancla.y, pos.x, pos.y);

    // Dibujar el tronco de madera
    rectMode(CENTER);
    fill(139, 69, 19); // Color madera
    stroke(60, 30, 10);
    strokeWeight(2);
    rect(pos.x, pos.y, this.tronco.bounds.max.x - this.tronco.bounds.min.x, 20, 4);
    pop();
  }
}
