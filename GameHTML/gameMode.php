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
            <div class="leaderboard-image">
                <img src="../GameImages/modo de juego/modo de juego.png">
            </div>
            <div class="buttons-row">
                <button class="custom-button">
                    <a href="difficulty.php?mode=Individual">
                    <img src="../GameImages/modo de juego/individual.png" alt="Botón 1">
                    </a>
                </button>
                <button class="custom-button">
                    <a href="difficulty.php?mode=Multijugador">
                    <img src="../GameImages/modo de juego/multi.png" alt="Botón 2">
                    </a>
                </button>
            </div>
        </div>
        <button class="back-button" onclick="window.history.back()">
            <img src="../GameImages/regresar.png" alt="Back">
        </button>
    </div>
</body>
</html>