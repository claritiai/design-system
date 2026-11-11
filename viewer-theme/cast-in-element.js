import { initialViewerTheme, isViewerThemeMessage, refreshViewerMaterials, viewerColor, bindViewerMaterial } from '/viewer-theme/theme.js';
import { MODEL_FOV, aimSun, modelLights, modelMaterials, modelRenderer, outlined, shadowGround } from '/viewer-theme/studio.js';
import { loadMesh } from './cast-in-element-meshes.js';
import {
  clearGroup, declutter as declutterTags, dimLine as dimPart, fitPose as fitPart, labelMaker, layoutForLens, lensRoom as lensRoomOf,
  renderLens as lensPart, spread as spreadPart,
} from '/viewer-theme/scene-parts.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

/*
 * A precast element with products cast into one face, in 3D, drawn as the white card model every view shares
 * (/viewer-theme/studio.js). Shared by every family whose products sit in a stated element. The host (the design system's Element3d) sends the scene; this page
 * only draws it and reports what the engineer does: a product picked, the group of products dragged on the face, an
 * edge of the element dragged. Words come from the host: the page draws names, values and the default mark only.
 *
 * Face frame (mm), the host's: x to the right, y up, the face the products are cast into at z = 0, the element behind
 * it (z from −thickness to 0). A product's mesh is in its own frame (axis −z, mouth at z = 0), so it is placed at
 * its face position as it is, turned about the face normal by `rotation_deg`. The whole face frame is one group: the
 * element lies flat with the face on top and the products pointing down into it (`orientation` 'flat', as an element
 * is cast), or stands with the face towards the viewer ('upright'). Drags are measured
 * along the face's own directions on screen, so a 5 mm step is the same at any angle.
 */

const PRESETS = {
  flat: { '3/4': [0.75, 0.95, 1], Plan: [0, 1, 0.004], Low: [0.55, 0.28, 1] },
  upright: { '3/4': [0.75, 0.42, 1], Front: [0, 0.03, 1], Side: [1, 0.12, 0.03] },
};
const orientation = () => (S?.orientation === 'upright' ? 'upright' : 'flat');
const ZONE_ROLE = { red: 'c-error-icon', amber: 'c-notcov-line', green: 'c-verified-icon' };
const SIDES = ['x_minus', 'x_plus', 'y_minus', 'y_plus'];
const color = role => new THREE.Color(viewerColor(role));
const fmt = mm => Math.round(mm).toLocaleString('en-GB').replace(/,/g, ' ');
const snap = x => Math.round(x / 5) * 5;
const post = message => parent.postMessage(message, location.origin);
/** The host's words as text: a label's markup is the page's own, never the scene's. */
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

document.documentElement.dataset.theme = initialViewerTheme();
document.documentElement.classList.toggle('dark', document.documentElement.dataset.theme === 'dark');

const renderer = modelRenderer(new THREE.WebGLRenderer({ antialias: true, alpha: true }));
renderer.domElement.className = 'gl';
renderer.domElement.setAttribute('aria-label', 'Interactive 3D view of the element and the products cast into it');
document.body.prepend(renderer.domElement);
const labels = new CSS2DRenderer();
labels.domElement.className = 'labels';
document.body.append(labels.domElement);
const lensFrame = document.querySelector('.lens');
const views = document.querySelector('.views');

const scene = new THREE.Scene();
const sun = modelLights(renderer, scene);
const camera = new THREE.PerspectiveCamera(MODEL_FOV, 1, 10, 200000);
const lensCam = new THREE.PerspectiveCamera(30, 1, 1, 50000);
const controls = new OrbitControls(camera, renderer.domElement);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.09, enablePan: false, rotateSpeed: 0.55, zoomSpeed: 0.7 });

// The face frame (element, products, labels) in one group, turned for the orientation; the ground stays in the world.
const frame = new THREE.Group(), stat = new THREE.Group(), dyn = new THREE.Group(), floor = new THREE.Group();
frame.add(stat, dyn);
scene.add(frame, floor);
/** What the host sent last (with a drag's preview applied), and the scene as sent. */
let S = null, sent = null, blocker = null, shownOrientation = null;
let mats = null, tween = null, pickables = [], drag = null, staticKey = null, fittedKey = null, request = 0;
/** A scene the host sent while a drag was under way: applied when the drag ends. */
let pending = null;
const meshes = new Map();
/** Models being fetched, by catalogue and id, so two scenes do not fetch one twice. */
const loading = new Map();

