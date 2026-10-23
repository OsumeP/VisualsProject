# Muestra las bandas (filas) y celdas detectadas en una hoja de sprites con bordes turquesa.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

def celdas(ruta):
    a = np.asarray(Image.open(ruta).convert('RGBA'))
    turquesa = (a[..., 0] == 0) & (a[..., 1] == 128) & (a[..., 2] == 128) & (a[..., 3] == 255)
    etiquetas, n = ndimage.label(~turquesa)
    cajas = ndimage.find_objects(etiquetas)
    res = []
    for i, c in enumerate(cajas):
        y0, y1, x0, x1 = c[0].start, c[0].stop, c[1].start, c[1].stop
        res.append((y0, x0, y1 - y0, x1 - x0))
    return sorted(res)

if __name__ == '__main__':
    for ruta in sys.argv[1:]:
        print(ruta)
        cs = [c for c in celdas(ruta) if c[2] > 30 and c[3] > 15]
        filas = {}
        for y, x, h, w in cs:
            clave = next((k for k in filas if abs(k - y) < 25), y)
            filas.setdefault(clave, []).append((x, w, h))
        for y in sorted(filas):
            celdas_fila = sorted(filas[y])
            print(f'  y={y:5d}  n={len(celdas_fila):2d}  tamaños={sorted(set((w, h) for _, w, h in celdas_fila))}')
