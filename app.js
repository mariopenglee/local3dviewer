import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "./jsm/loaders/OBJLoader.js";
import { PLYLoader } from "./jsm/loaders/PLYLoader.js";
import { MTLLoader } from "./jsm/loaders/MTLLoader.js";
import { TUNABLES } from "./tunables.js";

// === Tunable Parameters ===

let scene, camera, renderer, light;
let models = [];
let basePan = 0;
let baseTilt = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111118);

  camera = new THREE.PerspectiveCamera(
    TUNABLES.camera.fov,
    TUNABLES.camera.aspect,
    TUNABLES.camera.near,
    TUNABLES.camera.far
  );
  camera.position.set(
    TUNABLES.camera.position.x,
    TUNABLES.camera.position.y,
    TUNABLES.camera.position.z
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Removed floor

  // 3-point lighting
  const keyLight = new THREE.DirectionalLight(TUNABLES.lights.key.color, TUNABLES.lights.key.intensity);
  keyLight.position.set(...TUNABLES.lights.key.pos);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(TUNABLES.lights.fill.color, TUNABLES.lights.fill.intensity);
  fillLight.position.set(...TUNABLES.lights.fill.pos);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(TUNABLES.lights.back.color, TUNABLES.lights.back.intensity);
  backLight.position.set(...TUNABLES.lights.back.pos);
  scene.add(backLight);

  scene.add(new THREE.AmbientLight(TUNABLES.lights.ambient.color, TUNABLES.lights.ambient.intensity));

  loadModels();
  setInterval(() => {
    console.log('Refreshing models...');
    clearModels();
    loadModels();
  }, TUNABLES.refreshInterval);
}

function loadModels() {
  console.log('Loading models...');
  const availableModels = TUNABLES.modelList;
  const modelFolder = TUNABLES.modelFolder;
  
  // Instead of checking file existence, just try to load all models
  // The loaders will handle missing files gracefully
  const modelsToLoad = availableModels;

  for (let i = 0; i < modelsToLoad.length; i++) {
    // Place models randomly near the center, all on the ground (y = 0)
    const x = (Math.random() - 0.5) * TUNABLES.modelScatter.range;
    const z = (Math.random() - 0.5) * TUNABLES.modelScatter.range;
    const y = TUNABLES.modelScatter.y;
    const m = modelsToLoad[i];
    for (let ext of m.exts) {
      const modelPath = `${modelFolder}${m.name}/${m.name}.${ext}`;
      if (ext === "obj") {
        // Load MTL and OBJ for each model in its folder
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath(`${modelFolder}${m.name}/`);
        mtlLoader.load(`${m.name}.mtl`, (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.setPath(`${modelFolder}${m.name}/`);
          objLoader.load(`${m.name}.obj`, (object) => {
            object.position.set(x, y, z);
            object.traverse(child => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            scene.add(object);
            models.push(object);
          });
        });
        break;
      } else {
        const loader = getLoaderForExtension(ext);
        if (!loader) continue;
        let loaded = false;
        loader.load(
          modelPath,
          (object) => {
            let model;
            if (ext === "ply") {
              const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
              model = new THREE.Mesh(object, material);
              model.castShadow = true;
              model.receiveShadow = true;
            } else {
              model = object.scene || object;
              if (model) {
                model.traverse?.(child => {
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
              }
            }
            model.position.set(x, y, z);
            scene.add(model);
            models.push(model);
            loaded = true;
          },
          undefined,
          (error) => {
            // Ignore all errors, just continue
          }
        );
        if (loaded) break;
      }
    }
  }
}

function getLoaderForExtension(ext) {
  switch (ext) {
    case "glb":
      return new GLTFLoader();
    case "obj":
      return new OBJLoader();
    case "ply":
      return new PLYLoader();
    default:
      return null;
  }
}

function clearModels() {
  console.log(`Clearing ${models.length} models...`);
  models.forEach((model) => scene.remove(model));
  models = [];
}

function animate() {
  requestAnimationFrame(animate);

  // stochastic pan
  if (Math.random() < TUNABLES.camera.pan.stepChance) {
    basePan += (Math.random() - 0.5) * TUNABLES.camera.pan.stepMagnitude;
    basePan = Math.max(TUNABLES.camera.pan.min, Math.min(TUNABLES.camera.pan.max, basePan));
  }
  // stochastic tilt (up/down)
  if (Math.random() < TUNABLES.camera.pan.stepChance) {
    baseTilt += (Math.random() - 0.5) * (TUNABLES.camera.pan.stepMagnitude * 0.5);
    baseTilt = Math.max(-0.5, Math.min(0.5, baseTilt));
  }

  camera.position.x = basePan;
  camera.position.y = TUNABLES.camera.position.y + baseTilt;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}