function materials() {
  const m = modelMaterials();
  const tone = (role, extra = {}) => bindViewerMaterial(new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...extra }), { color: role });
  return {
    concrete: m.block, steel: m.steel, xray: m.xray, ink: m.ink, edges: m.edges, dim: m.dimension, ring: m.ring, shadow: m.shadow,
    // The fixture plate is the engineer's part, not the product: a light card, half see-through, so the product shows.
    plate: bindViewerMaterial(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, transparent: true, opacity: 0.45, depthWrite: false }), { color: 'model-card' }),
    assumed: tone('c-warn'), open: tone('c-error-icon'),
    openLine: bindViewerMaterial(new THREE.LineDashedMaterial({ transparent: true, opacity: 0.9 }), { color: 'c-error-icon' }),
    cutLine: bindViewerMaterial(new THREE.LineDashedMaterial({ transparent: true, opacity: 0.7 }), { color: 'c-ink' }),
    pick: new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0 }),
  };
}

// ---------- frames ----------
const E = () => S.element;
const cx = () => (E().x0 + E().x1) / 2;
/** World point of a face position (mm) at depth z (+ out of the face). */
const W = (x, y, z = 0) => new THREE.Vector3(x - cx(), y - E().y0, z);
const plateT = () => S.plate?.thickness_mm ?? 0;
/** Glyph size: arrows, rings and ticks at the scale of the products and what is round them, not of a long element. */
const k = () => Math.min(14, Math.max(6, Math.max(E().x1 - E().x0, E().y1 - E().y0) / 70));

function box(w, h, d, at, material, parent, edges = true) {
  const m = edges ? outlined(new THREE.BoxGeometry(w, h, d), material, mats.edges) : new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.copy(at); parent.add(m); return m;
}
/** A label: the loads first, then dimensions and names (see the design system's declutter). */
const pin = labelMaker([[/selected/, 5], [/load/, 4], [/dim/, 3], [/name/, 3]]);
function tag(html, at, cls = 'tag', parent = dyn) { return pin(parent, html, at, cls); }
function dimLine(a, b, text, tickDir, cls, parent = dyn) {
  dimPart(parent, a, b, { text, tickDir, tick: k() * 0.8, material: mats.dim, cls, tag: (into, h, at, c) => tag(h, at, c, into) });
}
function arrow(from, dir, length, material, parent = dyn) {
  const g = new THREE.Group(), r = k() * 0.32, head = k() * 2.4;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, length - head, 16), material);
  shaft.position.y = (length - head) / 2;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(r * 3, head, 24), material);
  cone.position.y = length - head / 2;
  g.add(shaft, cone);
  g.position.copy(from);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  parent.add(g);
  return from.clone().add(dir.clone().normalize().multiplyScalar(length));
}
const clear = clearGroup;

