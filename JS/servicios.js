/* ==========================================================
   servicios.js · Carga Servicios.html desde Json/servicios.json:
   título, descripción y una tarjeta por cada servicio (con su icono SVG).
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar se ejecuta cargarServicios().
document.addEventListener("DOMContentLoaded", cargarServicios);

/* cargarServicios(): pide el JSON y crea las tarjetas de servicios. */
async function cargarServicios() {
    const tituloServicios = document.getElementById("titulo-servicios");
    const descripcionServicios = document.getElementById("descripcion-servicios");
    const listaServicios = document.getElementById("lista-servicios");

    // Iconos SVG para las tarjetas.
    const iconos = {
        camera: `
            <rect x="3" y="7" width="18" height="14" rx="1"/>
            <path d="M8 7l1.5-3h5L16 7"/>
            <circle cx="12" cy="14" r="4"/>
        `,
        scan: `
            <path d="M4 8V4h4"/>
            <path d="M16 4h4v4"/>
            <path d="M20 16v4h-4"/>
            <path d="M8 20H4v-4"/>
        `,
        leaf: `
            <path d="M20 4C10 4 4 9 4 17c0 2 1 3 3 3 8 0 13-6 13-16Z"/>
            <path d="M4 20c3-5 7-8 12-11"/>
        `,
        lightbulb: `
            <path d="M9 18h6"/>
            <path d="M10 22h4"/>
            <path d="M8.5 14.5A7 7 0 1 1 15.5 14.5C14.5 15.5 14 16 14 18h-4c0-2-.5-2.5-1.5-3.5Z"/>
        `,
        key: `
            <circle cx="8" cy="15" r="5"/>
            <path d="m11.5 11.5 9-9"/>
            <path d="M17 6l3 3"/>
            <path d="M14 9l3 3"/>
        `,
        heart: `
            <path d="M20.8 8.8c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 8.8 2.5Z"/>
        `,
        "shopping-cart": `
            <circle cx="9" cy="20" r="1.5"/>
            <circle cx="18" cy="20" r="1.5"/>
            <path d="M2 3h3l3 12h11l3-9H6"/>
        `,
        headphones: `
            <path d="M3 13v-2a9 9 0 0 1 18 0v2"/>
            <path d="M3 13h4v7H5a2 2 0 0 1-2-2Z"/>
            <path d="M21 13h-4v7h2a2 2 0 0 0 2-2Z"/>
        `
    };

    try {
        // 1) Pedir el archivo JSON al servidor.
        const respuesta = await fetch("Json/servicios.json");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar Json/servicios.json. Código: " +
                respuesta.status
            );
        }

        // 2) Convertir el texto JSON en un objeto de JavaScript.
        const datos = await respuesta.json();

        // Cargar título y descripción.
        tituloServicios.textContent = datos.seccion1.titulo;
        descripcionServicios.textContent = datos.seccion1.descripcion;

        // Limpiar las tarjetas anteriores.
        listaServicios.replaceChildren();

        // Generar las tarjetas desde el JSON.
        datos.servicios.forEach(function (servicio) {
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta-servicio");

            // Crear el icono SVG.
            const icono = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );

            icono.setAttribute("viewBox", "0 0 24 24");
            icono.setAttribute("width", "26");
            icono.setAttribute("height", "26");
            icono.setAttribute("fill", "none");
            icono.setAttribute("stroke", "currentColor");
            icono.setAttribute("stroke-width", "1.7");
            icono.setAttribute("stroke-linecap", "round");
            icono.setAttribute("stroke-linejoin", "round");
            icono.setAttribute("aria-hidden", "true");
            icono.classList.add("icono-servicio");

            // Insertar el dibujo correspondiente.
            const dibujo = iconos[servicio.icono] || "";

            icono.innerHTML = dibujo;

            // Título.
            // textContent inserta texto plano (más seguro que innerHTML).
            const titulo = document.createElement("h2");
            titulo.textContent = servicio.titulo;

            // Descripción.
            const descripcion = document.createElement("p");
            descripcion.textContent = servicio.descripcion;

            tarjeta.append(icono, titulo, descripcion);
            listaServicios.appendChild(tarjeta);
        });

    // Si algo falla se muestra un mensaje de error en lugar de las tarjetas.
    } catch (error) {
        console.error("Error al cargar los servicios:", error);

        tituloServicios.textContent = "Servicios";
        descripcionServicios.textContent = "";

        listaServicios.replaceChildren();

        const mensajeError = document.createElement("p");
        mensajeError.textContent =
            "No se pudo cargar la información de los servicios. Verifica la ruta del archivo JSON.";

        listaServicios.appendChild(mensajeError);
    }
}
