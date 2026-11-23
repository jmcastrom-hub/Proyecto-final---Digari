import * as THREE from 'three';

export const MODEL_REFS = [
  'acoustic-guitar', 'electric-guitar', 'bass', 'keyboard', 'ukulele', 'recorder',
  'string-set', 'instrument-cable', 'reed', 'microphone', 'studio-monitor',
  'speaker', 'dj-controller', 'headphones', 'audio-interface',
] as const;
export type ModelRef = (typeof MODEL_REFS)[number];

/** Low-poly, purpose-built geometry. These are illustrative shapes, never exact product replicas. */
export function createProductModel(ref: string): THREE.Group {
  const group = new THREE.Group();
  const material = (color: string, metalness = 0, roughness = 0.62) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const geometries = new Map<string, THREE.BufferGeometry>();
  const cached = (key: string, factory: () => THREE.BufferGeometry) => { let geometry = geometries.get(key); if (!geometry) { geometry = factory(); geometries.set(key, geometry); } return geometry; };
  const dark = material('#29312f'); const wood = material('#b77a4a'); const woodLight = material('#d5a16a');
  const metal = material('#c7cbc5', 0.72, 0.28); const black = material('#171c1b', 0.12, 0.35); const white = material('#e7e4d8');
  const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => { const item = new THREE.Mesh(geometry, mat); item.position.set(x, y, z); group.add(item); return item; };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) => mesh(cached(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)), mat, x, y, z);
  const cylinder = (rTop: number, rBottom: number, length: number, mat: THREE.Material, x = 0, y = 0, z = 0, radial = 16) => mesh(cached(`cylinder:${rTop}:${rBottom}:${length}:${radial}`, () => new THREE.CylinderGeometry(rTop, rBottom, length, radial)), mat, x, y, z);
  const sphere = (r: number, mat: THREE.Material, x = 0, y = 0, z = 0) => mesh(cached(`sphere:${r}`, () => new THREE.SphereGeometry(r, 18, 12)), mat, x, y, z);
  const disc = (r: number, depth: number, mat: THREE.Material, x: number, y: number, z: number) => {
    const item = cylinder(r, r, depth, mat, x, y, z); item.rotation.x = Math.PI / 2; return item;
  };
  const guitar = (isBass: boolean, electric: boolean, uke: boolean) => {
    const scale = uke ? 0.64 : 1; const neckLen = isBass ? 2.35 : uke ? 1.2 : 1.7;
    const body = new THREE.Shape();
    body.moveTo(-0.34, -0.62); body.bezierCurveTo(-0.85, -0.82, -0.88, -0.15, -0.43, 0.03);
    body.bezierCurveTo(-0.86, 0.31, -0.73, 0.86, -0.12, 0.75); body.bezierCurveTo(0.42, 0.67, 0.32, 0.34, 0.23, 0.1);
    body.bezierCurveTo(0.67, -0.02, 0.78, -0.52, 0.27, -0.72); body.bezierCurveTo(0.06, -0.84, -0.16, -0.79, -0.34, -0.62);
    const bodyMesh = mesh(new THREE.ExtrudeGeometry(body, { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.025 }), electric ? dark : wood, 0, -0.25 * scale, 0);
    bodyMesh.scale.setScalar(scale);
    box(0.19 * scale, neckLen * scale, 0.14, dark, 0, 0.75 * scale, 0.02);
    box(0.24 * scale, 0.38 * scale, 0.15, electric ? dark : woodLight, 0, (0.75 + neckLen / 2 + 0.14) * scale, 0.02);
    const strings = isBass ? 4 : uke ? 4 : 6;
    for (let i = 0; i < strings; i++) {
      const x = ((i / (strings - 1)) - 0.5) * 0.13 * scale;
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, (neckLen + 1.48) * scale, 5), metal);
      wire.position.set(x, (neckLen * 0.44) * scale, 0.12); group.add(wire);
    }
    for (let i = 0; i < 5; i++) box(0.2 * scale, 0.012, 0.018, metal, 0, (0.32 + i * neckLen / 5) * scale, 0.1);
    if (!electric) disc(0.18 * scale, 0.024, black, 0, -0.16 * scale, 0.217);
    else for (const y of [-0.45, -0.17]) box(0.38 * scale, 0.09 * scale, 0.035, black, 0, y * scale, 0.22);
    box(0.42 * scale, 0.09, 0.08, metal, 0, -0.65 * scale, 0.22);
  };
  switch (ref as ModelRef) {
    case 'acoustic-guitar': guitar(false, false, false); break;
    case 'electric-guitar': guitar(false, true, false); break;
    case 'bass': guitar(true, true, false); break;
    case 'ukulele': guitar(false, false, true); break;
    case 'keyboard':
      box(2.8, 0.3, 0.72, dark, 0, 0, 0); box(2.55, 0.035, 0.58, white, 0, -0.12, 0.22);
      for (let i = 0; i < 21; i++) box(0.115, 0.035, 0.54, white, -1.22 + i * 0.122, -0.09, 0.22);
      for (let i = 0; i < 15; i++) if (![2, 6, 9, 13].includes(i % 7)) box(0.065, 0.045, 0.31, black, -1.16 + i * 0.171, -0.045, 0.09);
      break;
    case 'recorder':
      cylinder(0.085, 0.07, 2.6, white, 0, 0, 0); cylinder(0.09, 0.085, 0.38, woodLight, 0, 1.12, 0);
      for (let i = 0; i < 7; i++) sphere(0.045, black, (i % 2 ? 0.06 : -0.06), 0.75 - i * 0.22, 0.07);
      break;
    case 'string-set':
      cylinder(0.39, 0.39, 0.3, woodLight, 0, 0, 0); cylinder(0.32, 0.32, 0.34, black, 0, 0, 0.02);
      for (let i = 0; i < 6; i++) { const line = mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.05, 5), metal, -0.22 + i * 0.088, 0, 0.28); line.rotation.z = Math.PI / 2; }
      break;
    case 'instrument-cable': {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 80; i++) { const t = i / 80 * Math.PI * 4; points.push(new THREE.Vector3(Math.cos(t) * 0.7, Math.sin(t) * 0.7, Math.sin(t * 0.5) * 0.05)); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.045, 8, false), black);
      for (const x of [-0.8, 0.8]) { cylinder(0.065, 0.065, 0.32, metal, x, 0, 0); cylinder(0.09, 0.09, 0.1, black, x, 0.2, 0); }
      break;
    }
    case 'reed': {
      const shape = new THREE.Shape(); shape.moveTo(-0.08, -0.78); shape.lineTo(0.08, -0.78); shape.lineTo(0.14, 0.45); shape.quadraticCurveTo(0, 0.85, -0.14, 0.45); shape.closePath();
      mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.008, bevelSegments: 1 }), woodLight);
      break;
    }
    case 'microphone':
      cylinder(0.09, 0.075, 1.08, dark, 0, -0.3, 0); sphere(0.17, metal, 0, 0.34, 0); cylinder(0.15, 0.15, 0.24, metal, 0, 0.3, 0, 20);
      for (let i = 0; i < 5; i++) box(0.012, 0.28, 0.012, dark, -0.08 + i * 0.04, 0.34, 0.13);
      break;
    case 'studio-monitor':
      box(1.25, 1.9, 0.76, dark); disc(0.43, 0.09, black, 0, -0.28, 0.42); disc(0.31, 0.12, woodLight, 0, -0.28, 0.48); disc(0.09, 0.1, black, 0, -0.28, 0.55);
      disc(0.13, 0.1, black, 0, 0.52, 0.42); break;
    case 'speaker':
      box(1.55, 2.45, 0.82, dark); disc(0.58, 0.11, black, 0, -0.42, 0.45); disc(0.42, 0.13, metal, 0, -0.42, 0.52); disc(0.16, 0.1, black, 0, -0.42, 0.61);
      disc(0.17, 0.11, black, 0, 0.5, 0.44); break;
    case 'dj-controller':
      box(2.8, 0.22, 1.52, dark); for (const x of [-0.83, 0.83]) { disc(0.45, 0.11, black, x, 0.18, 0.02); disc(0.32, 0.08, metal, x, 0.25, 0.02); disc(0.09, 0.06, black, x, 0.32, 0.02); }
      for (let i = 0; i < 4; i++) { box(0.07, 0.22, 0.035, metal, -0.26 + i * 0.17, 0.17, 0.1); cylinder(0.08, 0.08, 0.1, woodLight, -0.72 + i * 0.48, 0.2, -0.55); }
      break;
    case 'headphones': {
      const arc = new THREE.EllipseCurve(0, 0, 0.8, 0.88, Math.PI, 0, false, 0);
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc.getPoints(36).map((point) => new THREE.Vector3(point.x, point.y, 0))), 48, 0.09, 8, false), dark, 0, 0.2, 0);
      for (const x of [-0.82, 0.82]) { box(0.35, 0.65, 0.36, dark, x, -0.1, 0); box(0.22, 0.47, 0.14, woodLight, x, -0.1, 0.22); }
      break;
    }
    case 'audio-interface':
      box(2.3, 1.24, 0.68, dark); for (let i = 0; i < 3; i++) { disc(0.18, 0.13, metal, -0.72 + i * 0.48, 0.23, 0.38); disc(0.11, 0.13, black, -0.72 + i * 0.48, 0.23, 0.46); }
      for (let i = 0; i < 2; i++) cylinder(0.13, 0.13, 0.11, metal, -0.5 + i * 1, -0.35, 0.37);
      box(0.35, 0.16, 0.1, woodLight, 0.75, -0.35, 0.38); break;
    default: throw new Error(`No existe geometría para ${ref}`);
  }
  group.traverse((child) => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
  return group;
}
