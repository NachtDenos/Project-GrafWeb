import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { Player } from './player.js'; 
import { Chick } from './chick.js';

let contenedor, renderer, scene, camera, mixers, previousRAF, controls, player, chickGroup, escenarioBB, mode, difficulty, map, gameID, isServer, bordesBB, timer, GamePlayers, timerWaitroom, damage, chickVelocity, fondoMusic, getEffect, damageEffect, itemBB;

let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

let playerID;
let otherPlayers = {};
let chicks = [];
let chicksBad = [];
let casasBB = [];
let ChickGrabbed = null; 

let pantallaWaiting = document.getElementById('waitingRoom');
let pantallaPause = document.getElementById('pause');
let timerGUI = document.getElementById('timerGUI');
let waitingText = document.getElementById('waitingRoomText');
let lobbyMusic = document.getElementById("lobbyMusic");

let isEscPressed = false;
let isEkeyPressed = false; 
let collidedChickBad = false; 
let gameStarted = false;

let effectsVolume = 100;
let musicVolume = 100; 

function initialize() {
  pantallaWaiting.style.display = 'block'; 
  pantallaPause.style.display = 'none'; 

  // -------------------------- CARGAR DATOS DEL JUEGO -------------------------- //
    const urlParams = new URLSearchParams(window.location.search);
    gameID = urlParams.get('id');
    isServer = urlParams.get('isServer');

    try {

      fb.child('General').child('Configuration').once('value', function(snapshot)  {
        const gameData = snapshot.val();

        if (gameData) {
          effectsVolume = gameData.effects;
          musicVolume = gameData.music;
        } else {
            console.log('data not found');
        }
      }); 

      document.body.addEventListener("mousemove", playLobbyMusic);

      fb.child('Games').child(gameID).once('value', function(snapshot)  {
        const gameData = snapshot.val();
        if (gameData) {
            // gameID exists, retrieve and display the data
            mode = gameData.Configuration.mode;
            difficulty = gameData.Configuration.difficulty;
            map = gameData.Configuration.map;
            if(difficulty == 'Facil'){
              damage = 10;
              chickVelocity = 1.0;
            }else{
              damage = 20; 
              chickVelocity = 2.0;
            }
            if(mode == 'Multijugador'){
              fb.child("Games").child(gameID).child("Players").on("value", checkStartGame);
            }else {
              timerWaitroom = 5;
              waitingRoomText.innerText = timerWaitroom;
              setInterval(updateTimerWaitroom, 1000);
              setTimeout(()=>{
                gameStarted = true; 
                lobbyMusic.pause();
                pantallaWaiting.style.display = 'none'; 
                startTimer();
                fondoMusic.play();
              }, 7000);
            }
            loadScene();
        } else {
            console.log('game not found');
            // reedireccionar a una pantalla de 'No se encontró la game'; 
            window.location.href = 'index.html';
        }
      }); 


    } catch (error) {
      console.error('Error in Firebase operation:', error);
      window.location.href = 'index.html';
    }
}

function playLobbyMusic(){
  lobbyMusic.play();
  lobbyMusic.volume = musicVolume/100;
  document.body.removeEventListener("mousemove", playLobbyMusic);
}

function checkStartGame(snapshot){
  GamePlayers = snapshot.numChildren();
  ('Jugadores en el juego: ', GamePlayers);
  waitingRoomText.innerText = GamePlayers + '/4';



  if(GamePlayers == 2){
    timerWaitroom = 5;
    waitingRoomText.innerText = timerWaitroom;

    setInterval(updateTimerWaitroom, 1000);
    setTimeout(()=>{
      gameStarted = true; 
      lobbyMusic.pause();
      pantallaWaiting.style.display = 'none'; 
      startTimer();
      fondoMusic.play();
      fb.child("Games").child(gameID).child("Players").off("value", checkStartGame);
    }, 10000);
  }else {
    if(player){
      player._Controls._input._keys.forward = false; 
      player._Controls._velocity = new THREE.Vector3(0, 0, 0);
    }
  }
}

function updateTimerWaitroom(){
  if(timerWaitroom > 0){
    timerWaitroom --;
    console.log(timerWaitroom);
    waitingRoomText.innerText = timerWaitroom;
  }

}

function startTimer(){
  timer = 60;

  if(gameStarted){
    let timerInterval = setInterval(updateTimer, 1000);

    setTimeout(() => {
      clearInterval(timerInterval); // Stop the timer interval
    }, 60000);
  }
}

