'use client';

import { useEffect, useRef, useState } from 'react';
import { createProductModel } from '@/lib/procedural-models';

type Props = { modelRef: string; name: string; visual: string; icon: string };

export default function ModelViewer({ modelRef, name, visual, icon }: Props) {
  const host = useRef<HTMLDivElement>(null); const modelSlot = useRef<import('three').Group | null>(null);
  const cameraRef = useRef<import('three').PerspectiveCamera | null>(null); const rendererRef = useRef<import('three').WebGLRenderer | null>(null); const sceneRef = useRef<import('three').Scene | null>(null);
  const visibleRef = useRef(true);
  const [fallback, setFallback] = useState(false); const [zoom, setZoom] = useState(4.1); const [angle, setAngle] = useState({ x: 0.12, y: 0.55 });
  useEffect(() => {
    let stopped = false; let visible = true; let renderer: import('three').WebGLRenderer | undefined;
    let observer: IntersectionObserver | undefined; let resize: ResizeObserver | undefined;
    let keyboardHandler: ((event: KeyboardEvent) => void) | undefined;
    let scene: import('three').Scene | undefined; let camera: import('three').PerspectiveCamera | undefined;
    let model: import('three').Group | undefined;
    const mount = host.current; if (!mount) return;
    const paint = () => { if (!stopped && visible && renderer && scene && camera) renderer.render(scene, camera); };
    void import('three').then((THREE) => {
      if (stopped) return;
      try {
        scene = new THREE.Scene(); scene.background = new THREE.Color('#e8ebe2');
        camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40); camera.position.set(0, 0.15, 4.1);
        scene.add(new THREE.HemisphereLight('#fffdf4', '#89978b', 2.1));
        const key = new THREE.DirectionalLight('#fff3df', 2.4); key.position.set(3, 5, 6); scene.add(key);
        const fill = new THREE.DirectionalLight('#c4d4c8', 1.2); fill.position.set(-4, 2, -2); scene.add(fill);
        const floor = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), new THREE.MeshStandardMaterial({ color: '#dce2d6', roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.25; scene.add(floor);
        model = createProductModel(modelRef); model.rotation.set(0.12, 0.55, 0); scene.add(model); modelSlot.current = model; cameraRef.current = camera; sceneRef.current = scene;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setSize(Math.min(mount.clientWidth, 760), Math.min(mount.clientHeight, 560), false); renderer.shadowMap.enabled = false; rendererRef.current = renderer;
        mount.replaceChildren(renderer.domElement); renderer.domElement.setAttribute('aria-label', `Modelo 3D ilustrativo de ${name}. Arrastra para girarlo.`); renderer.domElement.tabIndex = 0;
        keyboardHandler = (event: KeyboardEvent) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); setAngle((current) => ({ x: Math.max(-1.15, Math.min(1.15, current.x + (event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0))), y: current.y + (event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0) })); } if (event.key === '+' || event.key === '=') setZoom((value) => Math.max(2.3, value - 0.25)); if (event.key === '-' || event.key === '_') setZoom((value) => Math.min(6.5, value + 0.25)); if (event.key.toLowerCase() === 'r') { setZoom(4.1); setAngle({ x: 0.12, y: 0.55 }); } };
        renderer.domElement.addEventListener('keydown', keyboardHandler);
        observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibleRef.current = visible; if (visible) paint(); }, { threshold: 0.03 }); observer.observe(mount);
        resize = new ResizeObserver(() => { if (!renderer || !camera || !mount) return; const w = Math.min(mount.clientWidth, 760); const h = Math.min(mount.clientHeight, 560); renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); paint(); }); resize.observe(mount);
        paint();
      } catch { if (!stopped) { renderer?.dispose(); renderer = undefined; setFallback(true); } }
    }).catch(() => { if (!stopped) setFallback(true); });
    return () => { stopped = true; observer?.disconnect(); resize?.disconnect();
      scene?.traverse((child) => { const mesh = child as import('three').Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) { const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]; materials.forEach((mat) => mat.dispose()); } });
      if (keyboardHandler) renderer?.domElement.removeEventListener('keydown', keyboardHandler);
      renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove(); modelSlot.current = null; cameraRef.current = null; rendererRef.current = null; sceneRef.current = null;
    };
  }, [modelRef, name]);

  useEffect(() => { if (!modelSlot.current) return; modelSlot.current.rotation.x = angle.x; modelSlot.current.rotation.y = angle.y; if (visibleRef.current && rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current); }, [angle]);
  useEffect(() => { const camera = cameraRef.current; if (camera) camera.position.z = zoom; if (visibleRef.current && rendererRef.current && sceneRef.current && camera) rendererRef.current.render(sceneRef.current, camera); }, [zoom]);

  const pointer = useRef<{ x: number; y: number } | null>(null);
  return <section className="viewer-shell" aria-label="Estudio 3D del producto">
    <div ref={host} className="model-canvas" onPointerDown={(event) => { pointer.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!pointer.current) return; const dx = event.clientX - pointer.current.x; const dy = event.clientY - pointer.current.y; pointer.current = { x: event.clientX, y: event.clientY }; setAngle((current) => ({ x: Math.max(-1.15, Math.min(1.15, current.x + dy * 0.008)), y: current.y + dx * 0.01 })); }} onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }}>
      {fallback && <div className="model-fallback" style={{ background: visual }} role="img" aria-label={`Vista alternativa ilustrada de ${name}`}><span>{icon}</span><p>Vista 3D no disponible en este navegador. Esta ilustración alternativa no es un modelo 3D.</p></div>}
    </div>
    <div className="viewer-controls" aria-label="Controles del visor">
      <button type="button" className="button button-outline button-small" aria-label="Girar hacia la izquierda" onClick={() => setAngle((v) => ({ ...v, y: v.y - 0.22 }))}>↶ Girar</button>
      <button type="button" className="button button-outline button-small" aria-label="Girar hacia la derecha" onClick={() => setAngle((v) => ({ ...v, y: v.y + 0.22 }))}>↷ Girar</button>
      <button type="button" className="button button-outline button-small" aria-label="Elevar vista" onClick={() => setAngle((v) => ({ ...v, x: Math.max(-1.15, v.x - 0.16) }))}>↑ Elevar</button>
      <button type="button" className="button button-outline button-small" aria-label="Bajar vista" onClick={() => setAngle((v) => ({ ...v, x: Math.min(1.15, v.x + 0.16) }))}>↓ Bajar</button>
      <button type="button" className="button button-outline button-small" aria-label="Alejar" onClick={() => setZoom((v) => Math.min(6.5, v + 0.3))}>− Zoom</button>
      <button type="button" className="button button-outline button-small" aria-label="Acercar" onClick={() => setZoom((v) => Math.max(2.3, v - 0.3))}>+ Zoom</button>
      <button type="button" className="button button-outline button-small" onClick={() => { setAngle({ x: 0.12, y: 0.55 }); setZoom(4.1); if (cameraRef.current) cameraRef.current.position.z = 4.1; }}>Restablecer vista</button>
    </div>
    <p className="micro-copy">Arrastra con ratón o tacto; con el visor enfocado usa flechas, +/− y R. Modelo procedural ilustrativo, no reproducción exacta del producto.</p>
  </section>;
}
