<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajustes - Kollector Chicken</title>
    <link rel="stylesheet" href="../GameCSS/style.css">
    <script src="http://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>
</head>
<body>
    <div class="container-main">
        <div class="logo">
            <img src="http://localhost/graficas/GameImages/Logo.png">
        </div>
        <div class="leaderboard-wrapper">
            <div class="settings-image">
                <img src="http://localhost/graficas/GameImages/Ajustes/AjusteBase.png">
            </div>
            <div class="settings-image" style="flex-direction:column;">
                <div class="slider" id="sliderEffects" style="top:-9rem;">
                    <div class="knob" id="knobEffects"></div>
                </div>
                <div class="slider" id="sliderMusic" style="top:-3rem;">
                    <div class="knob" id="knobMusic"></div>
                </div>
            </div>
            <!--<button class="buttons-settings">
                <a href="">
                <img src="http://localhost/graficas/GameImages/Ajustes/guardar.png" alt="Prueba">
                </a>
            </button>-->
        </div>
        <button class="back-button" onclick="window.history.back()">
            <img src="http://localhost/graficas/GameImages/regresar.png" alt="Back">
        </button>
    </div>
    <script src="http://localhost/graficas/GameJS/slider.js"></script>
</body>
</html>