// ---------- zones painted on the face ----------
function zoneDecal() {
  const { x0, x1, y0, y1 } = E(), w = x1 - x0, h = y1 - y0, px = 1024 / Math.max(w, h);
  const c = document.createElement('canvas'); c.width = Math.max(8, Math.round(w * px)); c.height = Math.max(8, Math.round(h * px));
  const g = c.getContext('2d');
  for (const z of S.zones) {
    g.fillStyle = viewerColor(ZONE_ROLE[z.zone]);
    g.globalAlpha = z.zone === 'red' ? 0.1 : z.zone === 'amber' ? 0.34 : 0.26;
    g.fillRect((z.x0 - x0) * px, (y1 - z.y1) * px, (z.x1 - z.x0) * px + 1, (z.y1 - z.y0) * px + 1);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const material = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.copy(W((x0 + x1) / 2, (y0 + y1) / 2, 0.6)); m.userData.ownMap = true; stat.add(m);
}

// ---------- the static scene: ground, element, zones, sides ----------
function buildStatic() {
  clear(stat);
  const { x0, x1, y0, y1, thickness_mm: T } = E(), w = x1 - x0, h = y1 - y0;
  clear(floor);
  floor.add(shadowGround(mats.shadow, Math.max(w, h)));
  // Flat: the face on top, the products pointing down; upright: the face towards the viewer, standing on the ground.
  if (orientation() === 'flat') { frame.rotation.set(-Math.PI / 2, 0, 0); frame.position.set(0, T, h / 2); }
  else { frame.rotation.set(0, 0, 0); frame.position.set(0, 0, 0); }
  frame.updateMatrixWorld(true);
  const block = box(w, h, T, W((x0 + x1) / 2, (y0 + y1) / 2, -T / 2), mats.concrete, stat);
  block.renderOrder = 1;
  blocker = block;
  if (S.zones.length) zoneDecal();
  // Each side: stated (the outline), assumed (the default tone and its mark), not stated (a dashed break).
  const R = k();
  const border = {
    x_minus: [W(x0, y0, 0.8), W(x0, y1, 0.8)], x_plus: [W(x1, y0, 0.8), W(x1, y1, 0.8)],
    y_minus: [W(x0, y0, 0.8), W(x1, y0, 0.8)], y_plus: [W(x0, y1, 0.8), W(x1, y1, 0.8)],
  };
  for (const side of SIDES) {
    const how = S.sides[side], [a, b] = border[side];
    const mid = a.clone().lerp(b, 0.5);
    const out = side === 'x_minus' ? new THREE.Vector3(-1, 0, 0) : side === 'x_plus' ? new THREE.Vector3(1, 0, 0) : side === 'y_minus' ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0);
    if (how === 'assumed') {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.22, R * 0.22, a.distanceTo(b), 10), mats.assumed);
      m.position.copy(mid); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); stat.add(m);
      tag(`<span class="mark">${esc(S.words.assumed)}</span>`, mid.clone().add(out.clone().multiplyScalar(R * 3.5)), 'tag caption', stat);
    } else if (how === 'beyond') {
      // Farther than the view shows: cut, a quiet dashed line, no word (the dimension says how far).
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), mats.cutLine);
      mats.cutLine.dashSize = R * 1.4; mats.cutLine.gapSize = R; l.computeLineDistances(); stat.add(l);
    } else if (how === 'open') {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), mats.openLine);
      mats.openLine.dashSize = R * 1.4; mats.openLine.gapSize = R; l.computeLineDistances(); stat.add(l);
      tag(esc(S.words.open), mid.clone().add(out.clone().multiplyScalar(R * 3.5)), 'tag open', stat);
    }
  }
  tag(esc(S.caption), W(x0, y0, 1).add(new THREE.Vector3(0, -R * 3, T * 0.0)), 'tag caption', stat).center.set(0, 0);
}

// ---------- the dynamic scene: products, plate, loads, dimensions ----------
function pick(at, radius, data) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), mats.pick);
  m.position.copy(at); m.userData = data; dyn.add(m); pickables.push(m);
}
function pickEdge(side) {
  const { x0, x1, y0, y1, thickness_mm: T } = E(), R = k();
  const along = side.startsWith('x') ? [R * 3, y1 - y0, T + R * 2] : [x1 - x0, R * 3, T + R * 2];
  const at = side === 'x_minus' ? W(x0, (y0 + y1) / 2, -T / 2) : side === 'x_plus' ? W(x1, (y0 + y1) / 2, -T / 2)
    : side === 'y_minus' ? W((x0 + x1) / 2, y0, -T / 2) : W((x0 + x1) / 2, y1, -T / 2);
  const m = new THREE.Mesh(new THREE.BoxGeometry(...along), mats.pick);
  m.position.copy(at); m.userData = { kind: 'edge', side }; dyn.add(m); pickables.push(m);
}

