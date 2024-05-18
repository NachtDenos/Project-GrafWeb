<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buscar Partida - Kollector Chicken</title>
    <link rel="stylesheet" href="http://localhost/graficas/GameCSS/style.css">
    <script src="http://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>
</head>
<body>
    <div class="container-main">
        <div class="logo">
            <img src="http://localhost/graficas/GameImages/Logo.png">
        </div>
        <div class="leaderboard-image">
            <img src="http://localhost/graficas/GameImages/Busca partida/Busca.png">
            <div id="table-container" style="z-index: 10;">
            </div>
        </div>
        <button class="back-button" onclick="window.history.back()">
            <img src="http://localhost/graficas/GameImages/regresar.png" alt="Back">
        </button>
        <script>
            let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

            fb.child("Games").once("value", function(snapshot) {
                const gamePlayerCounts = {};

                // se recorren los hijos de Games 
                snapshot.forEach(child => {
                    const gameId = child.key();
                    console.log(gameId);
                    const configurationSnapshot = child.child("Configuration");

                    // se filtran solo en los que son multijugador
                    if (configurationSnapshot.exists() && configurationSnapshot.child("mode").val() === 'Multijugador') {
                        const playerCount = child.child("Players").numChildren();
                        gamePlayerCounts[gameId] = {
                            gameName: configurationSnapshot.child("nickname").val(),
                            playerCount: playerCount};
                    }
                });

                console.log(gamePlayerCounts);
                displaygamesAndPlayers(gamePlayerCounts);
            });

            function displaygamesAndPlayers(gamePlayerCounts) {
                const table = document.createElement('table');
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');

                const headerRow = document.createElement('tr');
                const headergameName = document.createElement('th');
                headergameName.textContent = 'Game Nickname';
                const headerPlayerCount = document.createElement('th');
                headerPlayerCount.textContent = 'Current Players';
                headerRow.appendChild(headergameName);
                headerRow.appendChild(headerPlayerCount);
                thead.appendChild(headerRow);
                table.appendChild(thead);

                for (const [gameId, gameData] of Object.entries(gamePlayerCounts)) {
                    console.log('Nueva fila');
                    const row = document.createElement('tr');
                    row.classList.add('table-row');
                    row.id = gameId; 
                    const { gameName, playerCount } = gameData;
                    const cellgameName = document.createElement('td');
                    cellgameName.textContent = gameName; 
                    const cellPlayerCount = document.createElement('td');
                    cellPlayerCount.textContent = playerCount+'/4';
                    cellPlayerCount.classList.add('cell-PlayerCount');
                    row.appendChild(cellgameName);
                    row.appendChild(cellPlayerCount);
                    tbody.appendChild(row);


                    row.addEventListener('click', function() {
                        if(playerCount > 3){
                            alert('La sala está llena');
                        }else{
                            console.log('Clicked row with ID:', row.id); 
                            let isServer = false; 
                            window.location.href = `game.html?id=${row.id}&isServer=${isServer}`;
                        }
                    });
                }

                table.appendChild(tbody);

                const tableContainer = document.getElementById('table-container');
                tableContainer.appendChild(table);
            }
        </script>
    </div>
</body>
</html>