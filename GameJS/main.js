import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';   
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; 
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';  
import { Player } from './player.js'; 
import { Chick } from './chick.js';
//import { mix } from 'three/examples/jsm/nodes/Nodes.js';

let contenedor, renderer, scene, camera, mixers, previousRAF, controls, player, chickGroup, escenarioBB, mode, difficulty, map, gameID, isServer, bordesBB;

let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

let playerID;
let otherPlayers = {};
let chicks = [];
let casasBB = [];

function initialize() {
  // -------------------------- CARGAR DATOS DEL JUEGO -------------------------- //
    const urlParams = new URLSearchParams(window.location.search);
    gameID = urlParams.get('id');
    isServer = urlParams.get('isServer');

    try {
      fb.child('Games').child(gameID).once('value', function(snapshot)  {
        const gameData = snapshot.val();
        if (gameData) {
            // gameID exists, retrieve and display the data
            mode = gameData.Configuration.mode;
            difficulty = gameData.Configuration.difficulty;
            map = gameData.Configuration.map;
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

  /*const fbxLoader = new FBXLoader();
    fbxLoader.load('../GameModels/escenarioPrueba1.fbx', (object) => {
      object.scale.multiplyScalar(0.003); 
      this._scene.add(object);
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
  );*/
  

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

function initChicken(){
  chickGroup = new THREE.Group();
  scene.add(chickGroup);
  console.log(isServer);
  if(isServer == 'true' || isServer == true){
    console.log('SI ES SERVER LAPTM');
    for (let i = 0; i < 2; i++) {

      let chickID = fb.child("Games").child(gameID).child("Chicken").push().key();
      console.log('Antes de instanciar chick');
      let chick = new Chick(chickID, gameID, chickGroup, scene, null);  
      //chick._Mesh.position.set(randomNumber(-9,14), 0, randomNumber(0,19));
      setTimeout(() => {
        console.log(chick._BB);
        mixers.push(chick._Mixer);
        chicks.push(chick);
        fb.child("Games").child(gameID).child("Chicken").child(chickID).child("position").set({
          x: chick._Mesh.position.x,
          y: chick._Mesh.position.y,
          z: chick._Mesh.position.z
        });
        fb.child("Games").child(gameID).child("Chicken").child(chickID).child("active").set(chick._Active);
        }, 10000);
      
    }
  }else{
    console.log('NO ES SERVER Q COÑO');
    fb.child("Games").child(gameID).child("Chicken").once("value", function(snapshot) {
        // Checar si Chicken tiene hijos 
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
              if(childSnapshot.child("active").val()){
                const positionData = childSnapshot.val().position;
                const position = new THREE.Vector3(positionData.x, positionData.y, positionData.z);
                console.log('childSnapshot.val(): ', childSnapshot.key());
                let chick = new Chick(childSnapshot.key(), gameID, chickGroup, scene, position); 

                setTimeout(() => {
                  //mixers.push(chick._Mixer);
                  chicks.push(chick);
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
      if (snapshot.exists()) {
        snapshot.forEach(function(childSnapshot) {
          
          for(const chick in chicks) {
            if(childSnapshot.key() == chick._ChickID){
              //remover el modelo si childSnapshot.child("active").val()
              //actualizar la posición
              if(isServer == 'false' || isServer == false){
                chick._Mesh.position.copy(childSnapshot.val().position);
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
    
    for(const chick of chicks){
      if(chick._ChickID == deletedChickID){
        console.log('Se encontró el pollo');
        scene.remove(chick._Mesh);
        scene.remove(chick._boxHelper);
        chicks.pop(chick);
      }
    }
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

    fb.child("Games").child(gameID).child("Players").child(playerID).child("barnNumber").set(numPrevPlayers+1);

    player = new Player(playerID, gameID, true, scene, camera, numPrevPlayers+1);
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

  //for (const chick of chicks) {
  //  chick.Update();
  //}

  checkCollisions();
}
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
function checkCollisions() {
  //console.log('BB de player: ', player._BB);
  if(player && player._BB){
    for (const chick of chicks) {
      //console.log('BB de chick:', chick._BB);
      if(chick._BB){
        if (player._BB.intersectsBox(chick._BB)){
          console.log('mi jugador tocó el pollo: ', chick._ChickID);
          player._Controls._input._keys.forward = false; 
          player._Controls._velocity = new THREE.Vector3(0, 0, 0);
          scene.remove(chick._Mesh);
          scene.remove(chick._boxHelper);
          fb.child("Games").child(gameID).child("Chicken").child(chick._ChickID).remove();
          chicks.pop(chick);
        }
      }
    }

    // for (const casa of casasBB){
    //   if(player._BB.intersectsBox(casa)){
    //     player._Controls._input._keys.forward = false; 
    //     player._Controls._velocity = new THREE.Vector3(0, 0, 0);
    //     if(player._BarnNumber == )
    //   }
    // }

  }

}

let APP = null;

window.addEventListener('DOMContentLoaded', () => {
  APP = initialize();
});