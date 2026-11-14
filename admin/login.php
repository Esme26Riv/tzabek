<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../php/conexion.php';

if (!empty($_SESSION['admin_id'])) {
    header('Location: panel.php');
    exit;
}

if (empty($_SESSION['token_login'])) {
    $_SESSION['token_login'] = bin2hex(random_bytes(32));
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    $correo = trim($_POST['correo'] ?? '');
    $contrasena = $_POST['contrasena'] ?? '';

    if (!hash_equals($_SESSION['token_login'], $token)) {
        $error = 'La solicitud no es válida. Recarga la página e inténtalo de nuevo.';
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL) || $contrasena === '') {
        $error = 'Verifica tu correo y contraseña.';
    } else {
        $consulta = $conexion->prepare('SELECT IDAdmin, Nombre, Correo, Contrasena FROM admin WHERE Correo = ? LIMIT 1');
        $consulta->bind_param('s', $correo);
        $consulta->execute();
        $resultado = $consulta->get_result();
        $admin = $resultado->fetch_assoc();

        if ($admin && password_verify($contrasena, $admin['Contrasena'])) {
            session_regenerate_id(true);
            $_SESSION['admin_id'] = (int)$admin['IDAdmin'];
            $_SESSION['admin_nombre'] = $admin['Nombre'];
            $_SESSION['admin_correo'] = $admin['Correo'];
            unset($_SESSION['token_login']);
            header('Location: panel.php');
            exit;
        }

        $error = 'Correo o contraseña incorrectos.';
        $consulta->close();
    }
}
$conexion->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso administrativo | Tzab-ek</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body class="admin-fondo">
    <main class="admin-contenedor">
        <a class="admin-marca" href="../index.html">TZAB-EK <span>AERONÁUTICA</span></a>
        <section class="admin-tarjeta">
            <p class="admin-etiqueta">ACCESO RESTRINGIDO</p>
            <h1>Iniciar sesión</h1>
            <p class="admin-descripcion">Ingresa con tu cuenta de administrador para continuar.</p>

            <?php if ($error !== ''): ?>
                <div class="admin-mensaje error"><?php echo escapar($error); ?></div>
            <?php endif; ?>

            <form method="POST" action="login.php">
                <input type="hidden" name="token" value="<?php echo escapar($_SESSION['token_login']); ?>">
                <label for="correo">Correo electrónico</label>
                <input type="email" id="correo" name="correo" autocomplete="username" required>

                <label for="contrasena">Contraseña</label>
                <input type="password" id="contrasena" name="contrasena" autocomplete="current-password" required>

                <button class="admin-boton" type="submit">Entrar al panel</button>
            </form>
            <a class="admin-volver" href="../index.html">Volver al sitio público</a>
        </section>
        <p class="admin-pie">Tzab-ek Aeronáutica · Área administrativa</p>
    </main>
</body>
</html>
