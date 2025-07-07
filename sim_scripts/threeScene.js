// Načítanie knižníc a modulov
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { createCamera, setupPointerLockControls } from './camera.js';
import { PhysicsWorld } from './physics.js';
import { createStaticCube, createFallingCube, loadOBJModel } from './objects.js';

// Hodiny pre animáciu
const clock = new THREE.Clock();

// Scéna
const scene = new THREE.Scene();
scene.background = new THREE.Color('#252526');

// Kamera
const camera = createCamera();

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Ovládanie kamery
const updateCameraPosition = setupPointerLockControls(camera, renderer);

// Svetlá
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Mriežka
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Fyzikálny svet
const physicsWorld = new PhysicsWorld();

// Počítadlo načítania
let objectsToLoad = 3; //počet objektov
let objectsLoaded = 0;

function objectLoaded() 
{
  objectsLoaded++;
  if (objectsLoaded === objectsToLoad) {
    animate();
  }
}

// Objekty zo samostatného modulu
createStaticCube(scene, physicsWorld);
createFallingCube(scene, physicsWorld);
loadOBJModel(scene, physicsWorld);

// Obsluha resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animácia
function animate() 
{
  requestAnimationFrame(animate);
  updateCameraPosition();
  const deltaTime = clock.getDelta();
  physicsWorld.update(deltaTime);
  renderer.render(scene, camera);
}

animate();