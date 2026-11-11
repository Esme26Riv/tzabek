/* ==========================================================
   detalles-dron.js · Ficha de un dron (Dron.html): lee el ?id= de la URL, pide los datos
   a PHP/obtener_dron.php y llena la página (textos, galería y botón de cotización).
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar se ejecuta cargarDetallesDron().
document.addEventListener("DOMContentLoaded", cargarDetallesDron);

/* cargarDetallesDron(): obtiene el dron indicado en la URL y rellena toda la ficha. */
async function cargarDetallesDron() {
    const parametros = new URLSearchParams(window.location.search);
    // Lee el ID del dron desde la URL (Dron.html?id=3).
    const identificador = parametros.get("id");
    const mensaje = document.getElementById("mensaje-dron");
    const seccion = document.getElementById("detalles-dron");

    // Se valida que el ID exista y sea numérico antes de consultar al servidor.
    if (!identificador || !/^\d+$/.test(identificador)) {
        mensaje.textContent = "No se indicó un dron válido.";
        return;
    }

    try {
        // Pide al PHP los datos del dron en formato JSON.
        const respuesta = await fetch(
            "PHP/obtener_dron.php?id=" + encodeURIComponent(identificador)
        );

        const dron = await respuesta.json();

        if (!respuesta.ok || dron.error) {
            throw new Error(dron.error || "No fue posible cargar el dron.");
        }

        // Se rellena la página con los datos recibidos (si falta alguno, asignarTexto pone "Información por confirmar").
        document.title = dron.Nombre + " | Tzab-ek";

        asignarTexto("categoria-dron", dron.Categoria);
        asignarTexto("nombre-dron", dron.Nombre);
        asignarTexto("nombre-miga", dron.Nombre);
        asignarTexto("descripcion-dron", dron.Descripcion);
        asignarTexto("proposito-dron", dron.Proposito);
        asignarTexto("autonomia-dron", dron.AutonomiaVuelo);
        asignarTexto("alcance-dron", dron.Alcance);
        asignarTexto("peso-dron", dron.Peso);
        asignarTexto("camara-dron", dron.CamaraSensores);
        asignarTexto("velocidad-dron", dron.VelocidadMaxima);
        asignarTexto("aplicaciones-dron", dron.Aplicaciones);
        asignarTexto("publico-dron", dron.PublicoObjetivo);
        asignarTexto("historia-dron", dron.HistoriaModelo);

        // Dibuja la galería: la primera imagen es la principal y el resto son miniaturas.
        mostrarImagenes(dron.Imagenes || []);

        // El botón lleva al formulario con el nombre del dron como asunto y su ID para guardarlo en la cotización.
        document.getElementById("enlace-cotizacion").href =
            "Contáctanos.html?asunto=" + encodeURIComponent(dron.Nombre) +
            "&idDron=" + encodeURIComponent(dron.IDDron);

        // Se oculta el mensaje de carga y se muestra la sección de detalles.
        mensaje.textContent = "";
        seccion.hidden = false;

    } catch (error) {
        console.error("Error al cargar los detalles:", error);
        mensaje.textContent =
            "No fue posible cargar los detalles. Verifica que el dron exista en la base de datos.";
    }
}

/* asignarTexto(): escribe un valor en el elemento con ese id; si viene vacío, pone un texto por defecto. */
function asignarTexto(identificador, valor) {
    const elemento = document.getElementById(identificador);
    elemento.textContent =
        valor && String(valor).trim()
            ? valor
            : "Información por confirmar.";
}

/* mostrarImagenes(): pone la primera imagen como principal y crea miniaturas
   (con soporte de teclado) para cambiarla. Si no hay imágenes, muestra un aviso. */
function mostrarImagenes(imagenes) {
    const principal = document.getElementById("imagen-principal");
    const secundarias = document.getElementById("imagenes-secundarias");

    principal.replaceChildren();
    secundarias.replaceChildren();

    if (imagenes.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "Imagen no disponible.";
        principal.appendChild(mensaje);
        return;
    }

    imagenes.forEach(function (archivo, indice) {
        const ruta = obtenerRutaImagen(archivo);

        if (!ruta) {
            return;
        }

        const imagen = document.createElement("img");
        imagen.src = ruta;
        imagen.alt = "Imagen " + (indice + 1) + " del dron";
        imagen.loading = "lazy";

        imagen.addEventListener("error", function () {
            imagen.remove();
        }, { once: true });

        if (indice === 0) {
            imagen.alt = "Imagen principal del dron";
            principal.appendChild(imagen);
        } else {
            imagen.tabIndex = 0;
            imagen.setAttribute("role", "button");
            imagen.setAttribute("aria-label", "Ver esta imagen como principal");

            imagen.addEventListener("click", function () {
                cambiarImagenPrincipal(ruta, imagen.alt);
            });

            imagen.addEventListener("keydown", function (evento) {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    cambiarImagenPrincipal(ruta, imagen.alt);
                }
            });

            secundarias.appendChild(imagen);
        }
    });

    if (!principal.hasChildNodes()) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "Imagen no disponible.";
        principal.appendChild(mensaje);
    }
}

/* cambiarImagenPrincipal(): reemplaza la imagen grande por la miniatura elegida. */
function cambiarImagenPrincipal(ruta, textoAlternativo) {
    const principal = document.getElementById("imagen-principal");
    const imagen = document.createElement("img");

    imagen.src = ruta;
    imagen.alt = textoAlternativo;
    principal.replaceChildren(imagen);
}

/* obtenerRutaImagen(): valida la ruta de imagen (bloquea URLs externas, javascript: y "..");
   si solo es un nombre de archivo, lo busca en la carpeta img/. */
function obtenerRutaImagen(valor) {
    if (typeof valor !== "string" || !valor.trim()) {
        return "";
    }

    const ruta = valor.trim().replace(/\\/g, "/");

    if (
        /^(https?:|\/\/|data:|javascript:)/i.test(ruta) ||
        ruta.startsWith("/") ||
        ruta.split("/").includes("..")
    ) {
        return "";
    }

    return ruta.includes("/") ? ruta : "img/" + ruta;
}
