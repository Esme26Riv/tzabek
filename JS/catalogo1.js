/* ==========================================================
   catalogo1.js · Carrusel de drones de la página de inicio
   1) Pide a php/obtener_drones.php la lista de drones (JSON).
   2) Crea una tarjeta (enlace a dron.html?id=...) por cada dron.
   3) Controla el carrusel: flechas, avance automático y pausa.
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar: se activa el carrusel y se piden los drones.
document.addEventListener("DOMContentLoaded", function () {
    iniciarCarrusel();
    cargarDrones();
});

// Función que el carrusel expone para recalcular si se muestran las flechas.
// Se reemplaza dentro de iniciarCarrusel() cuando el carrusel existe en la página.
let actualizarControlesCarrusel = function () {};

/* ----------------------------------------------------------
   cargarDrones(): consulta la base de datos (vía PHP) y
   dibuja una tarjeta por cada dron dentro de la pista.
   ---------------------------------------------------------- */
async function cargarDrones() {
    const contenedor = document.getElementById("contenedor-drones");

    // Si esta página no tiene carrusel, no hay nada que hacer.
    if (!contenedor) {
        return;
    }

    try {
        // Petición al servidor (fetch es asíncrono, por eso se usa await).
        const respuesta = await fetch("php/obtener_drones.php");

        // Si el servidor responde con error (404, 500...) se salta al catch.
        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        // Se convierte el texto JSON en un arreglo de objetos de JavaScript.
        const drones = await respuesta.json();

        // El PHP devuelve un arreglo; si devuelve otra cosa (por ejemplo {error: ...}) es un fallo.
        if (!Array.isArray(drones)) {
            throw new Error(
                drones.error || "La respuesta del servidor no es válida."
            );
        }

        // Se borra el mensaje "Cargando drones...".
        contenedor.replaceChildren();

        if (drones.length === 0) {
            mostrarMensaje(
                contenedor,
                "Todavía no hay drones registrados en el catálogo."
            );
            actualizarControlesCarrusel();
            return;
        }

        // Una tarjeta por cada dron recibido.
        drones.forEach(function (dron) {

            // Se ignora cualquier dron que no traiga un ID válido.
            if (!dron.IDDron) {
                console.error("Dron sin ID válido:", dron);
                return;
            }

            // Toda la tarjeta es un enlace a la ficha del dron (dron.html?id=3).
            const tarjeta = document.createElement("a");

            tarjeta.className = "tarjeta-dron";

            // encodeURIComponent evita que caracteres raros rompan la URL.
            tarjeta.href =
                "dron.html?id=" + encodeURIComponent(dron.IDDron);

            tarjeta.setAttribute(
                "aria-label",
                "Ver detalles de " + (dron.Nombre || "este dron")
            );

            // Imagen del dron (carga diferida: loading = "lazy").
            const imagen = document.createElement("img");

            imagen.className = "imagen-dron";
            imagen.alt = "Imagen de " + (dron.Nombre || "dron");
            imagen.loading = "lazy";

            // Si la imagen no se puede cargar, se reemplaza por un recuadro
            // (drone.js lo rellena después con una ilustración de dron).
            imagen.addEventListener("error", function () {
                const marcador = document.createElement("div");

                marcador.className = "imagen-no-disponible";
                marcador.textContent = "Imagen no disponible";

                imagen.replaceWith(marcador);
            }, { once: true });

            const rutaImagen = obtenerRutaImagen(dron.Imagen);

            if (rutaImagen) {
                imagen.src = rutaImagen;
            } else {
                // Sin ruta válida: se dispara el mismo manejo de error.
                imagen.dispatchEvent(new Event("error"));
            }

            // Contenido de texto de la tarjeta: categoría, nombre y descripción.
            // Se usa textContent (texto plano) y no innerHTML para evitar inyección de código.
            const contenido = document.createElement("div");

            contenido.className = "contenido-tarjeta";

            const categoria = document.createElement("span");

            categoria.className = "categoria-dron";
            categoria.textContent = dron.Categoria || "Sin categoría";

            const nombre = document.createElement("h3");

            nombre.textContent = dron.Nombre || "Dron sin nombre";

            const descripcion = document.createElement("p");

            descripcion.className = "descripcion-dron";
            descripcion.textContent =
                dron.Descripcion || "Sin descripción disponible.";

            contenido.append(categoria, nombre, descripcion);
            tarjeta.append(imagen, contenido);

            // Se agrega la tarjeta a la pista del carrusel.
            contenedor.appendChild(tarjeta);
        });

        // Ya con las tarjetas puestas, se decide si hacen falta las flechas.
        actualizarControlesCarrusel();

    } catch (error) {
        // Cualquier fallo (red, PHP, JSON inválido) se registra y se avisa al usuario.
        console.error("Error al cargar el catálogo:", error);

        contenedor.replaceChildren();

        mostrarMensaje(
            contenedor,
            "No fue posible cargar los drones. Verifica la conexión con el servidor.",
            true
        );

        actualizarControlesCarrusel();
    }
}

/* ----------------------------------------------------------
   iniciarCarrusel(): conecta las flechas, el avance automático
   y el botón de pausa con la pista de tarjetas.
   El desplazamiento lo hace el navegador (scroll horizontal con
   scroll-snap en CSS); aquí solo se calcula cuánto mover.
   ---------------------------------------------------------- */
