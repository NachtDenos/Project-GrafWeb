<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puntuación - Kollector Chicken</title>
    <link rel="stylesheet" href="http://localhost/graficas/GameCSS/style.css">
    <script src="http://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>
</head>
<body>
    <div class="container-main">
        <div class="logo">
            <img src="http://localhost/graficas/GameImages/Logo.png">
        </div>
        <div class="game-image">
            <img id="icon" src="http://localhost/graficas/GameImages/Pantalla juego/juegoIcon.png">
            <img id="frame" src="http://localhost/graficas/GameImages/Pantalla juego/juego3.png">
            <div id="game-container"></div>
            <script src="http://localhost/graficas/GameJS/main.js" type="module">
            </script>
        </div>
        <button class="back-button" onclick="window.history.back()">
            <img src="http://localhost/graficas/GameImages/regresar.png" alt="Back">
        </button>
    </div>
</body>
</html>