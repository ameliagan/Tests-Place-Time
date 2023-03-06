import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import { Sky } from 'three/addons/objects/Sky.js';

let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer, orbit;

let sky, sun;

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
        [Math.random() * 1000,
            100,
            Math.random() * 1000,]
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
        scene.remove(object.box)
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

const eggshellMaterial = new CANNON.Material('eggshell')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)


world.defaultContactMaterial = defaultContactMaterial

const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    'concrete.jpg',
])



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
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);

    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
    cameraOrtho = new THREE.OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
    currentCamera = cameraPersp;

    currentCamera.position.set(1000, 500, 1000);
    currentCamera.lookAt(0, 200, 0);

    //grid
    scene = new THREE.Scene();
    scene.add(new THREE.GridHelper(100000, 100, 0x424242, 0x424242));

    initSky();
    // const ambientLight = new THREE.AmbientLight( 0xffffff );
    // scene.add( ambientLight );

    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // // light.intensity = 1; // Increase intensity
    // light.position.set(1, 1, 1);
    // scene.add(light);

    /**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)


const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(200, 200)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(100,100, 100)
scene.add(directionalLight)

    //load different material texture

    //eggshell
    const eggshellTexture = new THREE.TextureLoader().load('eggshell.jpg', render);
    eggshellTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    //concrete
    const concreteTexture = new THREE.TextureLoader().load('concrete.jpg', render);
    concreteTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    orbit = new OrbitControls(currentCamera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);

    // Create transform controls
    const transformControls = new TransformControls(currentCamera, renderer.domElement);
    
    transformControls.addEventListener('change', render);

    transformControls.addEventListener('dragging-changed', function (event) {

        orbit.enabled = !event.value;

    });
    scene.add(transformControls);

    window.addEventListener('resize', onWindowResize);

    window.addEventListener('keydown', function (event) {

        switch (event.keyCode) {

            case 81: // Q
                transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
                break;

            case 16: // Shift
                transformControls.setTranslationSnap(100);
                transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
                transformControls.setScaleSnap(0.25);
                break;

            case 87: // W
                transformControls.setMode('translate');
                break;

            case 69: // E
                transformControls.setMode('rotate');
                break;

            case 82: // R
                transformControls.setMode('scale');
                break;

            case 67: // C
                const position = currentCamera.position.clone();

                currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                currentCamera.position.copy(position);

                orbit.object = currentCamera;
                transformControls.camera = currentCamera;

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
                transformControls.setSize(transformControls.size + 0.1);
                break;

            case 189:
            case 109: // -, _, num-
                transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
                break;

            case 88: // X
                transformControls.showX = !transformControls.showX;
                break;

            case 89: // Y
                transformControls.showY = !transformControls.showY;
                break;

            case 90: // Z
                transformControls.showZ = !transformControls.showZ;
                break;

            case 32: // Spacebar
                transformControls.enabled = !transformControls.enabled;
                break;

            case 27: // Esc
                transformControls.reset();
                break;

        }



    });

    window.addEventListener('keyup', function (event) {

        switch (event.keyCode) {

            case 16: // Shift
                transformControls.setTranslationSnap(null);
                transformControls.setRotationSnap(null);
                transformControls.setScaleSnap(null);
                break;

        }
        // Enable OrbitControls when no longer dragging
    orbit.enabled = !transformControls.dragging;

    });

    

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
        box.position.copy(x,y,z);
        scene.add(box);

        

        // Attach transform controls to box mesh
        transformControls.attach(box);
        scene.add(transformControls);
        transformControls.updateMatrixWorld();

        // Cannon.js body
        const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

        const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(x, y, z),
        shape: shape,
        material: defaultContactMaterial
        });
        body.addEventListener('collide', playHitSound);
         world.addBody(body);

         

         // Save in objects
        objectsToUpdate.push({ box, body });
        return box;
    }

        //eggshell box class 
        const eggshellBox = ([x,y,z],width, height, depth, material)=>{
            const boxgeometry = new THREE.BoxGeometry(width, height, depth);
            const boxmaterial = new THREE.MeshLambertMaterial({
                map: material,
                transparent: true
            });
            const eggshellbox = new THREE.Mesh(boxgeometry, boxmaterial);
            //position
            box.position.x =x;
            box.position.y =y;
            box.position.z =z;
    
            // box.scale.set(width, height, depth)
            // box.castShadow = true
            eggshellbox.position.copy(x,y,z);
            scene.add(box);
    
            
    
            // Attach transform controls to box mesh
            transformControls.attach(box);
            scene.add(transformControls);
            transformControls.updateMatrixWorld();
    
            // Cannon.js body
            const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
    
            const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(x, y, z),
            shape: shape,
            material: defaultMaterial
            });
            body.addEventListener('collide', playHitSound);
             world.addBody(body);
    
             
    
             // Save in objects
            objectsToUpdate.push({ box, body });
            return box;
        }
    
    //box1 
    const box1 = newBox([200,100,100],200,200,200,eggshellTexture);


    // box2
    const box2 = newBox([200,100,600],200,200,200,concreteTexture);

    // box3
    const box3 = newBox([400,100,200],200,200,200,concreteTexture);

    // box4
    const box4 = newBox([400,100,800],200,200,200,concreteTexture);

    // box5
    const box5 = newBox([1000,100,1000],200,200,200,concreteTexture);


    // orbit = new OrbitControls(currentCamera, renderer.domElement);
    // orbit.update();
    // orbit.addEventListener('change', render);

    // //controlbox1
    // controlbox1 = new TransformControls(currentCamera, renderer.domElement);
    // controlbox1.addEventListener('change', render);

    // controlbox1.addEventListener('dragging-changed', function (event) {

    //     orbit.enabled = !event.value;

    // });

    // //controlbox2
    // controlbox2 = new TransformControls(currentCamera, renderer.domElement);
    // controlbox2.addEventListener('change', render);

    // controlbox2.addEventListener('dragging-changed', function (event) {

    //     orbit.enabled = !event.value;

    // });

    scene.add(box1);
    scene.add(box2);



// }

//fog brown ish
// scene.fog = new THREE.Fog(0XFF00FF,5000,1000)
// scene.fog = new THREE.FogExp2( 0xefd1b5, 0.00025 );

//green fog - mold? 
const fogColor = new THREE.Color(0x00af00);
scene.background = fogColor;
scene.fog = new THREE.FogExp2(fogColor, 0.0005);


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

//sky
function initSky() {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    sun = new THREE.Vector3();

    /// GUI

    const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( sun );

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render( scene, currentCamera );

    }



    gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );

    guiChanged();

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
    world.step(1/3600, deltaTime, 3)
    
    for(const object of objectsToUpdate)
    {
        object.box.position.copy(object.body.position)
        object.box.quaternion.copy(object.body.quaternion)
        
    }

    // Update controls

    //orbit update allows new boxes to be dispersed 
    // orbit.update();

    //use when you want to move the block, this is a massive glitch
    //orbit and transform control is competing for the camera
    transformControls.update();

    // Render
    renderer.render(scene, currentCamera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick()