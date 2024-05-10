import * as THREE from 'three';
import { BasicCharacterController } from './character.js';

export { Player };

class Player {
    constructor(playerId, gameId, isMainPlayer, scene, camera){
        this._Init(playerId, gameId, isMainPlayer, scene, camera);
    }

    _Init(playerId, gameId, isMainPlayer, scene, camera) {
        console.log(isMainPlayer)
        this._PlayerID = playerId; 
        this._gameID = gameId;
        this._IsMainPlayer = isMainPlayer; 
        this._Mesh; 
        this._Scene = scene; 
        this._Camera = camera; 
        this._BB = new THREE.Box3();
        // create mesh and add mesh to scene 
        this._LoadAnimatedModel();

        if(this._IsMainPlayer) {
            // give player control of mesh 

        }
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
        console.log(this._IsMainPlayer)
        const params = {
          camera: this._Camera,
          scene: this._Scene,
          isMainPlayer: this._IsMainPlayer,
          playerID: this._PlayerID,
          gameID: this._gameID
        }
        this._Controls = new BasicCharacterController(params);
    }

    Update(timeInSeconds) {
        this._Controls.Update(timeInSeconds);
    }
}