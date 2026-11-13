<?php
require_once __DIR__ . '/auth.php';
requerir_admin();
require_once __DIR__ . '/../PHP/Conexion.php';

$totalDrones = 0;
$totalCotizaciones = 0;
$totalEmpleados = 0;

if (empty($_SESSION['csrf_admin'])) {
    $_SESSION['csrf_admin'] = bin2hex(random_bytes(32));
}

$resultado = $conexion->query('SELECT COUNT(*) AS total FROM DRON');
$totalDrones = (int)$resultado->fetch_assoc()['total']; $resultado->close();
$resultado = $conexion->query('SELECT COUNT(*) AS total FROM COTIZACION');
$totalCotizaciones = (int)$resultado->fetch_assoc()['total']; $resultado->close();
$resultado = $conexion->query('SELECT COUNT(*) AS total FROM EMPLEADO');
$totalEmpleados = (int)$resultado->fetch_assoc()['total']; $resultado->close();
$conexion->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel administrativo | Tzab-ek</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body class="panel-fondo">
    <header class="panel-header">
        <a class="admin-marca" href="../index.html">TZAB-EK <span>AERONÁUTICA</span></a>
        <div class="panel-usuario">
            <span><?php echo escapar($_SESSION['admin_nombre']); ?></span>
            <a href="logout.php">Cerrar sesión</a>
        </div>
    </header>

    <main class="panel-contenido">
        <p class="admin-etiqueta">PANEL DE CONTROL</p>
        <h1>Bienvenido, <?php echo escapar($_SESSION['admin_nombre']); ?></h1>
        <p class="admin-descripcion">Desde aquí puedes consultar la información registrada y administrar el personal.</p>

        <section class="panel-resumen">
            <article class="panel-dato"><span>Drones registrados</span><strong><?php echo $totalDrones; ?></strong></article>
            <article class="panel-dato"><span>Solicitudes de cotización</span><strong><?php echo $totalCotizaciones; ?></strong></article>
            <article class="panel-dato"><span>Personal registrado</span><strong><?php echo $totalEmpleados; ?></strong></article>
        </section>

        <section class="panel-personal">
            <div class="panel-seccion-cabecera">
                <div>
                    <p class="admin-etiqueta">API JSON · EMPLEADOS</p>
                    <h2>Registrar personal</h2>
                    <p class="admin-descripcion">Registra empleados. Su contraseña se almacena mediante password_hash(). Este registro no crea administradores ni habilita el acceso al panel.</p>
                </div>
            </div>
            <form id="form-personal" class="form-personal" autocomplete="off">
                <input type="hidden" id="csrf-personal" value="<?php echo escapar($_SESSION['csrf_admin']); ?>">
                <label for="personal-nombre">Nombre completo</label>
                <input id="personal-nombre" name="nombre" type="text" maxlength="100" required placeholder="Nombre y apellidos">
                <label for="personal-rango">Puesto o rol</label>
                <input id="personal-rango" name="rango" type="text" maxlength="100" required placeholder="Ej. Técnico de mantenimiento">
                <label for="personal-correo">Correo electrónico</label>
                <input id="personal-correo" name="correo" type="email" maxlength="150" required placeholder="persona@empresa.com">
                <label for="personal-contrasena">Contraseña del empleado</label>
                <input id="personal-contrasena" name="contrasena" type="password" minlength="10" maxlength="72" required placeholder="Mínimo 10 caracteres">
                <button class="admin-boton boton-personal" type="submit">Registrar empleado</button>
                <p id="respuesta-personal" class="admin-mensaje" role="status" aria-live="polite" hidden></p>
            </form>
        </section>

        <section class="panel-personal panel-listado">
            <div>
                <p class="admin-etiqueta">GESTIÓN DE PERSONAL</p>
                <h2>Empleados registrados</h2>
                <p class="admin-descripcion">Modifica únicamente el puesto o rol. Los demás datos y las contraseñas no se alteran.</p>
            </div>
            <p id="estado-empleados" class="admin-mensaje" role="status" aria-live="polite">Cargando empleados…</p>
            <div class="tabla-contenedor">
                <table class="tabla-empleados">
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Puesto / rol</th><th>Acción</th></tr></thead>
                    <tbody id="lista-empleados"><tr><td colspan="4">Cargando…</td></tr></tbody>
                </table>
            </div>
        </section>

        <section class="panel-accesos">
            <h2>Accesos rápidos</h2>
            <a href="../index.html">Ver sitio público</a>
            <a href="../catalogo.html">Consultar catálogo</a>
            <a href="logout.php">Cerrar sesión</a>
        </section>
    </main>
    <script src="personal.js" defer></script>
</body>
</html>
