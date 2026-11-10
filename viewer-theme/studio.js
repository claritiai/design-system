/**
 * The look every Clariti 3D view shares: a white card model. One matte card for the construction, fat ink outlines on
 * its edges, matte steel and ink hardware, soft room light with a key light that casts a faint shadow on the ground,
 * and a long lens, so a model reads almost like a drawing. The design system's docs/3d.md describes it; every colour
 * is a role read through theme.js (--model-card and --model-shade change with the theme, --c-ink is the ink), so a
 * palette change reaches every view and a theme message recolours a view in place (refreshViewerMaterials).
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { bindViewerMaterial, viewerColor } from './theme.js';

/** The long lens (vertical field of view, degrees). */
export const MODEL_FOV = 12;

/** How far from its centre a camera with this field of view stands to fit a sphere of `radius` in the picture. */
export function fitDistance(radius, aspect = 1, fov = MODEL_FOV) {
  return radius / (Math.tan(fov * Math.PI / 360) * Math.min(aspect, 1));
}

/** Tone and shadows on a renderer: neutral tone mapping, soft shadows, a clear canvas over the page's ground. */
export function modelRenderer(renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  return renderer;
}

/** The room in the reflections, and the key light (casting the shadow, see aimSun) over a hemisphere light. */
export function modelLights(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.9;
  const sun = new THREE.DirectionalLight(viewerColor('light-sky'), 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 2;
  sun.shadow.radius = 8;
  const sky = new THREE.HemisphereLight(viewerColor('light-sky'), viewerColor('light-ground'), 0.9);
  scene.add(sun, sun.target, sky);
  return sun;
}

/** A renderer, a scene and its key light, the canvas added to `container`. */
export function createStudio(container, { label, ...options }) {
  const renderer = modelRenderer(new THREE.WebGLRenderer({ antialias: true, alpha: true, ...options }));
  renderer.domElement.setAttribute('aria-label', label);
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const sun = modelLights(renderer, scene);
  return { renderer, scene, sun };
}

/** Puts the key light above and in front of a model `size` (mm) across standing at `centre`, its shadow round it. */
export function aimSun(sun, size, centre = new THREE.Vector3()) {
  const ext = size * 0.75;
  Object.assign(sun.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: size / 600, far: ext * 8 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.position.copy(centre).add(new THREE.Vector3(0.35, 1.1, 0.8).multiplyScalar(size));
  sun.target.position.copy(centre);
  sun.target.updateMatrixWorld();
}

/** The ground the model stands on, at height `y`: it shows only the model's shadow. */
export function shadowGround(material, size, y = 0) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size * 8, size * 8), material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = y;
  ground.receiveShadow = true;
  return ground;
}

/**
 * The model's materials. `card` and `shade` are the construction (the card a shade down for a cut face or a mould);
 * `block`, `blockCut` and `ghost` are concrete a product is cast into (0.8 opaque, and the concrete in front of a
 * cut), with `xray` drawing the part of the product it hides and `hatch` laid over a cut face; `edges` are the ink
 * outlines and `ghostEdges` the quiet ones of a ghost (keep both at the canvas size), `dimension` and `dashed` the
 * ink lines.
 */
export function modelMaterials() {
  const role = (material, color) => bindViewerMaterial(material, { color });
  const matte = (color, extra = {}) => role(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...extra }), color);
  return {
    card: matte('model-card'),
    shade: matte('model-shade'),
    steel: matte('material-steel'),
    ink: matte('c-ink'),
    block: matte('model-card', { transparent: true, opacity: 0.8 }),
    blockCut: matte('model-shade', { transparent: true, opacity: 0.8 }),
    ghost: matte('model-card', { transparent: true, opacity: 0.12, depthWrite: false }),
    xray: role(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false, depthFunc: THREE.GreaterDepth }), 'c-ink'),
    hatch: role(new THREE.MeshBasicMaterial({ alphaMap: hatchLines(), transparent: true, opacity: 0.35, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 'c-ink'),
    edges: role(new LineMaterial({ linewidth: 1.6, transparent: true, opacity: 0.85, resolution: new THREE.Vector2(innerWidth, innerHeight) }), 'c-ink'),
    ghostEdges: role(new LineMaterial({ linewidth: 1, transparent: true, opacity: 0.3, resolution: new THREE.Vector2(innerWidth, innerHeight) }), 'c-ink'),
    dimension: role(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 }), 'c-ink'),
    dashed: role(new THREE.LineDashedMaterial({ transparent: true, opacity: 0.6 }), 'c-ink'),
    ring: role(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }), 'c-ink'),
    shadow: new THREE.ShadowMaterial({ opacity: 0.16 }),
  };
}

/** One diagonal line per tile, as an alpha map: the hatch takes its colour from its material, so it follows the theme. */
function hatchLines() {
  const size = 64, canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  g.fillStyle = 'black'; g.fillRect(0, 0, size, size);
  g.strokeStyle = 'white'; g.lineWidth = 5;
  for (const shift of [-size, 0, size]) { g.beginPath(); g.moveTo(shift, size); g.lineTo(shift + size, 0); g.stroke(); }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

/** Millimetres one hatch tile covers. */
const MM_PER_HATCH = 14;

/** Box UVs in hatch tiles, so the hatch keeps one spacing on every face of every size. */
export function hatchUv(geometry) {
  const { uv, normal, position } = geometry.attributes;
  for (let i = 0; i < uv.count; i++) {
    const ax = Math.abs(normal.getX(i)), ay = Math.abs(normal.getY(i));
    const [u, v] = ax > 0.5 ? [position.getY(i), position.getZ(i)] : ay > 0.5 ? [position.getX(i), position.getZ(i)] : [position.getX(i), position.getY(i)];
    uv.setXY(i, u / MM_PER_HATCH, v / MM_PER_HATCH);
  }
  return geometry;
}

/** Ink outlines on the edges of a solid (faces meeting at more than `angle` degrees), to add beside or inside it. */
export function inkEdges(geometry, material, angle = 1) {
  const lines = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry, angle)), material);
  lines.userData.outline = true;
  // Picking goes to the solid, never to its outline.
  lines.raycast = () => {};
  return lines;
}

/** A mesh with its ink outlines inside it. */
export function outlined(geometry, material, edges, angle) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.add(inkEdges(geometry, edges, angle));
  return mesh;
}
