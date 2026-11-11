<?php
// ==========================================================
// guardar_cotizacion.php · Recibe por POST el formulario de contacto, valida los datos
// y los guarda en la tabla COTIZACION. Responde JSON {exito, mensaje}. Lo usa contacto.js.
// ==========================================================
// La respuesta será JSON en UTF-8 y no se guarda en caché.
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// Importa la conexión a MySQL ($conexion).
require_once __DIR__ . "/Conexion.php";

// responder(): envía una respuesta JSON con su código HTTP y detiene el script.
function responder($codigo, $mensaje, $exito = false) {
    http_response_code($codigo);

    echo json_encode([
        "exito" => $exito,
        "mensaje" => $mensaje
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// Solo se aceptan peticiones POST.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(405, "Método de solicitud no permitido.");
}

// Lee los campos del formulario. trim() quita espacios; ?? "" evita errores si el campo no llega.
$nombre = trim($_POST["Nombre"] ?? "");
$correo = trim($_POST["Correo"] ?? "");
$telefono = trim($_POST["Telefono"] ?? "");
$empresa = trim($_POST["Empresa"] ?? "");
$asunto = trim($_POST["Asunto"] ?? "");
$ayuda = trim($_POST["Ayuda"] ?? "");
$idRecibido = trim($_POST["IDDron"] ?? "");

// Comprobar que todos los campos obligatorios estén completos.
if (
    $nombre === "" ||
    $correo === "" ||
    $telefono === "" ||
    $empresa === "" ||
    $asunto === "" ||
    $ayuda === ""
) {
    responder(400, "Completa todos los campos obligatorios.");
}

// Comprobar el formato del correo.
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(400, "Escribe un correo electrónico válido.");
}

// Comprobar la longitud de los campos.
if (
    mb_strlen($nombre) > 150 ||
    mb_strlen($correo) > 150 ||
    mb_strlen($telefono) > 25 ||
    mb_strlen($empresa) > 150 ||
    mb_strlen($asunto) > 150 ||
    mb_strlen($ayuda) > 300
) {
    responder(400, "Uno o más campos superan la longitud permitida.");
}

// El mensaje debe tener al menos 10 caracteres.
if (mb_strlen($ayuda) < 10) {
    responder(400, "El mensaje debe contener al menos 10 caracteres.");
}

// IDDron es opcional: queda NULL si la cotización no es de un dron en particular.
$idDron = null;

try {
    // Comprobar el dron si se recibió un identificador.
    if ($idRecibido !== "") {
        if (!ctype_digit($idRecibido) || (int)$idRecibido < 1) {
            responder(400, "El dron seleccionado no es válido.");
        }

        $idBuscado = (int)$idRecibido;

        $consultaDron = $conexion->prepare(
            "SELECT IDDron
             FROM DRON
             WHERE IDDron = ?"
        );

        $consultaDron->bind_param("i", $idBuscado);
        $consultaDron->execute();

        $resultadoDron = $consultaDron->get_result();
        $dron = $resultadoDron->fetch_assoc();

        $consultaDron->close();

        if (!$dron) {
            responder(400, "El dron seleccionado no existe.");
        }

        $idDron = (int)$dron["IDDron"];
    }

    // Guardar la cotización.
    $consulta = $conexion->prepare(
        "INSERT INTO COTIZACION
            (IDDron, Asunto, Nombre, Correo, Telefono, Empresa, Ayuda)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    // Tipos de los datos: i = entero (IDDron) y s = texto (los otros 6 campos).
    $consulta->bind_param(
        "issssss",
        $idDron,
        $asunto,
        $nombre,
        $correo,
        $telefono,
        $empresa,
        $ayuda
    );

    $consulta->execute();
    $consulta->close();
    $conexion->close();

    responder(200, "La solicitud se guardó correctamente.", true);

// Cualquier error inesperado se guarda en el log y se responde 500 sin revelar detalles.
} catch (Throwable $error) {
    error_log("Error al guardar la cotización: " . $error->getMessage());

    $conexion->close();

    responder(
        500,
        "No fue posible guardar la solicitud. Inténtalo nuevamente."
    );
}
?>