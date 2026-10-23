import React, { useState } from 'react';
import { Navbar, type NavigationTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection, ProblemSection, SolutionSection } from './components/journey/JourneySections';
import { MachineViewer } from './components/3d/MachineViewer';
import { MarkingWorkflow } from './components/marking/MarkingWorkflow';
import { ComponentRecordCard } from './components/scanner/ComponentRecordCard';
import { ScannerModal } from './components/scanner/ScannerModal';
import { AnalyticsEngine } from './components/analytics/AnalyticsEngine';
import { ArchitectureDiagram } from './components/architecture/ArchitectureDiagram';
import { RoadmapBudget } from './components/roadmap/RoadmapBudget';
import { TeamMembers } from './components/team/TeamMembers';
import { HardwareModeModal } from './components/hardware/HardwareModeModal';
import { INITIAL_DEMO_COMPONENTS } from './data/mockData';
import { componentRegistry } from './services/componentRegistry';
import type { ComponentRecord, HardwareBridgeConfig } from './types';
import { hardwareAdapter } from './services/hardwareBridge';
import { 
  QrCode, 
  Layers, 
  Zap, 
  WifiOff, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Flame,
  FileCheck
} from 'lucide-react';

export function App() {
  // Navigation Tab State (Replaces endless vertical scrolling)
  const [activeTab, setActiveTab] = useState<NavigationTab>('3d-workstation');

  // Shared active demo component record
  const [activeComponent, setActiveComponent] = useState<ComponentRecord>(INITIAL_DEMO_COMPONENTS[0]);

  // Synchronized simulation states between MarkingWorkflow and 3D Machine Viewer
  const [isSimulatingMarking, setIsSimulatingMarking] = useState<boolean>(false);
  const [markingProgress, setMarkingProgress] = useState<number>(0);
  const [markingCoord, setMarkingCoord] = useState<{ x: number; y: number; laserActive: boolean } | null>(null);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [hardwareConfig, setHardwareConfig] = useState<HardwareBridgeConfig>(hardwareAdapter.getConfig());

  const handleRunSimulation = () => {
    setActiveTab('laser-marking');
    setIsSimulatingMarking(true);
  };

  const handleSimulationStateChange = (
    isSimulating: boolean,
    progress: number,
    coord?: { x: number; y: number; laserActive: boolean } | null
  ) => {
    setIsSimulatingMarking(isSimulating);
    setMarkingProgress(progress);
    setMarkingCoord(coord || null);
  };

  const handleRecordFound = (record: ComponentRecord) => {
    componentRegistry.save(record);
    setActiveComponent(record);
    setIsScannerOpen(false);
    setActiveTab('field-scanner');
  };

  return (
    <div className="min-h-screen bg-industrial-950 text-industrial-200 selection:bg-cyanAccent selection:text-black flex flex-col justify-between">
      {/* Top Navbar with Tab Navigation & KEC Logo */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        hardwareConfig={hardwareConfig}
      />

      {/* Main Console Workstation Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ==================================================== */}
        {/* TAB 1: 3D DIGITAL TWIN & INSPECTION WORKSTATION */}
        {/* ==================================================== */}
        {activeTab === '3d-workstation' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-industrial-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                    CONSOLE MODULE 01
                  </span>
                  <span className="text-xs font-mono text-industrial-400">
                    INTERACTIVE 3D CNC WORKSTATION & SUBSYSTEM INSPECTOR
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  Desktop CNC Laser Marking Workstation
                </h2>
                <p className="text-xs text-industrial-300 mt-0.5">
                  Inspect the rigid chassis, linear motion rods, ESP32 controller, and dynamic 3D track fittings with live spark emission during engraving runs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('laser-marking')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyanAccent text-black font-mono font-bold text-xs hover:bg-cyan-300 transition shadow-cyan-glow"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>LAUNCH ENGRAVING SIMULATOR ➔</span>
                </button>
              </div>
            </div>

            {/* 3D Scene + Dedicated Inspection Column Component */}
            <MachineViewer
              isSimulatingMarking={isSimulatingMarking}
              markingProgress={markingProgress}
              selectedSubsystemId={selectedSubsystemId}
              onSelectSubsystem={(sub) => setSelectedSubsystemId(sub ? sub.id : null)}
              componentCategory={activeComponent.category}
              currentCoord={markingCoord}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: LASER MARKING & G-CODE SIMULATOR */}
        {/* ==================================================== */}
        {activeTab === 'laser-marking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amberAccent/10 text-amberAccent border border-amberAccent/30">
                    CONSOLE MODULE 02
                  </span>
                  <span className="text-xs font-mono text-industrial-400">
                    QR-TO-G-CODE PIPELINE & LASER MARKING SIMULATION
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  Laser Toolpath Generation & Real-Time Ablation
                </h2>
              </div>

              <button
                onClick={() => setActiveTab('3d-workstation')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 text-xs font-mono text-cyanAccent border border-cyanAccent/30 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>VIEW IN 3D WORKSTATION ➔</span>
              </button>
            </div>

            <MarkingWorkflow
              activeComponent={activeComponent}
              setActiveComponent={setActiveComponent}
              onSimulationStateChange={handleSimulationStateChange}
              onComponentMarked={(comp) => {
                componentRegistry.save(comp);
                setActiveComponent(comp);
              }}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: OFFLINE FIELD SCANNER & DIGITAL ASSET RECORD */}
        {/* ==================================================== */}
        {activeTab === 'field-scanner' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-industrial-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> OFFLINE-FIRST FIELD MODULE
                  </span>
                  <span className="text-xs font-mono text-industrial-400">
                    LOCAL CLIENT-SIDE OPTICAL DECODING & ASSET LEDGER
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  Mobile QR Scanning & Track Fitting Digital Record
                </h2>
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyanAccent text-black text-xs font-mono font-bold hover:bg-cyan-300 transition shadow-cyan-glow"
              >
                <QrCode className="w-4 h-4" />
                <span>OPEN OFFLINE SCANNER (WEBCAM / FILE)</span>
              </button>
            </div>

            {/* Offline Architecture Explanation Banner */}
            <div className="bg-industrial-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>HOW THE OFFLINE-FIRST SCANNER OPERATES WITHOUT INTERNET:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-industrial-300">
                <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
                  <span className="text-cyanAccent font-mono font-bold block">1. Client-Side WASM/Canvas</span>
                  <p className="leading-relaxed">
                    Camera video frames and image files are processed directly inside your browser memory using an in-memory HTML5 Canvas and the <strong className="text-white">jsQR</strong> library. Zero image pixels are sent across the network.
                  </p>
                </div>
                <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
                  <span className="text-cyanAccent font-mono font-bold block">2. Local Storage Ledger</span>
                  <p className="leading-relaxed">
                    Component data and newly discovered track fittings are stored directly in <strong className="text-white">localStorage</strong>. The scanner functions reliably in remote railway tunnels and desert corridors with zero network coverage.
                  </p>
                </div>
                <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
                  <span className="text-cyanAccent font-mono font-bold block">3. Deferred UDM/TMS Sync</span>
                  <p className="leading-relaxed">
                    Scan events, inspections, and GPS coordinates are stamped and tagged as <strong className="text-amber-400 font-mono">"Offline Cached"</strong>. Once the mobile device reconnects to depot Wi-Fi, records automatically synchronize to Indian Railways portals.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Component Digital Twin Record Card */}
            <ComponentRecordCard record={activeComponent} />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: AI LIFECYCLE ANALYTICS & PREDICTIVE ENGINE */}
        {/* ==================================================== */}
        {activeTab === 'ai-analytics' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-industrial-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                  CONSOLE MODULE 04
                </span>
                <span className="text-xs font-mono text-industrial-400">
                  EDGE-AI PREDICTIVE MAINTENANCE & COUNTERFEIT DETECTION
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                AI Component Lifecycle Intelligence
              </h2>
            </div>

            <AnalyticsEngine component={activeComponent} />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: SYSTEM ARCHITECTURE & DATA FLOW */}
        {/* ==================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-industrial-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                  CONSOLE MODULE 05
                </span>
                <span className="text-xs font-mono text-industrial-400">
                  6-LAYER CYBER-PHYSICAL INTEROPERABILITY SPECIFICATION
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                End-to-End System Architecture
              </h2>
            </div>

            <ArchitectureDiagram />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: ROADMAP & BUDGET */}
        {/* ==================================================== */}
        {activeTab === 'budget-roadmap' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-industrial-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amberAccent/10 text-amberAccent border border-amberAccent/30">
                  CONSOLE MODULE 06
                </span>
                <span className="text-xs font-mono text-industrial-400">
                  SASTRA – TCS TIC FINANCIAL ALLOCATION & 18-MONTH PLAN
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Project Budget & 18-Month Execution Roadmap
              </h2>
            </div>

            <RoadmapBudget />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: TEAM MEMBERS (DEDICATED KEC SECTION) */}
        {/* ==================================================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-industrial-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                  CONSOLE MODULE 07
                </span>
                <span className="text-xs font-mono text-industrial-400">
                  KONGU ENGINEERING COLLEGE RESEARCH & INNOVATION TEAM
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Principal Investigator & Student Innovator Team
              </h2>
            </div>

            <TeamMembers />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: TIC EXECUTIVE OVERVIEW & POSTER */}
        {/* ==================================================== */}
        {activeTab === 'tic-overview' && (
          <div className="space-y-12">
            <HeroSection
              onScrollToSection={(sec) => {
                if (sec === 'machine-3d') setActiveTab('3d-workstation');
                else if (sec === 'marking-sim') setActiveTab('laser-marking');
              }}
              onRunSimulation={handleRunSimulation}
            />
            <ProblemSection />
            <SolutionSection />
          </div>
        )}

      </main>

      {/* Footer with College Logo and requested developer attribution */}
      <Footer />

      {/* Floating Offline Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onRecordFound={handleRecordFound}
        activeDemoComponent={activeComponent}
      />

      {/* Hardware Bridge / Mode Modal */}
      <HardwareModeModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        onModeChanged={(cfg) => setHardwareConfig(cfg)}
      />
    </div>
  );
}

export default App;
