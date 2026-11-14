<?php
// ==========================================================
// conexion.php · Conexión a la base de datos MySQL.
// Todos los demás PHP la importan con require_once y usan la variable $conexion.
// ==========================================================
// Datos de conexión (en XAMPP: servidor local, usuario root y sin contraseña).
$servidor = "localhost";
$usuario = "root";
$contrasena = "";
$basedatos = "tzabek";

// Crear conexión
// Crear conexión con la clase mysqli.
$conexion = new mysqli(
    $servidor,
    $usuario,
    $contrasena,
    $basedatos
);

// Verificar conexión
// Verificar conexión: si falla, se detiene el script y se muestra el error.
if ($conexion->connect_error) {
    error_log("Error de conexión: " . $conexion->connect_error);
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    die(json_encode(
        ["error" => "No fue posible conectar con la base de datos."],
        JSON_UNESCAPED_UNICODE
    ));
}

// Codificación de caracteres
// Codificación de caracteres: utf8mb4 para acentos y ñ.
$conexion->set_charset("utf8mb4");
?>
