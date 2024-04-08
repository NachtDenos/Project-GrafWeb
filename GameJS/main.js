import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';   
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; 
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';  
import { Player } from './player.js'; 

let contenedor, renderer, scene, camera, mixers, previousRAF, controls, player;

let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

let playerID;
let otherPlayers = {};

function initialize() {

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
    camera.lookAt(new THREE.Vector3(0,-7,0));
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

    light = new THREE.AmbientLight(0xFFFFFF, 0.25);
    scene.add(light);

    /*const controls = new OrbitControls(
    this._camera, this._renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();*/

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

    loader.load(
        '../GameModels/escenario.gltf',
        ( gltf ) => {
            scene.add( gltf.scene );
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        // called while loading is progressing
        ( xhr )  => {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        ( error ) => {
            console.log( 'An error happened:',error );
        }
    );

    mixers = [];
    previousRAF = null;
    
    initMainPlayer();

    listenToOtherPlayers();

    RAF();

    window.onunload = function() {
        fb.child("Players").child(playerID).remove();
    };

    window.onbeforeunload = function() {
        fb.child("Players").child(playerID).remove();
    };

}

function initMainPlayer(){
    playerID = fb.child("Players").push().key();
    console.log(fb);
    console.log(playerID);
    
    fb.child("Players").child(playerID).child("orientation").set({
        position: {x:0, y:0, z:0},
        rotation: {w:0, x:0, y:0, z:0}
    });


    player = new Player(playerID, true, scene, camera);
}

function initOtherPlayer(){

}

function listenToPlayer(playerData){
    if(playerData.val() && otherPlayers[playerData.key()]._Controls && otherPlayers[playerData.key()]._Controls._target){
        console.log(otherPlayers[playerData.key()]._Controls._target.quaternion);
        console.log(playerData.val().orientation.rotation)
        otherPlayers[playerData.key()]._Controls._target.position.copy( playerData.val().orientation.position );
        otherPlayers[playerData.key()]._Controls._target.quaternion.copy( playerData.val().orientation.rotation );
    }
}

function listenToOtherPlayers(){
    fb.child("Players").on("child_added", function(playerData){
        // validamos que exista player data
        if(playerData.val()){
            //validamos que el player no sea nuestro jugador y que no sea un jugador que ya existe
            if( playerID != playerData.key() && !otherPlayers[playerData.key()] ) {

                otherPlayers[playerData.key()] = new Player(playerData.key(), false, scene, camera);

                //console.log(otherPlayers[playerData.key()])

                fb.child("Players").child(playerData.key()).on("value",listenToPlayer)
            
            }
        }
    });

}

function loadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
      const loader = new FBXLoader();
      loader.setPath(path);
      loader.load(modelFile, (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.traverse(c => {
          c.castShadow = true;
        });
        fbx.position.copy(offset);
  
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
        const otherPlayer = otherPlayers[playerID];
        otherPlayer.Update(timeElapsedS);
    }
}


let APP = null;

window.addEventListener('DOMContentLoaded', () => {
  APP = initialize();
});