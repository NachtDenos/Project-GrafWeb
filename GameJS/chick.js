import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; 
export { Chick };

let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

class Chick {
    constructor(chickID, gameId, chickGroup, scene, position, type){
        this._Init(chickID, gameId, chickGroup, scene, position, type);
    }

    _Init(chickID, gameId, chickGroup, scene, position, type) {
        this._ChickID = chickID; 
        this._gameID = gameId;
        this._Mesh; 
        this._Mixer;
        this._Scene = scene; 
        this._BB;
        this._Active = true; 
        this._PositionRecieved = position; 
        this._boxHelper;
        this._Type = type;
        // create mesh and add mesh to scene 
        this._LoadAnimatedModel();

    }

    // actualizar la posición de los otros meshes que no son nuestro jugador en base a su posición
    _SetOrientation(position, rotation) {

        // si existe una instancia del mesh
        if(scope._Mesh){
            // establecer la posicion
            //this._Mesh.position.x = position.x;
            //this._Mesh.rotation.x = rotation.x;

            //or 
            //this._Mesh.position.copy(position);
            //this._Mesh.rotation.copy(position);

        }

    }

    _LoadAnimatedModel() {
        console.log('Llegó a load animated model chick');
        console.log('Scene: ', this._Scene);
        const loader = new GLTFLoader();
        loader.setPath('../GameModels/');
        loader.load('ChickWalk.glb', (gltf) => {
            this._Mesh = gltf.scene;
            this._Mesh.scale.setScalar(1);
            console.log(this._PositionRecieved);
            if(this._PositionRecieved){
                console.log('antes de establecer la posición;');
                this._Mesh.position.set(this._PositionRecieved.x, this._PositionRecieved.y, this._PositionRecieved.z);
            }else{
                this._Mesh.position.set(this.randomNumber(-9,14), 0, this.randomNumber(0,19));
            }
            this._Mesh.traverse(c => {
            c.castShadow = true;
            }); 

            this._Mixer = new THREE.AnimationMixer(this._Mesh);
            console.log('mixer se definió');
            const animations = gltf.animations;
            const actions = {};
            animations.forEach((clip) => {
            actions[clip.name] = this._Mixer.clipAction(clip);
            });
            console.log('se asignaron los anim clips al mixer');
            const animationName = 'Run';
            if (actions[animationName]) {
            actions[animationName].play();
            }

            this._Scene.add(this._Mesh);

            // bounding box 
            //this._BB.setFromObject(this._Mesh);
            //const meshPosition = this._Mesh.position.clone(); 
            //this._BB.translate(meshPosition.x, meshPosition.y, meshPosition.z);
            setTimeout(() => {
                
                //this._Mesh.geometry.computeBoundingBox();
                this._BB = new THREE.Box3();
                this._BB.setFromObject(this._Mesh);
                this._boxHelper = new THREE.Box3Helper( this._BB, 0xffff00 );
                this._Scene.add(this._boxHelper);
                console.log(this._BB);
            }, 5000);

        });
    }

    randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
}