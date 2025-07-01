// Importy z CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js';

// Import kamery a voľného pohybu s PointerLockControls
import { createCamera, setupPointerLockControls } from './camera.js';

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

// Načítaj OBJ model a vlož ho do scény
const loader = new OBJLoader();
loader.load(
  'obj/test.obj',
  function (obj)
  {
    obj.position.set(0, 0, 0);
    obj.scale.set(0.1, 0.1, 0.1);
    obj.rotation.x = degToRad(-90);

    scene.add(obj);
    console.log('OBJ loaded:', obj);
  },
  function (xhr)
  {
    console.log((xhr.loaded / xhr.total * 100) + '% načítané');
  },
  function (error)
  {
    console.error('Chyba načítania:', error);
  }
);

// Pomocná funkcia na prevod stupňov na radiány
function degToRad(degrees)
{
  return degrees * (Math.PI / 180);
}

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

  renderer.render(scene, camera);
}

animate();