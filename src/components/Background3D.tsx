import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// --- Shaders ---
const vertexShader = `
  precision mediump float;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  attribute vec2 uv;
  attribute mat4 instanceMatrix;
  
  varying vec2 vUv;
  varying float vHeight;
  
  uniform float uTime;
  uniform float uWindComplexity;

  void main() {
      vUv = uv;
      vHeight = position.y;
      
      vec3 worldPos = instanceMatrix[3].xyz;
      
      float windStrength = uWindComplexity * 0.1;
      float windEffect = sin(uTime * 1.5 + worldPos.x * 0.5) * windStrength;
      
      float heightFactor = pow(vHeight, 2.0);
      
      vec3 localPos = position;
      if (uWindComplexity > 0.1) {
          localPos.x += windEffect * heightFactor;
      }
      
      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(localPos, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  
  varying vec2 vUv;
  varying float vHeight;
  
  uniform vec3 uFogColor;
  uniform float uWindComplexity;

  void main() {
      vec3 colorNear = vec3(0.914, 0.769, 0.416);
      vec3 colorFar = vec3(0.518, 0.663, 0.361);
      
      // Calculate depth approximation for fog
      // Since we don't have access to gl_FragCoord.z / gl_FragCoord.w in the same way in all environments
      // and mediump might lose precision, simple fog is often safer or use a varying for depth.
      // However, for this visual style, we will keep it simple.
      
      float depth = gl_FragCoord.z / gl_FragCoord.w;
      float mixFactor = smoothstep(5.0, 60.0, depth);
      
      vec3 baseColor = mix(colorNear, colorFar, mixFactor);
      
      vec3 finalColor = baseColor;
      if (uWindComplexity > 0.5) {
          finalColor *= (0.6 + 0.4 * vHeight);
          finalColor *= 0.5 + 0.5 * vHeight;
      }
      
      float fogDistance = uWindComplexity > 0.5 ? 90.0 : 60.0;
      float fogFactor = smoothstep(15.0, fogDistance, depth);
      
      gl_FragColor = vec4(mix(finalColor, uFogColor, fogFactor), 1.0);
  }
`;

// --- Configuration & Types ---
type PerformanceTier = 'high' | 'medium' | 'low' | 'minimal';

interface PerformanceConfig {
    grassCount: number;
    cloudCount: number;
    pixelRatio: number;
    antialiasing: boolean;
    lodEnabled: boolean;
    windComplexity: number;
    renderDistance: number;
}

const PERFORMANCE_CONFIGS: Record<PerformanceTier, PerformanceConfig> = {
    high: {
        grassCount: 450000,
        cloudCount: 4,
        pixelRatio: 2, // Will be clamped by device pixel ratio later
        antialiasing: true,
        lodEnabled: true,
        windComplexity: 1.0,
        renderDistance: 90,
    },
    medium: {
        grassCount: 100000,
        cloudCount: 3,
        pixelRatio: 1.5,
        antialiasing: true,
        lodEnabled: true,
        windComplexity: 0.7,
        renderDistance: 60,
    },
    low: {
        grassCount: 50000,
        cloudCount: 2,
        pixelRatio: 1,
        antialiasing: false,
        lodEnabled: false,
        windComplexity: 0.5,
        renderDistance: 40,
    },
    minimal: {
        grassCount: 20000,
        cloudCount: 1,
        pixelRatio: 1,
        antialiasing: false,
        lodEnabled: false,
        windComplexity: 0.3,
        renderDistance: 30,
    },
};

// --- Utils ---
const getPerformanceTier = (): PerformanceTier => {
    // Simple heuristic based on hardware concurrency and device memory
    // This runs on client side
    if (typeof navigator === 'undefined') return 'medium';

    const concurrency = navigator.hardwareConcurrency || 4;
    // @ts-ignore
    const memory = navigator.deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

    let score = 0;
    if (concurrency >= 8) score += 3;
    else if (concurrency >= 4) score += 2;
    else score += 1;

    if (memory >= 8) score += 3;
    else if (memory >= 4) score += 2;
    else score += 1;

    if (isMobile) score -= 2;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
};

