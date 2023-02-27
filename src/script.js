import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Tween } from '@tweenjs/tween.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 15, -22);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false,
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 5);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xD9D2E9 });
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);

function rotateCube() {
    cubeMesh.rotateY(0.02);

    const fragments = [];
    for (let i = 0; i < 10; i++) {
        const fragment = cubeMesh.clone();
        fragment.material = cubeMaterial.clone(); // Need to clone material as well to avoid changing the original
        fragment.position.x += Math.random() * 10 - 5;
        fragment.position.y += Math.random() * 10 + 1;
        fragment.position.z += Math.random() * 10 - 5;
        fragments.push(fragment);
        scene.add(fragment);
    }

    for (const fragment of fragments) {
        new Tween(fragment.material)
            .to({ opacity: 0 }, 1000)
            .onComplete(() => scene.remove(fragment))
            .start();
    }
}

function animate() {
    requestAnimationFrame(animate);
    rotateCube();
    renderer.render(scene, camera);
}
animate();