function buildDynamic() {
  clear(dyn);
  pickables = [];
  const R = k();
  // the plate on the face
  if (S.plate) {
    const p = S.plate, t = p.thickness_mm;
    box(p.x1 - p.x0, p.y1 - p.y0, t, W((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, t / 2), mats.plate, dyn).renderOrder = 2;
  }
  // the products: the exact model, and its embedded length drawn through the concrete
  S.products.forEach((p, i) => {
    const at = W(p.x, p.y, 0);
    const geometry = p.mesh ? meshes.get(`${p.mesh.base}|${p.mesh.id}`) : null;
    if (geometry) {
      for (const [material, order] of [[mats.steel, 0], [mats.xray, 3]]) {
        const m = new THREE.Mesh(geometry, material); m.position.copy(at); m.rotation.z = (p.rotation_deg ?? 0) * Math.PI / 180;
        m.renderOrder = order; m.userData.shared = true; m.castShadow = material === mats.steel; dyn.add(m);
      }
    } else {
      // No model for this size: a plain cylinder of its length, so the layout still reads.
      const L = p.length_mm ?? 60, r = (p.diameter_mm ?? 20) / 2;
      for (const material of [mats.steel, mats.xray]) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 24), material);
        m.rotation.x = Math.PI / 2; m.position.copy(at).add(new THREE.Vector3(0, 0, -L / 2)); dyn.add(m);
      }
    }
    const sel = S.selected === i;
    if (sel) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(R * 2.2, R * 2.6, 64), mats.ring);
      ring.position.copy(at).add(new THREE.Vector3(0, 0, plateT() + 1.2)); dyn.add(ring);
    }
    tag(esc(p.name), at.clone().add(new THREE.Vector3(0, R * 4, plateT() + 2)), sel ? 'tag name selected' : 'tag name');
    pick(at.clone().add(new THREE.Vector3(0, 0, plateT() + R)), R * 4.5, { kind: 'product', index: i });
  });
  // the loads: tension out of the face, a shear on the face towards an edge
  for (const load of S.loads) {
    const material = load.assumed ? mats.assumed : mats.ink;
    const from = W(load.at[0], load.at[1], plateT() + R * 1.2);
    let tip;
    if (load.kind === 'tension') tip = arrow(from.clone().add(new THREE.Vector3(0, 0, R * 2)), new THREE.Vector3(0, 0, 1), R * 18, material);
    else tip = arrow(from.clone().add(new THREE.Vector3(load.dir[0], load.dir[1], 0).multiplyScalar(R * 3)), new THREE.Vector3(load.dir[0], load.dir[1], 0), R * 12, material);
    tag(`${esc(load.text)}${load.assumed ? `<span class="mark">${esc(S.words.assumed)}</span>` : ''}`,
      tip.clone().add(load.kind === 'tension' ? new THREE.Vector3(R * 5, R * 5, R * 2) : new THREE.Vector3(load.dir[0] * R * 4, load.dir[1] * R * 4 - R * 2, 0)), 'tag load');
  }
  // the dimensions on the face
  for (const d of S.dims) {
    const a = W(d.from[0], d.from[1], 1), b = W(d.to[0], d.to[1], 1);
    const along = b.clone().sub(a).normalize();
    dimLine(a, b, esc(d.text), new THREE.Vector3(-along.y, along.x, 0), d.assumed ? 'tag dim assumed' : 'tag dim');
  }
  // An edge's distance is measured from the outermost product: without products there is nothing to drag it from.
  if (S.movable && S.products.length) for (const side of SIDES) if (S.sides[side] === 'stated' || S.sides[side] === 'assumed') pickEdge(side);
  lensFrame.hidden = !lensShown();
  layoutView();
  const i = S.selected ?? 0, p = S.products[i];
  const title = lensFrame.querySelector('.lens-title');
  title.replaceChildren();
  if (p) { const name = document.createElement('b'); name.textContent = p.name; title.append(name, ` · ${p.mesh?.id ?? ''}`); }
}

// ---------- camera ----------
function framePoints() {
  const { x0, x1, y0, y1, thickness_mm: T } = E(), pts = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [-T, plateT() + k() * 22]) pts.push(frame.localToWorld(W(x, y, z)));
  return pts;
}
const spread = (cam, pts) => spreadPart(cam, pts, lensRoom());
const fitPose = dir => fitPart(camera, framePoints(), dir, { room: lensRoom(), fill: 0.9 });
/** A preset's direction; the 3/4 and Side views look from the side the shear points away from, so the tension arrow
 *  (towards the camera) and the shear arrow do not fall on each other. */
