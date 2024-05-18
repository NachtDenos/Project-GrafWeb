<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inicio - Kollector Chicken</title>
    <link rel="stylesheet" href="http://localhost/graficas/GameCSS/style.css">
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
            <img src="http://localhost/graficas/GameImages/Logo.png">
        </div>
        <h2>Bienvenido, <?php echo $username; ?>!</h2>
            <!-- <p>Tu ID de usuario es: <?php echo $user_id; ?></p> -->
        <div class="buttons-menu">
            <button>
                <a href="http://localhost/graficas/GameHTML/gameMode.php">
                <img src="http://localhost/graficas/GameImages/Pagina principal/crearPartida.png" alt="Prueba">
                </a>
            </button>
            <button>
                <a href="http://localhost/graficas/GameHTML/searchGame.php">
                <img src="http://localhost/graficas/GameImages/Pagina principal/unirse.png" alt="Prueba">
                </a>
            </button>
            <button>
                <a href="http://localhost/graficas/GameHTML/settings.php">
                <img src="http://localhost/graficas/GameImages/Pagina principal/ajuste.png" alt="Prueba">
                </a>
            </button>
            <button>
                <a href="http://localhost/graficas/GameHTML/leaderboard.php">
                <img src="http://localhost/graficas/GameImages/Pagina principal/puntuacion.png" alt="Prueba">
                </a>
            </button>
        </div>
        <script>
            sessionStorage.setItem('gameEntry', 'valid');
        </script>
    </div>
</body>
</html>