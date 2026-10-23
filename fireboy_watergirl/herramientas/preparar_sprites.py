"""
Prepara los sprites de los personajes a partir de las hojas originales
(Resources/images/FireboySprites.png y WatergirlSprites.png).

Para cada animación: recorta los cuadros (las celdas separadas por bordes turquesa),
los escala y los guarda como una tira horizontal en Resources/sprites/. También genera
sprites_datos.js con el tamaño de cada cuadro, cuántos hay y su punto de anclaje.

Uso (desde la carpeta del sketch):
    python herramientas/preparar_sprites.py
"""
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from analizar_hoja import celdas

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'Resources', 'sprites')

# Los cuadros se guardan al doble del tamaño en pantalla para que se vean nítidos;
# el juego los dibuja con escala 1 / RESOLUCION.
RESOLUCION = 2
ESCALA_CABEZA = 0.16   # Calibrado con los personajes del fondo original (~36 px de ancho)
ESCALA_CUERPO = 0.15
ESCALA_GANAR = 0.9     # La fila "Win" ya viene en tamaño pequeño

# y: fila (coordenada superior de sus celdas en la hoja).
# cuello: punto de la celda donde la cabeza se une al cuerpo (en píxeles de la hoja original).
PERSONAJES = {
    'fuego': {
        'hoja': 'FireboySprites.png',
        'cabeza': {
            'quieto': {'y': 162,  'cuello': (107, 325), 'fps': 12},
            'caer':   {'y': 531,  'cuello': (107, 325), 'fps': 12},
            'saltar': {'y': 900,  'cuello': (107, 230), 'fps': 12},
            'correr': {'y': 1267, 'cuello': (237, 198), 'fps': 15},
        },
        'ganar': {'y': 1502, 'fps': 35},
    },
    'agua': {
        'hoja': 'WatergirlSprites.png',
        'cabeza': {
            'quieto': {'y': 162,  'cuello': (97, 316),  'fps': 14},
            'caer':   {'y': 672,  'cuello': (95, 390),  'fps': 18},
            'saltar': {'y': 1255, 'cuello': (96, 340),  'fps': 18},
            'correr': {'y': 1765, 'cuello': (273, 320), 'fps': 20},
        },
        'ganar': {'y': 2275, 'fps': 45},
    },
}
FILA_CUERPO = 31
FPS_PIERNAS = 18


def cuadros_de_fila(ruta, y):
    """Celdas de la fila que empieza en y, de izquierda a derecha: (x, y, ancho, alto)."""
    cs = [c for c in celdas(ruta) if abs(c[0] - y) < 25 and c[2] > 30 and c[3] > 15]
    return [(x0, y0, w, h) for (y0, x0, h, w) in sorted(cs, key=lambda c: c[1])]


def escalar(img, factor):
    w = max(1, round(img.width * factor))
    h = max(1, round(img.height * factor))
    return img.resize((w, h), Image.LANCZOS)


def guardar_tira(cuadros, nombre):
    """Une cuadros del mismo tamaño en una tira horizontal."""
    w, h = cuadros[0].size
    tira = Image.new('RGBA', (w * len(cuadros), h), (0, 0, 0, 0))
    for i, c in enumerate(cuadros):
        tira.alpha_composite(c, (i * w, 0))
    tira.save(os.path.join(SALIDA, nombre), optimize=True)
    return w, h


