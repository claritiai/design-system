/**
 * The parts every Clariti 3D page that draws an element with products in it is made of: labels pinned to the model and
 * kept from covering each other, dimension lines, a group cleared for redrawing, the camera fitted to what must show,
 * and the lens that shows the selected product up close in a corner. Every element page of
 * the families (and the cast-in-element page) uses them. Layout only: each page keeps its own scene, words and rules.
 */
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * A label maker: `tag(parent, html, at, cls)` pins a label to a point. Its priority (which of two overlapping labels
 * stays, see declutter) is the first of `order` whose pattern its classes match, else 1.
 */
export function labelMaker(order) {
  return (parent, html, at, cls = 'tag') => {
    const d = document.createElement('div'); d.className = cls; d.innerHTML = html;
    d.dataset.prio = order.find(([pattern]) => pattern.test(cls))?.[1] ?? 1;
    const o = new CSS2DObject(d); o.position.copy(at); parent.add(o); return o;
  };
}

/** Two labels on top of each other: the higher-priority one stays, the other steps aside (hidden). */
export function declutter(root) {
  const placed = [];
  const tags = [...root.querySelectorAll('.tag')].sort((a, b) => b.dataset.prio - a.dataset.prio);
  for (const el of tags) {
    el.style.visibility = '';
    if (el.style.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (placed.some(q => r.left < q.right + 3 && r.right > q.left - 3 && r.top < q.bottom + 2 && r.bottom > q.top - 2)) el.style.visibility = 'hidden';
    else placed.push(r);
  }
}

/** A dimension: a line from a to b with a tick at each end (`tick` long, across `tickDir`) and its text at the middle. */
export function dimLine(parent, a, b, { text, tickDir, tick, material, tag, cls = 'tag dim' }) {
  const t = tickDir.clone().multiplyScalar(tick);
  parent.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([a, b, a.clone().sub(t), a.clone().add(t), b.clone().sub(t), b.clone().add(t)]), material));
  if (text) tag(parent, text, a.clone().lerp(b, 0.5), cls);
}

/** Everything in a group removed and freed, except geometry marked shared (a product's model drawn several times). */
export function clearGroup(group) {
  for (const o of [...group.children]) {
    o.traverse(c => {
      if (c.isCSS2DObject) c.element.remove();
      if (c.geometry && !c.userData.shared) c.geometry.dispose();
      if (c.userData.ownMap) { c.material.map.dispose(); c.material.dispose(); }
    });
    group.remove(o);
  }
}

/** How far out the furthest point lies on screen: 1 at the edge of the picture, the strip on the right (`room` px) left out. */
export function spread(cam, pts, room = 0) {
  const usable = 1 - room / innerWidth;
  return Math.max(...pts.map(p => {
    const q = p.clone().project(cam);
    return Math.max(Math.abs(((q.x + 1) / usable) - 1), Math.abs(q.y));
  }));
}

/** The camera pose that shows every point from direction `dir`, the furthest at `fill` of the way to the edge. */
export function fitPose(camera, pts, dir, { room = 0, fill = 0.8 } = {}) {
  const b = new THREE.Box3().setFromPoints(pts), centre = b.getCenter(new THREE.Vector3());
  const probe = camera.clone();
  let dist = b.getBoundingSphere(new THREE.Sphere()).radius / Math.sin(camera.fov * Math.PI / 360);
  for (let i = 0; i < 4; i++) {
    probe.position.copy(centre).add(dir.clone().multiplyScalar(dist)); probe.lookAt(centre); probe.updateMatrixWorld();
    dist *= spread(probe, pts, room) / fill;
  }
  return { target: centre, position: centre.clone().add(dir.clone().multiplyScalar(dist)), dist };
}

/** Where the lens sits (px from the right and bottom) and how large it is for this window. */
export const LENS = { right: 16, bottom: 84 };
export const lensSize = () => Math.round(Math.min(220, Math.max(130, Math.min(innerWidth, innerHeight) * 0.28)));
/** The strip on the right the lens takes (px), so the model is framed in the rest. */
export const lensRoom = frameEl => (frameEl.hidden ? 0 : lensSize() + LENS.right + 16);

/** The camera's picture centred in the room left of the lens. */
export function layoutForLens(camera, frameEl) {
  const w = innerWidth, h = innerHeight, room = lensRoom(frameEl);
  if (room) camera.setViewOffset(w + room, h, room, 0, w, h); else camera.clearViewOffset();
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

/**
 * The lens: `target` seen from the main camera's direction `dir`, `reach` mm across, drawn into the lens's square of
 * the canvas over `background`. `frameEl` is the lens's frame on the page (sized and placed here).
 */
export function renderLens({ renderer, scene, lensCam, frameEl, target, dir, reach, distance = 2.4, background }) {
  if (frameEl.hidden) return;
  const w = innerWidth, h = innerHeight, size = lensSize(), { right, bottom } = LENS;
  frameEl.style.width = frameEl.style.height = `${size}px`;
  Object.assign(frameEl.style, { right: `${right}px`, bottom: `${bottom}px` });
  lensCam.position.copy(target).add(dir.clone().normalize().multiplyScalar(reach * distance)); lensCam.lookAt(target);
  lensCam.aspect = 1; lensCam.near = reach / 50; lensCam.far = reach * 40; lensCam.updateProjectionMatrix();
  const x = w - right - size, y = bottom;
  renderer.setScissorTest(true); renderer.setScissor(x, y, size, size); renderer.setViewport(x, y, size, size);
  renderer.setClearColor(background, 1); renderer.clear();
  renderer.render(scene, lensCam);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h);
  renderer.setClearColor(0, 0);
}