function loadScene(){

  // -------------------------- OBJETOS DE ESCENA  -------------------------- //
  contenedor = document.getElementById('game-container');
  let width = contenedor.clientWidth;
  let height = contenedor.clientHeight;


  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( width, height);

  contenedor.appendChild(renderer.domElement);    

  window.addEventListener('resize', () => {
    onWindowResize();
  }, false);

  const fov = 45;
  const aspect = width / height;
  const near = 1.0;
  const far = 1000.0;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 15, 33);
  camera.lookAt(new THREE.Vector3(0,-12,0));
  camera.aspect = width / height;

  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  const audioLoader = new THREE.AudioLoader();

  fondoMusic = new THREE.Audio(audioListener);
  audioLoader.load("../GameMusic/GameMusic.mp3", function(buffer){
      fondoMusic.setBuffer(buffer);
      fondoMusic.setLoop(true);
      fondoMusic.setVolume(musicVolume/100);
  });

  getEffect = new THREE.Audio(audioListener);
  audioLoader.load("../GameMusic/GetEffect.mp3", function(buffer){
    getEffect.setBuffer(buffer);
    getEffect.setLoop(false);
    getEffect.setVolume(effectsVolume/100);
  });

  damageEffect = new THREE.Audio(audioListener);
  audioLoader.load("../GameMusic/DamageEffect.mp3", function(buffer){
    damageEffect.setBuffer(buffer);
    damageEffect.setLoop(false);
    damageEffect.setVolume(effectsVolume/100);
  });


  scene = new THREE.Scene();
  scene.background = new THREE.Color("#7FE2F3");

  let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light.position.set(-100, 100, 100);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 500.0;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500.0;
  light.shadow.camera.left = 50;
  light.shadow.camera.right = -50;
  light.shadow.camera.top = 50;
  light.shadow.camera.bottom = -50;
  scene.add(light);

  light = new THREE.AmbientLight(0xFFFFFF, 1.0);
  scene.add(light);

  const loader = new GLTFLoader();
  const escenarioURL = '../GameModels/escenario'+ map + '.gltf';
  loader.load(
      escenarioURL,
      ( gltf ) => {
          scene.add( gltf.scene );
          gltf.animations; 
          gltf.scene; 
          gltf.scenes; 
          gltf.cameras; 
          gltf.asset;
      },
      ( xhr )  => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      ( error ) => {
          console.log( 'An error happened:',error );
      }
  );

  loader.load(
    '../GameModels/FirstAidKit.glb',
      ( gltf ) => {
          scene.add( gltf.scene );
          gltf.animations; 
          const mesh = gltf.scene; 
          gltf.scenes; 
          gltf.cameras; 
          gltf.asset;
          mesh.position.set(0,0,3);
      },
      ( xhr )  => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      ( error ) => {
          console.log( 'An error happened:',error );
      }
  );

  loader.load(
    '../GameModels/Soda.glb',
      ( gltf ) => {
          scene.add( gltf.scene );
          gltf.animations; 
          const mesh = gltf.scene; 
          gltf.scenes; 
          gltf.cameras; 
          gltf.asset;
          mesh.position.set(0,0,1);
      },
      ( xhr )  => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      ( error ) => {
          console.log( 'An error happened:',error );
      }
  );

  /*loader.load('../GameModels/FirstAidKit.glb', (gltf) => {
    const mesh = gltf.scene;
    mesh.scale.setScalar(1);
    mesh.traverse(c => {
    c.castShadow = true;
    }); 
    scene.add(mesh);
  });*/

  /*const fbxLoader = new FBXLoader();
  fbxLoader.load('../GameModels/FirstAidKit.fbx', (object) => {
      scene.add(object);
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
  );*/

  // -------------------------- COLISIONES ESCENARIO -------------------------- //

  const casa1Geometry = new THREE.BoxGeometry( 5, 4, 5 ); 
  const casa1Material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
  const casa1 = new THREE.Mesh( casa1Geometry, casa1Material ); 
  casa1.position.set(8.5,0,-4.5);
  casa1.rotation.set(0,45,0);
  scene.add( casa1 );
  const casa1BB = new THREE.Box3();
  casa1BB.setFromObject(casa1);
  casasBB.push(casa1BB);
  const casa1BoxHelper = new THREE.Box3Helper(casa1BB, 0xffff00 );
  casa1BoxHelper.updateMatrixWorld(true);
  scene.add(casa1BoxHelper);

  const casa2Geometry = new THREE.BoxGeometry( 6, 4, 6 ); 
  const casa2Material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
  const casa2 = new THREE.Mesh( casa2Geometry, casa2Material ); 
  casa2.position.set(-9,0,-5);
  casa2.rotation.set(0,-34,0);
  scene.add( casa2 );
  const casa2BB = new THREE.Box3();
  casa2BB.setFromObject(casa2);
  casasBB.push(casa2BB);
  const casa2BoxHelper = new THREE.Box3Helper(casa2BB, 0xffff00 );
  casa2BoxHelper.updateMatrixWorld(true);
  scene.add(casa2BoxHelper);

  const casa3Geometry = new THREE.BoxGeometry( 6, 4, 6 ); 
  const casa3Material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
  const casa3 = new THREE.Mesh( casa3Geometry, casa3Material ); 
  casa3.position.set(-17.5,0,9.5);
  casa3.rotation.set(0,0,0);
  scene.add( casa3 );
  const casa3BB = new THREE.Box3();
  casa3BB.setFromObject(casa3);
  casasBB.push(casa3BB);
  const casa3BoxHelper = new THREE.Box3Helper(casa3BB, 0xffff00 );
  casa3BoxHelper.updateMatrixWorld(true);
  scene.add(casa3BoxHelper);

  const casa4Geometry = new THREE.BoxGeometry( 6, 4, 6 ); 
  const casa4Material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
  const casa4 = new THREE.Mesh( casa4Geometry, casa4Material ); 
  casa4.position.set(17.5,0,9);
  casa4.rotation.set(0,0.1,0);
  scene.add( casa4 );
  const casa4BB = new THREE.Box3();
  casa4BB.setFromObject(casa4);
  casasBB.push(casa4BB);
  const casa4BoxHelper = new THREE.Box3Helper(casa4BB, 0xffff00 );
  casa4BoxHelper.updateMatrixWorld(true);
  scene.add(casa4BoxHelper);

  //const casa4Geometry = new THREE.BoxGeometry( 6, 4, 6 ); 
  //const casa4Material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
  //const casa4 = new THREE.Mesh( casa4Geometry, casa4Material ); 
  //casa4.position.set(17.5,0,9);
  //casa4.rotation.set(0,0.1,0);
  //scene.add( casa4 );
  //const casa4BB = new THREE.Box3();
  //casa4BB.setFromObject(casa4);
  //const casa4BoxHelper = new THREE.Box3Helper(casa4BB, 0xffff00 );
  //casa4BoxHelper.updateMatrixWorld(true);
  //scene.add(casa4BoxHelper);


  mixers = [];
  previousRAF = null;
  
  initMainPlayer();

  initChicken();

  listenToOtherPlayers();

  listenToChicken();

  //window.onbeforeunload = function() {
  //    fb.child("Players").child(playerID).remove();
  //};

  RAF();

  window.addEventListener('keydown', keyEvents);

  window.addEventListener('beforeunload', function (event) {
    fb.child("Games").child(gameID).child("Players").child(playerID).remove();
  });

  window.addEventListener('pagehide', function(){
    fb.child("Games").child(gameID).child("Players").child(playerID).remove();
  });

  fb.child("Games").child(gameID).child("Players").on("child_removed", function(childSnapshot) {
    fb.child("Games").child(gameID).child("Players").once("value", function(snapshot) {
        if (!snapshot.exists()) {
          fb.child("Games").child(gameID).remove()
            .then(function() {
                console.log("Game removed because there are no players left.");
            })
            .catch(function(error) {
                console.error("Error removing game:", error);
            });
          }
      });
  });

} 

