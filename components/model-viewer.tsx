'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { preloadStudioModel } from '@/lib/studio-preload';

type Props = { modelRef: string; name: string; imageSrc: string };
type Angle = { x: number; y: number };

export default function ModelViewer({ modelRef, name, imageSrc }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const modelSlot = useRef<import('three').Group | null>(null);
  const cameraRef = useRef<import('three').PerspectiveCamera | null>(null);
  const rendererRef = useRef<import('three').WebGLRenderer | null>(null);
  const sceneRef = useRef<import('three').Scene | null>(null);
  const visibleRef = useRef(true);
  const fitDistanceRef = useRef(5);
  const zoomRef = useRef(1);
  const [fallback, setFallback] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [angle, setAngle] = useState<Angle>({ x: 0.04, y: 0.18 });
  const angleRef = useRef<Angle>({ x: 0.04, y: 0.18 });
  const rotationFrame = useRef(0);
  const pendingDelta = useRef({ x: 0, y: 0 });
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const updateAngle = (next: Angle) => { angleRef.current = next; setAngle(next); };
  const resetView = useCallback(() => { updateAngle({ x: 0.04, y: 0.18 }); setZoom(1); }, []);

  useEffect(() => {
    let stopped = false; let visible = true;
    let renderer: import('three').WebGLRenderer | undefined;
    let observer: IntersectionObserver | undefined; let resize: ResizeObserver | undefined;
    let keyboardHandler: ((event: KeyboardEvent) => void) | undefined;
    let scene: import('three').Scene | undefined; let camera: import('three').PerspectiveCamera | undefined;
    let model: import('three').Group | undefined;
    const mount = host.current;
    if (!mount) return;
    const paint = () => { if (!stopped && visible && renderer && scene && camera) renderer.render(scene, camera); };

    void preloadStudioModel().then(([THREE, { createProductModel }]) => {
      if (stopped) return;
      try {
        scene = new THREE.Scene(); scene.background = new THREE.Color('#e8dfd2');
        camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
        scene.add(new THREE.HemisphereLight('#fff8ed', '#766355', 2.45));
        const key = new THREE.DirectionalLight('#fff0dc', 2.8); key.position.set(3, 5, 5); scene.add(key);
        const fill = new THREE.DirectionalLight('#dfc19a', 1.45); fill.position.set(-4, 1, -3); scene.add(fill);

        model = createProductModel(modelRef);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        model.position.sub(center); model.rotation.set(angleRef.current.x, angleRef.current.y, 0);
        modelSlot.current = model; scene.add(model);

        const shadowData = new Uint8Array(64 * 64 * 4);
        for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
          const distance = Math.hypot((x - 31.5) / 31.5, (y - 31.5) / 31.5); const index = (y * 64 + x) * 4;
          shadowData[index] = 49; shadowData[index + 1] = 38; shadowData[index + 2] = 30; shadowData[index + 3] = Math.max(0, Math.round((1 - distance) * 92));
        }
        const shadowTexture = new THREE.DataTexture(shadowData, 64, 64, THREE.RGBAFormat); shadowTexture.needsUpdate = true;
        const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(1.8, size.x * 1.45), 0.58), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
        contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = -size.y / 2 - 0.035; scene.add(contactShadow);

        cameraRef.current = camera; sceneRef.current = scene;
        const fitCamera = () => {
          if (!camera || !mount) return;
          const width = Math.max(1, mount.clientWidth); const height = Math.max(1, mount.clientHeight);
          const aspect = width / height; camera.aspect = aspect; camera.updateProjectionMatrix();
          const verticalFov = THREE.MathUtils.degToRad(camera.fov / 2);
          const frameWidth = Math.max(size.x, size.z);
          fitDistanceRef.current = Math.max(size.y, frameWidth / Math.max(0.5, aspect)) / (2 * Math.tan(verticalFov)) * 1.18;
          camera.position.set(0, 0, fitDistanceRef.current / zoomRef.current); camera.lookAt(0, 0, 0);
        };
        fitCamera();

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setSize(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight), false);
        rendererRef.current = renderer;
        mount.replaceChildren(renderer.domElement);
        renderer.domElement.setAttribute('aria-label', `Modelo 3D ilustrativo de ${name}. Arrastrá para girarlo.`);
        renderer.domElement.tabIndex = 0;

        keyboardHandler = (event: KeyboardEvent) => {
          const current = angleRef.current;
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            updateAngle({ x: Math.max(-1.15, Math.min(1.15, current.x + (event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0))), y: current.y + (event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0) });
          }
          if (event.key === '+' || event.key === '=') setZoom((value) => Math.min(1.8, value + 0.12));
          if (event.key === '-' || event.key === '_') setZoom((value) => Math.max(0.6, value - 0.12));
          if (event.key.toLowerCase() === 'r') resetView();
        };
        renderer.domElement.addEventListener('keydown', keyboardHandler);
        observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibleRef.current = visible; if (visible) paint(); }, { threshold: 0.03 });
        observer.observe(mount);
        resize = new ResizeObserver(() => { if (!renderer || !camera || !mount) return; fitCamera(); renderer.setSize(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight), false); paint(); });
        resize.observe(mount); paint();
      } catch {
        if (!stopped) { renderer?.dispose(); renderer = undefined; mount.replaceChildren(); setFallback(true); }
      }
    }).catch(() => { if (!stopped) setFallback(true); });

    return () => {
      stopped = true; if (rotationFrame.current) cancelAnimationFrame(rotationFrame.current);
      observer?.disconnect(); resize?.disconnect();
      scene?.traverse((child) => {
        const object = child as import('three').Mesh; object.geometry?.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((mat) => { const mapped = mat as import('three').Material & { map?: import('three').Texture | null }; mapped.map?.dispose(); mat.dispose(); });
        }
      });
      if (keyboardHandler) renderer?.domElement.removeEventListener('keydown', keyboardHandler);
      renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
      modelSlot.current = null; cameraRef.current = null; rendererRef.current = null; sceneRef.current = null;
    };
  }, [modelRef, name, resetView]);

  useEffect(() => {
    angleRef.current = angle;
    if (!modelSlot.current) return;
    modelSlot.current.rotation.x = angle.x; modelSlot.current.rotation.y = angle.y;
    if (visibleRef.current && rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [angle]);
  useEffect(() => {
    zoomRef.current = zoom;
    const camera = cameraRef.current; if (camera) camera.position.z = fitDistanceRef.current / zoom;
    if (visibleRef.current && rendererRef.current && sceneRef.current && camera) rendererRef.current.render(sceneRef.current, camera);
  }, [zoom]);

  return <section className="viewer-shell" aria-label="Estudio 3D del producto">
    <div ref={host} className="model-canvas"
      onPointerDown={(event) => { pointer.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => {
        if (!pointer.current) return;
        pendingDelta.current.x += event.clientX - pointer.current.x; pendingDelta.current.y += event.clientY - pointer.current.y;
        pointer.current = { x: event.clientX, y: event.clientY }; if (rotationFrame.current) return;
        rotationFrame.current = requestAnimationFrame(() => {
          rotationFrame.current = 0; const delta = pendingDelta.current; pendingDelta.current = { x: 0, y: 0 };
          const current = angleRef.current; const next = { x: Math.max(-1.15, Math.min(1.15, current.x + delta.y * 0.008)), y: current.y + delta.x * 0.01 };
          angleRef.current = next;
          if (modelSlot.current) { modelSlot.current.rotation.x = next.x; modelSlot.current.rotation.y = next.y; }
          if (visibleRef.current && rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
        });
      }}
      onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }} onPointerLeave={() => { pointer.current = null; }}>
      {fallback && <div className="model-fallback" role="img" aria-label={`Vista alternativa ilustrada de ${name}`}><Image src={imageSrc} alt="" width={960} height={640} unoptimized /><p>Vista 3D no disponible. Esta ilustración de catálogo es alternativa, no una foto ni un modelo 3D.</p></div>}
    </div>
    <div className="viewer-controls" aria-label="Controles del visor">
      <button type="button" className="button button-outline button-small" aria-label="Girar hacia la izquierda" onClick={() => updateAngle({ ...angleRef.current, y: angleRef.current.y - 0.22 })}>↶ Girar</button>
      <button type="button" className="button button-outline button-small" aria-label="Girar hacia la derecha" onClick={() => updateAngle({ ...angleRef.current, y: angleRef.current.y + 0.22 })}>↷ Girar</button>
      <button type="button" className="button button-outline button-small" aria-label="Elevar vista" onClick={() => updateAngle({ ...angleRef.current, x: Math.max(-1.15, angleRef.current.x - 0.16) })}>↑ Elevar</button>
      <button type="button" className="button button-outline button-small" aria-label="Bajar vista" onClick={() => updateAngle({ ...angleRef.current, x: Math.min(1.15, angleRef.current.x + 0.16) })}>↓ Bajar</button>
      <button type="button" className="button button-outline button-small" aria-label="Alejar" onClick={() => setZoom((value) => Math.max(0.6, value - 0.12))}>− Zoom</button>
      <button type="button" className="button button-outline button-small" aria-label="Acercar" onClick={() => setZoom((value) => Math.min(1.8, value + 0.12))}>+ Zoom</button>
      <button type="button" className="button button-outline button-small" onClick={resetView}>Restablecer vista</button>
    </div>
    <p className="micro-copy">Arrastrá con ratón o tacto; con el visor enfocado usá flechas, +/− y R. Modelo procedural ilustrativo, no es una reproducción exacta del producto.</p>
  </section>;
}
