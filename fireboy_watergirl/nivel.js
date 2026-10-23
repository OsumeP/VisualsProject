  // ==========================================
  //  CONSTRUCCIÓN Y ESTADO DEL NIVEL
  // ==========================================
// Todo el contenido del nivel vive en estas listas. Se vacían y se vuelven a llenar
// en cada reinicio, así nada queda con el estado de la partida anterior.

let nivelActual = null;  // Datos del nivel cargado (ej: NIVEL_1)
let indiceNivel = 0;     // Posición de nivelActual en listaNiveles()
let imagenesFondo = {};  // Fondo de cada nivel, por id (se cargan en preload)
let imgFondo;            // Fondo del nivel actual

// Todos los niveles en orden. Para agregar uno: crear nivelN.js con sus datos
// (ver NIVEL_1), su imagen de fondo, y añadirlo aquí. Es una función (y no una
// constante) para no depender del orden en que se cargan los archivos.
function listaNiveles() {
  return [NIVEL_1];
}

// Se llama desde preload()
function cargarFondosNiveles() {
  for (let n of listaNiveles()) imagenesFondo[n.id] = loadImage(n.fondo);
}

let fireboy, watergirl;
let personajes = [];
let paredesYSuelos = [];   // Paredes, suelos y rampas estáticas
let piscinas = [];         // Lava, agua, ácido
let listaPalancas = [];
let listaPlataformas = [];
let listaBotones = [];
let listaPuertas = [];
let listaGemas = [];
let listaCajas = [];
let listaSolidos = [];     // Cuerpos que sirven de suelo (para detectar dónde se apoyan los personajes)

function construirNivel(datos) {
  nivelActual = datos;
  imgFondo = imagenesFondo[datos.id];

  // Vaciar por completo el mundo físico y las colisiones pendientes
  Composite.clear(world, false);
  Engine.clear(engine);

  paredesYSuelos = [];
  piscinas = [];
  listaPalancas = [];
  listaPlataformas = [];
  listaBotones = [];
  listaPuertas = [];
  listaGemas = [];
  listaCajas = [];

  // --- Escenario estático ---
  for (let p of datos.paredes) agregarBloquePorEsquinas(...p);
  for (let r of datos.rampas) agregarRampaPorPuntos(...r);

  // --- Piscinas (y los lados inclinados de su hueco) ---
  for (let p of datos.piscinas) {
    let [xIni, yIni, xFin, yFin] = p.esquinas;
    let talud = p.talud || 0;
    if (talud > 0) {
      agregarRampaPorPuntos(xIni, yIni, xIni + talud, yFin, xIni, yFin);
      agregarRampaPorPuntos(xFin, yIni, xFin, yFin, xFin - talud, yFin);
    }
    piscinas.push(new Piscina(xIni, yIni, xFin, yFin, p.tipo, talud));
  }

  // --- Plataformas, y lo que las activa (enlazado por id) ---
  let plataformasPorId = {};
  for (let d of datos.plataformas) {
    let plat = new PlataformaMovil(...d.esquinas, d.velocidad, d.recorrido);
    plataformasPorId[d.id] = plat;
    listaPlataformas.push(plat);
  }

  for (let d of datos.palancas) {
    let pal = new Palanca(d.x, d.y, d.estado);
    buscarPorId(plataformasPorId, d.plataforma, 'plataforma').agregarActivador(pal);
    listaPalancas.push(pal);
  }

  for (let d of datos.botones) {
    let bot = new Boton(...d.esquinas);
    buscarPorId(plataformasPorId, d.plataforma, 'plataforma').agregarActivador(bot);
    listaBotones.push(bot);
  }

  // --- Puertas de salida ---
  for (let d of datos.puertas) {
    listaPuertas.push(new Puerta(...d.esquinas, d.tipo));
  }

  // --- Cajas empujables ---
  for (let esquinas of datos.cajas) listaCajas.push(new Caja(...esquinas));

  // --- Gemas ---
  for (let tipo of ['fuego', 'agua']) {
    for (let [x, y] of datos.gemas[tipo]) listaGemas.push(new Gema(x, y, tipo));
  }

  // --- Personajes ---
  fireboy = new Personaje(datos.aparicion.fuego.x, datos.aparicion.fuego.y, 'fuego');
  watergirl = new Personaje(datos.aparicion.agua.x, datos.aparicion.agua.y, 'agua');
  personajes = [fireboy, watergirl];

  listaSolidos = [...paredesYSuelos, ...listaPlataformas.map(plat => plat.cuerpo), ...listaCajas.map(c => c.cuerpo)];
}

// Lista de todas las entidades con lógica propia (las paredes no tienen)
function todasLasEntidades() {
  return [...personajes, ...piscinas, ...listaPalancas, ...listaPlataformas, ...listaBotones, ...listaPuertas, ...listaGemas, ...listaCajas];
}

// Conteo de gemas; tipo opcional ('fuego' | 'agua') para contar solo las de un color
function contarGemas(tipo) {
  let gemas = tipo ? listaGemas.filter(g => g.tipo === tipo) : listaGemas;
  return { recogidas: gemas.filter(g => g.recogida).length, total: gemas.length };
}

function cuerposSolidos() {
  return listaSolidos;
}

function buscarPorId(mapa, id, tipo) {
  if (!mapa[id]) {
    throw new Error(`El nivel hace referencia a la ${tipo} '${id}', que no existe`);
  }
  return mapa[id];
}

// Bloque rectangular estático a partir de sus esquinas
function agregarBloquePorEsquinas(xIni, yIni, xFin, yFin) {
  let ancho = xFin - xIni;
  let alto = yFin - yIni;
  let centroX = xIni + (ancho / 2);
  let centroY = yIni + (alto / 2);

  let cuerpo = Bodies.rectangle(centroX, centroY, ancho, alto, {
    label: 'pared',
    isStatic: true,
    collisionFilter: FILTRO.ESCENARIO
  });
  paredesYSuelos.push(cuerpo);
  World.add(world, cuerpo);
}

// Rampa triangular estática a partir de sus tres vértices
function agregarRampaPorPuntos(x1, y1, x2, y2, x3, y3) {
  let vertices = [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 }
  ];

  // Centro matemático inicial de los tres puntos
  let centroX = (x1 + x2 + x3) / 3;
  let centroY = (y1 + y2 + y3) / 3;

  let rampa = Bodies.fromVertices(centroX, centroY, vertices, {
    label: 'rampa',
    isStatic: true,
    collisionFilter: FILTRO.ESCENARIO
  });

  // Obligamos a Matter.js a alinearse con las coordenadas originales,
  // cancelando cualquier desfase interno del cálculo del centroide.
  let desfasarX = centroX - rampa.position.x;
  let desfasarY = centroY - rampa.position.y;
  Body.setPosition(rampa, { x: centroX + desfasarX, y: centroY + desfasarY });

  paredesYSuelos.push(rampa);
  World.add(world, rampa);
}
