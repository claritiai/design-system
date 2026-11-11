/**
 * A product's exact display mesh from a content-addressed catalogue the host serves (`base`: a folder with a
 * manifest.json and <meshSha256>.mesh.json files, as the product geometry packages ship them). The entry is found by its `sku` or `id`; the bytes must hash to its meshSha256. Only millimetre meshes in
 * the product's own frame (the axis along −z, the mouth at z = 0), never source CAD.
 */
import * as THREE from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const registries = new Map();
const hex = bytes => [...new Uint8Array(bytes)].map(v => v.toString(16).padStart(2, '0')).join('');

/** The catalogue's manifest, fetched once; a failed fetch is forgotten, so the next request tries again. */
async function registry(base) {
  if (!registries.has(base)) {
    const manifest = fetch(`${base}manifest.json`).then(r => (r.ok ? r.json() : Promise.reject(new Error('No registry'))));
    manifest.catch(() => registries.delete(base));
    registries.set(base, manifest);
  }
  return registries.get(base);
}

/** The mesh as a creased-normal geometry, or null when the catalogue has none (or it does not check out). */
export async function loadMesh({ base, id }) {
  if (typeof base !== 'string' || !base.startsWith('/') || typeof id !== 'string') return null;
  try {
    const manifest = await registry(base);
    const entries = (manifest.assets ?? []).filter(a => (a.sku ?? a.id) === id);
    if (entries.length !== 1) return null;
    const entry = entries[0];
    if (!/^[a-f0-9]{64}$/.test(entry.meshSha256 ?? '') || entry.file !== `${entry.meshSha256}.mesh.json`) return null;
    const response = await fetch(`${base}${entry.file}`);
    if (!response.ok) return null;
    const bytes = await response.arrayBuffer();
    if (hex(await crypto.subtle.digest('SHA-256', bytes)) !== entry.meshSha256) return null;
    const mesh = JSON.parse(new TextDecoder().decode(bytes));
    if (mesh.units !== 'mm' || !Array.isArray(mesh.positionsMm) || !Array.isArray(mesh.indices)) return null;
    const source = new THREE.BufferGeometry();
    source.setAttribute('position', new THREE.Float32BufferAttribute(mesh.positionsMm, 3));
    source.setIndex(mesh.indices);
    const geometry = toCreasedNormals(source, Math.PI / 6);
    source.dispose();
    geometry.computeBoundingBox();
    geometry.userData = { id, depth: -geometry.boundingBox.min.z };
    return geometry;
  } catch {
    return null;
  }
}
