<?php
include '../conexion.php';

session_start();

if (isset($_SESSION['username'])) {
    $username = $_SESSION['username'];
    $user_id = $_SESSION['user_id'];

    $sql = "SELECT pts FROM jugadores WHERE id = $user_id";

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

    if (isset($_GET['score'])) {
        $new_score = intval($_GET['score']);

        // Comparar y actualizar si el nuevo puntaje es mayor
        if ($new_score > $current_pts) {
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
            <h1 id="scoreText"></h1>
            <div class="leaderboard-image">
                <img src="../GameImages/Pantalla juego/end.png">
            </div>
        </div>
        <button class="button-share" onclick="shareScore()">
            <img src="../GameImages/Pantalla juego/compartir.png" alt="Compartir en Facebook">
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

            function shareScore() {
                const message = `Tu puntuación es: ${score}`;

                FB.api(
                    "/331396916715898/feed",
                    "POST",
                    {
                        message: message,
                        access_token: "EAANNCB2g0TgBO15hwQwnJnYrp0dmjC9hZCPENGDTT0HC580Q5nTFN59NOBVVI91HkDJYLEGJLASjrt5r5jAk6AZCacJhrhsaUl7XpZCh2UjJiOjKMWZCmXHFbTtRT3oRgDUibkN6Yg4d3rWxY8ZBqDIwAso3oMkdWGq4sOU6Okzk5Aeb3zxtTW8Q74tZCt8IZAdAZCO1BXiszPyOVZAGZBLsFhG1xE0fAdIAELzQZDZD",
                    },
                    function(response) {
                        if (response && !response.error) {
                            console.log("POST", response);
                        } else {
                            console.error("error");
                        }
                    }
                );
            }

            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            window.fbAsyncInit = function() {
                FB.init({
                    appId: '1172744637406338',
                    xfbml: true,
                    version: 'v19.0'
                });
            };
        </script>
    </div>
</body>
</html>