function keyEvents(event) {
  if (event.key === 'Escape') {
    if (!isEscPressed) {
      console.log('First time Esc key pressed');
      isEscPressed = true;
      pantallaPause.style.display = 'block';
    } else {
      console.log('Esc key pressed again');
      isEscPressed = false;
      pantallaPause.style.display = 'none';
    }
  }

  if (event.key === 'E' || event.key === 'e') {
    if (!isEkeyPressed) {
      isEkeyPressed = true;
      console.log('se presionó la E');
    } else {
      isEkeyPressed = false;
    }
  }
}


function initChicken(){
  chickGroup = new THREE.Group();
  scene.add(chickGroup);
  console.log(isServer);
  if(isServer == 'true' || isServer == true){
    for (let i = 0; i < 2; i++) {
      let chickID = fb.child("Games").child(gameID).child("Chicken").push().key();
      console.log('Antes de instanciar chick');
      let chick = new Chick(chickID, gameID, chickGroup, scene, null, 'good');  
      setTimeout(() => {
        console.log(chick._BB);
        mixers.push(chick._Mixer);
        chicks.push(chick);
        fb.child("Games").child(gameID).child("Chicken").child(chickID).set({
          active: true,
          type: 'good',
          position:{
            x: chick._Mesh.position.x,
            y: chick._Mesh.position.y,
            z: chick._Mesh.position.z
          }
        });
        console.log('chick._Active: ', chick._Active);
        }, 10000);
      
    }
    for (let i = 0; i < 2; i++) {
      let chickID = fb.child("Games").child(gameID).child("Chicken").push().key();
      console.log('Antes de instanciar chick');
      console.log('Dificulty:', difficulty);
      let modelType;
      if(difficulty == 'Facil'){
        modelType = 'bad';
      }else{
        modelType = 'bad2';
      }
      console.log('modelType:', modelType);
      let chick = new Chick(chickID, gameID, chickGroup, scene, null, modelType);  
      setTimeout(() => {
        console.log(chick._BB);
        mixers.push(chick._Mixer);
        chicksBad.push(chick);
        fb.child("Games").child(gameID).child("Chicken").child(chickID).set({
          active: true,
          type: 'bad',
          position:{
            x: chick._Mesh.position.x,
            y: chick._Mesh.position.y,
            z: chick._Mesh.position.z
          }
        });
        console.log('chick._Active: ', chick._Active);
        }, 10000);
      
    }
  }else{
    fb.child("Games").child(gameID).child("Chicken").once("value", function(snapshot) {
        // Checar si Chicken tiene hijos 
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
              if(childSnapshot.child("active").val()){
                const positionData = childSnapshot.val().position;
                const position = new THREE.Vector3(positionData.x, positionData.y, positionData.z);
                console.log('childSnapshot.val(): ', childSnapshot.key());
                console.log('type of chicken dificulty:', childSnapshot.val().type);
                let chick = new Chick(childSnapshot.key(), gameID, chickGroup, scene, position, childSnapshot.val().type); 

                setTimeout(() => {
                  //mixers.push(chick._Mixer);
                  if(childSnapshot.val().type == 'good'){
                    chicks.push(chick);
                  }else{
                    chicksBad.push(chick);
                  }
                }, 10000);
              }

            });
        } else {
            console.log("No chickens found.");
        }
    }, function(error) {
        console.error("Error fetching chickens:", error);
    });
  }
}

