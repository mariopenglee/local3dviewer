// Tunable parameters for the 3D viewer scene
export const TUNABLES = {
  modelFolder: "models/",
  modelList: [
    { name: "model1", exts: ["obj"] },
    { name: "model2", exts: ["obj"] },
    { name: "model3", exts: ["obj"] },
  ],
  refreshInterval: 30 * 1000, // ms
  camera: {
    fov: 100,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 1, z: 5 },
    pan: {
      min: -1,
      max: 1,
      stepMagnitude: 1,
      stepChance: 0.01,
    },
  },
  floor: {
    size: 20,
    color: 0x222228,
    roughness: 0.8,
  },
  lights: {
    key:   { color: 0xffffff, intensity: 1.2, pos: [-4, 6, 4] },
    fill:  { color: 0xffffff, intensity: 0.8, pos: [4, 3, 4] },
    back:  { color: 0xffffff, intensity: 0.6, pos: [0, 5, -6] },
    ambient: { color: 0xffffff, intensity: 0.15 },
  },
  modelScatter: {
    range: 5, // how far from center
    y: 0,      // ground level
  },
};
