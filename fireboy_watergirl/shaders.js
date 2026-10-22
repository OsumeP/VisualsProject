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
  uniform float time; // <-- Cambiado a 'time' para que coincida con el JS

  void main() {
    vec2 uv = vTexCoord;

    // Hacemos las ondas más notorias multiplicando el impacto en el color
    float onda1 = sin(uv.x * 15.0 + time * 4.0) * 0.12;
    float onda2 = cos(uv.y * 15.0 + time * 3.0) * 0.08;

    // Sumamos las ondas al color final
    vec3 colorFinal = uColor + vec3(onda1 + onda2);

    gl_FragColor = vec4(colorFinal, 1.0);
  }
`;
