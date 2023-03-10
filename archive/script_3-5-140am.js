import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'

let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer, controlbox1, controlbox2, orbit;

// init();
// render();

const gui = new dat.GUI()
const objectsToUpdate = [];
const Object = {}

//newBox([0,0,0],200,200,200,concreteTexture)

//object 
Object.Box = () =>
{
    newBox(
        [(Math.random() - 0.5) * 3,
            0,
            (Math.random() - 0.5) * 3]
            ,200,200,200,
            concreteTexture)
}
gui.add(Object, 'Box')


// Reset
Object.reset = () =>
{
    for(const object of objectsToUpdate)
    {
        // Remove body
        object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)

        // Remove mesh
        scene.remove(object.mesh)
    }
    
    objectsToUpdate.splice(0, objectsToUpdate.length)
}
gui.add(Object, 'reset')


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')


/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

// Default material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.defaultContactMaterial = defaultContactMaterial

// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3')

const playHitSound = (collision) =>
{
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 1.5)
    {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}


// function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
    cameraOrtho = new THREE.OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
    currentCamera = cameraPersp;

    currentCamera.position.set(1000, 500, 1000);
    currentCamera.lookAt(0, 200, 0);

    //grid
    scene = new THREE.Scene();
    scene.add(new THREE.GridHelper(100000, 100, 0x888888, 0x444444));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    scene.add(light);

    const concreteTexture = new THREE.TextureLoader().load('concrete.jpg', render);
    concreteTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    //box class 
    const newBox = ([x,y,z],width, height, depth, material)=>{
        const boxgeometry = new THREE.BoxGeometry(width, height, depth);
        const boxmaterial = new THREE.MeshLambertMaterial({
            map: material,
            transparent: true
        });
        const box = new THREE.Mesh(boxgeometry, boxmaterial);
        //position
        box.position.x =x;
        box.position.y =y;
        box.position.z =z;

        // box.scale.set(width, height, depth)
        // box.castShadow = true
        box.position.copy(x,y,z)
        scene.add(box)
        

        // Cannon.js body
        const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

        const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(x, y, z),
        shape: shape,
        material: defaultMaterial
        })
        body.addEventListener('collide', playHitSound)
         world.addBody(body)

         // Save in objects
        objectsToUpdate.push({ box, body })
        return box;
    }

    //box1 
    const box1 = newBox([0,0,0],200,200,200,concreteTexture);

    // //box2
    const box2 = newBox([100,400,400],200,200,200,concreteTexture);

    orbit = new OrbitControls(currentCamera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);

    //controlbox1
    controlbox1 = new TransformControls(currentCamera, renderer.domElement);
    controlbox1.addEventListener('change', render);

    controlbox1.addEventListener('dragging-changed', function (event) {

        orbit.enabled = !event.value;

    });

    //controlbox2
    controlbox2 = new TransformControls(currentCamera, renderer.domElement);
    controlbox2.addEventListener('change', render);

    controlbox2.addEventListener('dragging-changed', function (event) {

        orbit.enabled = !event.value;

    });

    scene.add(box1);
    scene.add(box2);

    controlbox1.attach(box1);
    controlbox2.attach(box2);
    scene.add(controlbox1);
    scene.add(controlbox2);

    window.addEventListener('resize', onWindowResize);

    window.addEventListener('keydown', function (event) {

        switch (event.keyCode) {

            case 81: // Q
                controlbox1.setSpace(controlbox1.space === 'local' ? 'world' : 'local');
                break;

            case 16: // Shift
                controlbox1.setTranslationSnap(100);
                controlbox1.setRotationSnap(THREE.MathUtils.degToRad(15));
                controlbox1.setScaleSnap(0.25);
                break;

            case 87: // W
                controlbox1.setMode('translate');
                break;

            case 69: // E
                controlbox1.setMode('rotate');
                break;

            case 82: // R
                controlbox1.setMode('scale');
                break;

            case 67: // C
                const position = currentCamera.position.clone();

                currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                currentCamera.position.copy(position);

                orbit.object = currentCamera;
                controlbox1.camera = currentCamera;

                currentCamera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
                onWindowResize();
                break;

            case 86: // V
                const randomFoV = Math.random() + 0.1;
                const randomZoom = Math.random() + 0.1;

                cameraPersp.fov = randomFoV * 160;
                cameraOrtho.bottom = -randomFoV * 500;
                cameraOrtho.top = randomFoV * 500;

                cameraPersp.zoom = randomZoom * 5;
                cameraOrtho.zoom = randomZoom * 5;
                onWindowResize();
                break;

            case 187:
            case 107: // +, =, num+
                controlbox1.setSize(controlbox1.size + 0.1);
                break;

            case 189:
            case 109: // -, _, num-
                controlbox1.setSize(Math.max(controlbox1.size - 0.1, 0.1));
                break;

            case 88: // X
                controlbox1.showX = !controlbox1.showX;
                break;

            case 89: // Y
                controlbox1.showY = !controlbox1.showY;
                break;

            case 90: // Z
                controlbox1.showZ = !controlbox1.showZ;
                break;

            case 32: // Spacebar
                controlbox1.enabled = !controlbox1.enabled;
                break;

            case 27: // Esc
                controlbox1.reset();
                break;

        }

    });

    window.addEventListener('keyup', function (event) {

        switch (event.keyCode) {

            case 16: // Shift
                controlbox1.setTranslationSnap(null);
                controlbox1.setRotationSnap(null);
                controlbox1.setScaleSnap(null);
                break;

        }

    });

// }

function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp.aspect = aspect;
    cameraPersp.updateProjectionMatrix();

    cameraOrtho.left = cameraOrtho.bottom * aspect;
    cameraOrtho.right = cameraOrtho.top * aspect;
    cameraOrtho.updateProjectionMatrix();
    
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    render();

}



function render() {

    renderer.render(scene, currentCamera);

}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)
    
    for(const object of objectsToUpdate)
    {
        object.box.position.copy(object.body.position)
        object.box.quaternion.copy(object.body.quaternion)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()