function listenToChicken(){
  fb.child("Games").child(gameID).child("Chicken").on("value", function(snapshot) {
      console.log('evento change chick value');
      if (snapshot.exists()) {
        console.log('snapshot exists');
        console.log('snapshot: ', snapshot.exists());
        snapshot.forEach(function(childSnapshot) {
          console.log('childSnapshot: ', childSnapshot);
          for(const chick of chicks) {
            console.log(childSnapshot.key(), ' = ', chick._ChickID);
            if(childSnapshot.key() == chick._ChickID){
              if(isServer == 'false' || isServer == false){
                chick._Mesh.position.copy(childSnapshot.val().position);
              }
              console.log('childSnapshot.val().active: ', childSnapshot.val().active);
              chick._Active = childSnapshot.val().active;
              console.log('chick._Active');
              if(chick._Active){
                chick._Mesh.visible = true; 
              }else{
                chick._Mesh.visible = false; 
              }
            }
          }

        });
      } else {
          console.log("No chickens found.");
      }
  }, function(error) {
      console.error("Error fetching chickens:", error);
  });
  fb.child("Games").child(gameID).child("Chicken").on("child_removed", function(snapshot) {
    console.log('Entró al evento de borrar pollos');
    console.log(snapshot.key());
    const deletedChickID = snapshot.key();
    console.log(chicks);
    setTimeout(()=>{
      for(const chick of chicks){
        console.log(chick);
        console.log(chick._ChickID, ' = ', deletedChickID);
        if(chick._ChickID == deletedChickID){
          console.log('Se encontró el pollo');
          scene.remove(chick._Mesh);
          scene.remove(chick._boxHelper);
          chicks.pop(chick);
        }
      }
    },1000);
  });
  
}

