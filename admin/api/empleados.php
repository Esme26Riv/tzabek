<?php
// API JSON de personal: listar, registrar y modificar el puesto/rango.
require_once __DIR__ . '/../auth.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder_json(int $codigo, array $datos): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if (empty($_SESSION['admin_id'])) {
    responder_json(401, ['exito' => false, 'mensaje' => 'Debes iniciar sesión como administrador.']);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($metodo, ['GET', 'POST', 'PATCH'], true)) {
    header('Allow: GET, POST, PATCH');
    responder_json(405, ['exito' => false, 'mensaje' => 'Método no permitido.']);
}

// GET solamente consulta. POST y PATCH requieren token CSRF.
if (in_array($metodo, ['POST', 'PATCH'], true)) {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf_admin']) || !hash_equals($_SESSION['csrf_admin'], $token)) {
        responder_json(403, ['exito' => false, 'mensaje' => 'La sesión del formulario expiró. Recarga el panel.']);
    }
}

$entrada = [];
if ($metodo !== 'GET') {
    $entrada = json_decode(file_get_contents('php://input'), true);
    if (!is_array($entrada)) {
        responder_json(400, ['exito' => false, 'mensaje' => 'El cuerpo debe contener un objeto JSON válido.']);
    }
}

require_once __DIR__ . '/../../PHP/Conexion.php';

try {
    if ($metodo === 'GET') {
        $consulta = $conexion->query('SELECT IDEmpleado, Nombre, Rango, Correo FROM EMPLEADO ORDER BY Nombre ASC');
        $empleados = [];
        while ($fila = $consulta->fetch_assoc()) {
            $empleados[] = [
                'id' => (int)$fila['IDEmpleado'],
                'nombre' => $fila['Nombre'],
                'rango' => $fila['Rango'],
                'correo' => $fila['Correo']
            ];
        }
        $consulta->free();
        $conexion->close();
        responder_json(200, ['exito' => true, 'empleados' => $empleados]);
    }

    if ($metodo === 'PATCH') {
        $id = filter_var($entrada['id'] ?? null, FILTER_VALIDATE_INT);
        $rango = trim((string)($entrada['rango'] ?? ''));
        if (!$id || $id < 1 || $rango === '' || mb_strlen($rango, 'UTF-8') > 100) {
            responder_json(422, ['exito' => false, 'mensaje' => 'Indica un empleado y un puesto válido (máximo 100 caracteres).']);
        }

        $consulta = $conexion->prepare('UPDATE EMPLEADO SET Rango = ? WHERE IDEmpleado = ?');
        $consulta->bind_param('si', $rango, $id);
        $consulta->execute();
        $afectadas = $consulta->affected_rows;
        $consulta->close();

        if ($afectadas === 0) {
            $verificar = $conexion->prepare('SELECT IDEmpleado FROM EMPLEADO WHERE IDEmpleado = ? LIMIT 1');
            $verificar->bind_param('i', $id);
            $verificar->execute();
            $existe = $verificar->get_result()->num_rows === 1;
            $verificar->close();
            if (!$existe) {
                $conexion->close();
                responder_json(404, ['exito' => false, 'mensaje' => 'No se encontró ese empleado.']);
            }
        }

        $conexion->close();
        responder_json(200, ['exito' => true, 'mensaje' => 'El puesto del empleado se actualizó correctamente.']);
    }

    // POST: registrar personal. No crea administradores ni otorga acceso al panel.
    $nombre = trim((string)($entrada['nombre'] ?? ''));
    $rango = trim((string)($entrada['rango'] ?? ''));
    $correo = mb_strtolower(trim((string)($entrada['correo'] ?? '')), 'UTF-8');
    $contrasena = (string)($entrada['contrasena'] ?? '');

    if ($nombre === '' || $rango === '' || $correo === '' || $contrasena === '') {
        responder_json(422, ['exito' => false, 'mensaje' => 'Todos los campos son obligatorios.']);
    }
    if (mb_strlen($nombre, 'UTF-8') > 100 || mb_strlen($rango, 'UTF-8') > 100 || mb_strlen($correo, 'UTF-8') > 150) {
        responder_json(422, ['exito' => false, 'mensaje' => 'Revisa la longitud de los campos.']);
    }
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        responder_json(422, ['exito' => false, 'mensaje' => 'Escribe un correo electrónico válido.']);
    }
    if (mb_strlen($contrasena, 'UTF-8') < 10 || strlen($contrasena) > 72) {
        responder_json(422, ['exito' => false, 'mensaje' => 'La contraseña debe tener entre 10 y 72 caracteres.']);
    }

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);
    if ($hash === false) {
        throw new RuntimeException('No fue posible generar el hash de la contraseña.');
    }
    $consulta = $conexion->prepare('INSERT INTO EMPLEADO (Nombre, Rango, Correo, Contrasena) VALUES (?, ?, ?, ?)');
    $consulta->bind_param('ssss', $nombre, $rango, $correo, $hash);
    $consulta->execute();
    $id = (int)$conexion->insert_id;
    $consulta->close();
    $conexion->close();

    responder_json(201, [
        'exito' => true,
        'mensaje' => 'El empleado se registró correctamente.',
        'empleado' => ['id' => $id, 'nombre' => $nombre, 'rango' => $rango, 'correo' => $correo]
    ]);
} catch (mysqli_sql_exception $error) {
    error_log('API empleados: ' . $error->getMessage());
    if (isset($conexion) && $conexion instanceof mysqli) $conexion->close();
    if ((int)$error->getCode() === 1062) {
        responder_json(409, ['exito' => false, 'mensaje' => 'Ya existe un empleado registrado con ese correo.']);
    }
    responder_json(500, ['exito' => false, 'mensaje' => 'No fue posible completar la operación.']);
} catch (Throwable $error) {
    error_log('API empleados: ' . $error->getMessage());
    if (isset($conexion) && $conexion instanceof mysqli) $conexion->close();
    responder_json(500, ['exito' => false, 'mensaje' => 'Ocurrió un error al procesar la solicitud.']);
}
