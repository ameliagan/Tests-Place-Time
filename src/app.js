import * as THREE from 'three'

/* Using three.js, and using OrbitControls, make a scene that rotates with planemesh and a grid. Make a cube in the scene that disintegrates into small fragments upon rotation. */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new THREE.OrbitControls(camera, renderer.domElement);
var geometry = new THREE.PlaneGeometry(10, 10, 10);
var material = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide
});
var plane = new THREE.Mesh(geometry, material);
scene.add(plane);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube2 = new THREE.Mesh(geometry, material);
scene.add(cube2);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube3 = new THREE.Mesh(geometry, material);
scene.add(cube3);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube4 = new THREE.Mesh(geometry, material);
scene.add(cube4);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube5 = new THREE.Mesh(geometry, material);
scene.add(cube5);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube6 = new THREE.Mesh(geometry, material);
scene.add(cube6);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube7 = new THREE.Mesh(geometry, material);
scene.add(cube7);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube8 = new THREE.Mesh(geometry, material);
scene.add(cube8);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube9 = new THREE.Mesh(geometry, material);
scene.add(cube9);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube10 = new THREE.Mesh(geometry, material);
scene.add(cube10);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube11 = new THREE.Mesh(geometry, material);
scene.add(cube11);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube12 = new THREE.Mesh(geometry, material);
scene.add(cube12);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
var cube13 = new THREE.Mesh(geometry, material);
scene.add(cube13);
var geometry = new THREE.Box

// Define the animate function to update the scene
function animate() {
    requestAnimationFrame(animate);
    
    renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
    
    // Call the animate function to start the animation loop
    animate();