function presetDir(name) {
  const [x, y, z] = PRESETS[orientation()][name];
  const shear = S?.loads.find(l => l.kind === 'shear' && l.dir);
  const flip = shear && shear.dir[0] < 0 ? -1 : 1;
  return new THREE.Vector3(x * flip, y, z).normalize();
}
function preset(name, animate = true) {
  const pose = fitPose(presetDir(name));
  controls.minDistance = pose.dist * 0.2; controls.maxDistance = pose.dist * 2;
  camera.near = pose.dist / 400; camera.far = pose.dist * 20; camera.updateProjectionMatrix();
  if (!animate) { controls.target.copy(pose.target); camera.position.copy(pose.position); controls.update(); return; }
  tween = { t0: performance.now(), from: { p: camera.position.clone(), t: controls.target.clone() }, to: pose };
}
function buildViews() {
  views.replaceChildren(...Object.keys(PRESETS[orientation()]).map(name => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.onclick = () => preset(name);
    return b;
  }));
}

// ---------- picking and dragging ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function cast(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  // A handle behind the concrete (an edge on the far side) is not under the pointer: the element blocks it.
  const hit = ray.intersectObjects(blocker ? [...pickables, blocker] : pickables, false)[0]?.object ?? null;
  return hit === blocker ? null : hit;
}
/** A face position (mm) on screen (px). */
function screenOf(x, y) {
  const p = frame.localToWorld(W(x, y, 0)).project(camera), r = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2((p.x + 1) / 2 * r.width + r.left, (1 - p.y) / 2 * r.height + r.top);
}
/** How 100 mm along the face's x and y look on screen at a point (px), for reading a drag in millimetres. */
function faceAxes(x, y) {
  const o = screenOf(x, y);
  return { ex: screenOf(x + 100, y).sub(o), ey: screenOf(x, y + 100).sub(o) };
}
/** The largest edge distance a drag may state: as far as the view draws an edge (the host's), else 1.5 m. */
const reach = () => sent.maxEdge_mm ?? 1500;
document.body.addEventListener('pointerdown', ev => {
  // One drag at a time: a second pointer going down does not replace it.
  if (!S || drag || ev.target.closest('.views, .lens')) return;
  const hit = cast(ev);
  if (!hit || !sent.products.length) return;
  ev.stopPropagation(); ev.preventDefault();
  const xs = sent.products.map(p => p.x), ys = sent.products.map(p => p.y);
  const cxp = (Math.min(...xs) + Math.max(...xs)) / 2, cyp = (Math.min(...ys) + Math.max(...ys)) / 2;
  const start = new THREE.Vector2(ev.clientX, ev.clientY);
  if (hit.userData.kind === 'product') {
    post({ type: 'cast-in-element-select', index: hit.userData.index });
    if (!S.movable) return;
    drag = { kind: 'product', pointerId: ev.pointerId, start, axes: faceAxes(cxp, cyp), dx: 0, dy: 0 };
  } else {
    const side = hit.userData.side, e = sent.element;
    const at = side === 'x_minus' ? [e.x0, cyp] : side === 'x_plus' ? [e.x1, cyp] : side === 'y_minus' ? [cxp, e.y0] : [cxp, e.y1];
    const base = side === 'x_minus' ? Math.min(...xs) - e.x0 : side === 'x_plus' ? e.x1 - Math.max(...xs) : side === 'y_minus' ? Math.min(...ys) - e.y0 : e.y1 - Math.max(...ys);
    const { ex, ey } = faceAxes(...at);
    // Outwards on screen for 100 mm: −x on the left, +x on the right, −y at the bottom, +y at the top.
    const out = side === 'x_minus' ? ex.clone().negate() : side === 'x_plus' ? ex : side === 'y_minus' ? ey.clone().negate() : ey;
    if (out.lengthSq() < 4) return;
    drag = { kind: 'edge', pointerId: ev.pointerId, side, start, out, base, value: null };
  }
  try { document.body.setPointerCapture(ev.pointerId); } catch { /* a pointer the page did not see go down */ }
  controls.enabled = false;
  document.body.dataset.dragging = drag.kind;
}, true);
document.body.addEventListener('pointermove', ev => {
  if (!S) return;
  if (!drag) {
    const hit = cast(ev);
    document.body.dataset.hover = hit?.userData.kind === 'edge' ? (hit.userData.side.startsWith('y') ? 'edge-y' : 'edge-x') : hit?.userData.kind ?? '';
    return;
  }
  if (ev.pointerId !== drag.pointerId) return;
  const d = new THREE.Vector2(ev.clientX, ev.clientY).sub(drag.start);
  const xs = sent.products.map(p => p.x), ys = sent.products.map(p => p.y);
  if (drag.kind === 'product') {
    // The pointer's move as millimetres along the face's x and y (the two axes as seen on screen).
    const { ex, ey } = drag.axes, det = ex.x * ey.y - ex.y * ey.x;
    if (Math.abs(det) < 1) return;
    const a = (d.x * ey.y - d.y * ey.x) / det, b = (ex.x * d.y - ex.y * d.x) / det;
    const e = sent.element, m = 20;
    drag.dx = Math.max(e.x0 + m - Math.min(...xs), Math.min(e.x1 - m - Math.max(...xs), snap(a * 100)));
    drag.dy = Math.max(e.y0 + m - Math.min(...ys), Math.min(e.y1 - m - Math.max(...ys), snap(b * 100)));
    S = { ...sent, products: sent.products.map(p => ({ ...p, x: p.x + drag.dx, y: p.y + drag.dy })),
      loads: sent.loads.map(l => ({ ...l, at: [l.at[0] + drag.dx, l.at[1] + drag.dy] })),
      plate: sent.plate && { ...sent.plate, x0: sent.plate.x0 + drag.dx, x1: sent.plate.x1 + drag.dx, y0: sent.plate.y0 + drag.dy, y1: sent.plate.y1 + drag.dy },
      dims: [] };
    buildDynamic();
  } else {
    // The edge moves along its own direction on screen, 20 mm from the products at the least, as far as the view draws.
    const mm = snap(drag.base + d.dot(drag.out) / drag.out.lengthSq() * 100);
    drag.value = Math.max(20, Math.min(reach(), mm));
    const s0 = drag.side, e = { ...sent.element };
    if (s0 === 'x_minus') e.x0 = Math.min(...xs) - drag.value;
    if (s0 === 'x_plus') e.x1 = Math.max(...xs) + drag.value;
    if (s0 === 'y_minus') e.y0 = Math.min(...ys) - drag.value;
    if (s0 === 'y_plus') e.y1 = Math.max(...ys) + drag.value;
    S = { ...sent, element: e, sides: { ...sent.sides, [s0]: 'stated' }, zones: [], dims: [] };
    staticKey = null; buildStatic(); buildDynamic();
    tagDrag(s0, drag.value);
  }
});
/** The distance an edge being dragged is at, on the edge. */
function tagDrag(side, mm) {
  const e = S.element, xs = S.products.map(p => p.x), ys = S.products.map(p => p.y);
  const at = side === 'x_minus' ? W(e.x0, (Math.min(...ys) + Math.max(...ys)) / 2, 2) : side === 'x_plus' ? W(e.x1, (Math.min(...ys) + Math.max(...ys)) / 2, 2)
    : side === 'y_minus' ? W((Math.min(...xs) + Math.max(...xs)) / 2, e.y0, 2) : W((Math.min(...xs) + Math.max(...xs)) / 2, e.y1, 2);
  tag(fmt(mm), at, 'tag dim selected');
}
/**
 * The drag over: its pointer released, and a scene the host sent meanwhile applied. Without one, a stated change keeps
 * its preview until the host's next scene; a cancelled one goes back to the scene as sent.
 */
