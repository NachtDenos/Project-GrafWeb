import * as THREE from 'three';

const audioListener = new THREE.AudioListener();
camera.add(audioListener);
const audioLoader = new THREE.AudioLoader();
const lobby = new THREE.Audio(audioListener);
audioLoader.load("../GameMusic/BestFriend.mp3", function(buffer){
    lobby.setBuffer(buffer);
    lobby.setLoop(true);
    lobby.setVolume(100);
    lobby.play();
});