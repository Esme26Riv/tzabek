/* ==========================================================
   drone.js · Dibuja con SVG las ilustraciones animadas del dron:
   escena de vuelo con telemetría (inicio), radar (Nosotros/Inicio) e imágenes de relleno del catálogo.
   ========================================================== */

"use strict";

/* Ilustración SVG del dron (vista superior) */
function drone(v = 0, size = 360, spin = true) {
  // rot(x, y): dibuja un rotor (aro + aspas) en esa posición. Si spin es true, las aspas giran con CSS.
  const rot = (x, y) => `<circle cx="${x}"
    cy="${y}"
    r="32" fill="none"
    stroke="currentColor"
    stroke-width="1"
    opacity=".5"/><g
    class="${spin ? 'rotor' : ''}"><line
    x1="${x - 29}"
    y1="${y}"
    x2="${x + 29}"
    y2="${y}"
    stroke="currentColor" stroke-width="2"
    stroke-linecap="round"/><line x1="${x}"
    y1="${y - 29}" x2="${x}" y2="${y + 29}" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".45"/></g><circle cx="${x}" cy="${y}" r="3.5" fill="currentColor"/>`;
  // Relleno oscuro y borde del cuerpo del dron.
  const fill = 'fill="#121212" stroke="currentColor" stroke-width="1.8"';
  // Tres variantes de cuerpo: 0 = rectángulo redondeado, 1 = círculo, 2 = rombo.
  const
    body = v === 1 ? `<circle cx="160" cy="131" r="38" ${fill}/>`
      : v === 2 ? `<rect x="128" y="99" width="64" height="64" rx="8" transform="rotate(45 160 131)" ${fill}/>`
        : `<rect x="124" y="96" width="72" height="70" rx="14" ${fill}/>`;
  // Devuelve el SVG completo: brazos, 4 rotores, cuerpo, cámara y soporte.
  return `<svg class="drone-svg ${spin ? 'float' : ''}" width="${size}" height="${size * 0.82}" viewBox="0 0 320 262" role="img" aria-label="Ilustración de dron">
  <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M98 74L132 108M222 74L188 108M98 188L132 154M222 188L188 154"/></g>
  ${rot(80, 56)}${rot(240, 56)}${rot(80, 206)}${rot(240, 206)}
  ${body}<circle cx="160" cy="131" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="160" cy="131" r="3.5" fill="currentColor"/>
  <path d="M160 169v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="160" cy="187" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;
}

/* Escena 1: dron con movimiento + telemetría (hero) */
function montarVuelo(el) {
  el.innerHTML = `
    <div class="cruz"></div>
    ${drone(0, 360, true)}
    <div class="drone-telemetry" aria-hidden="true">
      <div class="t-pos">POS<span>31.69°N 106.42°O</span></div>
      <div class="t-alt">ALT<span>123 m</span></div>
      <div class="t-bat">BAT<span>60 %</span></div>
      <div class="t-senal">SEÑAL<span>Óptima</span></div>
    </div>`;
}

/* Escena 2: radar con barrido y dron quieto (¿Quiénes somos?) */
function montarRadar(el) {
  el.classList.add("radar");
  el.innerHTML = `
    <div class="cruz"></div>
    <div class="barrido"></div>
    ${drone(0, 860, false)}`;
}

/* Miniaturas del catálogo: rellena las imágenes vacías con un dron */
function rellenarMiniaturas() {
  document.querySelectorAll(".imagen-no-disponible").forEach((caja, i) => {
    if (caja.querySelector("svg")) return;
    const tarjeta = caja.closest(".tarjeta-dron");
    const pos = tarjeta ? [...tarjeta.parentNode.children].indexOf(tarjeta) : i;
    caja.innerHTML = drone(Math.max(pos, 0) % 3, 300, false);
  });
}

// Al cargar la página: dibuja las escenas marcadas con data-drone y vigila el catálogo del inicio.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-drone]").forEach((el) => {
    if (el.dataset.drone === "radar") montarRadar(el);
    else montarVuelo(el);
  });

  // Las tarjetas del catálogo se crean después (con fetch). Un MutationObserver avisa cada vez
  // que se agregan, para rellenar con una ilustración las imágenes que no cargaron.
  const catalogo = document.getElementById("contenedor-drones");
  if (catalogo) {
    rellenarMiniaturas();
    new MutationObserver(rellenarMiniaturas)
      .observe(catalogo, { childList: true, subtree: true });
  }
});