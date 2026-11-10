/** CSS owns the palette; renderer updates mutate only color-bearing objects. */
export function viewerColor(role) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${role}`).trim();
}

export function bindViewerMaterial(material, roles) {
  material.userData.claritiColors = roles;
  refreshMaterial(material);
  return material;
}

function refreshMaterial(material) {
  for (const [property, role] of Object.entries(material.userData?.claritiColors || {})) {
    material[property]?.set(viewerColor(role));
  }
}

export function refreshViewerMaterials(scene, extra = []) {
  const materials = new Set(extra);
  scene?.traverse(object => {
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material) materials.add(material);
    }
  });
  materials.forEach(refreshMaterial);
}

export function initialViewerTheme() {
  const requested = new URLSearchParams(location.search).get('theme');
  return requested === 'light' || requested === 'dark' ? requested
    : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function isViewerThemeMessage(event) {
  return parent !== window && event.source === parent && event.origin === location.origin
    && event.data?.type === 'clariti-viewer-theme'
    && (event.data.theme === 'light' || event.data.theme === 'dark');
}
