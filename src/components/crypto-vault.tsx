"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

function Vault() {
    const vaultRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (vaultRef.current) {
            vaultRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            vaultRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
        if (innerRef.current) {
            innerRef.current.rotation.y = -state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh ref={vaultRef}>
                    <boxGeometry args={[2.5, 2.5, 2.5]} />
                    <MeshTransmissionMaterial
                        backside
                        samples={4}
                        thickness={1.5}
                        chromaticAberration={0.05}
                        anisotropy={0.2}
                        distortion={0.1}
                        distortionScale={0.5}
                        temporalDistortion={0.2}
                        ior={1.5}
                        color="#ffffff"
                        transmission={1}
                        roughness={0.1}
                    />
                </mesh>
                <mesh ref={innerRef}>
                    <icosahedronGeometry args={[1.2, 0]} />
                    <meshStandardMaterial color="#10B981" wireframe emissive="#10B981" emissiveIntensity={1} />
                </mesh>
            </Float>
        </group>
    );
}

export function CryptoVaultScene() {
    return (
        <div className="w-full h-full relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <color attach="background" args={["transparent"]} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                
                <Vault />
                
                <Environment resolution={256}>
                    <group rotation={[-Math.PI / 4, -0.3, 0]}>
                        <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
                        <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
                        <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
                        <Lightformer type="ring" intensity={2} rotation-y={Math.PI / 2} position={[-0.1, -1, -5]} scale={10} />
                    </group>
                </Environment>
                <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#000000" />
            </Canvas>
        </div>
    );
}
