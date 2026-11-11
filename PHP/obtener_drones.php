<?php
// ==========================================================
// obtener_drones.php · Devuelve en JSON los drones del carrusel de Index.html:
// todos los drones (máx. 12) con su primera imagen. Lo consume catalogo1.js.
// ==========================================================

// La respuesta será JSON en UTF-8.
header("Content-Type: application/json; charset=utf-8");

// Importa la conexión a MySQL ($conexion).
require_once __DIR__ . "/Conexion.php";

// Consulta: trae cada dron y le une su primera imagen (LEFT JOIN).
// COALESCE usa la imagen de la tabla IMAGEN y, si no hay, la columna Imagenes de DRON.
// LIMIT 12 = máximo de imágenes que tendrá el carrusel.
$sql = "
    SELECT
        d.IDDron,
        d.Nombre,
        d.Categoria,
        d.Descripcion,
        COALESCE(
            NULLIF(i.NombreImagen, ''),
            NULLIF(d.Imagenes, '')
        ) AS Imagen
    FROM dron AS d

    LEFT JOIN (
        SELECT
            IDDron,
            MIN(IDImagen) AS IDImagen
        FROM imagen
        GROUP BY IDDron
    ) AS primera
        ON primera.IDDron = d.IDDron

    LEFT JOIN imagen AS i
        ON i.IDImagen = primera.IDImagen

    ORDER BY d.IDDron ASC
    LIMIT 12
";

// Ejecuta la consulta (no usa datos del usuario, por eso no necesita prepare).
$resultado = $conexion->query($sql);

if (!$resultado) {
    error_log("Error al consultar el catálogo: " . $conexion->error);

    http_response_code(500);

    echo json_encode(
        ["error" => "No fue posible consultar el catálogo."],
        JSON_UNESCAPED_UNICODE
    );

    $conexion->close();
    exit;
}

// Convierte cada fila del resultado en un elemento de un arreglo.
$drones = [];

while ($fila = $resultado->fetch_assoc()) {
    $drones[] = $fila;
}

// Envía el arreglo como JSON al JavaScript (catalogo1.js).
echo json_encode(
    $drones,
    JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
);

$resultado->free();
$conexion->close();
