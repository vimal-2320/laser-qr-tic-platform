import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MACHINE_SUBSYSTEMS } from '../../data/mockData';
import type { MachineSubsystem } from '../../types';
import { 
  RotateCcw, 
  Layers, 
  Eye, 
  Play, 
  Pause, 
  Camera, 
  Maximize2, 
  Info, 
  ShieldAlert, 
  Cpu, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface MachineViewerProps {
  isSimulatingMarking?: boolean;
  markingProgress?: number; // 0 to 1
  selectedSubsystemId?: string | null;
  onSelectSubsystem?: (subsystem: MachineSubsystem | null) => void;
}

export const MachineViewer: React.FC<MachineViewerProps> = ({
  isSimulatingMarking = false,
  markingProgress = 0,
  selectedSubsystemId = null,
  onSelectSubsystem
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
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupsRef = useRef<Record<string, THREE.Group>>({});
  const laserBeamRef = useRef<THREE.Mesh | null>(null);
  const laserSpotRef = useRef<THREE.Mesh | null>(null);
  const qrMarkRef = useRef<THREE.Mesh | null>(null);
  const gantryRef = useRef<THREE.Group | null>(null);
  const laserCarriageRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetExplodeRef = useRef<number>(0);

  // Sync internal selectedSubsystem with prop
  useEffect(() => {
    if (selectedSubsystemId) {
      const match = MACHINE_SUBSYSTEMS.find(s => s.id === selectedSubsystemId) || null;
      setActiveSubsystem(match);
    }
  }, [selectedSubsystemId]);

  useEffect(() => {
    targetExplodeRef.current = exploded ? 1 : 0;
  }, [exploded]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        setWebGLError('WebGL is not supported or disabled in your browser environment.');
        return;
      }
    } catch (err: any) {
      setWebGLError('Unable to initialize WebGL context: ' + err.message);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f14);
    scene.fog = new THREE.FogExp2(0x0c0f14, 0.04);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.2, 2.8, 3.4);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow slight under-angle but keep above ground
    controls.minDistance = 1.5;
    controls.maxDistance = 9;
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xe2e8f0, 1.8);
    dirLight1.position.set(5, 7, 4);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.bias = -0.0005;
    scene.add(dirLight1);

    const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    cyanRimLight.position.set(-4, 3, -3);
    scene.add(cyanRimLight);

    const amberFill = new THREE.PointLight(0xf59e0b, 0.6, 6);
    amberFill.position.set(0, 2, 0);
    scene.add(amberFill);

    // Floor CAD grid & shadow receiver
    const gridHelper = new THREE.GridHelper(8, 32, 0x00f2fe, 0x1f2937);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080b0f,
      roughness: 0.9,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.551;
    floor.receiveShadow = true;
    scene.add(floor);

    // ==========================================
    // 6. BUILD INDUSTRIAL CNC MACHINE SUBSYSTEMS
    // ==========================================
    const groups: Record<string, THREE.Group> = {};
    groupsRef.current = groups;

    // Materials
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e242b,
      metalness: 0.85,
      roughness: 0.25
    });
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.3
    });
    const steelRailMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.15
    });
    const laserHousingMat = new THREE.MeshStandardMaterial({
      color: 0x0b1320,
      metalness: 0.7,
      roughness: 0.35
    });
    const brassNozzleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.3
    });
    const railwayClipMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.4
    });
    const acrylicShieldMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706, // protective orange-tint filter for diode laser 450nm
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.32,
      transmission: 0.6,
      ior: 1.49,
      side: THREE.DoubleSide
    });

    // ------------------------------------------
    // A. BASE FRAME
    // ------------------------------------------
    const baseGroup = new THREE.Group();
    groups["base_frame"] = baseGroup;

    // Outer extruded 2040 profile perimeter
    const frameBedGeo = new THREE.BoxGeometry(2.4, 0.1, 2.0);
    const frameBed = new THREE.Mesh(frameBedGeo, darkMetalMat);
    frameBed.position.set(0, -0.4, 0);
    frameBed.castShadow = true;
    frameBed.receiveShadow = true;
    baseGroup.add(frameBed);

    // Bed slats / T-Slot grooves
    for (let i = -0.9; i <= 0.9; i += 0.3) {
      const slatGeo = new THREE.BoxGeometry(2.36, 0.02, 0.15);
      const slat = new THREE.Mesh(slatGeo, aluminumMat);
      slat.position.set(0, -0.34, i);
      slat.receiveShadow = true;
      baseGroup.add(slat);
    }

    // Vibration dampening feet
    const footGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    [
      [-1.1, -0.48, -0.9],
      [1.1, -0.48, -0.9],
      [-1.1, -0.48, 0.9],
      [1.1, -0.48, 0.9]
    ].forEach(([x, y, z]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(x, y, z);
      baseGroup.add(foot);
    });

    // Base frame corner brackets
    const bracketGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    [
      [-1.15, -0.38, -0.95],
      [1.15, -0.38, -0.95],
      [-1.15, -0.38, 0.95],
      [1.15, -0.38, 0.95]
    ].forEach(([x, y, z]) => {
      const br = new THREE.Mesh(bracketGeo, aluminumMat);
      br.position.set(x, y, z);
      baseGroup.add(br);
    });

    scene.add(baseGroup);

    // ------------------------------------------
    // B. GANTRY RAILS & LINEAR MOTION
    // ------------------------------------------
    const gantryGroup = new THREE.Group();
    groups["gantry_rails"] = gantryGroup;
    gantryRef.current = gantryGroup;

    // Longitudinal X guide rails (left & right side)
    const xRailGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 16);
    const xRailLeft = new THREE.Mesh(xRailGeo, steelRailMat);
    xRailLeft.rotation.x = Math.PI / 2;
    xRailLeft.position.set(-1.05, -0.28, 0);
    gantryGroup.add(xRailLeft);

    const xRailRight = xRailLeft.clone();
    xRailRight.position.set(1.05, -0.28, 0);
    gantryGroup.add(xRailRight);

    // Gantry side upright carriages
    const uprightGeo = new THREE.BoxGeometry(0.12, 0.5, 0.22);
    const uprightLeft = new THREE.Mesh(uprightGeo, aluminumMat);
    uprightLeft.position.set(-1.05, -0.05, 0);
    gantryGroup.add(uprightLeft);

    const uprightRight = uprightLeft.clone();
    uprightRight.position.set(1.05, -0.05, 0);
    gantryGroup.add(uprightRight);

    // Transverse Y beam across the gantry
    const yBeamGeo = new THREE.BoxGeometry(2.2, 0.08, 0.08);
    const yBeam = new THREE.Mesh(yBeamGeo, darkMetalMat);
    yBeam.position.set(0, 0.15, 0);
    gantryGroup.add(yBeam);

    // Dual Y guide rods
    const yRodGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.1, 16);
    const yRodTop = new THREE.Mesh(yRodGeo, steelRailMat);
    yRodTop.rotation.z = Math.PI / 2;
    yRodTop.position.set(0, 0.18, 0.05);
    gantryGroup.add(yRodTop);

    const yRodBottom = yRodTop.clone();
    yRodBottom.position.set(0, 0.12, 0.05);
    gantryGroup.add(yRodBottom);

    scene.add(gantryGroup);

    // ------------------------------------------
    // C. STEPPER DRIVE & DRV8825
    // ------------------------------------------
    const stepperGroup = new THREE.Group();
    groups["stepper_drive"] = stepperGroup;

    // NEMA 17 motor models (black body + silver faceplate + brass pulley)
    const motorBodyGeo = new THREE.BoxGeometry(0.22, 0.22, 0.24);
    const motorFaceGeo = new THREE.BoxGeometry(0.22, 0.22, 0.04);
    const pulleyGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16);

    const createNema17 = (x: number, y: number, z: number, rotY = 0) => {
      const mGroup = new THREE.Group();
      const body = new THREE.Mesh(motorBodyGeo, darkMetalMat);
      const face = new THREE.Mesh(motorFaceGeo, aluminumMat);
      face.position.z = 0.13;
      const pulley = new THREE.Mesh(pulleyGeo, brassNozzleMat);
      pulley.rotation.x = Math.PI / 2;
      pulley.position.z = 0.18;

      mGroup.add(body);
      mGroup.add(face);
      mGroup.add(pulley);
      mGroup.position.set(x, y, z);
      mGroup.rotation.y = rotY;
      return mGroup;
    };

    // X-axis motor on left rear
    stepperGroup.add(createNema17(-1.18, -0.28, -0.95));
    // Y-axis motor on gantry right carriage
    stepperGroup.add(createNema17(1.15, 0.15, 0, Math.PI / 2));

    scene.add(stepperGroup);

    // ------------------------------------------
    // D. ESP32 CONTROLLER ENCLOSURE & DRIVERS
    // ------------------------------------------
    const electronicsGroup = new THREE.Group();
    groups["esp32_controller"] = electronicsGroup;

    // DIN-rail industrial controller box on left flank
    const boxGeo = new THREE.BoxGeometry(0.28, 0.38, 0.44);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6, roughness: 0.4 });
    const cBox = new THREE.Mesh(boxGeo, boxMat);
    cBox.position.set(-1.26, -0.15, 0.3);
    electronicsGroup.add(cBox);

    // Status indicator LED pins
    const ledGeo = new THREE.SphereGeometry(0.015, 12, 12);
    const pwrLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 })); // Green Power
    pwrLed.position.set(-1.11, -0.05, 0.2);
    electronicsGroup.add(pwrLed);

    const wifiLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x00f2fe })); // Cyan WiFi
    wifiLed.position.set(-1.11, -0.05, 0.25);
    electronicsGroup.add(wifiLed);

    const grblLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b })); // Amber GRBL
    grblLed.position.set(-1.11, -0.05, 0.3);
    electronicsGroup.add(grblLed);

    // Dual mini heatsinks representing DRV8825 stepper drivers
    for (let d = 0; d < 2; d++) {
      const hsGeo = new THREE.BoxGeometry(0.05, 0.03, 0.05);
      const hsMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
      const hs = new THREE.Mesh(hsGeo, hsMat);
      hs.position.set(-1.12, -0.14, 0.22 + d * 0.09);
      electronicsGroup.add(hs);
    }

    // Flexible cable drag chain representation
    const chainPath = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
    const chainMesh = new THREE.Mesh(chainPath, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    chainMesh.rotation.z = Math.PI / 4;
    chainMesh.position.set(-0.6, 0.0, 0.1);
    electronicsGroup.add(chainMesh);

    scene.add(electronicsGroup);

    // ------------------------------------------
    // E. LASER HEAD & OPTICAL CARRIAGE
    // ------------------------------------------
    const laserCarriage = new THREE.Group();
    groups["laser_module"] = laserCarriage;
    laserCarriageRef.current = laserCarriage;

    // Laser module heatsink body
    const laserBodyGeo = new THREE.BoxGeometry(0.18, 0.32, 0.18);
    const laserBody = new THREE.Mesh(laserBodyGeo, laserHousingMat);
    laserBody.position.set(0, 0.25, 0);
    laserCarriage.add(laserBody);

    // Top cooling fan grill
    const fanGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16);
    const fan = new THREE.Mesh(fanGeo, aluminumMat);
    fan.position.set(0, 0.42, 0);
    laserCarriage.add(fan);

    // Brass laser nozzle
    const nozzleGeo = new THREE.ConeGeometry(0.045, 0.08, 16);
    const nozzle = new THREE.Mesh(nozzleGeo, brassNozzleMat);
    nozzle.rotation.x = Math.PI; // point downward
    nozzle.position.set(0, 0.05, 0);
    laserCarriage.add(nozzle);

    // Vision-guided alignment camera lens (Phase 2 planned subsystem)
    const camGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.07, 16);
    const camMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const cam = new THREE.Mesh(camGeo, camMat);
    cam.position.set(0.12, 0.15, 0);
    laserCarriage.add(cam);

    // Laser beam visual (cone/cylinder from nozzle down to workpiece surface at y = -0.22)
    const beamGeo = new THREE.CylinderGeometry(0.003, 0.012, 0.27, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xff2200,
      transparent: true,
      opacity: 0.85
    });
    const laserBeam = new THREE.Mesh(beamGeo, beamMat);
    laserBeam.position.set(0, -0.09, 0);
    laserBeam.visible = false;
    laserCarriage.add(laserBeam);
    laserBeamRef.current = laserBeam;

    // Intense focal burn spot on the workpiece surface
    const spotGeo = new THREE.RingGeometry(0.005, 0.025, 16);
    const spotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    const spot = new THREE.Mesh(spotGeo, spotMat);
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(0, -0.225, 0);
    spot.visible = false;
    laserCarriage.add(spot);
    laserSpotRef.current = spot;

    scene.add(laserCarriage);

    // ------------------------------------------
    // F. WORKHOLDING JIG & RAILWAY CLIP WORKPIECE
    // ------------------------------------------
    const workpieceGroup = new THREE.Group();
    groups["workpiece_holder"] = workpieceGroup;

    // Machine Vise / Clamping fixture
    const viseGeo = new THREE.BoxGeometry(0.8, 0.12, 0.6);
    const vise = new THREE.Mesh(viseGeo, darkMetalMat);
    vise.position.set(0, -0.3, 0);
    workpieceGroup.add(vise);

    // Toggle clamp jaw
    const jawGeo = new THREE.BoxGeometry(0.82, 0.08, 0.1);
    const jaw1 = new THREE.Mesh(jawGeo, aluminumMat);
    jaw1.position.set(0, -0.22, -0.22);
    workpieceGroup.add(jaw1);
    const jaw2 = jaw1.clone();
    jaw2.position.set(0, -0.22, 0.22);
    workpieceGroup.add(jaw2);

    // Elastic Rail Clip (ERC-III) 3D specimen approximation
    // Characteristic spring steel curve: torus arc + horizontal clamping flat
    const clipToroidGeo = new THREE.TorusGeometry(0.18, 0.035, 16, 32, Math.PI * 1.3);
    const clipArc = new THREE.Mesh(clipToroidGeo, railwayClipMat);
    clipArc.rotation.x = Math.PI / 2;
    clipArc.rotation.z = Math.PI / 4;
    clipArc.position.set(-0.08, -0.21, 0);
    clipArc.castShadow = true;
    workpieceGroup.add(clipArc);

    // Clip toe section (the actual flat ground surface where laser QR is marked)
    const toeGeo = new THREE.BoxGeometry(0.24, 0.05, 0.24);
    const toe = new THREE.Mesh(toeGeo, steelRailMat);
    toe.position.set(0.08, -0.23, 0);
    toe.receiveShadow = true;
    workpieceGroup.add(toe);

    // Progressive QR Engraving patch on the toe surface
    const qrPlaneGeo = new THREE.PlaneGeometry(0.16, 0.16);
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = 128;
    qrCanvas.height = 128;
    const qrCtx = qrCanvas.getContext('2d')!;
    qrCtx.fillStyle = '#ffffff';
    qrCtx.fillRect(0, 0, 128, 128);
    // Draw initial sample QR border
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
    // central timing marks
    for (let i = 0; i < 5; i++) {
      qrCtx.fillRect(52 + i * 6, 26, 4, 4);
      qrCtx.fillRect(26, 52 + i * 6, 4, 4);
    }

    const qrTexture = new THREE.CanvasTexture(qrCanvas);
    const qrMat = new THREE.MeshBasicMaterial({
      map: qrTexture,
      transparent: true,
      opacity: 0.95
    });
    const qrMesh = new THREE.Mesh(qrPlaneGeo, qrMat);
    qrMesh.rotation.x = -Math.PI / 2;
    qrMesh.position.set(0.08, -0.203, 0);
    workpieceGroup.add(qrMesh);
    qrMarkRef.current = qrMesh;

    scene.add(workpieceGroup);

    // ------------------------------------------
    // G. PROPOSED IEC 60825 ENCLOSURE & SAFETY
    // ------------------------------------------
    const enclosureGroup = new THREE.Group();
    groups["safety_enclosure"] = enclosureGroup;

    // Tinted acrylic hood
    const hoodGeo = new THREE.BoxGeometry(2.5, 0.95, 2.1);
    const hood = new THREE.Mesh(hoodGeo, acrylicShieldMat);
    hood.position.set(0, 0.05, 0);
    enclosureGroup.add(hood);

    // Aluminum perimeter frame around hood edges
    const hoodEdgeGeo = new THREE.BoxGeometry(2.52, 0.04, 0.04);
    const edgeTopFront = new THREE.Mesh(hoodEdgeGeo, aluminumMat);
    edgeTopFront.position.set(0, 0.52, 1.05);
    enclosureGroup.add(edgeTopFront);
    const edgeTopBack = edgeTopFront.clone();
    edgeTopBack.position.set(0, 0.52, -1.05);
    enclosureGroup.add(edgeTopBack);

    // Front Emergency Stop Mushroom Button
    const eStopMountGeo = new THREE.BoxGeometry(0.12, 0.12, 0.06);
    const eStopMount = new THREE.Mesh(eStopMountGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b })); // Yellow collar
    eStopMount.position.set(1.15, -0.25, 1.05);
    enclosureGroup.add(eStopMount);

    const eStopButtonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
    const eStopBtn = new THREE.Mesh(eStopButtonGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })); // Red mushroom
    eStopBtn.rotation.x = Math.PI / 2;
    eStopBtn.position.set(1.15, -0.25, 1.1);
    enclosureGroup.add(eStopBtn);

    scene.add(enclosureGroup);

    // Raycasting for interactive component inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersections across all subsystem groups
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

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (cameraRef.current instanceof THREE.PerspectiveCamera) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ------------------------------------------
    // 7. ANIMATION LOOP
    // ------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth explode animation interpolation
      const currentExplode = explodeFactor;
      const targetExplode = targetExplodeRef.current;
      const nextExplode = THREE.MathUtils.lerp(currentExplode, targetExplode, 0.08);
      setExplodeFactor(nextExplode);

      // Apply exploded offsets to subsystem groups
      MACHINE_SUBSYSTEMS.forEach(sub => {
        const group = groups[sub.id];
        if (group) {
          const [ox, oy, oz] = sub.explodedOffset;
          group.position.set(ox * nextExplode, oy * nextExplode, oz * nextExplode);
        }
      });

      // Controls update
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }

      // Simulation Motion & Laser Firing effects
      if (isSimulatingMarking && laserCarriageRef.current && laserBeamRef.current && laserSpotRef.current) {
        // Laser beam active
        laserBeamRef.current.visible = true;
        laserSpotRef.current.visible = true;

        // Animate laser spot intensity pulsation
        const pulse = 0.8 + 0.2 * Math.sin(time * 28);
        (laserSpotRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;

        // Traverse laser carriage across QR workpiece marking area
        const scanSweepX = 0.08 + 0.07 * Math.sin(time * 8);
        const scanSweepZ = 0.07 * Math.cos(time * 1.5);
        laserCarriageRef.current.position.x = scanSweepX;
        laserCarriageRef.current.position.z = scanSweepZ;

        // Progressive QR darkening / burn appearance
        if (qrMarkRef.current) {
          const mat = qrMarkRef.current.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.min(1.0, 0.25 + markingProgress * 0.75);
        }
      } else {
        if (laserBeamRef.current) laserBeamRef.current.visible = false;
        if (laserSpotRef.current) laserSpotRef.current.visible = false;
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

  // Handle camera switch
  const handleCameraChange = (type: 'perspective' | 'isometric' | 'top' | 'front') => {
    setCameraView(type);
    if (!cameraRef.current || !controlsRef.current) return;

    if (type === 'perspective') {
      cameraRef.current.position.set(3.2, 2.8, 3.4);
      controlsRef.current.target.set(0, 0.2, 0);
    } else if (type === 'isometric') {
      cameraRef.current.position.set(3.5, 3.5, 3.5);
      controlsRef.current.target.set(0, 0, 0);
    } else if (type === 'top') {
      cameraRef.current.position.set(0.01, 5.0, 0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (type === 'front') {
      cameraRef.current.position.set(0, 0.4, 4.2);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  const resetCamera = () => {
    handleCameraChange('perspective');
  };

  if (webGLError) {
    return (
      <div className="w-full h-[540px] bg-industrial-900 border border-red-500/30 rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">3D WebGL Rendering Fallback</h3>
        <p className="text-industrial-300 max-w-md text-sm mb-4">{webGLError}</p>
        <div className="bg-industrial-850 p-4 rounded-lg border border-industrial-700 text-left text-xs max-w-lg">
          <p className="font-semibold text-cyanAccent mb-2">CNC Laser QR Marking Station Overview (Static Specification):</p>
          <ul className="list-disc pl-4 space-y-1 text-industrial-300">
            <li>Controller: Dual-core ESP32 with GRBL_ESP32 motion control firmware</li>
            <li>Optics: Focus-collimated Diode Laser module (450nm) with TTL PWM pulsing</li>
            <li>Motion: Dual X/Y linear rails, NEMA 17 stepper motors, DRV8825 drivers</li>
            <li>Sample Workpiece: Elastic Rail Clip (ERC-III) / GFN-66 insulating liner</li>
            <li>Safety: Proposed IEC 60825 Class 1 laser enclosure with fail-safe interlocks</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden border border-industrial-700/80 bg-industrial-950 shadow-2xl">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Title & Live Subsystem Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-industrial-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-industrial-700 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-cyanAccent animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider text-industrial-200 uppercase">
            3D DIGITAL TWIN • TRL 3 PROTOTYPE MODEL
          </span>
        </div>
        {isSimulatingMarking && (
          <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/40 text-amber-400 text-xs font-mono animate-laser">
            <Zap className="w-3.5 h-3.5" />
            <span>SIMULATED LASER ABLATION IN PROGRESS</span>
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
        {/* Left Actions */}
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

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition ${
              showAnnotations ? 'text-cyanAccent' : 'text-industrial-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ANNOTATIONS</span>
          </button>
        </div>

        {/* Subsystems Dropdown / Quick Selector */}
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

      {/* Subsystem Details Overlay Modal (When a part is selected) */}
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

          <div className="bg-industrial-950/70 p-2.5 rounded-lg border border-industrial-800 mb-3 space-y-1">
            <span className="text-[10px] font-mono text-industrial-400 block uppercase">ENGINEERING ROLE:</span>
            <p className="text-xs text-industrial-200">{activeSubsystem.subsystemRole}</p>
          </div>

          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] font-mono text-industrial-400 block uppercase">TECHNICAL SPECIFICATIONS:</span>
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

      {/* Floating 3D Interaction Tip */}
      <div className="absolute bottom-16 right-4 hidden md:flex items-center gap-2 text-[10px] font-mono text-industrial-400 bg-industrial-900/60 backdrop-blur-sm px-2.5 py-1 rounded pointer-events-none">
        <span>Click parts to inspect • Left-click drag to rotate • Scroll to zoom</span>
      </div>
    </div>
  );
};
