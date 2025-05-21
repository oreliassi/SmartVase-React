import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const VaseViewer = ({ modelPath, color = '#f14a4a', width = 15, height = 15 }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Clean up resources
  const cleanupResources = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (modelRef.current) {
      if (modelRef.current.geometry) modelRef.current.geometry.dispose();
      if (modelRef.current.material) modelRef.current.material.dispose();
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
    }
  };

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous resources
    cleanupResources();

    // Container dimensions
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 0, 40);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Load the STL model
    if (modelPath) {
      loadModel(modelPath, color);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupResources();
    };
  }, [modelPath]); // Re-initialize when model path changes

  // Update model color when color prop changes
  useEffect(() => {
    if (modelRef.current && modelRef.current.material) {
      modelRef.current.material.color.set(color);
    }
  }, [color]);

  // Update model scale when width/height props change
  useEffect(() => {
    if (modelRef.current && modelRef.current.userData && 
        modelRef.current.userData.originalHeight && 
        modelRef.current.userData.originalWidth) {
      
      const scaleZ = height / modelRef.current.userData.originalHeight;
      const scaleXY = width / modelRef.current.userData.originalWidth;
      
      if (isFinite(scaleZ) && isFinite(scaleXY) && scaleZ > 0 && scaleXY > 0) {
        modelRef.current.scale.set(scaleXY, scaleXY, scaleZ);
      }
    }
  }, [width, height]);

  // Load STL model
  const loadModel = (modelPath, modelColor) => {
    if (isLoadingRef.current || !sceneRef.current) return;
    
    isLoadingRef.current = true;
    console.log('Loading model:', modelPath);
    
    const loader = new STLLoader();
    
    loader.load(
      modelPath,
      (geometry) => {
        try {
          // Remove existing model if it exists
          if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
            if (modelRef.current.geometry) modelRef.current.geometry.dispose();
            if (modelRef.current.material) modelRef.current.material.dispose();
          }
          
          // Create material
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(modelColor),
            roughness: 0.5,
            metalness: 0.1
          });
          
          // Create mesh
          const mesh = new THREE.Mesh(geometry, material);
          
          // Center the geometry
          geometry.computeBoundingBox();
          const box = geometry.boundingBox;
          const center = new THREE.Vector3();
          box.getCenter(center);
          geometry.center();
          
          // Set rotation
          mesh.rotation.set(-Math.PI / 2, 0, 0);
          
          // Calculate dimensions
          const size = new THREE.Vector3();
          box.getSize(size);
          const modelHeight = size.z;
          const modelWidth = (size.x + size.y) / 2;
          
          // Store original dimensions
          mesh.userData.originalHeight = modelHeight;
          mesh.userData.originalWidth = modelWidth;
          
          // Scale model
          const scaleZ = height / modelHeight;
          const scaleXY = width / modelWidth;
          mesh.scale.set(scaleXY, scaleXY, scaleZ);
          
          // Add to scene
          sceneRef.current.add(mesh);
          modelRef.current = mesh;
          
          // Position camera to see the model
          const updatedBox = new THREE.Box3().setFromObject(mesh);
          const updatedCenter = new THREE.Vector3();
          updatedBox.getCenter(updatedCenter);
          
          if (controlsRef.current) {
            controlsRef.current.target.copy(updatedCenter);
            controlsRef.current.update();
          }
          
          console.log('Model loaded successfully');
        } catch (error) {
          console.error('Error processing model:', error);
        } finally {
          isLoadingRef.current = false;
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error loading STL:', error);
        isLoadingRef.current = false;
      }
    );
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export default VaseViewer;