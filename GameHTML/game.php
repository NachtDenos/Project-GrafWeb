<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puntuación - Kollector Chicken</title>
    <link rel="stylesheet" href="../GameCSS/style.css">
    <script src="http://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>
</head>
<body>
    <div class="container-main">
        <div class="logo">
        </div>
        <div class="game-image">
            <img id="icon" src="../GameImages/Pantalla juego/juegoIcon.png">
            <img id="frame" src="../GameImages/Pantalla juego/juego3.png">
            <!--<div class="game-GUI-background">
            </div>-->
            <div class="game-GUI">
                <div id="health">
                    <img id="healthBarBackground" src="../GameImages/GUI/vida.png">
                    <div id="healthBar" style="background-color: brown;
                    width: 64%;
                    height: 18%;
                    position:relative;
                    top: -61%;
                    left: 27%;"></div>
                </div>
                <div id="score">
                    <img id="scoreBackground" src="../GameImages/GUI/score.png">
                    <h1 id="scoreGUI">0</h1>
                </div>
                <!--<h1 id="timerGUI" style="margin-top: 0; padding-left: 15rem; padding-right: 15rem; color:burlywood;">60</h1>-->
                <div id="time">
                    <img id="timerBackground" src="../GameImages/GUI/timer.png">
                    <h1 id="timerGUI">60</h1>
                </div>
                <div id="home">
                    <img id="iconHome" src="../GameImages/GUI/homeGray.png">
                </div>
            </div>
            <div id="game-container">
                <div id="waitingRoom">
                    <h1 id="waitingRoomText" ></h1>
                    <img src="../GameImages/Pantalla juego/pEspera.gif">
                </div>
                <div id="pause" >
                    <h1>PAUSA</h1>
                    <div id="blur"></div>
                </div>
            </div> 
            <script src="../GameJS/main.js" type="module">
            </script>
        </div>
        <button class="back-button">
            <a href="../menu.php">
                <img src="../GameImages/regresar.png" alt="Back">
            </a>
        </button>
    </div>
    <audio id="lobbyMusic" loop>
        <source src="../GameMusic/ALonelyCherryTree.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
    </audio>
</body>
</html>