function initMainPlayer(){
  let numPrevPlayers = 0;
  fb.child("Games").child(gameID).child("Players").once("value", function(snapshot) {
    numPrevPlayers = snapshot.numChildren();
    console.log('Num de jugadores antes q yo: ', numPrevPlayers);
  });

  setTimeout(() => {
    console.log('Nuevo player');
    playerID = fb.child("Games").child(gameID).child("Players").push().key();
  
    fb.child("Games").child(gameID).child("Players").child(playerID).child("orientation").set({
      position: {x:0, y:0, z:0},
      rotation: {w:0, x:0, y:0, z:0}
    });

    fb.child("Games").child(gameID).child("Players").child(playerID).child("keys").set({
      forward: false,
      backward: false,
      shift: false
    });
    const barnNum = numPrevPlayers+1;
    fb.child("Games").child(gameID).child("Players").child(playerID).child("barnNumber").set(barnNum);
    player = new Player(playerID, gameID, true, scene, camera, barnNum );

    setTimeout(() => {
      let quaternion = new THREE.Quaternion();
      if(barnNum == 1){
        player._Controls._target.position.copy(new THREE.Vector3(8,0,0.5));
      }else if (barnNum == 2) {
        player._Controls._target.position.copy(new THREE.Vector3(-8,0,0.5));
      }else if (barnNum == 3) {
        player._Controls._target.position.copy(new THREE.Vector3(-13,0,9.5));
        quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 1.5708);
        player._Controls._target.quaternion.copy(quaternion);
      }else if(barnNum == 4) {
        player._Controls._target.position.copy(new THREE.Vector3(13,0,9));
        quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -1.5708);
        player._Controls._target.quaternion.copy(quaternion);
      }
    }, 2000);

  }, 1000);
}

function listenToPlayer(playerData){
    if(playerData.val() && otherPlayers[playerData.key()]._Controls && otherPlayers[playerData.key()]._Controls._target){
        otherPlayers[playerData.key()]._Controls._target.position.copy( playerData.val().orientation.position );
        otherPlayers[playerData.key()]._Controls._target.quaternion.copy( playerData.val().orientation.rotation );
    }
}
function listenToOtherPlayers(){
    fb.child("Games").child(gameID).child("Players").on("child_added", function(playerData){
        // validamos que exista player data
        if(playerData.val()){
            if( playerID != playerData.key() && !otherPlayers[playerData.key()] ) {
                otherPlayers[playerData.key()] = new Player(playerData.key(), gameID, false, scene, camera, playerData.child("barnNumber").val());
                setTimeout(() => {
                  //console.log(otherPlayers[playerData.key()]._Controls );
                  otherPlayers[playerData.key()]._Controls._target.position.copy( playerData.val().orientation.position );
                  otherPlayers[playerData.key()]._Controls._target.quaternion.copy( playerData.val().orientation.rotation );
                }, 10000);
            
            }
        }
    });

}
function loadAnimatedModelAndPlay(path, modelFile, animFile) {
      const loader = new FBXLoader();
      loader.setPath(path);
      loader.load(modelFile, (fbx) => {
        fbx.scale.setScalar(0.02);
        fbx.traverse(c => {
          c.castShadow = true;
        });
        //fbx.position.copy(offset);
  
        const anim = new FBXLoader();
        anim.setPath(path);
        anim.load(animFile, (anim) => {
          const m = new THREE.AnimationMixer(fbx);
          mixers.push(m);
          const idle = m.clipAction(anim.animations[0]);
          idle.play();
        });
        scene.add(fbx);
      });
}

