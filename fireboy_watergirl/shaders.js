// --- SHADER PARA EL MOVIMIENTO DEL LÍQUIDO ---
// Shader de Vértices (Pasa la geometría a la pantalla)

let shaderLiquido; // Variable global para guardar el shader compilado

// --- SHADER CORREGIDO PARA WEBGL EN p5.js ---

const vsPiscina = `
  precision highp float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;

  // Matrices automáticas que p5.js le envía al shader para calcular posiciones reales
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    vTexCoord = aTexCoord;
    // Multiplicamos la posición por las matrices para que respete el translate() de JavaScript
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
`;

const fsPiscina = `
  precision highp float;
  varying vec2 vTexCoord;

  uniform vec3 uColor;
  uniform float time; // Segundos de juego (tiempoJuego)

  void main() {
    vec2 uv = vTexCoord; // x: 0..1 a lo ancho; y: 0 en el borde superior, 1 en el fondo

    // Superficie ondulada: lo que queda por encima de la ola no se pinta
    float ola = 0.2 + 0.1 * sin(uv.x * 28.0 + time * 3.0)
                    + 0.05 * sin(uv.x * 61.0 - time * 4.3);
    if (uv.y < ola) discard;

    // Más claro arriba y más oscuro en el fondo
    float profundidad = (uv.y - ola) / (1.0 - ola);
    vec3 colorFinal = uColor * (1.15 - 0.45 * profundidad);

    // Brillo en la cresta de la ola
    float cresta = 1.0 - smoothstep(0.0, 0.12, uv.y - ola);
    colorFinal += vec3(0.35) * cresta;

    // Ondulación interna del líquido
    colorFinal += vec3(0.06) * sin(uv.x * 15.0 + time * 4.8)
                + vec3(0.04) * cos(uv.y * 15.0 + time * 3.6);

    gl_FragColor = vec4(colorFinal, 1.0);
  }
`;
