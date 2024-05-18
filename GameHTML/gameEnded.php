<?php
include '../conexion.php';

session_start();

if(isset($_SESSION['username'])) {
    $username = $_SESSION['username'];
    $user_id = $_SESSION['user_id'];

    $user_id = $_SESSION['user_id'];
    $sql = "SELECT pts FROM jugadores WHERE id = $user_id ";

    try {
        $result = $conn->query($sql);

        if ($result === false) {
            throw new Exception("Error en la consulta SQL: " . $conn->error);
        }

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $current_pts = $row['pts'];
        } else {
            $current_pts = 0;
        }
    } catch (Exception $e) {
        die("Se produjo un error: " . $e->getMessage());
    }

    if(isset($_GET['score'])) {
        $new_score = intval($_GET['score']);

        // Comparar y actualizar si el nuevo puntaje es mayor
        if($new_score > $current_pts) {
            $update_sql = "UPDATE jugadores SET pts = $new_score WHERE id = $user_id";

            try {
                if ($conn->query($update_sql) === false) {
                    throw new Exception("Error al actualizar la puntuación: " . $conn->error);
                }
            } catch (Exception $e) {
                die("Se produjo un error al actualizar la puntuación: " . $e->getMessage());
            }
        }
    }

    $conn->close();
} 
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puntuación - Kollector Chicken</title>
    <link rel="stylesheet" href="../GameCSS/style.css">
</head>
<body>
    <div class="container-main">
        <div class="logo">
            <img src="../GameImages/Logo.png">
        </div>
        <div class="leaderboard-wrapper">
            <h1 id="scoreText" ></h1>
            <div class="leaderboard-image">
                <img src="../GameImages/Pantalla juego/end.png">
            </div>
        </div>
        <button class="button-share">
                <a href="">
                <img src="../GameImages/Pantalla juego/compartir.png" alt="Compartir en Facebook">
                </a>
        </button>
        <button class="back-button">
            <a href="../menu.php">
                <img src="../GameImages/regresar.png" alt="Back">
            </a>
        </button>
        <script>
            const urlParams = new URLSearchParams(window.location.search);
            const score = urlParams.get('score');

            let scoreText = document.getElementById('scoreText');
            scoreText.innerText = score; 

        </script>
    </div>
</body>
</html>