/* ==========================================================
   faq.js · Preguntas frecuentes (FAQ.html): carga Json/faq.json y construye el acordeón
   (cada pregunta es un botón que abre o cierra su respuesta).
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar se ejecuta cargarPreguntas().
document.addEventListener("DOMContentLoaded", cargarPreguntas);

/* cargarPreguntas(): pide el JSON y crea un bloque de acordeón por cada pregunta. */
async function cargarPreguntas() {
    const seccionPreguntas = document.getElementById("lista-preguntas");

    if (!seccionPreguntas) {
        console.error("No se encontró el contenedor de preguntas.");
        return;
    }

    try {
        // 1) Pedir el archivo JSON al servidor.
        const respuesta = await fetch("Json/faq.json");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar Json/faq.json. Código: " +
                respuesta.status
            );
        }

        // 2) Convertir el texto JSON en un objeto de JavaScript.
        const datos = await respuesta.json();

        seccionPreguntas.replaceChildren();

        // Cada pregunta del JSON = un bloque (botón + panel). La primera inicia abierta.
        datos.preguntas.forEach(function (item, indice) {
            const abierta = indice === 0;

            const bloque = document.createElement("div");
            bloque.classList.add("faq-item");
            if (abierta) bloque.classList.add("abierta");

            const boton = document.createElement("button");
            boton.type = "button";
            boton.classList.add("faq-q");
            boton.id = "faq-q-" + indice;
            boton.textContent = item.pregunta;
            boton.setAttribute("aria-expanded", String(abierta));
            boton.setAttribute("aria-controls", "faq-a-" + indice);

            const panel = document.createElement("div");
            panel.classList.add("faq-a");
            panel.id = "faq-a-" + indice;
            panel.setAttribute("role", "region");
            panel.setAttribute("aria-labelledby", boton.id);
            panel.hidden = !abierta;

            const respuestaPregunta = document.createElement("p");
            respuestaPregunta.textContent = item.respuesta;
            panel.appendChild(respuestaPregunta);

            // Al hacer clic se abre o cierra la respuesta y se actualiza aria-expanded (accesibilidad).
            boton.addEventListener("click", function () {
                const ahora = bloque.classList.toggle("abierta");
                boton.setAttribute("aria-expanded", String(ahora));
                panel.hidden = !ahora;
            });

            bloque.append(boton, panel);
            seccionPreguntas.appendChild(bloque);
        });

    // Si falla la carga se muestra un mensaje simple.
    } catch (error) {
        console.error("Error al cargar las preguntas frecuentes:", error);

        seccionPreguntas.textContent =
            "No se pudieron cargar las preguntas frecuentes.";
    }
}