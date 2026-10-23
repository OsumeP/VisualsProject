# Compone cada pose (cabeza + cuerpo) como lo hará el juego y la guarda ampliada,
# junto a los personajes del fondo original como referencia.
import json, os, re, sys
from PIL import Image, ImageDraw
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = open(os.path.join(RAIZ, 'sprites_datos.js'), encoding='utf-8').read()
S = json.loads(js[js.index('{'):js.rindex('}') + 1])
SOLAPE = float(sys.argv[2]) if len(sys.argv) > 2 else 3   # píxeles que la cabeza tapa del torso
Z = 4

def cuadro(d, i=0):
    tira = Image.open(os.path.join(RAIZ, 'Resources', 'sprites', d['archivo']))
    c = tira.crop((i * d['ancho'], 0, (i + 1) * d['ancho'], d['alto']))
    return c.resize((round(c.width * d['escala'] * Z), round(c.height * d['escala'] * Z)), Image.LANCZOS)

def pegar(lienzo, d, x, y, i=0):
    img = cuadro(d, i)
    lienzo.alpha_composite(img, (round(x - d['anclaX'] * d['escala'] * Z), round(y - d['anclaY'] * d['escala'] * Z)))

poses = []
for elem in ('agua', 'fuego'):
    for anim in ('quieto', 'caer', 'saltar', 'correr'):
        lz = Image.new('RGBA', (60 * Z, 90 * Z), (60, 55, 30, 255))
        pies = 80 * Z; x = 30 * Z
        d = ImageDraw.Draw(lz)
        d.rectangle([x - 15 * Z, pies - 30 * Z, x + 15 * Z, pies], outline=(255, 0, 255))  # caja física
        cuerpo = S[elem]['cuerpo_correr' if anim == 'correr' else 'cuerpo_quieto']
        alto_cuerpo = cuerpo['alto'] * cuerpo['escala'] * Z
        tope = pies - alto_cuerpo
        pegar(lz, cuerpo, x, tope)
        pegar(lz, S[elem]['cabeza_' + anim], x, tope + SOLAPE * Z)
        poses.append(lz)
ref = Image.open(os.path.join(RAIZ, 'Resources', 'images', 'backgame_ref.png')).convert('RGBA').crop((25, 555, 125, 730))
ref = ref.resize((ref.width * Z, ref.height * Z), Image.NEAREST)
W = sum(p.width for p in poses[:4]) + ref.width; H = max(poses[0].height * 2, ref.height)
out = Image.new('RGBA', (W, H), (30, 30, 30, 255))
for i, p in enumerate(poses): out.alpha_composite(p, ((i % 4) * p.width, (i // 4) * p.height))
out.alpha_composite(ref, (4 * poses[0].width, 0))
out.save(sys.argv[1])
