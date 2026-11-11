/* ==========================================================
   contacto.js · Formulario de Contáctanos.html: valida los campos y envía la cotización
   a PHP/guardar_cotizacion.php sin recargar la página (fetch).
   ========================================================== */

"use strict";

// Cuando el HTML termina de cargar se ejecuta iniciarContacto().
document.addEventListener("DOMContentLoaded", iniciarContacto);

/* iniciarContacto(): prellena el asunto, guarda el ID del dron (si viene en la URL)
   y programa el envío del formulario. */
function iniciarContacto() {
    // Lee los datos de la URL. La ficha del dron envía ?asunto=Nombre&idDron=3.
    const parametros = new URLSearchParams(window.location.search);
    const asuntoRecibido = parametros.get("asunto");
    const identificadorRecibido = parametros.get("idDron");

    const campoAsunto = document.getElementById("asunto-contacto");
    const campoDron = document.getElementById("id-dron");
    const formulario = document.getElementById("formulario-contacto");
    const mensajeFormulario = document.getElementById("mensaje-formulario");
    const botonEnviar = document.getElementById("boton-enviar");

    // Si llegó un asunto por la URL se usa; si no, se escribe "Cotización" por defecto.
    campoAsunto.value =
        asuntoRecibido && asuntoRecibido.trim()
            ? asuntoRecibido.trim()
            : "Cotización";

    // El ID del dron solo se guarda si es un número entero positivo (validación).
    if (
        identificadorRecibido &&
        /^\d+$/.test(identificadorRecibido) &&
        Number(identificadorRecibido) > 0
    ) {
        campoDron.value = identificadorRecibido;
    }

    // Al enviar el formulario se evita la recarga normal de la página (preventDefault)
    // y se manda la información con fetch (AJAX).
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        mensajeFormulario.textContent = "";

        // Comprobar que todos los campos obligatorios estén completos.
        if (!formulario.checkValidity()) {
            formulario.reportValidity();
            return;
        }

        // Comprobar que los campos no contengan solamente espacios.
        const camposObligatorios = [
            document.getElementById("nombre-contacto"),
            document.getElementById("correo-contacto"),
            document.getElementById("telefono-contacto"),
            document.getElementById("empresa-contacto"),
            document.getElementById("asunto-contacto"),
            document.getElementById("mensaje-contacto")
        ];

        const campoVacio = camposObligatorios.find(
            campo => campo.value.trim() === ""
        );

        if (campoVacio) {
            mensajeFormulario.textContent =
                "Completa todos los campos obligatorios.";

            campoVacio.focus();
            return;
        }

        // Comprobar el formato del correo electrónico.
        const campoCorreo = document.getElementById("correo-contacto");

        if (!campoCorreo.checkValidity()) {
            mensajeFormulario.textContent =
                "Escribe un correo electrónico válido.";

            campoCorreo.focus();
            return;
        }

        // Comprobar que el mensaje tenga al menos 10 caracteres.
        const campoAyuda = document.getElementById("mensaje-contacto");

        if (campoAyuda.value.trim().length < 10) {
            mensajeFormulario.textContent =
                "El mensaje debe contener al menos 10 caracteres.";

            campoAyuda.focus();
            return;
        }

        mensajeFormulario.textContent = "Enviando solicitud...";
        botonEnviar.disabled = true;

        try {
            const datosFormulario = new FormData(formulario);

            // Enviar los valores sin espacios innecesarios al principio o al final.
            camposObligatorios.forEach(campo => {
                datosFormulario.set(campo.name, campo.value.trim());
            });

            // Envío por POST al PHP, que guarda la cotización en la tabla COTIZACION.
            const respuesta = await fetch("PHP/guardar_cotizacion.php", {
                method: "POST",
                body: datosFormulario
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.exito) {
                throw new Error(
                    resultado.mensaje ||
                    "No fue posible guardar la solicitud."
                );
            }

            mensajeFormulario.textContent =
                "Tu solicitud se guardó correctamente. ¡Gracias por contactarnos!";

            formulario.reset();
            campoAsunto.value = "Cotización";
            campoDron.value = "";

        // Si falla la validación del servidor o la red, se muestra el mensaje de error.
        } catch (error) {
            console.error("Error al guardar la cotización:", error);

            mensajeFormulario.textContent =
                error.message ||
                "Ocurrió un error al enviar tu solicitud. Inténtalo nuevamente.";

        // finally se ejecuta siempre: pase lo que pase se vuelve a habilitar el botón.
        } finally {
            botonEnviar.disabled = false;
        }
    });
}