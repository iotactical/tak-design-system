// rtmx:req REQ-XW-072
// rtmx:req REQ-XW-073
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './ModelViewer.module.css';

export interface ModelViewerProps {
  /** Path to the .dae file, relative to public/ */
  modelPath: string;
  /** Canvas width in pixels */
  width?: number;
  /** Canvas height in pixels */
  height?: number;
  /** Enable automatic rotation */
  autoRotate?: boolean;
}

export function ModelViewer({
  modelPath,
  width = 200,
  height = 150,
  autoRotate = true,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for WebGL support
    let canvas: HTMLCanvasElement;
    try {
      canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL is not available');
        setLoading(false);
        return;
      }
    } catch {
      setError('WebGL is not available');
      setLoading(false);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3);

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setError('WebGL renderer could not be created');
      setLoading(false);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;

    // Load model
    const loader = new ColladaLoader();
    loader.load(
      modelPath,
      (collada) => {
        const model = collada.scene;
        scene.add(model);

        // Auto-fit camera to model bounds
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const distance = maxDim / (2 * Math.tan(fov / 2));

        camera.position.set(
          center.x + distance,
          center.y + distance * 0.6,
          center.z + distance,
        );
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();

        setLoading(false);
      },
      undefined,
      (_err) => {
        setError('Failed to load model');
        setLoading(false);
      },
    );

    // Animation loop
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      controls.dispose();

      // Dispose all geometries and materials in the scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: THREE.Material) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, width, height, autoRotate]);

  if (error) {
    return (
      <div className={styles.container} style={{ width, height }}>
        <span className={styles.fallback}>{error}</span>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ width, height }}>
      {loading && <span className={styles.loading}>Loading model...</span>}
      <div ref={containerRef} className={styles.canvas} />
    </div>
  );
}

export default ModelViewer;
