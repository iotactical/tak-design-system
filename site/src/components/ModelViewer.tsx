// rtmx:req REQ-XW-072
// rtmx:req REQ-XW-073
import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './ModelViewer.module.css';
import { Spinner } from './Spinner';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ModelViewerProps {
  modelPath: string;
  width?: number;
  height?: number;
  autoRotate?: boolean;
}

export interface ModelDimensions {
  x: number;
  y: number;
  z: number;
}

// DAE files declare meter="1.000000" -- 1 model unit = 1 meter
const M_TO_FT = 3.28084;

// Axis colors: X=red, Y=green, Z=blue
const AXIS_X = 0xFF4444;
const AXIS_Y = 0x44CC44;
const AXIS_Z = 0x4488FF;
const AXIS_X_CSS = '#FF4444';
const AXIS_Y_CSS = '#44CC44';
const AXIS_Z_CSS = '#4488FF';

function fmtDim(meters: number, unit: 'ft' | 'm'): string {
  const val = unit === 'ft' ? meters * M_TO_FT : meters;
  return val < 10 ? val.toFixed(1) : val.toFixed(0);
}

// ── Collada loader with file:// fix ────────────────────────────────────────

function loadCollada(
  modelPath: string,
  manager: THREE.LoadingManager,
  onLoad: (collada: { scene: THREE.Group }) => void,
  onError: () => void,
) {
  const modelDir = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
  fetch(modelPath)
    .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.text(); })
    .then((xml) => {
      const fixed = xml.replace(/<init_from>file:\/\//g, '<init_from>');
      const loader = new ColladaLoader(manager);
      loader.setResourcePath(modelDir);
      onLoad(loader.parse(fixed, modelDir));
    })
    .catch(() => onError());
}

// ── Scene helpers ──────────────────────────────────────────────────────────

function buildScene(w: number, h: number) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
  camera.position.set(3, 3, 3);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(5, 10, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-5, 5, -5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(0, -5, 5);
  scene.add(rim);
  return { scene, camera };
}

function fixMaterials(model: THREE.Object3D) {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (let i = 0; i < mats.length; i++) {
      let mat = mats[i] as THREE.Material;
      if (!mat) continue;
      if (mat instanceof THREE.MeshBasicMaterial) {
        const newMat = new THREE.MeshPhongMaterial({
          color: (mat as THREE.MeshBasicMaterial).color.clone(),
          map: (mat as THREE.MeshBasicMaterial).map,
          side: mat.side,
          transparent: mat.transparent,
          opacity: mat.opacity,
        });
        mat.dispose();
        mat = newMat;
        if (Array.isArray(child.material)) child.material[i] = mat;
        else child.material = mat;
      }
      const phong = mat as THREE.MeshPhongMaterial | THREE.MeshLambertMaterial;
      if (phong.map && phong.map.format === THREE.RGBAFormat) {
        phong.transparent = true;
        phong.alphaTest = 0.1;
        phong.side = THREE.DoubleSide;
      }
      if (!phong.map) {
        const c = phong.color;
        if (c && (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 0.1) {
          c.setHex(0x666666);
        }
      }
    }
  });
}

function fitCamera(camera: THREE.PerspectiveCamera, model: THREE.Object3D, extraMargin = 1.0) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const distance = (maxDim / (2 * Math.tan(fov / 2))) * extraMargin;
  camera.position.set(
    center.x + distance,
    center.y + distance * 0.6,
    center.z + distance,
  );
  camera.lookAt(center);
  camera.updateMatrixWorld();
  return { center, size, box };
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry?.dispose();
      if (object.material) {
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach((m: THREE.Material) => m.dispose());
      }
    }
  });
}

// ── Bounding box + grid (3D only, no text labels) ─────────────────────────

