/* ==========================================================
   catalogo2.js · Catálogo completo (catalogo.html): filtro por categoría y paginación.
   Pide los datos a php/catalogo.php y dibuja las tarjetas de drones.
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar se ejecuta iniciarCatalogo().
document.addEventListener("DOMContentLoaded", iniciarCatalogo);

// Estado del catálogo: drones por página, página actual y categoría elegida ("" = todas).
// Debe coincidir con $dronesPorPagina de php/catalogo.php.
const dronesPorPagina = 9;
let paginaActual = 1;
let categoriaActual = "";

/* iniciarCatalogo(): conecta los botones (filtro y paginación) y carga la primera página. */
function iniciarCatalogo() {
    const filtro = document.getElementById("filtro-categoria");
    const botonAnterior = document.getElementById("pagina-anterior");
    const botonSiguiente = document.getElementById("pagina-siguiente");

    /* El filtro ahora son botones: un solo listener para todos */
    filtro.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-categoria]");

        if (!boton) {
            return;
        }

        categoriaActual = boton.dataset.categoria;
        paginaActual = 1;
        cargarDrones();
    });

    // Botón "Anterior": retrocede una página si no está en la primera.
    botonAnterior.addEventListener("click", function () {
        if (paginaActual > 1) {
            paginaActual--;
            cargarDrones();
        }
    });

    // Botón "Siguiente": avanza una página (el PHP corrige si se pasa del total).
    botonSiguiente.addEventListener("click", function () {
        paginaActual++;
        cargarDrones();
    });

    cargarDrones();
}

/* cargarDrones(): pide al servidor los drones de la página y categoría actuales
   y los dibuja. Se vuelve a llamar cada vez que cambia la página o la categoría. */
async function cargarDrones() {
    const catalogo = document.getElementById("catalogo-drones");
    const mensaje = document.getElementById("mensaje-catalogo");

    catalogo.replaceChildren();
    mensaje.textContent = "";

    // Parámetros que se envían por URL (GET) al PHP: página y categoría.
    const parametros = new URLSearchParams({
        pagina: String(paginaActual),
        categoria: categoriaActual
    });

    try {
        const respuesta = await fetch(
            "php/catalogo.php?" + parametros.toString()
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar el catálogo.");
        }

        const datos = await respuesta.json();

        if (datos.error) {
            throw new Error(datos.error);
        }

        // Dibuja los botones de categoría con la lista que devolvió el servidor.
        actualizarCategorias(datos.categorias || []);

        if (datos.totalDrones === 0) {
            mensaje.textContent = "No hay drones registrados en esta categoría.";
            actualizarPaginacion(1);
            return;
        }

        /* Ya hay drones: se limpia el mensaje "Cargando drones..." */
        mensaje.textContent = "";

        // Se crea una tarjeta por cada dron recibido.
        datos.drones.forEach(function (dron, indice) {
            catalogo.appendChild(crearTarjeta(dron, indice));
        });

        paginaActual = datos.pagina;
        actualizarPaginacion(datos.totalPaginas);

    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
        mensaje.textContent =
            "No fue posible cargar los drones. Verifica tu conexión con el servidor.";
        actualizarPaginacion(1);
    }
}

/* crearTarjeta(): arma el HTML de una tarjeta (imagen, categoría, nombre y descripción)
   dentro de un enlace a dron.html?id=... */
function crearTarjeta(dron, indice) {
    const tarjeta = document.createElement("article");
    const enlace = document.createElement("a");
    const categoria = document.createElement("p");
    const nombre = document.createElement("h2");
    const descripcion = document.createElement("p");
    const boton = document.createElement("span");

    categoria.className = "categoria-dron";
    descripcion.className = "descripcion-dron";

    enlace.href = "dron.html?id=" + encodeURIComponent(dron.IDDron);
    enlace.setAttribute(
        "aria-label",
        "Ver detalles de " + (dron.Nombre || "este dron")
    );

    const rutaImagen = obtenerRutaImagen(dron.Imagen);

    if (rutaImagen) {
        const imagen = document.createElement("img");

        imagen.className = "imagen-dron";
        imagen.src = rutaImagen;
        imagen.alt = dron.Nombre
            ? "Imagen del dron " + dron.Nombre
            : "Imagen del dron";
        imagen.loading = "lazy";

        /* Si la imagen no carga, se muestra la ilustración */
        imagen.addEventListener("error", function () {
            imagen.replaceWith(crearImagenVacia(indice));
        }, { once: true });

        enlace.appendChild(imagen);
    } else {
        enlace.appendChild(crearImagenVacia(indice));
    }

    categoria.textContent = dron.Categoria || "Sin categoría";
    nombre.textContent = dron.Nombre || "Dron sin nombre";
    descripcion.textContent =
        dron.Descripcion || "Descripción no disponible.";

    boton.textContent = "Más información";

    enlace.append(categoria, nombre, descripcion, boton);
    tarjeta.appendChild(enlace);

    return tarjeta;
}

/* Ilustración de dron cuando no hay imagen (usa drone() de drone.js) */
function crearImagenVacia(indice) {
    const caja = document.createElement("div");
    caja.className = "imagen-no-disponible";

    if (typeof drone === "function") {
        caja.innerHTML = drone(indice % 3, 300, false);
    } else {
        caja.textContent = "Imagen no disponible";
    }

    return caja;
}

/* Botones de categoría: solo se reconstruyen si la lista cambió */
function actualizarCategorias(categorias) {
    const filtro = document.getElementById("filtro-categoria");
    const lista = [""].concat(categorias);
    const firma = lista.join("|");

    if (filtro.dataset.categorias !== firma) {
        filtro.dataset.categorias = firma;
        filtro.replaceChildren();

        lista.forEach(function (categoria) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.dataset.categoria = categoria;
            boton.textContent = categoria || "Todos";
            filtro.appendChild(boton);
        });
    }

    filtro.querySelectorAll("button").forEach(function (boton) {
        const activo = boton.dataset.categoria === categoriaActual;
        boton.classList.toggle("activo", activo);
        boton.setAttribute("aria-pressed", String(activo));
    });
}

/* actualizarPaginacion(): crea los botones numerados y activa o desactiva Anterior/Siguiente. */
function actualizarPaginacion(totalPaginas) {
    const contenedorNumeros = document.getElementById("numeros-pagina");
    const botonAnterior = document.getElementById("pagina-anterior");
    const botonSiguiente = document.getElementById("pagina-siguiente");

    contenedorNumeros.replaceChildren();

    botonAnterior.disabled = paginaActual <= 1;
    botonSiguiente.disabled = paginaActual >= totalPaginas;

    for (let numero = 1; numero <= totalPaginas; numero++) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = String(numero);
        boton.setAttribute("aria-label", "Ir a la página " + numero);

        if (numero === paginaActual) {
            boton.setAttribute("aria-current", "page");
            boton.disabled = true;
        }

        boton.addEventListener("click", function () {
            paginaActual = numero;
            cargarDrones();
        });

        contenedorNumeros.appendChild(boton);
    }
}

/* obtenerRutaImagen(): valida la ruta de imagen que viene de la base de datos.
   Bloquea URLs externas, javascript: y rutas con ".."; si solo es un nombre, usa la carpeta img/. */
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