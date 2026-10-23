  // ==========================================
  //  SONIDO (Web Audio API, sin librerías)
  // ==========================================
// Todos los sonidos pasan por un volumen maestro: silenciar = volumen 0, y pausar el juego
// suspende el contexto de audio entero (música y efectos se congelan donde estaban).
// Los navegadores no dejan sonar nada hasta que el usuario hace click o pulsa una tecla:
// por eso desbloquearAudio() se llama desde mousePressed() y keyPressed().

// OJO con los nombres de archivo: sin espacios, tildes ni símbolos. El servidor del
// Processing IDE no decodifica la URL ("mi sonido.mp3" se pide como "mi%20sonido.mp3"
// y responde 404) y además distingue mayúsculas de minúsculas.
const SONIDOS = {
  salto_fuego: { archivo: "salto_fireboy.mp3",    volumen: 0.6 },
  salto_agua:  { archivo: "salto_watergirl.mp3",  volumen: 0.6 },
  muerte:      { archivo: "muerte.mp3",           volumen: 0.8 },
  gema:        { archivo: "gema.mp3",             volumen: 0.7 },
  plataforma:  { archivo: "plataforma.mp3",       volumen: 0.5 },
  musica:      { archivo: "musica_nivel.mp3",     volumen: 0.35 },
  victoria:    { archivo: "musica_victoria.mp3",  volumen: 0.5 },
  gameover:    { archivo: "musica_gameover.mp3",  volumen: 0.5 }
};

let audio = {
  ctx: null,          // AudioContext (null si el navegador no tiene Web Audio, ej: en Node)
  maestro: null,      // GainNode por el que pasa todo
  buffers: {},        // Sonidos ya decodificados, por nombre
  musica: null,       // Fuente de la música que suena ahora
  silenciado: false
};

// Se llama desde setup(): crea el contexto y empieza a descargar los sonidos.
// Si un sonido aún no terminó de cargar cuando se pide, simplemente no suena.
function iniciarAudio() {
  let Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) return;

  audio.ctx = new Contexto();
  audio.maestro = audio.ctx.createGain();
  audio.maestro.connect(audio.ctx.destination);

  try {
    audio.silenciado = localStorage.getItem("fw_silenciado") === "1";
  } catch (e) { /* Sin almacenamiento disponible: se empieza con sonido */ }
  audio.maestro.gain.value = audio.silenciado ? 0 : 1;

  for (let nombre in SONIDOS) {
    let ruta = "Resources/sound/" + SONIDOS[nombre].archivo;
    fetch(ruta)
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status + " (¿existe el archivo con ese nombre exacto?)");
        return r.arrayBuffer();
      })
      .then(datos => audio.ctx.decodeAudioData(datos))
      .then(buffer => { audio.buffers[nombre] = buffer; })
      .catch(err => console.warn("No se pudo cargar el sonido '" + nombre + "' desde " + ruta + ": " + err.message));
  }
}

// Desbloquea el audio con el primer gesto del usuario (política de autoplay)
function desbloquearAudio() {
  if (!juegoEnPausa()) reanudarAudio();
}

// Reproduce un sonido. Devuelve la fuente (para detenerla) o null si no pudo sonar.
function reproducirSonido(nombre, bucle = false) {
  let buffer = audio.buffers[nombre];
  if (!audio.ctx || !buffer) return null;

  let fuente = audio.ctx.createBufferSource();
  fuente.buffer = buffer;
  fuente.loop = bucle;

  let ganancia = audio.ctx.createGain();
  ganancia.gain.value = SONIDOS[nombre].volumen;
  fuente.connect(ganancia);
  ganancia.connect(audio.maestro);
  fuente.start();
  return fuente;
}

// Solo suena una música a la vez: la nueva reemplaza a la anterior
function reproducirMusica(nombre, bucle = true) {
  detenerMusica();
  audio.musica = reproducirSonido(nombre, bucle);
}

function detenerMusica() {
  if (audio.musica) {
    try { audio.musica.stop(); } catch (e) { /* Ya estaba detenida */ }
    audio.musica = null;
  }
}

// suspend() y resume() son asíncronos y el navegador los aplica en orden. No se mira
// ctx.state antes de llamarlos: podría estar desactualizado si hay un cambio en curso
// (ej: pulsar P justo después de desbloquear el audio dejaba la música sonando en pausa).
function pausarAudio() {
  if (audio.ctx) audio.ctx.suspend();
}

function reanudarAudio() {
  if (audio.ctx) audio.ctx.resume();
}

function alternarSilencio() {
  audio.silenciado = !audio.silenciado;
  if (audio.maestro) audio.maestro.gain.value = audio.silenciado ? 0 : 1;
  try {
    localStorage.setItem("fw_silenciado", audio.silenciado ? "1" : "0");
  } catch (e) { /* Sin almacenamiento: el ajuste dura solo esta sesión */ }
}