function createBoundingBoxHelper(box: THREE.Box3, size: THREE.Vector3) {
  const group = new THREE.Group();
  const min = box.min;
  const max = box.max;
  const cx = (min.x + max.x) / 2;
  const cz = (min.z + max.z) / 2;

  // Draw box edges colored per axis direction
  const makeLine = (a: THREE.Vector3, b: THREE.Vector3, color: number) => {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    group.add(new THREE.Line(geo, mat));
  };

  // X-axis edges (red) -- 4 edges parallel to X
  makeLine(new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(max.x, min.y, min.z), AXIS_X);
  makeLine(new THREE.Vector3(min.x, max.y, min.z), new THREE.Vector3(max.x, max.y, min.z), AXIS_X);
  makeLine(new THREE.Vector3(min.x, min.y, max.z), new THREE.Vector3(max.x, min.y, max.z), AXIS_X);
  makeLine(new THREE.Vector3(min.x, max.y, max.z), new THREE.Vector3(max.x, max.y, max.z), AXIS_X);

  // Y-axis edges (green) -- 4 edges parallel to Y
  makeLine(new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(min.x, max.y, min.z), AXIS_Y);
  makeLine(new THREE.Vector3(max.x, min.y, min.z), new THREE.Vector3(max.x, max.y, min.z), AXIS_Y);
  makeLine(new THREE.Vector3(min.x, min.y, max.z), new THREE.Vector3(min.x, max.y, max.z), AXIS_Y);
  makeLine(new THREE.Vector3(max.x, min.y, max.z), new THREE.Vector3(max.x, max.y, max.z), AXIS_Y);

  // Z-axis edges (blue) -- 4 edges parallel to Z
  makeLine(new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(min.x, min.y, max.z), AXIS_Z);
  makeLine(new THREE.Vector3(max.x, min.y, min.z), new THREE.Vector3(max.x, min.y, max.z), AXIS_Z);
  makeLine(new THREE.Vector3(min.x, max.y, min.z), new THREE.Vector3(min.x, max.y, max.z), AXIS_Z);
  makeLine(new THREE.Vector3(max.x, max.y, min.z), new THREE.Vector3(max.x, max.y, max.z), AXIS_Z);

  // Ground grid plane at box bottom
  const gridPad = 1.3;
  const gridW = size.x * gridPad;
  const gridD = size.z * gridPad;
  const gridGeo = new THREE.PlaneGeometry(gridW, gridD);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x333333, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
  });
  const gridPlane = new THREE.Mesh(gridGeo, gridMat);
  gridPlane.rotation.x = -Math.PI / 2;
  gridPlane.position.set(cx, min.y - 0.01, cz);
  group.add(gridPlane);

  // Grid lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.5 });
  const gy = min.y - 0.005;
  const halfW = gridW / 2;
  const halfD = gridD / 2;
  const step = Math.max(size.x, size.z) / 8;
  for (let off = -halfW; off <= halfW + 0.01; off += step) {
    const pts = [new THREE.Vector3(cx + off, gy, cz - halfD), new THREE.Vector3(cx + off, gy, cz + halfD)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  for (let off = -halfD; off <= halfD + 0.01; off += step) {
    const pts = [new THREE.Vector3(cx - halfW, gy, cz + off), new THREE.Vector3(cx + halfW, gy, cz + off)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  return group;
}

/** Create a flat shadow silhouette projected down onto the grid plane */
function createShadowProjection(model: THREE.Object3D, box: THREE.Box3) {
  const group = new THREE.Group();
  const groundY = box.min.y - 0.005;

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!child.geometry) return;
    // Skip flat disc-like meshes (e.g. rotor/propeller quads): extremely thin
    // in one axis relative to the other two, indicating a textured plane
    const mBox = new THREE.Box3().setFromObject(child);
    const mSize = mBox.getSize(new THREE.Vector3());
    const dims = [mSize.x, mSize.y, mSize.z].sort((a, b) => a - b);
    if (dims[2] > 0.1 && dims[0] / dims[2] < 0.01) return;
    const gBox = new THREE.Box3().setFromObject(child);
    const gSize = gBox.getSize(new THREE.Vector3());
    if (gSize.length() < 0.01) return;

    const geo = child.geometry.clone();
    geo.applyMatrix4(child.matrixWorld);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, groundY);
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.35,
      side: THREE.DoubleSide, depthWrite: false,
    });
    group.add(new THREE.Mesh(geo, shadowMat));
  });

  return group;
}

// ── Thumbnail rendering ────────────────────────────────────────────────────

let sharedRenderer: THREE.WebGLRenderer | null = null;
function getSharedRenderer(w: number, h: number): THREE.WebGLRenderer | null {
  if (sharedRenderer) { sharedRenderer.setSize(w, h); return sharedRenderer; }
  try {
    sharedRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    sharedRenderer.setSize(w, h);
    return sharedRenderer;
  } catch { return null; }
}

type RenderResult = { dataUrl: string; dims: ModelDimensions } | null;
type RenderJob = { resolve: (v: RenderResult) => void; run: () => RenderResult };
const renderQueue: RenderJob[] = [];
let rendering = false;

function enqueueRender(run: RenderJob['run']): Promise<RenderResult> {
  return new Promise((resolve) => {
    renderQueue.push({ resolve, run });
    processQueue();
  });
}

