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
                <img src="../GameImages/Pantalla juego/end.png">
            </div>
        </div>
        <button class="back-button">
            <a href="../menu.php">
                <img src="../GameImages/regresar.png" alt="Back">
            </a>
        </button>
        <script>
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
    
            if (mode) {
                const facilButton = document.getElementById('facil-button');
                const dificilButton = document.getElementById('dificil-button');
                facilButton.querySelector('a').href = `map.php?mode=${mode}&difficulty=Facil`;
                dificilButton.querySelector('a').href = `map.php?mode=${mode}&difficulty=Dificil`;
            }
        </script>
    </div>
</body>
</html>