def centro_de_cadera(img):
    """x del centro de los píxeles opacos en las primeras filas (donde están las caderas)."""
    a = np.asarray(img.getchannel('A'))
    filas = a[:max(3, a.shape[0] // 8)]
    xs = np.nonzero(filas > 128)[1]
    return float(xs.mean()) if len(xs) else img.width / 2


def main():
    os.makedirs(SALIDA, exist_ok=True)
    datos = {}

    for elemento, cfg in PERSONAJES.items():
        ruta = os.path.join(RAIZ, 'Resources', 'images', cfg['hoja'])
        hoja = Image.open(ruta).convert('RGBA')
        recortar = lambda c: hoja.crop((c[0], c[1], c[0] + c[2], c[1] + c[3]))
        datos[elemento] = {}

        # --- Cabezas: celdas uniformes por fila; el ancla es el cuello ---
        f = ESCALA_CABEZA * RESOLUCION
        for anim, a in cfg['cabeza'].items():
            cuadros = [escalar(recortar(c), f) for c in cuadros_de_fila(ruta, a['y'])]
            nombre = f'{elemento}_cabeza_{anim}.png'
            w, h = guardar_tira(cuadros, nombre)
            datos[elemento]['cabeza_' + anim] = {
                'archivo': nombre, 'cuadros': len(cuadros), 'ancho': w, 'alto': h,
                'anclaX': round(a['cuello'][0] * f, 1), 'anclaY': round(a['cuello'][1] * f, 1),
                'fps': a['fps'], 'escala': 1 / RESOLUCION}

        # --- Cuerpo: el primer cuadro de la fila "Body" es el cuerpo de pie;
        #     los otros 8, las piernas corriendo. Recortes de tamaño variable:
        #     se centran en las caderas dentro de una celda común. ---
        f = ESCALA_CUERPO * RESOLUCION
        fila = [escalar(recortar(c), f) for c in cuadros_de_fila(ruta, FILA_CUERPO)]
        for anim, cuadros in (('cuerpo_quieto', fila[:1]), ('cuerpo_correr', fila[1:])):
            caderas = [centro_de_cadera(c) for c in cuadros]
            izq = max(cad for cad in caderas)
            der = max(c.width - cad for c, cad in zip(cuadros, caderas))
            ancho, alto = int(np.ceil(izq + der)), max(c.height for c in cuadros)
            celdas_comunes = []
            for c, cad in zip(cuadros, caderas):
                lienzo = Image.new('RGBA', (ancho, alto), (0, 0, 0, 0))
                lienzo.alpha_composite(c, (int(round(izq - cad)), 0))
                celdas_comunes.append(lienzo)
            nombre = f'{elemento}_{anim}.png'
            w, h = guardar_tira(celdas_comunes, nombre)
            datos[elemento][anim] = {
                'archivo': nombre, 'cuadros': len(celdas_comunes), 'ancho': w, 'alto': h,
                'anclaX': round(izq, 1), 'anclaY': 0,   # Ancla: caderas / cuello (arriba)
                'fps': FPS_PIERNAS, 'escala': 1 / RESOLUCION}

        # --- Ganar (entra por la puerta): personaje completo, ancla en los pies ---
        g = cfg['ganar']
        cuadros = [recortar(c) for c in cuadros_de_fila(ruta, g['y'])]
        nombre = f'{elemento}_ganar.png'
        w, h = guardar_tira(cuadros, nombre)
        datos[elemento]['ganar'] = {
            'archivo': nombre, 'cuadros': len(cuadros), 'ancho': w, 'alto': h,
            'anclaX': w / 2, 'anclaY': h, 'fps': g['fps'], 'escala': ESCALA_GANAR}

    js = ('// ARCHIVO GENERADO por herramientas/preparar_sprites.py: no editar a mano.\n'
          '// Tamaños en píxeles de las tiras de Resources/sprites/. ancla = punto de unión\n'
          '// (cuello en las cabezas, caderas en el cuerpo, pies en "ganar").\n'
          'const SPRITES = ' + json.dumps(datos, indent=2, ensure_ascii=False) + ';\n')
    with open(os.path.join(RAIZ, 'sprites_datos.js'), 'w', encoding='utf-8') as fjs:
        fjs.write(js)

    for elem, anims in datos.items():
        for nombre, d in anims.items():
            print(f"{elem:6s} {nombre:16s} {d['cuadros']:3d} cuadros de {d['ancho']}x{d['alto']}")


if __name__ == '__main__':
    main()
