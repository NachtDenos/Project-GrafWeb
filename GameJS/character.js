import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';   
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; 
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';  

export { BasicCharacterController };

let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

class BasicCharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

class BasicCharacterController {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    this._animations = {};
    this._input = new BasicCharacterControllerInput(this._params.isMainPlayer);

    this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations), this._params.isMainPlayer);

    this._LoadModels();
  }

  _LoadModels() {
    const loader = new FBXLoader();
    loader.setPath('../GameModels/Character/');
    loader.load('character.fbx', (fbx) => {
      fbx.scale.setScalar(0.015);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
  
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('../GameModels/Character/');
      loader.load('Walking.fbx', (a) => { _OnLoad('walk', a); });
      loader.load('Running.fbx', (a) => { _OnLoad('run', a); });
      loader.load('Idle2.fbx', (a) => { _OnLoad('idle', a); });
    });
  }

  Update(timeInSeconds) {
    if (!this._target) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);
    
    if(this._params.isMainPlayer){
      const controlObject = this._target;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();

      const acc = this._acceleration.clone();
      if (this._input._keys.shift) {
        acc.multiplyScalar(2.0);
      }

      if (this._input._keys.forward) {
        velocity.z += acc.z * timeInSeconds;
      }
      if (this._input._keys.backward) {
        velocity.z -= acc.z * timeInSeconds;
      }
      if (this._input._keys.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
        _R.multiply(_Q);
      }
      if (this._input._keys.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
        _R.multiply(_Q);
      }

      controlObject.quaternion.copy(_R);

      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();

      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);

      controlObject.position.add(forward);
      controlObject.position.add(sideways);

      oldPosition.copy(controlObject.position);

      fb.child("Players").child(this._params.playerID).child("orientation").update({
        position: {
          x:controlObject.position.x,
          y:controlObject.position.y, 
          z:controlObject.position.z
        },
        rotation: {
          w:controlObject.quaternion.w, 
          x:controlObject.quaternion.x, 
          y:controlObject.quaternion.y, 
          z:controlObject.quaternion.z
        }

      });

    }

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
  }
};

class BasicCharacterControllerInput {
  constructor(isMainPlayer) {
    this._Init(isMainPlayer);    
  }

  _Init(isMainPlayer) {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false,
    };

    //if(this._params.isMainPlayer){
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    //}
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }
};

class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;
    
    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
};

class CharacterFSM extends FiniteStateMachine {
  constructor(proxy, isMainPlayer) {
    super();
    this._proxy = proxy;
    this._isMainPlayer = isMainPlayer;
    this._Init();
  }

  _Init() {
    this._AddState('idle', IdleState);
    this._AddState('walk', WalkState);
    this._AddState('run', RunState);
  }
};

class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}
  Exit() {}
  Update() {}
};

class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['walk'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    console.log(this._parent._isMainPlayer);

    if(this._parent._isMainPlayer){

      if (input._keys.forward || input._keys.backward) {
        if (input._keys.shift) {
          this._parent.SetState('run');
        }
        return;
      }

    }

    this._parent.SetState('idle');
  }
};

class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'run';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['run'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {

    if(this._parent._isMainPlayer){

      if (input._keys.forward || input._keys.backward) {
        if (!input._keys.shift) {
          this._parent.SetState('walk');
        }
        return;
      }

    }
    
    this._parent.SetState('idle');
  }
};

class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(_, input) {

    if(this._parent._isMainPlayer){

      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('walk');
      }

    }

  }
};
