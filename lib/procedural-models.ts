import * as THREE from 'three';

export const MODEL_REFS = [
  'acoustic-guitar', 'electric-guitar', 'bass', 'keyboard', 'ukulele', 'recorder',
  'string-set', 'instrument-cable', 'reed', 'microphone', 'studio-monitor',
  'speaker', 'dj-controller', 'headphones', 'audio-interface',
] as const;
export type ModelRef = (typeof MODEL_REFS)[number];

/** Original procedural studies. Geometry is illustrative and does not reproduce an exact retail model. */
export function createProductModel(ref: string): THREE.Group {
  const group = new THREE.Group();
  const geometries = new Map<string, THREE.BufferGeometry>();
  const cached = (key: string, factory: () => THREE.BufferGeometry) => {
    let geometry = geometries.get(key);
    if (!geometry) { geometry = factory(); geometries.set(key, geometry); }
    return geometry;
  };
  const material = (color: string, metalness = 0, roughness = 0.58) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const dark = material('#272624', 0.12, 0.42);
  const black = material('#111214', 0.18, 0.3);
  const ivory = material('#eee5d6', 0, 0.48);
  const maple = material('#bd8952', 0, 0.55);
  const woodEdge = material('#744b30', 0, 0.62);
  const brass = material('#d0a15e', 0.68, 0.3);
  const nickel = material('#bbc0c1', 0.78, 0.25);
  const rubber = material('#18191a', 0.02, 0.87);
  const screen = material('#a2b4a0', 0.08, 0.3);
  const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) => {
    const item = new THREE.Mesh(geometry, mat); item.position.set(x, y, z); group.add(item); return item;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, bevel = 0) => {
    const geometry = bevel
      ? cached(`roundbox:${w}:${h}:${d}:${bevel}`, () => {
        const shape = new THREE.Shape(); const x0 = -w / 2; const x1 = w / 2; const y0 = -h / 2; const y1 = h / 2;
        const r = Math.min(bevel, w / 3, h / 3);
        shape.moveTo(x0 + r, y0); shape.lineTo(x1 - r, y0); shape.quadraticCurveTo(x1, y0, x1, y0 + r);
        shape.lineTo(x1, y1 - r); shape.quadraticCurveTo(x1, y1, x1 - r, y1); shape.lineTo(x0 + r, y1);
        shape.quadraticCurveTo(x0, y1, x0, y1 - r); shape.lineTo(x0, y0 + r); shape.quadraticCurveTo(x0, y0, x0 + r, y0);
        return new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSegments: 3, bevelSize: r * 0.35, bevelThickness: r * 0.35, steps: 1 });
      })
      : cached(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
    return mesh(geometry, mat, x, y, z - (bevel ? d / 2 : 0));
  };
  const cylinder = (radius: number, length: number, mat: THREE.Material, x = 0, y = 0, z = 0, radial = 20) =>
    mesh(cached(`cyl:${radius}:${length}:${radial}`, () => new THREE.CylinderGeometry(radius, radius, length, radial)), mat, x, y, z);
  const sphere = (radius: number, mat: THREE.Material, x = 0, y = 0, z = 0) =>
    mesh(cached(`sphere:${radius}`, () => new THREE.SphereGeometry(radius, 20, 14)), mat, x, y, z);
  const disc = (radius: number, depth: number, mat: THREE.Material, x: number, y: number, z: number) => {
    const item = mesh(cached(`disc:${radius}:${depth}`, () => new THREE.CylinderGeometry(radius, radius, depth, 36)), mat, x, y, z);
    item.rotation.x = Math.PI / 2; return item;
  };
  const ring = (radius: number, tube: number, mat: THREE.Material, x: number, y: number, z: number) =>
    mesh(cached(`ring:${radius}:${tube}`, () => new THREE.TorusGeometry(radius, tube, 10, 64)), mat, x, y, z);
  const line = (points: THREE.Vector3[], radius: number, mat: THREE.Material, segments = 48) =>
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 8, false), mat);
  const tuner = (x: number, y: number, z: number) => {
    const side = Math.sign(x);
    disc(0.043, 0.018, nickel, x, y, z + 0.07);
    const stem = cylinder(0.022, 0.14, nickel, x + side * 0.055, y, z, 12); stem.rotation.z = Math.PI / 2;
    box(0.12, 0.065, 0.085, ivory, x + side * 0.13, y, z - 0.015, 0.024);
  };
  const woodTexture = () => {
    const width = 256; const height = 512; const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const warp = Math.sin(y * 0.011) * 4.2 + Math.sin(y * 0.033) * 1.5;
      const grain = Math.sin((x + warp) * 0.07) * 1.15 + Math.sin((x + warp * 0.62) * 0.29) * 0.55;
      const pores = Math.sin((x + Math.sin(y * 0.019) * 1.4) * 0.41) * 0.7;
      const light = 139 + grain * 23 + pores * 3 + Math.sin(y * 0.009) * 5.5;
      const i = (y * width + x) * 4;
      data[i] = Math.max(54, Math.min(238, light * 0.99));
      data[i + 1] = Math.max(32, Math.min(204, light * 0.66));
      data[i + 2] = Math.max(18, Math.min(155, light * 0.45)); data[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.25, 1.8); texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.needsUpdate = true;
    return texture;
  };
  const makeGuitar = (kind: 'acoustic' | 'electric' | 'bass' | 'ukulele') => {
    const isAcoustic = kind === 'acoustic'; const isBass = kind === 'bass'; const isUke = kind === 'ukulele';
    const scale = isUke ? 0.66 : 1; const stringCount = isBass ? 4 : isUke ? 4 : 6;
    const neckLength = (isBass ? 2.05 : isUke ? 1.05 : 1.65) * scale;
    const neckBase = 0.67 * scale; const neckCenter = neckBase + neckLength / 2;
    const headBase = neckBase + neckLength - 0.04 * scale; const headHeight = 0.54 * scale;
    const grain = woodTexture(); const topWood = new THREE.MeshStandardMaterial({ map: grain, color: '#fff0dc', roughness: 0.52 });
    const neckWood = new THREE.MeshStandardMaterial({ map: grain, color: '#d6a36c', roughness: 0.58 });
    const body = new THREE.Shape();
    body.moveTo(0, -1.06); body.bezierCurveTo(0.56, -1.04, 0.84, -0.85, 0.82, -0.49);
    body.bezierCurveTo(0.80, -0.21, 0.58, -0.04, 0.50, 0.08); body.bezierCurveTo(0.78, 0.35, 0.73, 0.70, 0.55, 0.79);
    body.bezierCurveTo(0.30, 0.92, 0.14, 0.76, 0, 0.70); body.bezierCurveTo(-0.14, 0.76, -0.30, 0.92, -0.55, 0.79);
    body.bezierCurveTo(-0.73, 0.70, -0.78, 0.35, -0.50, 0.08); body.bezierCurveTo(-0.58, -0.04, -0.80, -0.21, -0.82, -0.49);
    body.bezierCurveTo(-0.84, -0.85, -0.56, -1.04, 0, -1.06); body.closePath();
    const soundY = -0.16 * scale;
    if (isAcoustic || isUke) { const opening = new THREE.Path(); opening.absellipse(0, soundY, 0.19 * scale, 0.19 * scale, 0, Math.PI * 2, true); body.holes.push(opening); }
    const bodyDepth = 0.28; const bodyBack = -0.16;
    const bodyGeometry = new THREE.ExtrudeGeometry(body, { depth: bodyDepth, bevelEnabled: true, bevelSegments: 6, bevelSize: 0.055, bevelThickness: 0.045, steps: 1, curveSegments: 32 });
    const bodyFace = isAcoustic || isUke ? topWood : material('#453c36', 0.08, 0.48);
    const bodyMesh = mesh(bodyGeometry, [isAcoustic || isUke ? woodEdge : dark, bodyFace, bodyFace], 0, 0, bodyBack); bodyMesh.scale.set(scale, scale, isUke ? 0.72 : 1);
    // A narrow binding follows the rounded perimeter; face, bevel and side use distinct materials.
    const outline = body.getPoints(128).map((point) => new THREE.Vector3(point.x * scale, point.y * scale, 0.165));
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline, true), 192, 0.012 * scale, 8, true), isAcoustic || isUke ? maple : nickel);
    box(0.235 * scale, neckLength, 0.16 * scale, neckWood, 0, neckCenter, 0.015, 0.035 * scale);
    box(0.245 * scale, neckLength * 0.99, 0.05 * scale, dark, 0, neckCenter, 0.118 * scale, 0.012 * scale);
    box(0.27 * scale, 0.04 * scale, 0.085 * scale, ivory, 0, neckBase + neckLength + 0.01 * scale, 0.112 * scale, 0.012 * scale);
    // The headstock is a tapered shape with a visible front face and six (or four) individual tuner posts.
    const head = new THREE.Shape();
    head.moveTo(-0.12 * scale, headBase); head.lineTo(-0.18 * scale, headBase + 0.31 * scale); head.quadraticCurveTo(-0.2 * scale, headBase + headHeight, 0, headBase + headHeight);
    head.quadraticCurveTo(0.2 * scale, headBase + headHeight, 0.18 * scale, headBase + 0.31 * scale); head.lineTo(0.12 * scale, headBase); head.closePath();
    mesh(new THREE.ExtrudeGeometry(head, { depth: 0.14 * scale, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.035 * scale, bevelThickness: 0.028 * scale, curveSegments: 16 }), isAcoustic || isUke ? maple : dark, 0, 0, -0.02);
    const nutY = neckBase + neckLength - 0.01 * scale; const endY = headBase + headHeight * 0.86;
    for (let i = 0; i < stringCount; i++) {
      const x = (i / (stringCount - 1) - 0.5) * 0.16 * scale;
      const radius = isBass ? 0.009 : 0.006;
      const wire = cylinder(radius, endY + 0.72 * scale, nickel, x, (endY - 0.72 * scale) / 2, 0.26 * scale, 8);
      if (isUke) wire.material = material('#d8c9a8', 0.12, 0.55);
      disc(0.018 * scale, 0.03 * scale, nickel, x, -0.72 * scale, 0.245 * scale);
      // Short, readable fret spacing follows the equal-temperament fret formula.
    }
    // Frets cross the fretboard once each; they are not duplicated per string.
    const fretCount = isBass ? 20 : isUke ? 12 : 18;
    for (let fret = 1; fret <= fretCount; fret++) {
      const position = nutY - (1 - 2 ** (-fret / 12)) * neckLength;
      box(0.245 * scale, 0.012 * scale, 0.025 * scale, nickel, 0, position, 0.128 * scale);
    }
    for (const fret of [3, 5, 7, 9, 12, 15, 17]) {
      if (fret > (isBass ? 20 : isUke ? 12 : 18)) continue;
      const position = nutY - (1 - 2 ** (-fret / 12)) * neckLength;
      const dot = sphere(0.028 * scale, ivory, 0, position - 0.045 * scale, 0.135 * scale);
      if (fret === 12) { sphere(0.025 * scale, ivory, -0.045 * scale, position - 0.045 * scale, 0.135 * scale); dot.position.x = 0.045 * scale; }
    }
    for (let i = 0; i < stringCount; i++) {
      const side = i < stringCount / 2 ? -1 : 1; const row = i % Math.ceil(stringCount / 2);
      tuner(side * 0.2 * scale, headBase + (0.12 + row * (isUke ? 0.16 : 0.13)) * scale, 0.06 * scale);
    }
    // The shaped bridge and raised saddle anchor every string at the body end.
    if (isAcoustic || isUke) {
      const bridge = new THREE.Shape();
      bridge.moveTo(-0.22 * scale, -0.80 * scale); bridge.quadraticCurveTo(-0.29 * scale, -0.80 * scale, -0.28 * scale, -0.72 * scale);
      bridge.lineTo(-0.23 * scale, -0.61 * scale); bridge.quadraticCurveTo(0, -0.66 * scale, 0.23 * scale, -0.61 * scale);
      bridge.lineTo(0.28 * scale, -0.72 * scale); bridge.quadraticCurveTo(0.29 * scale, -0.80 * scale, 0.22 * scale, -0.80 * scale);
      bridge.quadraticCurveTo(0, -0.73 * scale, -0.22 * scale, -0.80 * scale); bridge.closePath();
      mesh(new THREE.ExtrudeGeometry(bridge, { depth: 0.12 * scale, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.022 * scale, bevelThickness: 0.018 * scale }), woodEdge, 0, 0, 0.125 * scale);
      box(0.43 * scale, 0.025 * scale, 0.05 * scale, ivory, 0, -0.66 * scale, 0.265 * scale, 0.01 * scale);
    } else {
      box(0.50 * scale, 0.09 * scale, 0.15 * scale, nickel, 0, -0.72 * scale, 0.20 * scale, 0.035 * scale);
      box(0.44 * scale, 0.025 * scale, 0.045 * scale, ivory, 0, -0.67 * scale, 0.275 * scale, 0.01 * scale);
    }
    if (isAcoustic || isUke) {
      const soundZ = 0.16 * scale;
      // The soundboard has a true cut-out. This dark inner well sits well behind its rim, not on top of the face.
      disc(0.175 * scale, 0.018 * scale, black, 0, soundY, -0.025 * scale);
      ring(0.196 * scale, 0.012 * scale, woodEdge, 0, soundY, soundZ + 0.006 * scale);
      ring(0.218 * scale, 0.009 * scale, maple, 0, soundY, soundZ + 0.009 * scale);
      ring(0.239 * scale, 0.006 * scale, ivory, 0, soundY, soundZ + 0.006 * scale);
      if (isAcoustic) {
        // Fine hand-drawn procedural grain makes the illustrative soundboard read as wood at normal viewing size.
        const lanes = [
          { x: 0.29, lo: -0.98, hi: 0.68 }, { x: 0.40, lo: -0.97, hi: 0.67 },
          { x: 0.51, lo: -0.94, hi: 0.58 }, { x: 0.61, lo: -0.91, hi: 0.35 },
        ];
        for (const lane of lanes) for (const side of [-1, 1]) {
          const intervals = [[Math.max(-0.56, lane.lo), Math.min(0.56, lane.hi)]] as const;
          for (const [from, to] of intervals) {
            if (to <= from) continue;
            const points: THREE.Vector3[] = [];
            for (let step = 0; step <= 18; step++) {
              const y = from + ((to - from) * step) / 18;
              const x = side * lane.x + Math.sin(y * 15 + lane.x * 9) * 0.006;
              points.push(new THREE.Vector3(x * scale, y * scale, 0.18 * scale));
            }
            const grain = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(points),
              new THREE.LineBasicMaterial({ color: lane.x > 0.4 ? '#8c5c3d' : '#a97550' }),
            );
            group.add(grain);
          }
        }
      }
      // A small end pin, rounded heel and center seam give the back a separate readable construction.
      box(0.27 * scale, 0.30 * scale, 0.05 * scale, woodEdge, 0, 0.67 * scale, bodyBack - 0.075, 0.045 * scale);
      box(0.018 * scale, 1.50 * scale, 0.012 * scale, woodEdge, 0, -0.12 * scale, bodyBack - 0.055);
      sphere(0.075 * scale, nickel, 0, -1.00 * scale, 0.015);
      const backWood = material('#925b3a', 0, 0.58);
      disc(0.195 * scale, 0.02 * scale, backWood, 0, soundY, -0.207 * scale);
      box(0.62 * scale, 0.026 * scale, 0.012 * scale, maple, 0, soundY + 0.25 * scale, bodyBack - 0.055);
      box(0.62 * scale, 0.026 * scale, 0.012 * scale, maple, 0, soundY - 0.25 * scale, bodyBack - 0.055);
      for (let i = 0; i < 6; i++) sphere(0.021 * scale, black, -0.19 * scale + i * 0.076 * scale, -0.73 * scale, 0.25 * scale);
      // A simple striped inlay reads as figured wood without claiming a photographed grain.
      for (let i = 0; i < 3; i++) box(0.32 * scale, 0.008 * scale, 0.006 * scale, brass, 0, -0.48 * scale + i * 0.022 * scale, 0.267 * scale);
    } else {
      // Two pickups, six bridge saddles, a pickguard, selector and tactile control knobs.
      const guard = new THREE.Shape(); guard.moveTo(-0.2 * scale, 0.02 * scale); guard.quadraticCurveTo(0.38 * scale, -0.06 * scale, 0.34 * scale, -0.49 * scale); guard.lineTo(-0.05 * scale, -0.58 * scale); guard.lineTo(-0.23 * scale, -0.32 * scale); guard.closePath();
      mesh(new THREE.ShapeGeometry(guard), material('#ddd1bd', 0.02, 0.5), 0, 0, 0.095 * scale);
      const pickupYs = isBass ? [-0.31, -0.12] : [-0.38, 0.04];
      for (const y of pickupYs) {
        box(0.38 * scale, 0.12 * scale, 0.06 * scale, black, 0, y * scale, 0.155 * scale, 0.025 * scale);
        for (let i = 0; i < stringCount; i++) sphere(0.018 * scale, nickel, (i / (stringCount - 1) - 0.5) * 0.28 * scale, y * scale, 0.19 * scale);
      }
      for (let i = 0; i < stringCount; i++) box(0.035 * scale, 0.045 * scale, 0.08 * scale, nickel, (i / (stringCount - 1) - 0.5) * 0.38 * scale, -0.73 * scale, 0.17 * scale);
      for (let i = 0; i < (isBass ? 2 : 3); i++) { const y = -0.48 * scale + i * 0.11 * scale; disc(0.065 * scale, 0.035 * scale, brass, 0.43 * scale, y, 0.19 * scale); disc(0.045 * scale, 0.04 * scale, black, 0.43 * scale, y, 0.215 * scale); }
      box(0.28 * scale, 0.035 * scale, 0.06 * scale, nickel, -0.34 * scale, -0.72 * scale, 0.18 * scale);
      // Back plate and output jack remain visible when the model is turned around.
      box(0.5 * scale, 0.34 * scale, 0.025 * scale, rubber, 0.1 * scale, -0.4 * scale, -0.15 * scale);
      disc(0.06 * scale, 0.08 * scale, nickel, 0.48 * scale, -0.6 * scale, 0.08 * scale);
    }
    // Strap buttons sit on both body horns/tail; the acoustic back and electric body keep real depth.
    for (const x of [-0.54, 0.54]) { sphere(0.055 * scale, nickel, x * scale, 0.45 * scale, 0.015); sphere(0.055 * scale, nickel, x * scale, -0.91 * scale, 0.015); }
    // Guitars are presented horizontally, like an instrument on a workbench, with the neck extending right.
    group.rotation.z = -Math.PI / 2;
  };

  const connector = (origin: THREE.Vector3, direction: THREE.Vector3) => {
    const axis = direction.clone().normalize();
    const orient = (part: THREE.Mesh, offset: number) => { part.position.copy(origin).addScaledVector(axis, offset); part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis); };
    const grip = mesh(cached('plug-grip', () => new THREE.CylinderGeometry(0.07, 0.07, 0.2, 18)), rubber); orient(grip, 0.06);
    const barrel = mesh(cached('plug-barrel', () => new THREE.CylinderGeometry(0.045, 0.055, 0.2, 18)), nickel); orient(barrel, 0.25);
    const insulator = mesh(cached('plug-insulator', () => new THREE.CylinderGeometry(0.046, 0.046, 0.035, 18)), black); orient(insulator, 0.34);
    const tip = mesh(cached('plug-tip', () => new THREE.CylinderGeometry(0.027, 0.04, 0.12, 18)), brass); orient(tip, 0.42);
  };
  const audioCabinet = (width: number, height: number, depth: number, wooferRadius: number, tweeterRadius: number) => {
    box(width, height, depth, dark, 0, 0, 0, 0.08);
    const z = depth / 2 + 0.05;
    for (const [y, radius] of [[-height * 0.22, wooferRadius], [height * 0.27, tweeterRadius]] as const) {
      ring(radius * 0.95, 0.045, rubber, 0, y, z);
      disc(radius * 0.82, 0.05, dark, 0, y, z + 0.015);
      ring(radius * 0.65, 0.022, nickel, 0, y, z + 0.05);
      disc(radius * 0.53, 0.035, material('#554c43', 0.12, 0.56), 0, y, z + 0.04);
      disc(radius * 0.2, 0.04, black, 0, y, z + 0.075);
      for (let i = 0; i < 4; i++) { const angle = i * Math.PI / 2; sphere(0.018, nickel, Math.cos(angle) * radius * 0.9, y + Math.sin(angle) * radius * 0.9, z + 0.07); }
    }
    // Rear connection panel: XLR, power and line-level sockets.
    for (let i = 0; i < 3; i++) { ring(0.085, 0.014, brass, -width * 0.25 + i * width * 0.25, -height * 0.3, -depth / 2 - 0.02); disc(0.058, 0.04, black, -width * 0.25 + i * width * 0.25, -height * 0.3, -depth / 2 - 0.035); }
    // Subtle grille strands are kept in front of the drivers so each speaker reads as audio gear.
    for (let i = -3; i <= 3; i++) box(0.008, height * 0.78, 0.009, material('#706960', 0.22, 0.52), i * 0.055, 0, z + 0.1);
  };

  switch (ref as ModelRef) {
    case 'acoustic-guitar': makeGuitar('acoustic'); break;
    case 'electric-guitar': makeGuitar('electric'); break;
    case 'bass': makeGuitar('bass'); break;
    case 'ukulele': makeGuitar('ukulele'); break;
    case 'keyboard': {
      box(2.75, 0.27, 0.82, dark, 0, 0, 0, 0.07);
      const whiteKeyWidth = 2.48 / 21;
      for (let i = 0; i < 21; i++) {
        const x = -1.24 + whiteKeyWidth * (i + 0.5);
        box(whiteKeyWidth - 0.012, 0.05, 0.48, ivory, x, -0.14, 0.22, 0.008);
      }
      const blackOffsets = [0, 1, 3, 4, 5];
      for (let octave = 0; octave < 3; octave++) for (const degree of blackOffsets) {
        const index = octave * 7 + degree; if (index >= 20) continue;
        const x = -1.24 + whiteKeyWidth * (index + 1); box(whiteKeyWidth * 0.56, 0.1, 0.27, black, x, -0.075, 0.045, 0.014);
      }
      box(0.45, 0.22, 0.025, screen, -0.78, 0.17, 0.42, 0.04);
      for (let i = 0; i < 5; i++) { disc(0.045, 0.05, brass, -0.18 + i * 0.17, 0.16, 0.43); box(0.07, 0.04, 0.035, ivory, 0.55 + i * 0.15, 0.16, 0.43, 0.01); }
      for (let i = 0; i < 15; i++) sphere(0.018, nickel, -1.13 + (i % 5) * 0.08, 0.15 - Math.floor(i / 5) * 0.065, 0.44);
      box(0.12, 0.08, 0.12, nickel, -1.25, -0.13, -0.42); box(0.12, 0.08, 0.12, nickel, 1.25, -0.13, -0.42);
      break;
    }
    case 'recorder': {
      cylinder(0.09, 2.58, ivory, 0, 0, 0, 24); cylinder(0.12, 0.32, maple, 0, 1.22, 0, 24);
      cylinder(0.098, 0.16, dark, 0, -1.3, 0, 24);
      for (let i = 0; i < 7; i++) { const y = 0.83 - i * 0.31; disc(0.043, 0.018, black, i % 2 ? 0.047 : -0.047, y, 0.078); }
      for (let i = 0; i < 4; i++) { ring(0.095, 0.009, brass, 0, 0.96 - i * 0.62, 0); }
      sphere(0.035, dark, 0, 1.15, 0.08); break;
    }
    case 'string-set': {
      cylinder(0.28, 0.52, maple, 0, 0, 0); cylinder(0.24, 0.56, dark, 0, 0, 0.03);
      for (let i = 0; i < 6; i++) {
        const radius = 0.31 + i * 0.018; const coil = mesh(cached(`string-coil:${i}`, () => new THREE.TorusGeometry(radius, 0.012 + i * 0.001, 8, 80)), nickel, -0.36 + i * 0.145, 0, 0.31);
        coil.rotation.x = Math.PI / 2;
        line([new THREE.Vector3(-0.2, -0.45 + i * 0.04, 0.28), new THREE.Vector3(0.2, -0.53 + i * 0.05, 0.28)], 0.01, nickel, 12);
      }
      break;
    }
    case 'instrument-cable': {
      const points: THREE.Vector3[] = []; const endAngle = Math.PI * 7;
      for (let i = 0; i <= 180; i++) { const t = i / 180 * endAngle; const radius = 0.72 - i / 180 * 0.14; const layer = Math.floor(t / (Math.PI * 2)); points.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0.035 * layer)); }
      line(points, 0.035, rubber, 220);
      const start = points[0]; const finish = points.at(-1)!;
      const left = new THREE.Vector3(-1, -0.15, 0); const right = new THREE.Vector3(1, 0.15, 0);
      line([start, new THREE.Vector3(0.12, -0.58, 0), right.clone().multiplyScalar(0.9)], 0.035, rubber, 28);
      line([finish, new THREE.Vector3(-0.12, 0.58, 0), left.clone().multiplyScalar(0.9)], 0.035, rubber, 28);
      connector(right, new THREE.Vector3(1, 0.12, 0)); connector(left, new THREE.Vector3(-1, -0.12, 0));
      break;
    }
    case 'reed': {
      const blade = new THREE.Shape(); blade.moveTo(-0.12, -0.76); blade.lineTo(0.12, -0.76); blade.lineTo(0.18, 0.35); blade.quadraticCurveTo(0.14, 0.74, 0, 0.84); blade.quadraticCurveTo(-0.14, 0.74, -0.18, 0.35); blade.closePath();
      mesh(new THREE.ExtrudeGeometry(blade, { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 3 }), maple);
      box(0.27, 0.08, 0.11, dark, 0, -0.51, 0.08, 0.025); box(0.29, 0.025, 0.12, nickel, 0, -0.47, 0.09);
      break;
    }
    case 'microphone': {
      cylinder(0.105, 1.2, dark, 0, -0.34, 0, 24); cylinder(0.17, 0.42, nickel, 0, 0.43, 0, 24);
      sphere(0.18, nickel, 0, 0.67, 0); sphere(0.14, dark, 0, 0.76, 0.055);
      for (let i = -3; i <= 3; i++) { const y = 0.55 + i * 0.055; box(0.27, 0.012, 0.012, nickel, 0, y, 0.15); }
      for (let i = 0; i < 5; i++) { box(0.012, 0.32, 0.012, nickel, -0.08 + i * 0.04, 0.7, 0.14); }
      cylinder(0.08, 0.22, black, 0, -0.98, 0, 20); for (let i = 0; i < 3; i++) disc(0.027, 0.018, nickel, -0.04 + i * 0.04, -1.1, 0.07);
      break;
    }
    case 'studio-monitor': audioCabinet(1.24, 1.82, 0.78, 0.4, 0.16); break;
    case 'speaker': audioCabinet(1.56, 2.5, 0.84, 0.56, 0.18); box(0.17, 0.04, 0.1, brass, 0, -1.3, 0); break;
    case 'dj-controller': {
      box(2.85, 0.24, 1.52, dark, 0, 0, 0, 0.08);
      for (const x of [-0.86, 0.86]) { disc(0.48, 0.11, rubber, x, 0.18, 0.02); ring(0.39, 0.025, nickel, x, 0.25, 0.08); disc(0.32, 0.045, dark, x, 0.25, 0.08); disc(0.075, 0.04, brass, x, 0.285, 0.11); }
      box(0.4, 0.24, 0.035, screen, 0, 0.14, 0.75, 0.035);
      for (let i = 0; i < 4; i++) { const x = -0.26 + i * 0.17; box(0.055, 0.2, 0.035, nickel, x, 0.15, 0.1); box(0.07, 0.04, 0.08, ivory, x, 0.25, 0.1, 0.01); }
      for (let i = 0; i < 8; i++) { const x = -0.66 + i * 0.19; disc(0.055, 0.06, brass, x, 0.19, -0.56); disc(0.025, 0.065, black, x, 0.21, -0.56); }
      for (const x of [-1.22, 1.22]) { ring(0.06, 0.012, nickel, x, 0.02, 0.76); disc(0.04, 0.04, black, x, 0.02, 0.77); }
      break;
    }
    case 'headphones': {
      const arc = new THREE.EllipseCurve(0, 0, 0.8, 0.95, Math.PI, 0, false, 0);
      line(arc.getPoints(48).map((point) => new THREE.Vector3(point.x, point.y + 0.35, 0)), 0.085, dark, 64);
      for (const x of [-0.8, 0.8]) {
        box(0.18, 0.31, 0.14, nickel, x, -0.22, 0);
        box(0.34, 0.62, 0.36, dark, x, -0.5, 0, 0.1);
        box(0.25, 0.47, 0.16, rubber, x, -0.5, 0.2, 0.08);
        ring(0.16, 0.018, brass, x, -0.5, 0.29);
      }
      box(0.46, 0.13, 0.12, rubber, 0, 1.1, 0, 0.06); break;
    }
    case 'audio-interface': {
      box(2.35, 1.2, 0.72, dark, 0, 0, 0, 0.1);
      box(0.42, 0.2, 0.035, screen, -0.78, 0.36, 0.39, 0.025);
      for (let i = 0; i < 2; i++) {
        const x = -0.72 + i * 0.54; ring(0.18, 0.027, brass, x, -0.08, 0.42); disc(0.13, 0.09, black, x, -0.08, 0.43); disc(0.085, 0.11, nickel, x, -0.08, 0.48);
        for (let n = 0; n < 3; n++) sphere(0.018, nickel, x - 0.05 + n * 0.05, -0.08, 0.54);
      }
      for (let i = 0; i < 3; i++) { disc(0.095, 0.06, nickel, 0.18 + i * 0.36, 0.33, 0.42); disc(0.045, 0.07, black, 0.18 + i * 0.36, 0.33, 0.46); }
      for (let i = 0; i < 4; i++) { ring(0.055, 0.012, brass, -0.6 + i * 0.38, -0.38, -0.39); disc(0.035, 0.025, black, -0.6 + i * 0.38, -0.38, -0.4); }
      box(0.25, 0.08, 0.1, brass, 0.78, -0.38, 0.4, 0.02); break;
    }
    default: throw new Error(`No existe geometría para ${ref}`);
  }
  group.traverse((child) => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
  return group;
}
