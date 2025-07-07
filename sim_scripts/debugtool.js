import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const allHitboxes = [];
const defaultToggle = false;

export function showHitbox(object3D, scene, physicsBody)
{
  const box = new THREE.Box3();
  const yellowHelper = new THREE.Box3Helper(box, 0xffff00);
  yellowHelper.visible = defaultToggle;
  scene.add(yellowHelper);

  let greenHelper = null;
  let greenBox = null;

  if (physicsBody && physicsBody.mesh)
  {
    greenBox = new THREE.Box3();
    greenHelper = new THREE.Box3Helper(greenBox, 0x00ff00);
    greenHelper.visible = defaultToggle; //default stav
    scene.add(greenHelper);
  }

  function update()
  {
    object3D.updateMatrixWorld(true);
    box.setFromObject(object3D);

    if (greenHelper && physicsBody.mesh)
    {
      physicsBody.mesh.updateMatrixWorld(true);
      greenBox.setFromObject(physicsBody.mesh);
    }
  }

  update();

  function animate()
  {
    update();
    requestAnimationFrame(animate);
  }

  animate();

  const helpers = {
    yellowHelper,
    greenHelper,
    setVisible(visible)
    {
      yellowHelper.visible = visible;
      if (greenHelper)
        greenHelper.visible = visible;
    },
    dispose()
    {
      scene.remove(yellowHelper);
      yellowHelper.geometry.dispose();
      yellowHelper.material.dispose();

      if (greenHelper)
      {
        scene.remove(greenHelper);
        greenHelper.geometry.dispose();
        greenHelper.material.dispose();
      }

      // Odstráni sa z globálneho zoznamu
      const index = allHitboxes.indexOf(helpers);
      if (index !== -1)
        allHitboxes.splice(index, 1);
    }
  };

  allHitboxes.push(helpers);

  return helpers;
}

// Funkcia na prepínanie viditeľnosti hitboxov
window.toggleHitbox = function(state, index = null)
{
  if (allHitboxes.length === 0)
  {
    console.warn('Hitboxy ešte nie sú inicializované.');
    return;
  }

  if (index === null)
  {
    // Hromadné prepnutie všetkých
    if (typeof state !== 'boolean')
    {
      // Prepni na opačný stav všetkých
      const newState = !allHitboxes[0].yellowHelper.visible;
      allHitboxes.forEach(h => h.setVisible(newState));
      console.log(`Všetky hitboxy prepnuté na ${newState ? 'zapnuté' : 'vypnuté'}`);
    }
    else
    {
      // Nastav všetky na zadaný stav
      allHitboxes.forEach(h => h.setVisible(state));
      console.log(`Všetky hitboxy nastavené na ${state ? 'zapnuté' : 'vypnuté'}`);
    }
  }
  else
  {
    // Prepni konkrétny podľa indexu
    if (index < 0 || index >= allHitboxes.length)
    {
      console.warn('Neplatný index hitboxu:', index);
      return;
    }

    if (typeof state !== 'boolean')
    {
      // Prepni na opačný stav
      const current = allHitboxes[index].yellowHelper.visible;
      allHitboxes[index].setVisible(!current);
      console.log(`Hitbox ${index} prepnutý na ${!current ? 'vypnutý' : 'zapnutý'}`);
    }
    else
    {
      allHitboxes[index].setVisible(state);
      console.log(`Hitbox ${index} nastavený na ${state ? 'zapnutý' : 'vypnutý'}`);
    }
  }
};

/*
    toggleHitbox();      // prepne stav
    toggleHitbox(true);  // zapne
    toggleHitbox(false); // vypne
*/