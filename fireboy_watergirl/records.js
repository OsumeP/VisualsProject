  // ==========================================
  //  RÉCORDS POR NIVEL (localStorage)
  // ==========================================
// Se guardan en el navegador de cada jugador: { idNivel: { mejorTiempoMs, maxGemas, mejorCalificacion } }.
// Si el almacenamiento no está disponible (modo privado, permisos), el juego funciona igual
// pero los récords solo duran mientras la página está abierta.

const CLAVE_RECORDS = "fw_records";
let recordsEnMemoria = {}; // Copia por si localStorage falla

function leerRecords() {
  try {
    let guardado = localStorage.getItem(CLAVE_RECORDS);
    if (guardado) recordsEnMemoria = JSON.parse(guardado);
  } catch (e) { /* Se usa la copia en memoria */ }
  return recordsEnMemoria;
}

function recordDeNivel(idNivel) {
  return leerRecords()[idNivel] || null;
}

// Compara el resultado de una partida ganada con el récord y lo actualiza.
// Devuelve qué se superó: { tiempo, gemas, calificacion } (true/false) y el récord resultante.
function registrarResultado(idNivel, res) {
  let records = leerRecords();
  let anterior = records[idNivel];
  let mejora = {
    tiempo: !anterior || res.tiempoMs < anterior.mejorTiempoMs,
    gemas: !anterior || res.gemas.recogidas > anterior.maxGemas,
    // 'A' < 'B' < 'C' alfabéticamente: menor es mejor
    calificacion: !anterior || res.calificacion < anterior.mejorCalificacion
  };

  records[idNivel] = {
    mejorTiempoMs: mejora.tiempo ? res.tiempoMs : anterior.mejorTiempoMs,
    maxGemas: mejora.gemas ? res.gemas.recogidas : anterior.maxGemas,
    totalGemas: res.gemas.total,
    mejorCalificacion: mejora.calificacion ? res.calificacion : anterior.mejorCalificacion
  };
  recordsEnMemoria = records;

  try {
    localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records));
  } catch (e) { /* Sin almacenamiento: queda solo en memoria */ }

  // En la primera victoria todo es "mejora", pero no tiene sentido anunciar un récord
  mejora.primeraVez = !anterior;
  mejora.record = records[idNivel];
  return mejora;
}
