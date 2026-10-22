  // ==========================================
  //  ENRUTADOR DE COLISIONES
  // ==========================================
// Cada cuerpo con lógica guarda su entidad en `cuerpo.entidad`. Cuando Matter.js
// reporta un choque, se avisa a las dos entidades llamando a su método (si lo tienen):
//   alIniciarColision(otra, par)   -> collisionStart
//   alColisionActiva(otra, par)    -> collisionActive (cada paso mientras se tocan)
//   alTerminarColision(otra, par)  -> collisionEnd
// `otra` es la entidad contraria, o null si es una pared/rampa.
// Además, antes de cada paso de física se llama a antesDePasoFisica() de cada entidad.

function registrarEventosColision(motor) {
  Events.on(motor, 'beforeUpdate', function() {
    for (let e of todasLasEntidades()) {
      if (e.antesDePasoFisica) e.antesDePasoFisica();
    }
  });

  Events.on(motor, 'collisionStart', ev => despacharColisiones(ev.pairs, 'alIniciarColision'));
  Events.on(motor, 'collisionActive', ev => despacharColisiones(ev.pairs, 'alColisionActiva'));
  Events.on(motor, 'collisionEnd', ev => despacharColisiones(ev.pairs, 'alTerminarColision'));
}

// En cuerpos compuestos el choque llega con la parte; la entidad está en el padre
function entidadDeCuerpo(cuerpo) {
  return cuerpo.entidad || (cuerpo.parent && cuerpo.parent.entidad) || null;
}

function despacharColisiones(pares, metodo) {
  for (let par of pares) {
    let a = entidadDeCuerpo(par.bodyA);
    let b = entidadDeCuerpo(par.bodyB);
    if (a && a[metodo]) a[metodo](b, par);
    if (b && b[metodo]) b[metodo](a, par);
  }
}
