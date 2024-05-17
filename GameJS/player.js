import * as THREE from 'three';
import { BasicCharacterController } from './character.js';

export { Player };

class Player {
    constructor(playerId, gameId, isMainPlayer, scene, camera, barnNumber){
        this._Init(playerId, gameId, isMainPlayer, scene, camera, barnNumber);
    }

    _Init(playerId, gameId, isMainPlayer, scene, camera, barnNumber) {
        console.log(isMainPlayer)
        this._PlayerID = playerId; 
        this._gameID = gameId;
        this._IsMainPlayer = isMainPlayer; 
        this._Mesh; 
        this._Scene = scene; 
        this._Camera = camera; 
        this._BB;
        this._boxHelper;
        this._BarnNumber = barnNumber;
        this._Points = 0; 
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
        const params = {
            camera: this._Camera,
            scene: this._Scene,
            isMainPlayer: this._IsMainPlayer,
            playerID: this._PlayerID,
            gameID: this._gameID
        }
        this._Controls = new BasicCharacterController(params);
        if(this._IsMainPlayer === true){
            setTimeout(() => {
                console.log('Is main player: ', this._IsMainPlayer)
                console.log('PORQQUE CHINGADOS ENTRA AQUI SI ES FALSO Q VERGAS');
                this._BB = new THREE.Box3();
                this._Mesh = this._Controls._target;
                //console.log('Mesh: ', this._Mesh);
                this._BB.setFromObject(this._Controls._target);
                this._boxHelper = new THREE.Box3Helper( this._BB, 0xffff00 );
                this._boxHelper.updateMatrixWorld(true);
                this._Scene.add(this._boxHelper);
            }, 5000);
        }
    }

    Update(timeInSeconds) {
        this._Controls.Update(timeInSeconds);
        //setTimeout(() => {
            if(this._BB && this._Mesh && (this._IsMainPlayer == true)){
                //console.log('update de bb: ', this._PlayerID);
                const fbxPosition = this._Mesh.position.clone();
                const fbxRotation = this._Mesh.quaternion.clone();
                this._BB.setFromObject(this._Mesh);
            }
        //}, 8000);
    }
}