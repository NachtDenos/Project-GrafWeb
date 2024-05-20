import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { Pathfinding } from 'https://cdn.jsdelivr.net/npm/three-pathfinding@1.3.0/+esm';
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
        this._Center = new THREE.Vector3(10, 0, 10);
        this._Radius= 3;
        this._Angle= Math.PI / 2;
        // create mesh and add mesh to scene 
        this._LoadAnimatedModel();
    }


    _LoadAnimatedModel() {
        console.log('Llegó a load animated model chick');
        console.log('Scene: ', this._Scene);
        let modelo; 
        if(this._Type == 'bad'){
            modelo = 'ChickBad.glb';
        }else if(this._Type == 'bad2'){
            console.log('modo dificil');
            modelo = 'ChickBadDificult.glb';
        }else{
            modelo = 'ChickWalk.glb';
        }

        const loader = new GLTFLoader();
        loader.setPath('../GameModels/');
        loader.load(modelo, (gltf) => {
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

            setTimeout(() => {
                
                //this._Mesh.geometry.computeBoundingBox();
                this._BB = new THREE.Box3();
                this._BB.setFromObject(this._Mesh);
                this._boxHelper = new THREE.Box3Helper( this._BB, 0xffff00 );
                this._Scene.add(this._boxHelper);
                console.log(this._BB);
                console.log('type:', this._Type);
            if(this._Type != 'good' && !this._PositionRecieved){
                this._CreatePathfinding();
            }
            }, 5000);

        });
    }

    randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    _CreatePathfinding(){
        
        console.log('entro a pathfinding');
        this._pathfinding = new Pathfinding();
        this._ZONE = 'level1';

        // Load navigation mesh
        const loader = new GLTFLoader();
        loader.load('../GameModels/navmesh.gltf', (gltf) => {
            //this._navmesh = gltf.scene;
            //this._Scene.add(this._navmesh);
            //const zoneNodes = Pathfinding.createZone(this._navmesh.geometry);
            //this._pathfinding.setZoneData(this._ZONE, zoneNodes);
            gltf.scene.traverse(node => {
                if(!this._navmesh && node.isObject3D && node.children.length > 0){
                    this._navmesh = node.children[0];
                    const zoneNodes = Pathfinding.createZone(this._navmesh.geometry);
                    this._pathfinding.setZoneData(this._ZONE, zoneNodes);
                }
            });
        });

        // State machine for enemy AI
        this._states = {
            PATROL: 'patrol',
            CHASE: 'chase',
            ATTACK: 'attack'
        };

        this. _currentState = this._states.PATROL;
        this._patrolPoints = this._GenerateRandomPatrolPoints(5);
        this._currentPatrolIndex = 0;
        this._chaseDistance = 7;
        this._attackDistance = 1;
        console.log('se creo pathfinding');
    }

    _GenerateRandomPatrolPoints(numPoints) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const randomPoint = new THREE.Vector3(this.randomNumber(6,12), 0.5, this.randomNumber(1,16));
            points.push(randomPoint);
        }
        return points;
    }

    _UpdateEnemy(delta, player) {
        if (!this._pathfinding || !this._navmesh) return;

        const distanceToPlayer = this._Mesh.position.distanceTo(player.position);

        // State transitions
        if (this._currentState === this._states.PATROL && distanceToPlayer < this._chaseDistance) {
            this._currentState = this._states.CHASE;
        } else if (this._currentState === this._states.CHASE && distanceToPlayer < this._attackDistance) {
            this._currentState = this._states.ATTACK;
        } else if (this._currentState === this._states.ATTACK && distanceToPlayer >= this._attackDistance) {
            this._currentState = this._states.CHASE;
        } else if (this._currentState === this._states.CHASE && distanceToPlayer >= this._chaseDistance) {
            this._currentState = this._states.PATROL;
        }

        console.log('patrol index: ', this._currentPatrolIndex);
        console.log('state:', this._currentState);

        // State behaviors
        switch (this._currentState) {
            case this._states.PATROL:
                this._Patrol(delta);
                break;
            case this._states.CHASE:
                this._Chase(delta, player);
                break;
            case this._states.ATTACK:
                this._Attack();
                break;
        }
    }

    _Patrol(delta) {
        const target = this._patrolPoints[this._currentPatrolIndex];
        console.log('taget:', target);
        this._groupId = this._pathfinding.getGroup(this._ZONE, this._Mesh.position);
        const closest = this._pathfinding.getClosestNode(this._Mesh.position, this._ZONE, this._groupId);
        const path = this._pathfinding.findPath(closest.centroid, target, this._ZONE, this._groupId);

        if (path) {
            this._MoveAlongPath(path, delta);
            //if (this._Mesh.position.distanceTo(target) < 0.1) {
            //    this._currentPatrolIndex = (this._currentPatrolIndex + 1) % this._patrolPoints.length;
            //}
        }
    }

    _Chase(delta, player) {
        const target = player.position;
        console.log('player is taget:', target);
        this._groupId = this._pathfinding.getGroup(this._ZONE, this._Mesh.position);
        const closest = this._pathfinding.getClosestNode(this._Mesh.position, this._ZONE, this._groupId);
        const path = this._pathfinding.findPath(closest.centroid, target, this._ZONE, this._groupId);

        if (path) {
            this._MoveAlongPath(path, delta);
        }
    }

    _Attack() {
        console.log('Attacking the player!');
        // Implement attack behavior
    }

    _MoveAlongPath(path, delta) {
        if (path.length > 0) {
            const target = path[0];
            const distance = target.clone().sub(this._Mesh.position);
            if(distance.lengthSq() > 0.5 * 0.05){
                distance.normalize();
                this._Mesh.position.add(distance.multiplyScalar(delta * 1)); // velocidad
                this._BB.setFromObject(this._Mesh);
                fb.child("Games").child(this._gameID).child("Chicken").child(this._ChickID).update({
                    position: {
                      x:this._Mesh.position.x,
                      y:this._Mesh.position.y, 
                      z:this._Mesh.position.z
                    }
                  });
                //console.log('id:',this._ChickID, ', pos:', this._Mesh.position);
            }else {
                path.shift();
                
                console.log('if ', this._patrolPoints.length-1, ' <= ', this._currentPatrolIndex);
                if(this._patrolPoints.length-1 <= this._currentPatrolIndex){
                    this._currentPatrolIndex = 0;
                }else{
                    this._currentPatrolIndex ++;
                }
                //this._currentPatrolIndex = (this._currentPatrolIndex + 1) % this._patrolPoints.length;
            }
            //const direction = new THREE.Vector3().subVectors(target, object.position).normalize();
            //object.position.add(direction.multiplyScalar(0.02 * delta));
//
            //if (object.position.distanceTo(target) < 0.1) {
            //    path.shift();
            //}

        }
    }
}