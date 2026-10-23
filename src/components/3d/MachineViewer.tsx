import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MACHINE_SUBSYSTEMS } from '../../data/mockData';
import type { MachineSubsystem, ComponentRecord } from '../../types';
import { 
  RotateCcw, 
  Layers, 
  Eye, 
  Zap, 
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface MachineViewerProps {
  isSimulatingMarking?: boolean;
  markingProgress?: number; // 0 to 1
  selectedSubsystemId?: string | null;
  onSelectSubsystem?: (subsystem: MachineSubsystem | null) => void;
  componentCategory?: ComponentRecord['category'];
  currentCoord?: { x: number; y: number; laserActive: boolean } | null;
}

export const MachineViewer: React.FC<MachineViewerProps> = ({
  isSimulatingMarking = false,
  markingProgress = 0,
  selectedSubsystemId = null,
  onSelectSubsystem,
  componentCategory = 'Elastic Rail Clip (ERC-III)',
  currentCoord = null
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(false);
  const [explodeFactor, setExplodeFactor] = useState(0); // 0 to 1
  const [cameraView, setCameraView] = useState<'perspective' | 'isometric' | 'top' | 'front'>('perspective');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [activeSubsystem, setActiveSubsystem] = useState<MachineSubsystem | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupsRef = useRef<Record<string, THREE.Group>>({});
  
  // Real-time animation refs
  const laserBeamRef = useRef<THREE.Mesh | null>(null);
  const laserSpotRef = useRef<THREE.Mesh | null>(null);
  const laserLightRef = useRef<THREE.PointLight | null>(null);
  const qrMarkRef = useRef<THREE.Mesh | null>(null);
  const gantryRef = useRef<THREE.Group | null>(null);
  const laserCarriageRef = useRef<THREE.Group | null>(null);
  const workpieceHolderRef = useRef<THREE.Group | null>(null);
  const activeWorkpieceMeshRef = useRef<THREE.Group | null>(null);
  const sparksRef = useRef<{ points: THREE.Points; velocities: THREE.Vector3[]; lives: number[] } | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const targetExplodeRef = useRef<number>(0);
  const isSimulatingRef = useRef(isSimulatingMarking);
  const markingProgressRef = useRef(markingProgress);
  const currentCoordRef = useRef(currentCoord);
  const categoryRef = useRef(componentCategory);

  useEffect(() => {
    isSimulatingRef.current = isSimulatingMarking;
    markingProgressRef.current = markingProgress;
    currentCoordRef.current = currentCoord;
  }, [isSimulatingMarking, markingProgress, currentCoord]);

  useEffect(() => {
    categoryRef.current = componentCategory;
    if (sceneRef.current && workpieceHolderRef.current) {
      updateWorkpieceGeometry(componentCategory);
    }
  }, [componentCategory]);

  useEffect(() => {
    if (selectedSubsystemId) {
      const match = MACHINE_SUBSYSTEMS.find(s => s.id === selectedSubsystemId) || null;
      setActiveSubsystem(match);
    }
  }, [selectedSubsystemId]);

  useEffect(() => {
    targetExplodeRef.current = exploded ? 1 : 0;
  }, [exploded]);

  // Function to build dynamic 3D workpiece matching the exact EQUIPMENT CATEGORY
  const updateWorkpieceGeometry = (category: ComponentRecord['category']) => {
    if (!workpieceHolderRef.current) return;
    
    // Remove existing workpiece mesh
    if (activeWorkpieceMeshRef.current) {
      workpieceHolderRef.current.remove(activeWorkpieceMeshRef.current);
    }

    const workpieceMeshGroup = new THREE.Group();
    activeWorkpieceMeshRef.current = workpieceMeshGroup;

    const railwaySteelMat = new THREE.MeshStandardMaterial({
      color: 0x3b444b,
      metalness: 0.85,
      roughness: 0.35
    });

    const nylonPolymerMat = new THREE.MeshStandardMaterial({
      color: 0x223028,
      roughness: 0.7,
      metalness: 0.1
    });

    const forgedIronMat = new THREE.MeshStandardMaterial({
      color: 0x262b32,
      metalness: 0.9,
      roughness: 0.4
    });

    const groundToeMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.95,
      roughness: 0.2
    });

    if (category === 'Elastic Rail Clip (ERC-III)') {
      // Characteristic looped spring steel rail clip
      const loopGeo1 = new THREE.TorusGeometry(0.12, 0.026, 16, 32, Math.PI * 1.35);
      const loop1 = new THREE.Mesh(loopGeo1, railwaySteelMat);
      loop1.rotation.x = Math.PI / 2;
      loop1.rotation.z = Math.PI / 4;
      loop1.position.set(-0.06, -0.06, 0);
      loop1.castShadow = true;
      workpieceMeshGroup.add(loop1);

      const loopGeo2 = new THREE.TorusGeometry(0.08, 0.024, 16, 24, Math.PI * 1.2);
      const loop2 = new THREE.Mesh(loopGeo2, railwaySteelMat);
      loop2.rotation.x = Math.PI / 2;
      loop2.rotation.z = -Math.PI / 3;
      loop2.position.set(-0.02, -0.05, 0.07);
      workpieceMeshGroup.add(loop2);

      // Ground flat toe section where the laser QR is marked
      const toeGeo = new THREE.BoxGeometry(0.18, 0.04, 0.18);
      const toe = new THREE.Mesh(toeGeo, groundToeMat);
      toe.position.set(0.05, -0.065, 0);
      toe.receiveShadow = true;
      toe.castShadow = true;
      workpieceMeshGroup.add(toe);
    } else if (category === 'GFN-66 Insulating Liner') {
      // Glass-Filled Nylon 66 rail pad with retention guide ribs
      const padGeo = new THREE.BoxGeometry(0.24, 0.04, 0.22);
      const pad = new THREE.Mesh(padGeo, nylonPolymerMat);
      pad.position.set(0.02, -0.065, 0);
      pad.castShadow = true;
      workpieceMeshGroup.add(pad);

      // Lateral retention ribs
      [-0.1, 0.14].forEach((xPos) => {
        const ribGeo = new THREE.BoxGeometry(0.02, 0.06, 0.22);
        const rib = new THREE.Mesh(ribGeo, nylonPolymerMat);
        rib.position.set(xPos, -0.05, 0);
        workpieceMeshGroup.add(rib);
      });

      // Target marking flat insert
      const insertGeo = new THREE.BoxGeometry(0.16, 0.005, 0.16);
      const insert = new THREE.Mesh(insertGeo, groundToeMat);
      insert.position.set(0.02, -0.043, 0);
      workpieceMeshGroup.add(insert);
    } else if (category === 'Metal Sleeper Fastener') {
      // Heavy forged sleeper tie plate with shoulder recess and bolt holes
      const plateGeo = new THREE.BoxGeometry(0.26, 0.05, 0.22);
      const plate = new THREE.Mesh(plateGeo, forgedIronMat);
      plate.position.set(0.02, -0.065, 0);
      plate.castShadow = true;
      workpieceMeshGroup.add(plate);

      // Elevated clamping shoulder
      const shoulderGeo = new THREE.BoxGeometry(0.07, 0.04, 0.22);
      const shoulder = new THREE.Mesh(shoulderGeo, forgedIronMat);
      shoulder.position.set(-0.08, -0.035, 0);
      workpieceMeshGroup.add(shoulder);

      // Bolt holes
      [-0.06, 0.06].forEach((zPos) => {
        const holeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 16);
        const hole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x111827 }));
        hole.position.set(0.1, -0.045, zPos);
        workpieceMeshGroup.add(hole);
      });

      const markSurface = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.16), groundToeMat);
      markSurface.position.set(0.02, -0.038, 0);
      workpieceMeshGroup.add(markSurface);
    } else if (category === 'Fishplate Bolt') {
      // High-tensile railway joint hex bolt & shank
      const hexHeadGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6);
      const hexHead = new THREE.Mesh(hexHeadGeo, groundToeMat);
      hexHead.position.set(0.02, -0.04, 0);
      hexHead.castShadow = true;
      workpieceMeshGroup.add(hexHead);

      const shankGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16);
      const shank = new THREE.Mesh(shankGeo, railwaySteelMat);
      shank.position.set(0.02, -0.16, 0);
      workpieceMeshGroup.add(shank);

      const markSurface = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.002, 16), groundToeMat);
      markSurface.position.set(0.02, -0.014, 0);
      workpieceMeshGroup.add(markSurface);
    } else {
      // Machined rectangular industrial specimen billet
      const blockGeo = new THREE.BoxGeometry(0.2, 0.06, 0.2);
      const block = new THREE.Mesh(blockGeo, groundToeMat);
      block.position.set(0.02, -0.065, 0);
      block.castShadow = true;
      workpieceMeshGroup.add(block);
    }

    workpieceHolderRef.current.add(workpieceMeshGroup);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        setWebGLError('WebGL is not supported in this browser.');
        return;
      }
    } catch (err: any) {
      setWebGLError('WebGL error: ' + err.message);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0d12);
    scene.fog = new THREE.FogExp2(0x0a0d12, 0.08);
    sceneRef.current = scene;

    // 2. Camera: Sized and positioned for a compact desktop CNC machine
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(1.4, 1.25, 1.6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.minDistance = 0.8;
    controls.maxDistance = 5.0;
    controls.target.set(0.02, 0.05, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 1.9);
    keyLight.position.set(3, 4, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x00f2fe, 1.1);
    cyanRim.position.set(-2.5, 2, -2);
    scene.add(cyanRim);

    // Glowing laser burn light (dynamic reflection on metal)
    const laserLight = new THREE.PointLight(0xff3b30, 0, 0.8);
    laserLight.position.set(0.02, 0.05, 0);
    scene.add(laserLight);
    laserLightRef.current = laserLight;

    // Floor CAD grid
    const gridHelper = new THREE.GridHelper(4, 20, 0x00f2fe, 0x1e293b);
    gridHelper.position.y = -0.32;
    scene.add(gridHelper);

    // ==========================================
    // 6. BUILD COMPACT BENCHTOP CNC LASER WORKSTATION
    // (Scaled realistically to ~350mm desktop footprint)
    // ==========================================
    const groups: Record<string, THREE.Group> = {};
    groupsRef.current = groups;

    const darkAlumMat = new THREE.MeshStandardMaterial({ color: 0x182029, metalness: 0.85, roughness: 0.25 });
    const silverAlumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const steelRodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.25 });
    const tintedShieldMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // --- A. COMPACT BASE FRAME ---
    const baseGroup = new THREE.Group();
    groups["base_frame"] = baseGroup;

    // Outer 2040 profile perimeter bed (1.1m x 0.95m virtual size)
    const bedPlates = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.95), darkAlumMat);
    bedPlates.position.set(0, -0.24, 0);
    bedPlates.castShadow = true;
    bedPlates.receiveShadow = true;
    baseGroup.add(bedPlates);

    // Slotted working bed grooves
    for (let z = -0.38; z <= 0.38; z += 0.12) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.13, 0.015, 0.06), silverAlumMat);
      slat.position.set(0, -0.21, z);
      slat.receiveShadow = true;
      baseGroup.add(slat);
    }

    // Corner rubber damping footings
    [[-0.52, -0.28, -0.42], [0.52, -0.28, -0.42], [-0.52, -0.28, 0.42], [0.52, -0.28, 0.42]].forEach(([x, y, z]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.07, 12), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      foot.position.set(x, y, z);
      baseGroup.add(foot);
    });

    scene.add(baseGroup);

    // --- B. COMPACT GANTRY & LINEAR RAILS ---
    const gantryGroup = new THREE.Group();
    groups["gantry_rails"] = gantryGroup;
    gantryRef.current = gantryGroup;

    // Dual X Guide Rods (Smooth hardened steel)
    [-0.48, 0.48].forEach((xPos) => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.0, 16), steelRodMat);
      rod.rotation.x = Math.PI / 2;
      rod.position.set(xPos, -0.17, 0);
      gantryGroup.add(rod);

      // Gantry upright carriage plates
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.14), silverAlumMat);
      plate.position.set(xPos, -0.04, 0);
      plate.castShadow = true;
      gantryGroup.add(plate);
    });

    // Transverse Y Crossbeam
    const yBeam = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.05, 0.05), darkAlumMat);
    yBeam.position.set(0, 0.08, 0);
    gantryGroup.add(yBeam);

    // Dual Y Guide Rods
    [-0.018, 0.018].forEach((yOff) => {
      const yRod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.98, 16), steelRodMat);
      yRod.rotation.z = Math.PI / 2;
      yRod.position.set(0, 0.08 + yOff, 0.035);
      gantryGroup.add(yRod);
    });

    scene.add(gantryGroup);

    // --- C. COMPACT STEPPER DRIVES & DRV8825 ---
    const stepperGroup = new THREE.Group();
    groups["stepper_drive"] = stepperGroup;

    // Compact NEMA 17 Stepper Motors (X & Y)
    const makeStepper = (x: number, y: number, z: number, rotY = 0) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.13), darkAlumMat);
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), silverAlumMat);
      face.position.z = 0.07;
      const pul = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12), brassMat);
      pul.rotation.x = Math.PI / 2;
      pul.position.z = 0.09;
      g.add(body, face, pul);
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      return g;
    };
    stepperGroup.add(makeStepper(-0.54, -0.17, -0.44)); // X-motor
    stepperGroup.add(makeStepper(0.53, 0.08, 0, Math.PI / 2)); // Y-motor
    scene.add(stepperGroup);

    // --- D. ESP32 CONTROLLER ENCLOSURE ---
    const electronicsGroup = new THREE.Group();
    groups["esp32_controller"] = electronicsGroup;

    const cBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.26), darkAlumMat);
    cBox.position.set(-0.59, -0.1, 0.15);
    electronicsGroup.add(cBox);

    // Status LEDs
    const ledMat1 = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledMat2 = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), ledMat1);
    p1.position.set(-0.49, -0.04, 0.1);
    const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), ledMat2);
    p2.position.set(-0.49, -0.04, 0.13);
    electronicsGroup.add(p1, p2);
    scene.add(electronicsGroup);

    // --- E. COMPACT LASER HEAD & FOCUS NOZZLE ---
    const laserCarriage = new THREE.Group();
    groups["laser_module"] = laserCarriage;
    laserCarriageRef.current = laserCarriage;

    // Laser heatsink cube with cooling fins
    const laserBody = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.18, 0.11), new THREE.MeshStandardMaterial({ color: 0x0b1320, metalness: 0.8, roughness: 0.2 }));
    laserBody.position.set(0, 0.14, 0);
    laserCarriage.add(laserBody);

    // Top high-RPM cooling fan grill
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), silverAlumMat);
    fan.position.set(0, 0.24, 0);
    laserCarriage.add(fan);

    // Brass laser focus nozzle
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.05, 16), brassMat);
    nozzle.rotation.x = Math.PI;
    nozzle.position.set(0, 0.025, 0);
    laserCarriage.add(nozzle);

    // Laser Beam (Cylinder from nozzle tip pointing straight down)
    const beamGeo = new THREE.CylinderGeometry(0.002, 0.008, 0.11, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.95 });
    const laserBeam = new THREE.Mesh(beamGeo, beamMat);
    laserBeam.position.set(0, -0.035, 0);
    laserBeam.visible = false;
    laserCarriage.add(laserBeam);
    laserBeamRef.current = laserBeam;

    // Focal intense burn spot (white-hot plasma center)
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    spot.position.set(0, -0.088, 0);
    spot.visible = false;
    laserCarriage.add(spot);
    laserSpotRef.current = spot;

    scene.add(laserCarriage);

    // --- F. WORKHOLDING JIG & DYNAMIC WORKPIECE ---
    const workpieceGroup = new THREE.Group();
    groups["workpiece_holder"] = workpieceGroup;
    workpieceHolderRef.current = workpieceGroup;

    // Precision Clamping Vise
    const vise = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.36), darkAlumMat);
    vise.position.set(0.02, -0.16, 0);
    vise.receiveShadow = true;
    workpieceGroup.add(vise);

    // Clamping Jaws
    const jaw1 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.05), silverAlumMat);
    jaw1.position.set(0.02, -0.11, -0.14);
    const jaw2 = jaw1.clone();
    jaw2.position.set(0.02, -0.11, 0.14);
    workpieceGroup.add(jaw1, jaw2);

    // Progressive QR Engraving patch on the workpiece
    const qrPlaneGeo = new THREE.PlaneGeometry(0.12, 0.12);
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = 128;
    qrCanvas.height = 128;
    const qrCtx = qrCanvas.getContext('2d')!;
    qrCtx.fillStyle = '#ffffff';
    qrCtx.fillRect(0, 0, 128, 128);
    // Draw initial faint QR markers
    qrCtx.fillStyle = '#111827';
    qrCtx.fillRect(10, 10, 36, 36);
    qrCtx.clearRect(18, 18, 20, 20);
    qrCtx.fillRect(22, 22, 12, 12);
    qrCtx.fillRect(82, 10, 36, 36);
    qrCtx.clearRect(90, 18, 20, 20);
    qrCtx.fillRect(94, 22, 12, 12);
    qrCtx.fillRect(10, 82, 36, 36);
    qrCtx.clearRect(18, 90, 20, 20);
    qrCtx.fillRect(22, 94, 12, 12);

    const qrTexture = new THREE.CanvasTexture(qrCanvas);
    const qrMat = new THREE.MeshBasicMaterial({ map: qrTexture, transparent: true, opacity: 0.15 });
    const qrMesh = new THREE.Mesh(qrPlaneGeo, qrMat);
    qrMesh.rotation.x = -Math.PI / 2;
    qrMesh.position.set(0.02, -0.06, 0);
    workpieceGroup.add(qrMesh);
    qrMarkRef.current = qrMesh;

    scene.add(workpieceGroup);

    // Initial workpiece geometry construction
    updateWorkpieceGeometry(categoryRef.current);

    // --- G. IEC 60825 COMPACT TINTED ENCLOSURE ---
    const enclosureGroup = new THREE.Group();
    groups["safety_enclosure"] = enclosureGroup;

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 1.0), tintedShieldMat);
    hood.position.set(0, 0.05, 0);
    enclosureGroup.add(hood);

    // Front Emergency Stop Button
    const eStopMount = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.03), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    eStopMount.position.set(0.55, -0.12, 0.5);
    const eStopBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    eStopBtn.rotation.x = Math.PI / 2;
    eStopBtn.position.set(0.55, -0.12, 0.52);
    enclosureGroup.add(eStopMount, eStopBtn);
    scene.add(enclosureGroup);

    // --- H. REALISTIC LASER SPARK PARTICLES SYSTEM ---
    const sparkCount = 45;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);
    const velocities: THREE.Vector3[] = [];
    const lives: number[] = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -0.088;
      sparkPositions[i * 3 + 2] = 0;

      // Fiery glowing yellow/orange/white colors
      const r = 1.0;
      const g = 0.5 + Math.random() * 0.5;
      const b = 0.1 + Math.random() * 0.4;
      sparkColors[i * 3] = r;
      sparkColors[i * 3 + 1] = g;
      sparkColors[i * 3 + 2] = b;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        0.3 + Math.random() * 0.6,
        (Math.random() - 0.5) * 0.6
      ));
      lives.push(Math.random());
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    sparkPoints.visible = false;
    scene.add(sparkPoints);
    sparksRef.current = { points: sparkPoints, velocities, lives };

    // --- RAYCASTING FOR INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      for (const sub of MACHINE_SUBSYSTEMS) {
        const group = groups[sub.id];
        if (!group) continue;
        const intersects = raycaster.intersectObjects(group.children, true);
        if (intersects.length > 0) {
          setActiveSubsystem(sub);
          if (onSelectSubsystem) onSelectSubsystem(sub);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 7. REAL-TIME ANIMATION & ENGRAVING LOOP
    // ==========================================
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Exploded View interpolation
      const currentExplode = explodeFactor;
      const targetExplode = targetExplodeRef.current;
      const nextExplode = THREE.MathUtils.lerp(currentExplode, targetExplode, 0.09);
      setExplodeFactor(nextExplode);

      MACHINE_SUBSYSTEMS.forEach(sub => {
        const group = groups[sub.id];
        if (group) {
          const [ox, oy, oz] = sub.explodedOffset;
          // Scale down exploded travel for compact machine
          group.position.set(ox * 0.65 * nextExplode, oy * 0.65 * nextExplode, oz * 0.65 * nextExplode);
        }
      });

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }

      const isSim = isSimulatingRef.current;
      const progress = markingProgressRef.current;
      const coord = currentCoordRef.current;

      // Real-time live motion & laser ablation
      if (isSim && laserCarriageRef.current && laserBeamRef.current && laserSpotRef.current && sparksRef.current && laserLightRef.current) {
        laserBeamRef.current.visible = true;
        laserSpotRef.current.visible = true;
        sparksRef.current.points.visible = true;

        // Synchronize physical carriage XY position with G-code or simulation progress
        let targetX = 0.02;
        let targetZ = 0.0;
        let laserIsBurning = true;

        if (coord) {
          // Map mm (0-20mm) to 3D workpiece coordinates (-0.05 to +0.05)
          targetX = 0.02 + ((coord.x - 10) / 10) * 0.05;
          targetZ = ((coord.y - 10) / 10) * 0.05;
          laserIsBurning = coord.laserActive;
        } else {
          // Smooth procedural zig-zag rastering across the workpiece QR patch
          const rasterRow = Math.floor(progress * 18);
          const rowProgress = (progress * 18) % 1;
          const sweepX = rasterRow % 2 === 0 ? (rowProgress - 0.5) * 0.09 : (0.5 - rowProgress) * 0.09;
          const sweepZ = (rasterRow / 18 - 0.5) * 0.09;
          targetX = 0.02 + sweepX;
          targetZ = sweepZ;
        }

        laserCarriageRef.current.position.x = THREE.MathUtils.lerp(laserCarriageRef.current.position.x, targetX, 0.3);
        laserCarriageRef.current.position.z = THREE.MathUtils.lerp(laserCarriageRef.current.position.z, targetZ, 0.3);

        // Spot & Beam Intensity
        const pulse = 0.8 + 0.25 * Math.sin(time * 35);
        (laserSpotRef.current.material as THREE.MeshBasicMaterial).opacity = laserIsBurning ? pulse : 0.2;
        laserBeamRef.current.visible = laserIsBurning;
        laserLightRef.current.intensity = laserIsBurning ? 1.8 + Math.random() * 0.8 : 0;
        laserLightRef.current.position.set(laserCarriageRef.current.position.x, -0.06, laserCarriageRef.current.position.z);

        // Progressive QR Darkening on the physical workpiece
        if (qrMarkRef.current) {
          const mat = qrMarkRef.current.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.min(1.0, 0.25 + progress * 0.75);
        }

        // --- UPDATE FLYING SPARKS ---
        const sparkPosAttr = sparksRef.current.points.geometry.getAttribute('position') as THREE.BufferAttribute;
        const sparkPositionsArray = sparkPosAttr.array as Float32Array;
        const vels = sparksRef.current.velocities;
        const lives = sparksRef.current.lives;
        const originX = laserCarriageRef.current.position.x;
        const originY = -0.065;
        const originZ = laserCarriageRef.current.position.z;

        if (laserIsBurning) {
          for (let i = 0; i < sparkCount; i++) {
            lives[i] -= delta * 2.8;

            if (lives[i] <= 0) {
              // Re-spawn spark at focal contact point
              sparkPositionsArray[i * 3] = originX;
              sparkPositionsArray[i * 3 + 1] = originY;
              sparkPositionsArray[i * 3 + 2] = originZ;
              vels[i].set(
                (Math.random() - 0.5) * 0.45,
                0.25 + Math.random() * 0.55,
                (Math.random() - 0.5) * 0.45
              );
              lives[i] = 0.4 + Math.random() * 0.6;
            } else {
              // Particle physics: move + gravity
              sparkPositionsArray[i * 3] += vels[i].x * delta;
              sparkPositionsArray[i * 3 + 1] += vels[i].y * delta;
              sparkPositionsArray[i * 3 + 2] += vels[i].z * delta;
              vels[i].y -= 9.8 * delta * 0.12; // light gravity
            }
          }
          sparkPosAttr.needsUpdate = true;
        } else {
          sparksRef.current.points.visible = false;
        }
      } else {
        // IDLE STATE (Stopped)
        if (laserBeamRef.current) laserBeamRef.current.visible = false;
        if (laserSpotRef.current) laserSpotRef.current.visible = false;
        if (sparksRef.current) sparksRef.current.points.visible = false;
        if (laserLightRef.current) laserLightRef.current.intensity = 0;

        // Reset carriage smoothly to home reference
        if (laserCarriageRef.current) {
          laserCarriageRef.current.position.x = THREE.MathUtils.lerp(laserCarriageRef.current.position.x, 0, 0.05);
          laserCarriageRef.current.position.z = THREE.MathUtils.lerp(laserCarriageRef.current.position.z, 0, 0.05);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.dispose();
    };
  }, []);

  const handleCameraChange = (type: 'perspective' | 'isometric' | 'top' | 'front') => {
    setCameraView(type);
    if (!cameraRef.current || !controlsRef.current) return;

    if (type === 'perspective') {
      cameraRef.current.position.set(1.4, 1.25, 1.6);
      controlsRef.current.target.set(0.02, 0.05, 0);
    } else if (type === 'isometric') {
      cameraRef.current.position.set(1.6, 1.6, 1.6);
      controlsRef.current.target.set(0, 0, 0);
    } else if (type === 'top') {
      cameraRef.current.position.set(0.01, 2.4, 0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (type === 'front') {
      cameraRef.current.position.set(0, 0.2, 1.9);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  const resetCamera = () => {
    handleCameraChange('perspective');
  };

  if (webGLError) {
    return (
      <div className="w-full h-[520px] bg-industrial-900 border border-red-500/30 rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">3D WebGL Rendering Fallback</h3>
        <p className="text-industrial-300 max-w-md text-sm">{webGLError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-industrial-700/80 bg-industrial-950 shadow-2xl">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Title, Live Marking Indicator & Active 3D Workpiece Pill */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-industrial-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-industrial-700 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-cyanAccent animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider text-industrial-200 uppercase">
            DESKTOP CNC LASER MARKER • TRL 3 DIGITAL TWIN
          </span>
        </div>

        {/* Dynamic 3D Workpiece Category Pill */}
        <div className="flex items-center gap-2 bg-industrial-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-cyanAccent/30 text-cyanAccent text-xs font-mono">
          <span className="text-industrial-400">3D SPECIMEN:</span>
          <span className="font-bold text-white">{componentCategory}</span>
        </div>

        {/* Live Sparks & Engraving Active Badge */}
        {isSimulatingMarking && (
          <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md px-3 py-1 rounded-lg border border-red-500/40 text-red-400 text-xs font-mono animate-pulse shadow-laser-glow">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>REAL-TIME LASER ABLATION & SPARK EMISSION ({Math.round(markingProgress * 100)}%)</span>
          </div>
        )}
      </div>

      {/* Top Right: View Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-industrial-900/90 backdrop-blur-md p-1.5 rounded-lg border border-industrial-700 shadow-lg">
        <button
          onClick={() => handleCameraChange('perspective')}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
            cameraView === 'perspective' ? 'bg-cyanAccent text-black font-semibold' : 'text-industrial-300 hover:text-white'
          }`}
          title="Perspective 3D View"
        >
          PERSP
        </button>
        <button
          onClick={() => handleCameraChange('isometric')}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
            cameraView === 'isometric' ? 'bg-cyanAccent text-black font-semibold' : 'text-industrial-300 hover:text-white'
          }`}
          title="Engineering Isometric View"
        >
          ISO
        </button>
        <button
          onClick={() => handleCameraChange('top')}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
            cameraView === 'top' ? 'bg-cyanAccent text-black font-semibold' : 'text-industrial-300 hover:text-white'
          }`}
          title="Top Plan View"
        >
          TOP
        </button>
        <button
          onClick={() => handleCameraChange('front')}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
            cameraView === 'front' ? 'bg-cyanAccent text-black font-semibold' : 'text-industrial-300 hover:text-white'
          }`}
          title="Front Elevation"
        >
          FRONT
        </button>
        <div className="w-px h-4 bg-industrial-700 mx-1" />
        <button
          onClick={resetCamera}
          className="p-1.5 text-industrial-400 hover:text-white rounded hover:bg-industrial-800 transition"
          title="Reset Camera Position"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Floating Bar: Exploded Mode, Auto-Rotate & Subsystem Selector */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-industrial-900/90 backdrop-blur-md p-1.5 rounded-lg border border-industrial-700 shadow-lg">
          <button
            onClick={() => setExploded(!exploded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition ${
              exploded
                ? 'bg-amberAccent text-black font-bold shadow-amber-glow'
                : 'bg-industrial-800 text-industrial-200 hover:bg-industrial-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{exploded ? 'REASSEMBLE' : 'EXPLODED VIEW'}</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition ${
              autoRotate ? 'bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/40' : 'text-industrial-400 hover:text-white'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>TURNTABLE</span>
          </button>
        </div>

        {/* Subsystems Dropdown */}
        <div className="flex items-center gap-2 bg-industrial-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-industrial-700 text-xs font-mono">
          <span className="text-industrial-400">INSPECT:</span>
          <select
            value={activeSubsystem?.id || ''}
            onChange={(e) => {
              const found = MACHINE_SUBSYSTEMS.find(s => s.id === e.target.value) || null;
              setActiveSubsystem(found);
              if (onSelectSubsystem) onSelectSubsystem(found);
            }}
            className="bg-industrial-800 border border-industrial-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-cyanAccent cursor-pointer"
          >
            <option value="">Select Machine Subsystem...</option>
            {MACHINE_SUBSYSTEMS.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.name} [{sub.currentStatus}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subsystem Details Overlay Modal */}
      {activeSubsystem && (
        <div className="absolute top-16 left-4 max-w-sm bg-industrial-900/95 backdrop-blur-md border border-cyanAccent/40 p-4 rounded-xl shadow-2xl z-20 cad-corner">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyanAccent uppercase">
                {activeSubsystem.category} SUBSYSTEM
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">{activeSubsystem.name}</h4>
            </div>
            <button
              onClick={() => {
                setActiveSubsystem(null);
                if (onSelectSubsystem) onSelectSubsystem(null);
              }}
              className="text-industrial-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-industrial-300 leading-relaxed mb-3">
            {activeSubsystem.description}
          </p>

          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] font-mono text-industrial-400 block uppercase">SPECIFICATIONS:</span>
            {activeSubsystem.specifications.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-industrial-300">
                <span className="w-1 h-1 rounded-full bg-cyanAccent" />
                <span>{spec}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-industrial-800 text-[11px]">
            <span className="text-industrial-400 font-mono">STATUS:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              activeSubsystem.currentStatus === 'Demonstrated' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {activeSubsystem.currentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
