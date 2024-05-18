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
            <img src="../GameImages/Logo.png">
        </div>
        <div class="leaderboard-wrapper">
            <div class="leaderboard-image">
                <img src="../GameImages/mapas/GUI.png">
            </div>
            <div class="buttons-row">
                <button class="custom-button" id="primaveraBtn">
                    <img src="../GameImages/mapas/prim.png" alt="Botón 1">
                </button>
                <button class="custom-button" id="otonoBtn">
                    <img src="../GameImages/mapas/otonio.png" alt="Botón 2">
                </button>
                <button class="custom-button" id="inviernoBtn">
                    <img src="../GameImages/mapas/invierno.png" alt="Botón 2">
                </button>
            </div>
        </div>
        <button class="back-button" onclick="window.history.back()">
            <img src="../GameImages/regresar.png" alt="Back">
        </button>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                console.log('Hola');
                let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

                const urlParams = new URLSearchParams(window.location.search);
                const mode = urlParams.get('mode');
                const difficulty = urlParams.get('difficulty');
        
                if (mode && difficulty) {
                        console.log('Hola2');
                        const primavera = document.getElementById('primaveraBtn');
                        const otoño = document.getElementById('otonoBtn');
                        const invierno = document.getElementById('inviernoBtn');
                        let isServer = true;
                        primavera.addEventListener('click', function(event) {
                            event.preventDefault();
                            console.log('Primavera button clicked');
                            let name = prompt('Nickname de la partida:');
                            let partidaID = fb.child("Games").push().key();
                            fb.child("Games").child(partidaID).child("Configuration").update({
                                nickname: name,
                                mode: mode,
                                difficulty: difficulty,
                                map: 'Primavera'
                            });
                            window.location.href = `game.php?id=${partidaID}&isServer=${isServer}`;
                        });

                        otoño.addEventListener('click', function(event) {
                            event.preventDefault();
                            console.log('Otoño button clicked');
                            let name = prompt('Nickname de la partida:');

                            let partidaID = fb.child("Games").push().key();
                            fb.child("Games").child(partidaID).child("Configuration").update({
                                nickname: name,
                                mode: mode,
                                difficulty: difficulty,
                                map: 'Otoño'
                            });
                            window.location.href = `game.php?id=${partidaID}&isServer=${isServer}`;
                        });

                        invierno.addEventListener('click', function(event) {
                            event.preventDefault();
                            console.log('Inverno button clicked');
                            let name = prompt('Nickname de la partida:');

                            let partidaID = fb.child("Games").push().key();
                            fb.child("Games").child(partidaID).child("Configuration").update({
                                nickname: name,
                                mode: mode,
                                difficulty: difficulty,
                                map: 'Invierno'
                            });
                            window.location.href = `game.php?id=${partidaID}&isServer=${isServer}`;
                        });


                    //primavera.querySelector('a').href = `map.html?mode=${mode}&difficulty=Facil`;
                    //otoño.querySelector('a').href = `map.html?mode=${mode}&difficulty=Dificil`;

                }
            });
        </script>
    </div>
</body>
</html>