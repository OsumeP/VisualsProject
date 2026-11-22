"""
Prepara el arte del nivel 2 (Forest Temple) a partir de la captura original
Resources/images/backgame_level2_ref.png (que no se modifica):

  * Resources/images/backgame_level2.png: el fondo sin los objetos que ahora se mueven
    por código (los dos troncos colgantes con su cadena, la compuerta vertical y el borde
    de la plataforma horizontal) ni los dos personajes que traía la captura. Las bolas de
    anclaje de las cadenas se quedan: no se mueven.
  * Resources/images/tronco.png: el tronco de madera recortado, con fondo transparente,
    para dibujar los péndulos.

Los huecos se rellenan copiando la pared de ladrillo desplazada un periodo del patrón
(los ladrillos se repiten cada 40 px en horizontal y cada 42 px en vertical).

Uso (desde la carpeta del sketch):
    python herramientas/preparar_nivel2.py
"""
import os

import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGENES = os.path.join(RAIZ, 'Resources', 'images')

ORIGEN = os.path.join(IMAGENES, 'backgame_level2_ref.png')
FONDO = os.path.join(IMAGENES, 'backgame_level2.png')
TRONCO = os.path.join(IMAGENES, 'tronco.png')

# Desplazamientos (dx, dy) de donde se copia la pared, en orden de preferencia
HORIZONTAL = [(40, 0), (-40, 0), (80, 0), (-80, 0), (120, 0), (-120, 0), (160, 0), (-160, 0)]
VERTICAL = [(0, -42), (0, -84), (0, -126)]

# Zonas a borrar del fondo: ([xIni, yIni, xFin, yFin] inclusive, desplazamientos)
BORRAR = [
    ((316, 201, 332, 336), HORIZONTAL),   # Cadena del péndulo izquierdo
    ((272, 333, 378, 360), HORIZONTAL),   # Tronco izquierdo
    ((677, 201, 694, 336), HORIZONTAL),   # Cadena del péndulo derecho
    ((633, 333, 738, 360), HORIZONTAL),   # Tronco derecho
    ((492, 440, 519, 537), HORIZONTAL),   # Compuerta vertical (entre el 3er y el 4o piso)
    ((557, 128, 567, 154), HORIZONTAL),   # Borde de la plataforma horizontal (sale de la pared derecha)
    ((40, 648, 145, 719), VERTICAL),      # Fireboy y Watergirl de la captura (a los lados hay piscinas)
    ((55, 720, 80, 723), [(80, 0), (120, 0)]),     # Pies de Fireboy sobre el borde del suelo
    ((105, 720, 132, 723), [(-28, 0), (-60, 0)]),  # Pies de Watergirl (a la derecha hay lava)
]

# Recorte del tronco izquierdo en la captura (el derecho es igual)
RECORTE_TRONCO = (272, 333, 378, 360)

# Diferencia de color (0..255) a partir de la cual un píxel es parte del objeto y no de la pared
UMBRAL_OBJETO = 20


def mascara_borrado(alto, ancho):
    m = np.zeros((alto, ancho), bool)
    for (x0, y0, x1, y1), _ in BORRAR:
        m[y0:y1 + 1, x0:x1 + 1] = True
    return m


def rellenar(img, mascara):
    """Cada píxel borrado toma el de la pared desplazada que no esté borrado."""
    salida = img.copy()
    alto, ancho = mascara.shape
    for (x0, y0, x1, y1), desplazamientos in BORRAR:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                for dx, dy in desplazamientos:
                    xo, yo = x + dx, y + dy
                    if 0 <= xo < ancho and 0 <= yo < alto and not mascara[yo, xo]:
                        salida[y, x] = img[yo, xo]
                        break
    return salida


def recortar_tronco(original, limpio):
    """Recorta el tronco y vuelve transparente la pared que se ve alrededor."""
    x0, y0, x1, y1 = RECORTE_TRONCO
    orig = original[y0:y1 + 1, x0:x1 + 1].astype(int)
    pared = limpio[y0:y1 + 1, x0:x1 + 1].astype(int)
    diferente = np.abs(orig - pared).max(axis=2) > UMBRAL_OBJETO

    # La pared es lo que se alcanza desde el borde del recorte sin cruzar el objeto
    alto, ancho = diferente.shape
    fuera = np.zeros_like(diferente)
    pila = [(y, x) for y in range(alto) for x in (0, ancho - 1)] + \
           [(y, x) for x in range(ancho) for y in (0, alto - 1)]
    while pila:
        y, x = pila.pop()
        if 0 <= y < alto and 0 <= x < ancho and not fuera[y, x] and not diferente[y, x]:
            fuera[y, x] = True
            pila += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]

    rgba = np.dstack([orig.astype(np.uint8), np.where(fuera, 0, 255).astype(np.uint8)])

    # Quitar filas y columnas completamente transparentes
    filas = np.nonzero(rgba[..., 3].any(axis=1))[0]
    cols = np.nonzero(rgba[..., 3].any(axis=0))[0]
    return rgba[filas[0]:filas[-1] + 1, cols[0]:cols[-1] + 1]


def main():
    original = np.asarray(Image.open(ORIGEN).convert('RGB'))
    mascara = mascara_borrado(*original.shape[:2])
    limpio = rellenar(original, mascara)

    Image.fromarray(limpio).save(FONDO)
    tronco = recortar_tronco(original, limpio)
    Image.fromarray(tronco, 'RGBA').save(TRONCO)

    print(f'Fondo limpio: {FONDO}')
    print(f'Tronco: {TRONCO} ({tronco.shape[1]}x{tronco.shape[0]} px)')


if __name__ == '__main__':
    main()
