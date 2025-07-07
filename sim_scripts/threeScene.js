// Importy z CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js';

// Import kamery a voľného pohybu s PointerLockControls
import { createCamera, setupPointerLockControls } from './camera.js';
// Import fyziky
import { PhysicsBody, PhysicsWorld } from './physics.js';
//Debug
import { showHitbox} from './debugtool.js';

const clock = new THREE.Clock();

// Vytvor scénu a nastav farbu pozadia
const scene = new THREE.Scene();
scene.background = new THREE.Color('#252526');

// Vytvor kameru
const camera = createCamera();

// Vytvor renderer a vlož ho do DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Nastav PointerLockControls a funkciu na aktualizáciu pohybu kamery
const updateCameraPosition = setupPointerLockControls(camera, renderer);

// Pridaj ambientné svetlo
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Pridaj smerové svetlo
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Pridaj mriežku na zem pre orientáciu
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

//Pridaj kocku !!!! testovne
const physicsWorld = new PhysicsWorld();

const cubeStatic = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
cubeStatic.position.set(0, 8, 18);
scene.add(cubeStatic);

const staticBody = new PhysicsBody(cubeStatic);
staticBody.isStatic = true;
physicsWorld.addBody(staticBody);

const cubeFalling = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cubeFalling.position.set(0, 20, 0);
scene.add(cubeFalling);

const fallingBody = new PhysicsBody(cubeFalling);
physicsWorld.addBody(fallingBody);

//hitbox
const hb2 = showHitbox(cubeStatic, scene, staticBody);
const hb3= showHitbox(cubeFalling, scene, fallingBody);

// Pomocná funkcia na prevod stupňov na radiány
function degToRad(degrees)
{
  return degrees * (Math.PI / 180);
}

// Načítaj OBJ model a vlož ho do scény
const loader = new OBJLoader();
loader.load('obj/conv1.obj', (obj) => {
  // Vypočítaj bbox celej Group
  const box = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Posuň VŠETKY deti
  obj.traverse((child) => {
    if (child.isMesh) {
      child.position.sub(center);
    }
  });

  // Teraz je Group pivot v strede, deti posunuté
  scene.add(obj);

  obj.position.set(0, 5, 0); // nová pozícia
  obj.scale.set(0.01, 0.01, 0.01);
  obj.rotation.z = degToRad(180);

  const physBody = new PhysicsBody(obj);
  physBody.isStatic = true;
  physicsWorld.addBody(physBody);

  const hb1 = showHitbox(obj, scene, physBody);
});

// Prispôsobenie rozmerov pri zmene veľkosti okna
window.addEventListener('resize', () =>
{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animácia - každý frame sa vykreslí scéna a aktualizuje pohyb kamery
function animate()
{
  requestAnimationFrame(animate);

  updateCameraPosition();

  const deltaTime = clock.getDelta(); // čas medzi snímkami v sekundách
  physicsWorld.update(deltaTime);

  renderer.render(scene, camera);
}

animate();