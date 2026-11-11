/* ==========================================================
   nosotros.js · Carga el contenido de Nosotros.html desde Json/nosotros.json:
   los dos párrafos y las tarjetas de Misión, Visión, Valores y Objetivos.
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar se ejecuta cargarNosotros().
document.addEventListener("DOMContentLoaded", cargarNosotros);

/* cargarNosotros(): pide el JSON al servidor y dibuja la página.
   Es "async" porque fetch tarda y se espera con await. */
async function cargarNosotros() {
    const tarjetas = document.getElementById("tarjetas-nosotros");

    // Dibujos SVG de cada icono. El JSON solo guarda el nombre ("target", "eye"...)
    // y aquí se busca el dibujo que le corresponde.
    const iconos = {
        target: `
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="12" cy="12" r="2"/>
        `,
        eye: `
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3"/>
        `,
        star: `
            <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3 1.2-6.8-5-4.9 6.9-1Z"/>
        `,
        flag: `
            <path d="M5 22V3"/>
            <path d="M5 4h14l-3 5 3 5H5"/>
        `
    };

    try {
        // 1) Pedir el archivo JSON al servidor.
        const respuesta = await fetch("Json/nosotros.json");

        // Si el servidor responde con error (404, 500...) se lanza una excepción que atrapa el catch.
        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar Json/nosotros.json. Código: " +
                respuesta.status
            );
        }

        // 2) Convertir el texto JSON en un objeto de JavaScript.
        const datos = await respuesta.json();

        // SECCIÓN 2
        document.getElementById("titulo-nosotros").textContent =
            datos.seccion2.titulo;

        document.getElementById("parrafo-nosotros-1").textContent =
            datos.seccion2.parrafo1;

        document.getElementById("parrafo-nosotros-2").textContent =
            datos.seccion2.parrafo2;

        // SECCIÓN 3
        tarjetas.replaceChildren();

        // Por cada tarjeta del JSON se crea un <article> con icono, título y descripción.
        datos.seccion3.tarjetas.forEach(function (item) {
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta-nosotros");

            const icono = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );

            icono.setAttribute("viewBox", "0 0 24 24");
            icono.setAttribute("width", "28");
            icono.setAttribute("height", "28");
            icono.setAttribute("fill", "none");
            icono.setAttribute("stroke", "currentColor");
            icono.setAttribute("stroke-width", "1.7");
            icono.setAttribute("stroke-linecap", "round");
            icono.setAttribute("stroke-linejoin", "round");
            icono.setAttribute("aria-hidden", "true");
            icono.classList.add("icono-nosotros");

            // Los dibujos proceden de iconos definidos en este archivo.
            icono.innerHTML = iconos[item.icono] || "";

            // textContent inserta texto plano (más seguro que innerHTML: evita inyección de código).
            const titulo = document.createElement("h3");
            titulo.textContent = item.titulo;

            const descripcion = document.createElement("p");
            descripcion.textContent = item.descripcion;

            tarjeta.append(icono, titulo, descripcion);
            tarjetas.appendChild(tarjeta);
        });

    // Si algo falla (JSON mal escrito, ruta incorrecta...) se avisa en consola y al usuario.
    } catch (error) {
        console.error("Error al cargar Nosotros:", error);

        tarjetas.textContent =
            "No se pudo cargar la información. Verifica el archivo JSON y su ruta.";
    }
}