function finish(ev, stated) {
  drag = null; document.body.dataset.dragging = ''; controls.enabled = true;
  try { document.body.releasePointerCapture(ev.pointerId); } catch { /* not captured */ }
  const next = pending ?? (stated ? null : sent);
  pending = null;
  if (next) { staticKey = null; show(next); }
}
/** Released: the change is stated, once. */
document.body.addEventListener('pointerup', ev => {
  if (!drag || ev.pointerId !== drag.pointerId) return;
  let stated = false;
  if (drag.kind === 'product' && (drag.dx || drag.dy)) { post({ type: 'cast-in-element-drop', dx: drag.dx, dy: drag.dy }); stated = true; }
  if (drag.kind === 'edge' && drag.value !== null) { post({ type: 'cast-in-element-edge', side: drag.side, mm: Math.round(drag.value) }); stated = true; }
  finish(ev, stated);
});
/** Cancelled by the browser: nothing is stated, the preview goes back. */
document.body.addEventListener('pointercancel', ev => {
  if (!drag || ev.pointerId !== drag.pointerId) return;
  finish(ev, false);
});

// ---------- render ----------
const lensShown = () => Boolean(S?.products[S.selected ?? 0] && innerWidth >= 560 && innerHeight >= 360);
const lensRoom = () => lensRoomOf(lensFrame);
const layoutView = () => layoutForLens(camera, lensFrame);
/** The selected product up close, its embedded part through the concrete: the design system's lens. */
function renderLens() {
  if (lensFrame.hidden) return;
  const p = S.products[S.selected ?? 0];
  const geometry = p.mesh ? meshes.get(`${p.mesh.base}|${p.mesh.id}`) : null;
  const depth = geometry?.userData.depth ?? p.length_mm ?? 60;
  lensPart({ renderer, scene, lensCam, frameEl: lensFrame, target: frame.localToWorld(W(p.x, p.y, -depth * 0.45)),
    dir: camera.position.clone().sub(controls.target), reach: Math.max(depth * 1.6, k() * 6), distance: 2.6, background: color('viewer-panel') });
}
const declutter = () => declutterTags(labels.domElement);
function resize() {
  renderer.setSize(innerWidth, innerHeight); labels.setSize(innerWidth, innerHeight);
  if (S) lensFrame.hidden = !lensShown();
  layoutView();
  mats?.edges.resolution.set(innerWidth, innerHeight);
}
function draw(now = performance.now()) {
  if (!S) return;
  if (tween) {
    const t = Math.min(1, (now - tween.t0) / 520), e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(tween.from.p, tween.to.position, e); controls.target.lerpVectors(tween.from.t, tween.to.target, e);
    if (t === 1) tween = null;
  }
  controls.update();
  renderer.render(scene, camera);
  labels.render(scene, camera);
  declutter();
  renderLens();
}
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(draw);

