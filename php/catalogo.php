<?php
// ==========================================================
// catalogo.php · Devuelve en JSON una página del catálogo completo (9 drones),
// la lista de categorías y los datos de paginación. Lo consume catalogo2.js.
// ==========================================================
// La respuesta será JSON en UTF-8.
header("Content-Type: application/json; charset=utf-8");

// Importa la conexión a MySQL ($conexion).
require_once __DIR__ . "/conexion.php";

// Página solicitada (?pagina=2). Si no es válida, se usa la 1.
$pagina = filter_input(INPUT_GET, "pagina", FILTER_VALIDATE_INT);
$pagina = ($pagina !== false && $pagina !== null && $pagina > 0)
    ? $pagina
    : 1;

// Categoría para filtrar (?categoria=...). Vacía = todas.
$categoria = trim($_GET["categoria"] ?? "");
// Paginación: 9 drones por página. OFFSET = cuántos registros se saltan antes de empezar.
$dronesPorPagina = 9;
$desplazamiento = ($pagina - 1) * $dronesPorPagina;

try {
    // Lista de categorías distintas para crear los botones de filtro.
    $categorias = [];

    $consultaCategorias = $conexion->query(
        "SELECT DISTINCT Categoria
         FROM dron
         WHERE Categoria IS NOT NULL AND Categoria <> ''
         ORDER BY Categoria ASC"
    );

    while ($fila = $consultaCategorias->fetch_assoc()) {
        $categorias[] = $fila["Categoria"];
    }

    // Cuenta cuántos drones hay (con o sin filtro) para calcular el número de páginas.
    if ($categoria !== "") {
        $consultaTotal = $conexion->prepare(
            "SELECT COUNT(*) AS total
             FROM dron
             WHERE Categoria = ?"
        );
        $consultaTotal->bind_param("s", $categoria);
    } else {
        $consultaTotal = $conexion->prepare(
            "SELECT COUNT(*) AS total FROM dron"
        );
    }

    $consultaTotal->execute();
    $resultadoTotal = $consultaTotal->get_result();
    $totalDrones = (int) $resultadoTotal->fetch_assoc()["total"];

    // ceil redondea hacia arriba: 10 drones / 9 por página = 2 páginas.
    $totalPaginas = (int) ceil($totalDrones / $dronesPorPagina);

    if ($totalPaginas > 0 && $pagina > $totalPaginas) {
        $pagina = $totalPaginas;
        $desplazamiento = ($pagina - 1) * $dronesPorPagina;
    }

    // Consulta principal: datos de cada dron + su primera imagen.
    // LEFT JOIN: un dron sin imagen también aparece en el catálogo.
    $sql = "
        SELECT
            d.IDDron,
            d.Nombre,
            d.Categoria,
            d.Descripcion,
            d.Proposito,
            COALESCE(
                NULLIF(i.NombreImagen, ''),
                NULLIF(d.Imagenes, '')
            ) AS Imagen
        FROM dron AS d
        LEFT JOIN (
            SELECT IDDron, MIN(IDImagen) AS IDImagen
            FROM imagen
            GROUP BY IDDron
        ) AS primera ON primera.IDDron = d.IDDron
        LEFT JOIN imagen AS i ON i.IDImagen = primera.IDImagen
    ";

    if ($categoria !== "") {
        $sql .= "
            WHERE d.Categoria = ?
            ORDER BY d.IDDron ASC
            LIMIT ? OFFSET ?
        ";

        $consultaDrones = $conexion->prepare($sql);
        $consultaDrones->bind_param(
            "sii",
            $categoria,
            $dronesPorPagina,
            $desplazamiento
        );
    } else {
        $sql .= "
            ORDER BY d.IDDron ASC
            LIMIT ? OFFSET ?
        ";

        $consultaDrones = $conexion->prepare($sql);
        $consultaDrones->bind_param(
            "ii",
            $dronesPorPagina,
            $desplazamiento
        );
    }

    // Ejecuta la consulta y guarda los resultados.
    $consultaDrones->execute();
    $resultadoDrones = $consultaDrones->get_result();

    $drones = [];

    while ($fila = $resultadoDrones->fetch_assoc()) {
        $drones[] = $fila;
    }

    // Respuesta JSON: drones de la página, categorías y datos de paginación.
    echo json_encode([
        "drones" => $drones,
        "categorias" => $categorias,
        "pagina" => $pagina,
        "dronesPorPagina" => $dronesPorPagina,
        "totalDrones" => $totalDrones,
        "totalPaginas" => $totalPaginas
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

    $consultaDrones->close();
    $consultaTotal->close();
    $conexion->close();

// Cualquier error inesperado se guarda en el log y se responde 500.
} catch (Throwable $error) {
    error_log("Error al consultar el catálogo: " . $error->getMessage());

    http_response_code(500);

    echo json_encode([
        "error" => "No fue posible cargar el catálogo."
    ], JSON_UNESCAPED_UNICODE);

    $conexion->close();
}
?>
