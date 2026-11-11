/* ==========================================================
   menu.js · Menú hamburguesa (todas las páginas)
   Abre y cierra el <nav id="menu-principal"> en pantallas chicas.
   Se cierra al elegir un enlace, al tocar fuera, con Escape
   o al ensanchar la ventana.
   ========================================================== */
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const boton = document.querySelector(".menu-toggle");
    const menu = document.getElementById("menu-principal");

    if (!boton || !menu) {
        return;
    }

    function abrir(abierto) {
        menu.classList.toggle("abierto", abierto);
        boton.setAttribute("aria-expanded", String(abierto));
        boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    }

    boton.addEventListener("click", function () {
        abrir(!menu.classList.contains("abierto"));
    });

    // Al tocar un enlace del menú, se cierra.
    menu.addEventListener("click", function (evento) {
        if (evento.target.closest("a")) {
            abrir(false);
        }
    });

    // Tocar fuera del header cierra el menú.
    document.addEventListener("click", function (evento) {
        if (!evento.target.closest("header")) {
            abrir(false);
        }
    });

    // Escape cierra el menú y devuelve el foco al botón.
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && menu.classList.contains("abierto")) {
            abrir(false);
            boton.focus();
        }
    });

    // Si la ventana pasa a tamaño de escritorio, se reinicia el estado.
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
        if (e.matches) {
            abrir(false);
        }
    });
});