function loadModel() {
      const loader = new GLTFLoader();
      loader.load('./resources/thing.glb', (gltf) => {
        gltf.scene.traverse(c => {
          c.castShadow = true;
        });
        scene.add(gltf.scene);
      });
}
function onWindowResize() {
      const widthUpdate = contenedor.clientWidth;
      const heightUpdate = contenedor.clientHeight;
      camera.aspect = widthUpdate / heightUpdate;
      camera.updateProjectionMatrix();
      renderer.setSize(widthUpdate, heightUpdate);
}
function RAF() {
      requestAnimationFrame((t) => {
        if (previousRAF === null) {
          previousRAF = t;
        }
  
        RAF();
  
        renderer.render(scene, camera);
        step(t - previousRAF);
        previousRAF = t;
      });
}
function step(timeElapsed) {
  const timeElapsedS = timeElapsed * 0.001;
  if (mixers) {
    mixers.map(m => m.update(timeElapsedS));
  }
  

  if (player) {
    player.Update(timeElapsedS);
  }

  for (const playerID in otherPlayers) {
    otherPlayers[playerID].Update(timeElapsedS);
  }

  checkCollisions();
}

function updateTimer(){
  if (timer > 0) {
    timer --;
    timerGUI.innerText = timer; 
  }
}


function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
function checkCollisions() {
  if(player && player._BB){
      for (const chick of chicks) {
        if(chick._BB && chick._Active){
          if (player._BB.intersectsBox(chick._BB)){
            console.log('mi jugador colisionó con un pollo');
            player._Controls._input._keys.forward = false; 
            player._Controls._velocity = new THREE.Vector3(0, 0, 0);
            //console.log('ChickGrabbed')
            //si ya está agarrando un pollo no puede agarrar otro. 
            if(ChickGrabbed == null && isEkeyPressed){
              // cuando el jugador agarra el pollo no se borra el pollo, solo se esconde. se borra hasta que toca la casa.
              console.log('mi jugador agarró un pollo: ', chick._ChickID);
              getEffect.play();
              ChickGrabbed = chick._ChickID; 
              chick._Mesh.visible = false; 
              chick._Active = false;
              fb.child("Games").child(gameID).child("Chicken").child(chick._ChickID).child("active").set(false);
              document.getElementById('iconHome').src = '../GameImages/GUI/homeGreen.png';
            }
          }
        }
      }

      //const healthBar = document.getElementById('healthBar');
      for (const chick of chicksBad) {
        if(chick._BB && chick._Active){
          if (player._BB.intersectsBox(chick._BB)){
            console.log('mi jugador colisionó con un pollo malo');
            player._Controls._input._keys.forward = false; 
            player._Controls._velocity = new THREE.Vector3(0, 0, 0);
            //bajar la vida
            if(!collidedChickBad){
              damageEffect.play();
              collidedChickBad = true; 
              player._Health -= damage;
              let currentWidth = parseFloat(document.getElementById('healthBar').style.width); // Parse the current width as a number
              //console.log(healthBar);
              console.log(currentWidth);
              let newWidth = currentWidth - 12.8; // Subtract 12.8 from the current width
              console.log(newWidth);
              document.getElementById('healthBar').style.width = newWidth + '%';
              console.log('health: ', player._Health);
            }else{
              setTimeout(()=>{
                collidedChickBad = false; 
              },5000);
            }
          }
        }
      }

    for (const [index, casa] of casasBB.entries()) {
      if (player._BB.intersectsBox(casa)) {
        player._Controls._input._keys.forward = false; 
        player._Controls._velocity = new THREE.Vector3(0, 0, 0);
        if (player._BarnNumber == index+1) {
          console.log('choque con mi casa');
          console.log(chicks);
          if(ChickGrabbed != null && isEkeyPressed){
              for(const chick of chicks){
                console.log(chicks);
                console.log(chick._ChickID, ' = ', ChickGrabbed);
                if(chick._ChickID == ChickGrabbed){
                  getEffect.play();
                  console.log(chicks);
                  scene.remove(chick._Mesh);
                  scene.remove(chick._boxHelper);
                  console.log('antes: ', chicks);
                  for(const chick2 of chicks)
                    console.log(chick2._ChickID);
                  chicks.pop(chick);
                  console.log('despues: ', chicks);
                  for(const chick3 of chicks)
                    console.log(chick3._ChickID);
                  ChickGrabbed = null;
                  player._Points += 1;  
                  document.getElementById('scoreGUI').innerHTML = player._Points;
                  console.log('Puntos: ', player._Points);
                  fb.child("Games").child(gameID).child("Chicken").child(chick._ChickID).remove();
                  document.getElementById('iconHome').src = '../GameImages/GUI/homeGray.png';
                  break;
                }
              }
          }
        }
      }
    }
  }
}


let APP = null;

window.addEventListener('DOMContentLoaded', () => {
  APP = initialize();
});