// --- Components ---

const GrassField = ({ config }: { config: PerformanceConfig }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.RawShaderMaterial>(null);

    // Custom geometry
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(0.08, 1.4, 1, 4);
        geo.translate(0, 0.7, 0);
        // Compute bounding sphere for the *entire* field to prevent culling issues
        // Since we know the rangeX and rangeZ from generation
        const rangeX = config.lodEnabled ? 300 : 150;
        const rangeZ = config.lodEnabled ? 140 : 80;
        geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), Math.max(rangeX, rangeZ) / 1.5);
        return geo;
    }, [config.lodEnabled]);

    // Generate instances
    const instanceData = useMemo(() => {
        const count = config.grassCount;
        const rangeX = config.lodEnabled ? 300 : 150;
        const rangeZ = config.lodEnabled ? 140 : 80;

        const matrices = new Float32Array(count * 16);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * rangeX;
            const z = Math.random() * -rangeZ + 20;

            dummy.position.set(x, 0, z);
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.scale.setScalar(0.5 + Math.random() * 1.5);
            dummy.updateMatrix();

            matrices.set(dummy.matrix.elements, i * 16);
        }
        return matrices;
    }, [config.grassCount, config.lodEnabled]);

    // Apply matrices
    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.instanceMatrix.needsUpdate = true;
            meshRef.current.instanceMatrix.array.set(instanceData);
            meshRef.current.instanceMatrix.needsUpdate = true;

            // Explicitly compute bouding sphere on the instanced mesh geometry if R3F didn't pick up the previous change
            if (meshRef.current.geometry) {
                const rangeX = config.lodEnabled ? 300 : 150;
                const rangeZ = config.lodEnabled ? 140 : 80;
                meshRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -rangeZ / 2 + 10), Math.max(rangeX, rangeZ));
            }
        }
    }, [instanceData, config]);

    // Uniforms
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(0x84a95c) },
        uWindComplexity: { value: config.windComplexity },
    }), [config.windComplexity]);

    // Update loop
    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, undefined, config.grassCount]}
            frustumCulled={true}
        >
            <rawShaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                side={THREE.DoubleSide}
                transparent={false}
                depthWrite={true}
            />
        </instancedMesh>
    );
};

const CameraController = ({ config }: { config: PerformanceConfig }) => {
    const { camera } = useThree();
    const scrollRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollMax = document.documentElement.scrollHeight - window.innerHeight || 1;
            scrollRef.current = window.scrollY / scrollMax;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useFrame(() => {
        const scrollPercent = scrollRef.current;

        // Linear interpolation for smoother movement could be added here if needed, 
        // but simple mapping ensures it feels responsive.
        camera.position.y = 1.8 + scrollPercent * 6;
        camera.position.z = 12 - scrollPercent * 4;
    });

    return null;
}

export default function Background3D() {
    // Determine tier securely
    const [tier, setTier] = useState<PerformanceTier>('medium');

    useEffect(() => {
        setTier(getPerformanceTier());
    }, []);

    const config = PERFORMANCE_CONFIGS[tier];
    const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, config.pixelRatio) : 1;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none'
        }}>
            <Canvas
                gl={{
                    antialias: config.antialiasing,
                    alpha: true,
                    powerPreference: 'high-performance',
                    toneMapping: config.grassCount > 50000 ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping,
                }}
                dpr={pixelRatio}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                <PerspectiveCamera
                    makeDefault
                    fov={60}
                    near={0.1}
                    far={config.renderDistance}
                    position={[0, 1.8, 12]}
                    onUpdate={c => c.lookAt(0, 2.5, 0)}
                />

                <fog attach="fog" args={[0x84a95c, 15, config.renderDistance]} />

                <GrassField config={config} />
                <CameraController config={config} />

            </Canvas>
        </div>
    );
}
