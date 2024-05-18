<?php
session_start();
include '../conexion.php';

$sql = "SELECT user, pts FROM jugadores";

try {
    $result = $conn->query($sql);

    if ($result === false) {
        throw new Exception("Error en la consulta SQL: " . $conn->error);
    }

    // Verificar si hay resultados
    if ($result->num_rows > 0) {
        // Guardar los resultados en un array
        $jugadores = [];
        while ($row = $result->fetch_assoc()) {
            $jugadores[] = $row;
        }
    } else {
        $jugadores = [];
    }
} catch (Exception $e) {
    die("Se produjo un error: " . $e->getMessage());
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puntuación - Kollector Chicken</title>
    <link rel="stylesheet" href="../GameCSS/style.css">
    <style>
        table {
            width: 50%;
            border-collapse: collapse;
            margin: 50px 0;
            font-size: 18px;
            text-align: left;
        }
        th, td {
            padding: 12px;
            border-bottom: 1px solid #fff;
        }
        th {
        }
    </style>
</head>
<body>
    <div class="container-main">
        <div class="logo">
            <img src="../GameImages/Logo.png">
        </div>
        <div class="leaderboard-image">
            <img src="../GameImages/puntuacion/puntuacion.png">
                <div id="table-container" style="z-index: 10;">
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Maxima puntuación</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($jugadores)): ?>
                            <?php foreach ($jugadores as $jugador): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($jugador['user']); ?></td>
                                    <td><?php echo htmlspecialchars($jugador['pts']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="2">No hay datos disponibles</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <button class="back-button" onclick="window.history.back()">
            <img src="../GameImages/regresar.png" alt="Back">
        </button>
    </div>
</body>
</html>