// ---------- the host's scene ----------
function show(next) {
  const theme = document.documentElement.dataset.theme;
  sent = next; S = next;
  if (!mats) mats = materials();
  const key = JSON.stringify([next.element, next.sides, next.zones, next.caption, next.orientation ?? 'flat', theme]);
  if (key !== staticKey) { staticKey = key; buildStatic(); }
  buildDynamic();
  const fit = JSON.stringify([Math.round(next.element.x1 - next.element.x0), Math.round(next.element.y1 - next.element.y0), next.element.thickness_mm, orientation()]);
  if (fit !== fittedKey) {
    const first = fittedKey === null;
    fittedKey = fit;
    aimSun(sun, Math.max(next.element.x1 - next.element.x0, next.element.y1 - next.element.y0) * 1.4, frame.localToWorld(W((next.element.x0 + next.element.x1) / 2, (next.element.y0 + next.element.y1) / 2, 0)));
    if (first || orientation() !== shownOrientation) { shownOrientation = orientation(); buildViews(); preset('3/4', false); }
    else if (spread(camera, framePoints()) > 0.95) preset('3/4');
  }
  draw();
}

addEventListener('message', async event => {
  if (isViewerThemeMessage(event)) {
    document.documentElement.dataset.theme = event.data.theme;
    document.documentElement.classList.toggle('dark', event.data.theme === 'dark');
    if (mats) refreshViewerMaterials(scene, Object.values(mats));
    staticKey = null;
    if (S) show(sent);
    return;
  }
  if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'cast-in-element-scene') return;
  const next = event.data.scene;
  const asked = ++request;
  // Drawn at once, a product without its model yet as a plain cylinder; while a drag is under way, kept for its end.
  if (drag) pending = next; else show(next);
  // Each model is fetched once; one that could not be had (yet) is asked for again with the next scene.
  const missing = next.products.filter(p => p.mesh && !meshes.has(`${p.mesh.base}|${p.mesh.id}`));
  if (!missing.length) return;
  const arrived = await Promise.all(missing.map(p => {
    const key = `${p.mesh.base}|${p.mesh.id}`;
    if (!loading.has(key)) {
      loading.set(key, loadMesh(p.mesh).then(geometry => { loading.delete(key); if (geometry) meshes.set(key, geometry); return geometry; }));
    }
    return loading.get(key);
  }));
  // Redrawn with the models, unless a newer scene came meanwhile (it redraws itself) or a drag holds it.
  if (asked !== request || !arrived.some(Boolean)) return;
  if (drag) pending = next; else show(next);
});
post({ type: 'cast-in-element-ready' });
