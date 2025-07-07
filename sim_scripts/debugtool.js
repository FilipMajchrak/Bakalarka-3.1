import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

export function showHitbox(object3D, scene)
{
  const box = new THREE.Box3().setFromObject(object3D);
  const helper = new THREE.Box3Helper(box, 0xffff00);
  scene.add(helper);

  // Interná funkcia na update hitboxu
  function update()
  {
    box.setFromObject(object3D);
  }

  // Automatický update cez requestAnimationFrame
  function animate()
  {
    update();
    requestAnimationFrame(animate);
  }

  animate(); // spusti automatickú aktualizáciu

  return helper;
}