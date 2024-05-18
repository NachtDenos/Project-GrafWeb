import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
export { Item };

let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

class Item {
    constructor(itemID, gameId, scene, position, name){
        this._Init(itemID, gameId, scene, position, name);
    }

    _Init(itemID, gameId, scene, position, name) {
        this._ItemID = itemID; 
        this._gameID = gameId;
        this._Mesh; 
        this._Scene = scene; 
        this._BB;
        this._PositionRecieved = position; 
        this._boxHelper;
        this._Name = name;
        // create mesh and add mesh to scene 
        this._LoadModel();

    }

    _LoadModel() {
        const loader = new GLTFLoader();
        loader.load(
        '../GameModels/'+ this._Name +'.glb',
            ( gltf ) => {
                this._Scene.add( gltf.scene );
                gltf.animations; 
                this._Mesh = gltf.scene; 
                gltf.scenes; 
                gltf.cameras; 
                gltf.asset;
                this._Mesh.position.set(this.randomNumber(-7,12),0,this.randomNumber(0,17));

                this._BB = new THREE.Box3();
                this._BB.setFromObject(this._Mesh);
                this._boxHelper = new THREE.Box3Helper( this._BB, 0xffff00 );
                this._Scene.add(this._boxHelper);
            },
            ( xhr )  => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            ( error ) => {
                console.log( 'An error happened:',error );
            }
        );
    }

    randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

}