function iniciarCarrusel() {
    const pista = document.getElementById("contenedor-drones");
    const botonAnterior = document.getElementById("carrusel-anterior");
    const botonSiguiente = document.getElementById("carrusel-siguiente");
    const botonPausa = document.getElementById("carrusel-pausa");

    if (!pista || !botonAnterior || !botonSiguiente) {
        return;
    }

    const INTERVALO = 5000; // milisegundos entre cada avance automático

    // Si el usuario pidió "reducir movimiento" en su sistema, no hay avance
    // automático ni animaciones de desplazamiento.
    const reducirMovimiento =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const comportamiento = reducirMovimiento ? "auto" : "smooth";

    let pausadoPorUsuario = reducirMovimiento; // el usuario pulsó "Pausar"
    let pausadoTemporal = false;               // el mouse o el foco está sobre el carrusel
    let temporizador = null;

    // Cuánto se desplaza el carrusel en cada paso: el ancho de una tarjeta + el espacio entre tarjetas.
    function calcularPaso() {
        const tarjeta = pista.querySelector(".tarjeta-dron");

        if (!tarjeta) {
            return pista.clientWidth;
        }

        const espacio = parseFloat(getComputedStyle(pista).columnGap) || 0;

        return tarjeta.getBoundingClientRect().width + espacio;
    }

    // Avanza una tarjeta; si ya está al final, regresa al inicio (carrusel infinito).
    function moverSiguiente() {
        const alFinal =
            pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 2;

        if (alFinal) {
            pista.scrollTo({ left: 0, behavior: comportamiento });
        } else {
            pista.scrollBy({ left: calcularPaso(), behavior: comportamiento });
        }
    }

    // Retrocede una tarjeta; si está al inicio, salta al final.
    function moverAnterior() {
        if (pista.scrollLeft <= 2) {
            pista.scrollTo({ left: pista.scrollWidth, behavior: comportamiento });
        } else {
            pista.scrollBy({ left: -calcularPaso(), behavior: comportamiento });
        }
    }

    // Avance automático: cada INTERVALO ms, salvo que esté en pausa o la pestaña esté oculta.
    function iniciarAutomatico() {
        detenerAutomatico();

        if (pausadoPorUsuario) {
            return;
        }

        temporizador = setInterval(function () {
            if (!pausadoTemporal && !document.hidden) {
                moverSiguiente();
            }
        }, INTERVALO);
    }

    function detenerAutomatico() {
        clearInterval(temporizador);
        temporizador = null;
    }


    // Las flechas y el botón de pausa solo se muestran si hay más tarjetas de las que caben.
    actualizarControlesCarrusel = function () {
        const hayDesbordamiento = pista.scrollWidth > pista.clientWidth + 2;

        botonAnterior.hidden = !hayDesbordamiento;
        botonSiguiente.hidden = !hayDesbordamiento;

        if (pie) {
            pie.hidden = !hayDesbordamiento;
        }
    };

    // --- Eventos ---

    botonAnterior.addEventListener("click", moverAnterior);
    botonSiguiente.addEventListener("click", moverSiguiente);

    // Flechas del teclado cuando la pista tiene el foco.
    pista.addEventListener("keydown", function (evento) {
        if (evento.key === "ArrowRight") {
            evento.preventDefault();
            moverSiguiente();
        } else if (evento.key === "ArrowLeft") {
            evento.preventDefault();
            moverAnterior();
        }
    });

    if (botonPausa) {
        botonPausa.addEventListener("click", function () {
            pausadoPorUsuario = !pausadoPorUsuario;
            actualizarBotonPausa();
            iniciarAutomatico();
        });
    }

    // Pausa temporal mientras el usuario tiene el mouse o el teclado dentro del carrusel.
    const carrusel = pista.closest(".carrusel");

    if (carrusel) {
        carrusel.addEventListener("mouseenter", function () { pausadoTemporal = true; });
        carrusel.addEventListener("mouseleave", function () { pausadoTemporal = false; });
        carrusel.addEventListener("focusin", function () { pausadoTemporal = true; });
        carrusel.addEventListener("focusout", function () { pausadoTemporal = false; });
    }

    // Si cambia el tamaño de la ventana, cambia cuántas tarjetas caben.
    window.addEventListener("resize", actualizarControlesCarrusel);

    actualizarBotonPausa();
    iniciarAutomatico();
}

/* ----------------------------------------------------------
   obtenerRutaImagen(): valida el nombre/ruta de imagen que
   viene de la base de datos antes de usarlo en el <img>.
   Seguridad: bloquea URLs externas, javascript: y rutas con "..".
   Si solo trae el nombre del archivo, lo busca en la carpeta img/.
   ---------------------------------------------------------- */
function obtenerRutaImagen(valor) {

    if (typeof valor !== "string" || !valor.trim()) {
        return "";
    }

    const ruta = valor.trim();

    // No permitir protocolos externos.
    if (/^(https?:|\/\/|data:|javascript:)/i.test(ruta)) {
        return "";
    }

    // Si solamente contiene el nombre del archivo.
    if (!ruta.includes("/") && !ruta.includes("\\")) {
        return "img/" + ruta;
    }

    // Normalizar las barras.
    const rutaNormalizada = ruta.replace(/\\/g, "/");

    // Evitar rutas fuera del proyecto.
    if (
        rutaNormalizada.startsWith("/") ||
        rutaNormalizada.split("/").includes("..")
    ) {
        return "";
    }

    return rutaNormalizada;
}

/* ----------------------------------------------------------
   mostrarMensaje(): escribe un aviso dentro de la pista
   (por ejemplo "Cargando..." o un error).
   ---------------------------------------------------------- */
function mostrarMensaje(contenedor, mensaje, esError = false) {

    const parrafo = document.createElement("p");

    parrafo.className = esError
        ? "mensaje-catalogo mensaje-error"
        : "mensaje-catalogo";

    parrafo.textContent = mensaje;

    contenedor.appendChild(parrafo);
}
