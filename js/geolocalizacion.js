/* ============================================
   TZAB-EK · Geolocalización (geolocalizacion.html)
   Usa la API del navegador navigator.geolocation
   para obtener la ubicación del visitante.
   ============================================ */

// Elementos de la página
const botonUbicar = document.getElementById("btn-ubicar");
const estado = document.getElementById("estado");
const celdaLat = document.getElementById("lat");
const celdaLng = document.getElementById("lng");
const celdaPrecision = document.getElementById("precision");
const celdaDistancia = document.getElementById("distancia");
const mapaUsuario = document.getElementById("mapa-usuario");
const enlaceRuta = document.getElementById("enlace-ruta");

// Ubicación de la empresa: Del Ejido 4347, Los Nogales, Juárez, Chih.
const EMPRESA = {
    lat: 31.726303579,
    lng: -106.447799367,
    direccion: "Del Ejido 4347, Los Nogales, 32350 Juárez, Chih."
};

// Distancia en línea recta entre dos puntos (fórmula de Haversine), en km
function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // radio de la Tierra en km
    const aRadianes = grados => grados * Math.PI / 180;
    const dLat = aRadianes(lat2 - lat1);
    const dLng = aRadianes(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Se ejecuta cuando el navegador SÍ obtuvo la ubicación
function mostrarUbicacion(posicion) {
    const lat = posicion.coords.latitude;
    const lng = posicion.coords.longitude;
    const precision = Math.round(posicion.coords.accuracy);

    // Mostrar los datos
    celdaLat.textContent = lat.toFixed(6);
    celdaLng.textContent = lng.toFixed(6);
    celdaPrecision.textContent = "± " + precision + " m";

    // Distancia en línea recta hasta la empresa
    const km = calcularDistancia(lat, lng, EMPRESA.lat, EMPRESA.lng);
    celdaDistancia.textContent = km < 1 ? Math.round(km * 1000) + " m" : km.toFixed(1) + " km";

    // Centrar el mapa en la ubicación del usuario
    mapaUsuario.src = "https://maps.google.com/maps?q=" + lat + "," + lng + "&z=16&output=embed";

    // Activar el enlace de ruta hacia la empresa (origen = ubicación del usuario)
    enlaceRuta.href = "https://www.google.com/maps/dir/?api=1&origin=" + lat + "," + lng +
        "&destination=" + EMPRESA.lat + "," + EMPRESA.lng;
    enlaceRuta.classList.remove("desactivado");
    enlaceRuta.removeAttribute("aria-disabled");

    estado.textContent = "Ubicación obtenida correctamente.";
    botonUbicar.disabled = false;
}

// Se ejecuta cuando hubo un error (permiso negado, sin señal, tiempo agotado)
function mostrarError(error) {
    const mensajes = {
        1: "Permiso denegado. Activa la ubicación en tu navegador e inténtalo de nuevo.",
        2: "No se pudo determinar tu ubicación. Revisa tu conexión o tu GPS.",
        3: "Se agotó el tiempo de espera. Inténtalo otra vez."
    };
    estado.textContent = mensajes[error.code] || "Ocurrió un error al obtener la ubicación.";
    botonUbicar.disabled = false;
}

// Al hacer clic en el botón se solicita la ubicación
botonUbicar.addEventListener("click", function () {
    // Verificar que el navegador soporte geolocalización
    if (!("geolocation" in navigator)) {
        estado.textContent = "Tu navegador no soporta geolocalización.";
        return;
    }

    estado.textContent = "Obteniendo tu ubicación...";
    botonUbicar.disabled = true;

    navigator.geolocation.getCurrentPosition(mostrarUbicacion, mostrarError, {
        enableHighAccuracy: true,  // pide la mejor precisión posible
        timeout: 10000,            // máximo 10 segundos
        maximumAge: 0              // no usar ubicaciones guardadas
    });
});

// Evita que el enlace de ruta funcione mientras no haya ubicación
enlaceRuta.addEventListener("click", function (evento) {
    if (enlaceRuta.classList.contains("desactivado")) {
        evento.preventDefault();
    }
});