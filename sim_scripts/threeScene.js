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
cubeStatic.position.set(0, 0, 0);
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
loader.load('obj/test.obj', (obj) => 
{
  // Predpokladáme, že obj je Group - zober prvý Mesh
  let mesh;
  obj.traverse((child) => 
  {
    if (child.isMesh)
    {
      mesh = child;
    }
  });

  if (!mesh)
  {
    console.error('Načítaný OBJ nemá mesh');
    return;
  }

  // Pridaj mesh do scény
  scene.add(mesh);
  mesh.position.set(0, 0, 0);
  mesh.scale.set(0.1,0.1, 0.1); // alebo uprav podľa potreby
  mesh.rotation.x = degToRad(-90);

  // Vytvor PhysicsBody a označ ho ako statický (podložka, prekážka)
  const physBody = new PhysicsBody(mesh);
  physBody.isStatic = true;
  physicsWorld.addBody(physBody);
  // Teraz mesh reaguje v simulácii ako pevné teleso

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