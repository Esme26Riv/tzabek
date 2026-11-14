<?php
// ==========================================================
// obtener_dron.php · Devuelve en JSON los datos de UN dron y sus imágenes.
// Lo consume detalles-dron.js (dron.html?id=...).
// ==========================================================
// La respuesta será JSON en UTF-8.
header("Content-Type: application/json; charset=utf-8");

// Importa la conexión a MySQL ($conexion).
require_once __DIR__ . "/conexion.php";

// Lee y valida el parámetro ?id= de la URL (debe ser un entero).
$idDron = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

// ID inválido: responde 400 (solicitud incorrecta) y termina.
if (!$idDron || $idDron < 1) {
    http_response_code(400);
    echo json_encode([
        "error" => "El identificador del dron no es válido."
    ], JSON_UNESCAPED_UNICODE);
    $conexion->close();
    exit;
}

try {
    // Consulta preparada (el ? se rellena después): evita la inyección SQL.
    $consulta = $conexion->prepare(
        "SELECT
            IDDron,
            Nombre,
            Categoria,
            Descripcion,
            Proposito,
            AutonomiaVuelo,
            Alcance,
            Peso,
            CamaraSensores,
            VelocidadMaxima,
            Aplicaciones,
            PublicoObjetivo,
            HistoriaModelo,
            Imagenes
         FROM dron
         WHERE IDDron = ?"
    );

    // bind_param: "i" indica que el parámetro es un entero.
    $consulta->bind_param("i", $idDron);
    $consulta->execute();

    $resultado = $consulta->get_result();
    $dron = $resultado->fetch_assoc();

    // Si no existe un dron con ese ID, responde 404 (no encontrado).
    if (!$dron) {
        http_response_code(404);
        echo json_encode([
            "error" => "No se encontró el dron solicitado."
        ], JSON_UNESCAPED_UNICODE);

        $consulta->close();
        $conexion->close();
        exit;
    }

    // Busca todas las imágenes del dron en la tabla imagen.
    $consultaImagenes = $conexion->prepare(
        "SELECT NombreImagen
         FROM imagen
         WHERE IDDron = ?
         ORDER BY IDImagen ASC"
    );

    $consultaImagenes->bind_param("i", $idDron);
    $consultaImagenes->execute();

    $resultadoImagenes = $consultaImagenes->get_result();
    $imagenes = [];

    while ($fila = $resultadoImagenes->fetch_assoc()) {
        if (!empty($fila["NombreImagen"])) {
            $imagenes[] = $fila["NombreImagen"];
        }
    }

    // Si no hay imágenes en imagen, usa la columna Imagenes de la tabla dron como respaldo.
    if (count($imagenes) === 0 && !empty($dron["Imagenes"])) {
        $imagenes[] = $dron["Imagenes"];
    }

    unset($dron["Imagenes"]);
    $dron["Imagenes"] = $imagenes;

    // Devuelve el dron completo (con su arreglo de imágenes) como JSON.
    echo json_encode(
        $dron,
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    $consulta->close();
    $consultaImagenes->close();
    $conexion->close();

// Cualquier error inesperado se guarda en el log y se responde 500 sin mostrar detalles al usuario.
} catch (Throwable $error) {
    error_log("Error al consultar el dron: " . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        "error" => "No fue posible cargar los detalles del dron."
    ], JSON_UNESCAPED_UNICODE);

    $conexion->close();
}
?>
