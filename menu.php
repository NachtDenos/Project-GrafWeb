<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inicio - Kollector Chicken</title>
    <link rel="stylesheet" href="../Project-GrafWeb/GameCSS/style.css">
    <script src="http://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>
</head>
<body>
    
<?php
    session_start();

    // Verificar si el usuario ha iniciado sesión
    if(isset($_SESSION['username'])) {
        $username = $_SESSION['username'];
        $user_id = $_SESSION['user_id'];

    } else {
        // Si el usuario no ha iniciado sesión, redirigirlo a la página de inicio de sesión o mostrar un mensaje de error
        header("Location: iniciar_sesion.php");
        exit();
    }
?>

    <div class="container-main">
        <div class="logo">
            <img src="../Project-GrafWeb/GameImages/Logo.png">
        </div>
        <h2>Bienvenido, <?php echo $username; ?>!</h2>
            <!-- <p>Tu ID de usuario es: <?php echo $user_id; ?></p> -->
        <div class="buttons-menu">
            <button>
                <a href="../Project-GrafWeb/GameHTML/gameMode.php">
                <img src="../Project-GrafWeb/GameImages/Pagina principal/crearPartida.png" alt="Prueba">
                </a>
            </button>
            <button>
                <a href="../Project-GrafWeb/GameHTML/searchGame.php">
                <img src="../Project-GrafWeb/GameImages/Pagina principal/unirse.png" alt="Prueba">
                </a>
            </button>
            <button>
                <a href="../Project-GrafWeb/GameHTML/settings.php">
                <img src="../Project-GrafWeb/GameImages/Pagina principal/ajuste.png" alt="Prueba">
                </a>
            </button>
            <button>
                <a href="../Project-GrafWeb/GameHTML/leaderboard.php">
                <img src="../Project-GrafWeb/GameImages/Pagina principal/puntuacion.png" alt="Prueba">
                </a>
            </button>
        </div>
        <audio id="backgroundMusic" loop>
            <source src="../Project-GrafWeb/GameMusic/BestFriend.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        <script>
            let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");
            sessionStorage.setItem('gameEntry', 'valid');
            let valueMusic = 100;
            fb.child("General").child("Configuration").once("value", function(snapshot) {
                if (snapshot.exists()) {
                    console.log('snapshot exists');
                    console.log(snapshot);
                    valueMusic = snapshot.val().music;
                    console.log(valueMusic);
                } else {
                    console.log("No data found.");
                }
            }, function(error) {
                console.error("Error fetching data:", error);
            });

            document.addEventListener("DOMContentLoaded", function() {
                const backgroundMusic = document.getElementById("backgroundMusic");
                document.body.addEventListener("mousemove", function () {
                    backgroundMusic.play();
                    backgroundMusic.volume = valueMusic/100;
                    console.log(backgroundMusic.volume);
                })
            });
        </script>
    </div>
</body>
</html>