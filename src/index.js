import {
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
    PerspectiveCamera,
    Scene, SkeletonHelper,
    WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {CreateCannonPhysics} from "./physics/CannonPhysicsManager";


// ---------- SETUP ------------------

const canvas = document.querySelector('#glcanvas');
const renderer = new WebGLRenderer({canvas, antialias: true });
renderer.setClearColor('#f7f7f7');
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.clearColor();
renderer.sortObjects = false;

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1;
camera.position.y = 0.5;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);

const scene = new Scene();
window.scene = scene;

const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.7);
hemiLight.position.set(0, 5, -5);

const dirLight = new DirectionalLight(0xffffff, 0.3);
dirLight.position.set(0, 5, 5);

const ambLight = new AmbientLight(0x404040, 1);

scene.add(hemiLight, dirLight, ambLight);

const stats = Stats()
document.body.appendChild(stats.dom);


// ---------- VARIABLES/CONSTANTS ------------------

let physicsUpdateCallback;


// ---------- LOADING ------------------

const fbxLoader = new FBXLoader();

// Loading the rigged FBX model
fbxLoader.load('fbx/Isolated_rigged_cut.fbx', async function (group) {
    console.log(group);

    const _ = (_) => group.getObjectByName(_);

    scene.add(group);

    let theSkinnedMesh = _('s0090');

    scene.add(new SkeletonHelper(theSkinnedMesh.skeleton.bones[0]));

    // Setting up the physics manager to move the bones
    physicsUpdateCallback = CreateCannonPhysics({
        bones: theSkinnedMesh.skeleton.bones,
        gravity: [0, -0.3, 0]
    });

});


// ---------- RENDERING ------------------

function render() {

    if (physicsUpdateCallback)
        physicsUpdateCallback();

    renderer.render(scene, camera);
    stats.update();

    requestAnimationFrame(render);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

requestAnimationFrame(render);

window.addEventListener( 'resize', onWindowResize);