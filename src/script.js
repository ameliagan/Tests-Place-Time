import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

//object
const gui = new dat.GUI()
const Object = {}
const objectsToUpdate = [];

Object.Box = () =>
{
    const box = Box(
        //box size
        1,
        1,
        1,
        {
            //random position
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    );
    Object.box = box; // add the mesh object to the object property
    box.userData = { type: 'box', body: boxBody }; // set the type of the object and its Cannon.js body to the userData property of the mesh object
    scene.add(box); // add the mesh object to the scene

    transformControls.attach(box);
    objectsToUpdate.push(transformControls); // add transform controls to objectsToUpdate array

}

gui.add(Object, 'Box')

Object.Sphere = () =>
{
    Sphere(
        //sphere size
        .15,
        {
            //random position
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    )
}

gui.add(Object, 'Sphere')


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

        //remove control widgets
        transformControls.detach()
    }

    objectsToUpdate.splice(0, objectsToUpdate.length)
}
gui.add(Object, 'reset')


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

//orbit 
const orbit = new OrbitControls(camera, renderer.domElement );
orbit.update();
orbit.addEventListener( 'change', renderer );

// Add a flag to keep track of the state of the mouse drag transformation
let enableMouseDrag = false;

// transform 
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.mode = 'translate'; // set the mode to 'translate'
scene.add(transformControls);

transformControls.addEventListener('dragging-changed', function (event) {
    orbit.enabled = !event.value; // disable orbit controls when dragging
    enableMouseDrag = event.value; // set enableMouseDrag to true when dragging starts, false otherwise
});

transformControls.addEventListener('objectChange', function (event) {
    if (enableMouseDrag && event.target.userData.type === 'box') { // check if the object is a box and dragging is enabled
        event.target.userData.body.position.copy(event.target.position); // set the position of the box's Cannon.js body to the position of the transformControls object
        event.target.userData.body.quaternion.copy(event.target.quaternion); // set the rotation of the box's Cannon.js body to the rotation of the transformControls object
    }
});


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

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
])

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

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}


// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody)


//resize window
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Utils
 */

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
});

const Sphere = (radius, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.scale.set(radius, radius, radius)
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })

    // Add transform control
    const control = new THREE.TransformControls(camera, renderer.domElement);
    control.attach(mesh);
    scene.add(control);

    return { mesh, body, control };
}

// Create box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})


//box
function Box(width, height, depth, position) {
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    const transformcontrol = new TransformControls(camera, renderer.domElement);
    transformcontrol.attach(mesh);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    transformcontrol.addEventListener('dragging-changed', function (event) {
        orbit.enabled = !event.value;
    });

    transformcontrol.attach(mesh);
    scene.add(transformcontrol);

    transformcontrol.addEventListener('change', function () {
        render();
    });

    window.addEventListener('resize', onWindowResize);

    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 81: // Q
                transformcontrol.setSpace(transformcontrol.space === 'local' ? 'world' : 'local');
                break;

            case 16: // Shift
                transformcontrol.setTranslationSnap(100);
                transformcontrol.setRotationSnap(THREE.MathUtils.degToRad(15));
                transformcontrol.setScaleSnap(0.25);
                break;

            case 87: // W
                transformcontrol.setMode('translate');
                break;

            case 69: // E
                transformcontrol.setMode('rotate');
                break;

            case 82: // R
                transformcontrol.setMode('scale');
                break;

            case 67: // C
                const position = currentCamera.position.clone();

                currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                currentCamera.position.copy(position);

                orbit.object = currentCamera;
                transformcontrol.camera = currentCamera;

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
                transformcontrol.setSize(transformcontrol.size + 0.1);
                break;

            case 189:
            case 109: // -, _, num-
                transformcontrol.setSize(Math.max(transformcontrol.size - 0.1, 0.1));
                break;

            case 88: // X
                transformcontrol.showX = !transformcontrol.showX;
                break;

            case 89: // Y
                transformcontrol.showY = !transformcontrol.showY;
                break;

            case 90: // Z
                transformcontrol.showZ = !transformcontrol.showZ;
                break;

            case 32: // Spacebar
                transformcontrol.enabled = !transformcontrol.enabled;
                break;

            case 27: // Esc
                transformcontrol.reset();
                break;
        }
    });

    window.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 16: // Shift
                transformcontrol.setTranslationSnap(null);
                transformcontrol.setRotationSnap(null);
                transformcontrol.setScaleSnap(null);
                break;
        }
    });

    function onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;

        cameraPersp.aspect = aspect;
        cameraPersp.updateProjectionMatrix();

        cameraOrtho.left = cameraOrtho.bottom * aspect;
        cameraOrtho.right = cameraOrtho.top * aspect;
        cameraOrtho.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();

    }
    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        shape: shape,
        material: defaultMaterial
    })
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh: mesh, body: body })

    // Add mouse event listeners
    let isDragging = false
    let lastMousePosition = new THREE.Vector2()

    canvas.addEventListener('mousedown', (event) => {
        event.preventDefault()
        if (enableMouseDrag) { // check if mouse drag is enabled
            isDragging = true
            lastMousePosition.set(event.clientX, event.clientY)
            
        }
    })

    canvas.addEventListener('mousemove', (event) => {
        event.preventDefault()
        if (isDragging && enableMouseDrag) { // check if mouse drag is enabled
            const deltaX = event.clientX - lastMousePosition.x
            const deltaY = event.clientY - lastMousePosition.y
    
            // Move the box based on mouse x and y position
            mesh.position.x += deltaX * 0.01
            mesh.position.y -= deltaY * 0.01

            // Update the Cannon.js body position
            body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    
            lastMousePosition.set(event.clientX, event.clientY)
            
        }
    })
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false
    })

    return mesh;
    
}


Box(1, 1, 1, { x: 0, y: 3, z: 0 })

/**
 * Floor
 */

//infinite plane

const gridHelper = new THREE.GridHelper(200,50);
scene.add(gridHelper);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


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
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()