function processQueue() {
  if (rendering || renderQueue.length === 0) return;
  rendering = true;
  requestAnimationFrame(() => {
    const job = renderQueue.shift();
    if (job) job.resolve(job.run());
    rendering = false;
    if (renderQueue.length > 0) processQueue();
  });
}

// ── ModelThumbnail ─────────────────────────────────────────────────────────

export function ModelThumbnail({
  modelPath,
  width = 160,
  height = 120,
  onClick,
}: {
  modelPath: string;
  width?: number;
  height?: number;
  onClick?: (dims: ModelDimensions) => void;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<ModelDimensions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let rendered = false;
    const mgr = new THREE.LoadingManager();

    loadCollada(modelPath, mgr, (collada) => {
      if (cancelled) return;
      const model = collada.scene;
      fixMaterials(model);

      const doRender = () => {
        if (rendered || cancelled) return;
        rendered = true;
        enqueueRender(() => {
          const renderer = getSharedRenderer(width, height);
          if (!renderer) return null;
          const { scene, camera } = buildScene(width, height);
          scene.add(model);
          const { size } = fitCamera(camera, model);
          renderer.render(scene, camera);
          const dataUrl = renderer.domElement.toDataURL('image/png');
          disposeScene(scene);
          return { dataUrl, dims: { x: size.x, y: size.y, z: size.z } };
        }).then((result) => {
          if (!cancelled && result) {
            setThumbnailUrl(result.dataUrl);
            setDims(result.dims);
            setLoading(false);
          }
        });
      };

      mgr.onLoad = doRender;
      mgr.onError = () => doRender();
      requestAnimationFrame(() => { if (!cancelled) doRender(); });
    }, () => {
      if (!cancelled) { setError('Failed to load'); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, [modelPath, width, height]);

  if (error) {
    return (
      <div className={styles.container} style={{ width, height }}>
        <span className={styles.fallback}>{error}</span>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{ width, height, cursor: onClick ? 'pointer' : undefined }}
      onClick={dims && onClick ? () => onClick(dims) : undefined}
    >
      {loading && <div className={styles.loading}><Spinner size={16} /></div>}
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt="3D model" style={{ width, height, display: 'block' }} />
      )}
    </div>
  );
}

// ── ModelViewerModal ───────────────────────────────────────────────────────

export function ModelViewerModal({
  modelPath,
  modelName,
  dimensions,
  onClose,
}: {
  modelPath: string;
  modelName: string;
  dimensions: ModelDimensions;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');
  const toggleUnit = useCallback(() => {
    setUnit((u) => u === 'ft' ? 'm' : 'ft');
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Live renderer
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch { return; }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const { scene, camera } = buildScene(w, h);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 2.0;

    loadCollada(modelPath, new THREE.LoadingManager(), (collada) => {
      const model = collada.scene;
      fixMaterials(model);
      scene.add(model);
      const { center, size, box } = fitCamera(camera, model, 1.05);
      controls.target.copy(center);
      controls.update();

      const group = createBoundingBoxHelper(box, size);
      const shadow = createShadowProjection(model, box);
      group.add(shadow);
      scene.add(group);

    }, () => {});

    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrameId);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);

    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]);

  const unitStr = unit === 'ft' ? 'ft' : 'm';

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{modelName}</span>
          <div className={styles.modalControls}>
            <button className={styles.unitToggle} onClick={toggleUnit}>
              {unitStr}
            </button>
            <button className={styles.modalClose} onClick={onClose}>X</button>
          </div>
        </div>
        <div className={styles.modalCanvasWrap}>
          <div ref={canvasRef} className={styles.modalCanvas} />
          {/* Fixed overlay -- always visible regardless of zoom/rotation */}
          <div className={styles.dimOverlay}>
            <span className={styles.dimLabel} style={{ color: AXIS_X_CSS }}>
              L: {fmtDim(dimensions.x, unit)} {unitStr}
            </span>
            <span className={styles.dimLabel} style={{ color: AXIS_Y_CSS }}>
              H: {fmtDim(dimensions.y, unit)} {unitStr}
            </span>
            <span className={styles.dimLabel} style={{ color: AXIS_Z_CSS }}>
              W: {fmtDim(dimensions.z, unit)} {unitStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Legacy export -- static thumbnail only */
export function ModelViewer(props: ModelViewerProps) {
  return <ModelThumbnail modelPath={props.modelPath} width={props.width} height={props.height} />;
}

export default ModelViewer;
