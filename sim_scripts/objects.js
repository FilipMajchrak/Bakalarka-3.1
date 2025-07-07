// objects.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js';
import { PhysicsBody } from './physics.js';
import { showHitbox } from './debugtool.js';

// Pomocná funkcia na prevod stupňov na radiány
function degToRad(degrees) 
{
  return degrees * (Math.PI / 180);
}

// Vytvor statickú kocku (platformu)
export function createStaticCube(scene, physicsWorld) 
{
  const cubeStatic = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 10),
    new THREE.MeshStandardMaterial({ color: 0x555555 })
  );
  cubeStatic.position.set(0, 8, 18);
  scene.add(cubeStatic);

  const staticBody = new PhysicsBody(cubeStatic);
  staticBody.isStatic = true;
  physicsWorld.addBody(staticBody);

  showHitbox(cubeStatic, scene, staticBody);

  return cubeStatic;
}

// Vytvor kocku, ktorá padá
export function createFallingCube(scene, physicsWorld) 
{
  const cubeFalling = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  cubeFalling.position.set(0, 20, 0);
  scene.add(cubeFalling);

  const fallingBody = new PhysicsBody(cubeFalling);
  physicsWorld.addBody(fallingBody);

  showHitbox(cubeFalling, scene, fallingBody);

  return cubeFalling;
}

// Načítaj OBJ model a vlož ho do scény
export function loadOBJModel(scene, physicsWorld) 
{
  const loader = new OBJLoader();
  loader.load('obj/conv1.obj', (obj) => 
  {
    const box = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    box.getCenter(center);

    obj.traverse((child) => 
    {
      if (child.isMesh) 
      {
        child.position.sub(center);
      }
    });

    scene.add(obj);

    obj.position.set(0, 5, 0);
    obj.scale.set(0.01, 0.01, 0.01);
    obj.rotation.z = degToRad(180);

    const physBody = new PhysicsBody(obj);
    physBody.isStatic = true;
    physicsWorld.addBody(physBody);

    showHitbox(obj, scene, physBody);
  });
}
