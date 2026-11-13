// Registro, consulta y modificación del puesto/rol del personal mediante API JSON.
document.addEventListener('DOMContentLoaded', () => {
    const api = 'api/empleados.php';
    const tokenInput = document.getElementById('csrf-personal');
    const token = tokenInput ? tokenInput.value : '';

    const formulario = document.getElementById('form-personal');
    const respuesta = document.getElementById('respuesta-personal');
    const botonRegistro = formulario?.querySelector('button[type="submit"]');

    const cuerpoTabla = document.getElementById('lista-empleados');
    const estadoEmpleados = document.getElementById('estado-empleados');

    function mostrarEstado(elemento, mensaje, tipo = '') {
        if (!elemento) return;
        elemento.hidden = false;
        elemento.className = 'admin-mensaje' + (tipo ? ` ${tipo}` : '');
        elemento.textContent = mensaje;
    }

    async function leerRespuesta(peticion) {
        const datos = await peticion.json();
        if (!peticion.ok || !datos.exito) {
            throw new Error(datos.mensaje || 'No se pudo completar la operación.');
        }
        return datos;
    }

    async function cargarEmpleados() {
        if (!cuerpoTabla) return;
        mostrarEstado(estadoEmpleados, 'Cargando empleados…');
        try {
            const peticion = await fetch(api, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });
            const datos = await leerRespuesta(peticion);
            cuerpoTabla.replaceChildren();

            if (datos.empleados.length === 0) {
                const fila = document.createElement('tr');
                const celda = document.createElement('td');
                celda.colSpan = 4;
                celda.textContent = 'Todavía no hay empleados registrados.';
                fila.appendChild(celda);
                cuerpoTabla.appendChild(fila);
            } else {
                datos.empleados.forEach((empleado) => {
                    const fila = document.createElement('tr');
                    const nombre = document.createElement('td');
                    const correo = document.createElement('td');
                    const celdaRango = document.createElement('td');
                    const acciones = document.createElement('td');
                    const campoRango = document.createElement('input');
                    const guardar = document.createElement('button');

                    nombre.textContent = empleado.nombre;
                    correo.textContent = empleado.correo;
                    campoRango.type = 'text';
                    campoRango.maxLength = 100;
                    campoRango.value = empleado.rango;
                    campoRango.setAttribute('aria-label', `Puesto o rol de ${empleado.nombre}`);
                    guardar.type = 'button';
                    guardar.className = 'admin-boton boton-guardar-rol';
                    guardar.textContent = 'Guardar';
                    guardar.addEventListener('click', () => actualizarRango(empleado.id, campoRango, guardar));

                    celdaRango.appendChild(campoRango);
                    acciones.appendChild(guardar);
                    fila.append(nombre, correo, celdaRango, acciones);
                    cuerpoTabla.appendChild(fila);
                });
            }
            mostrarEstado(estadoEmpleados, `${datos.empleados.length} empleado(s) encontrado(s).`, 'exito');
        } catch (error) {
            mostrarEstado(estadoEmpleados, error.message || 'No fue posible cargar el personal.', 'error');
            cuerpoTabla.replaceChildren();
        }
    }

    async function actualizarRango(id, campo, boton) {
        const rango = campo.value.trim();
        if (!rango || rango.length > 100) {
            mostrarEstado(estadoEmpleados, 'El puesto o rol es obligatorio y admite máximo 100 caracteres.', 'error');
            campo.focus();
            return;
        }
        boton.disabled = true;
        boton.textContent = 'Guardando…';
        try {
            const peticion = await fetch(api, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': token,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ id, rango })
            });
            const datos = await leerRespuesta(peticion);
            mostrarEstado(estadoEmpleados, datos.mensaje, 'exito');
        } catch (error) {
            mostrarEstado(estadoEmpleados, error.message || 'No fue posible modificar el puesto.', 'error');
        } finally {
            boton.disabled = false;
            boton.textContent = 'Guardar';
        }
    }

    if (formulario) {
        formulario.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            mostrarEstado(respuesta, 'Registrando personal…');
            botonRegistro.disabled = true;
            const datos = {
                nombre: formulario.elements.nombre.value.trim(),
                rango: formulario.elements.rango.value.trim(),
                correo: formulario.elements.correo.value.trim(),
                contrasena: formulario.elements.contrasena.value
            };
            try {
                const peticion = await fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': token,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });
                const resultado = await leerRespuesta(peticion);
                mostrarEstado(respuesta, resultado.mensaje, 'exito');
                formulario.reset();
                await cargarEmpleados();
            } catch (error) {
                mostrarEstado(respuesta, error.message || 'No se pudo conectar con la API.', 'error');
            } finally {
                botonRegistro.disabled = false;
            }
        });
    }

    cargarEmpleados();
});
