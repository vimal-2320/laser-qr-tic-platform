import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection, ProblemSection, SolutionSection } from './components/journey/JourneySections';
import { MachineViewer } from './components/3d/MachineViewer';
import { MarkingWorkflow } from './components/marking/MarkingWorkflow';
import { ComponentRecordCard } from './components/scanner/ComponentRecordCard';
import { ScannerModal } from './components/scanner/ScannerModal';
import { AnalyticsEngine } from './components/analytics/AnalyticsEngine';
import { ArchitectureDiagram } from './components/architecture/ArchitectureDiagram';
import { RoadmapBudget } from './components/roadmap/RoadmapBudget';
import { HardwareModeModal } from './components/hardware/HardwareModeModal';
import { INITIAL_DEMO_COMPONENTS } from './data/mockData';
import { componentRegistry } from './services/componentRegistry';
import type { ComponentRecord, HardwareBridgeConfig } from './types';
import { hardwareAdapter } from './services/hardwareBridge';
import { 
  QrCode, 
  Layers, 
  Zap, 
  Activity, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export function App() {
  // Shared active demo component record
  const [activeComponent, setActiveComponent] = useState<ComponentRecord>(INITIAL_DEMO_COMPONENTS[0]);

  // Synchronized simulation states between MarkingWorkflow and 3D Machine Viewer
  const [isSimulatingMarking, setIsSimulatingMarking] = useState<boolean>(false);
  const [markingProgress, setMarkingProgress] = useState<number>(0);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [hardwareConfig, setHardwareConfig] = useState<HardwareBridgeConfig>(hardwareAdapter.getConfig());

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRunSimulation = () => {
    setIsSimulatingMarking(true);
  };

  const handleSimulationStateChange = (isSimulating: boolean, progress: number) => {
    setIsSimulatingMarking(isSimulating);
    setMarkingProgress(progress);
  };

  const handleRecordFound = (record: ComponentRecord) => {
    componentRegistry.save(record);
    setActiveComponent(record);
    setIsScannerOpen(false);
    handleScrollToSection('traceability');
  };

  return (
    <div className="min-h-screen bg-industrial-950 text-industrial-200 selection:bg-cyanAccent selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        hardwareConfig={hardwareConfig}
      />

      {/* 1. Hero Section */}
      <HeroSection
        onScrollToSection={handleScrollToSection}
        onRunSimulation={handleRunSimulation}
      />

      {/* 2. Industrial Problem Section */}
      <ProblemSection />

      {/* 3. Proposed Solution Section */}
      <SolutionSection />

      {/* 4. Dedicated 3D Interactive Machine Digital Twin Section */}
      <section id="machine-3d" className="py-20 border-t border-industrial-800 bg-industrial-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                  SECTION 04 • 3D DIGITAL TWIN
                </span>
                <span className="text-xs font-mono text-industrial-400">
                  WEBGL CAD VISUALIZATION
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interactive 3D CNC Laser Marking Workstation
              </h2>
              <p className="text-xs sm:text-sm text-industrial-300 mt-1 max-w-2xl leading-relaxed">
                Inspect the structural gantry, ESP32 motion electronics, laser optics, and railway fitting fixture in full 3D space. Toggle between assembled and exploded perspectives.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-industrial-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>TRL 3 Laboratory Architecture Model</span>
            </div>
          </div>

          {/* 3D Scene Component */}
          <MachineViewer
            isSimulatingMarking={isSimulatingMarking}
            markingProgress={markingProgress}
            selectedSubsystemId={selectedSubsystemId}
            onSelectSubsystem={(sub) => setSelectedSubsystemId(sub ? sub.id : null)}
          />
        </div>
      </section>

      {/* 5. Laser Marking & G-Code Workflow Section */}
      <section id="marking-sim" className="py-20 border-t border-industrial-800 bg-industrial-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
      </section>

      {/* 6. Digital Traceability & Component Record Section */}
      <section id="traceability" className="py-20 border-t border-industrial-800 bg-industrial-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                  SECTION 06 • DIGITAL LIFECYCLE
                </span>
                <span className="text-xs font-mono text-industrial-400">
                  PROVENANCE & AUDIT TRAIL
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Component Digital Record & Track History
              </h2>
            </div>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-industrial-850 hover:bg-industrial-800 text-cyanAccent border border-cyanAccent/40 text-xs font-mono font-bold transition shadow-cyan-glow"
            >
              <QrCode className="w-4 h-4" />
              <span>SCAN / DECODE NEW SPECIMEN</span>
            </button>
          </div>

          <ComponentRecordCard record={activeComponent} />
        </div>
      </section>

      {/* 7. AI-Assisted Maintenance & Anomaly Analytics */}
      <section id="ai-analytics" className="py-20 border-t border-industrial-800 bg-industrial-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <AnalyticsEngine component={activeComponent} />
        </div>
      </section>

      {/* 8. System Architecture & Data Flow */}
      <section id="architecture" className="py-20 border-t border-industrial-800 bg-industrial-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <ArchitectureDiagram />
        </div>
      </section>

      {/* 9. Funding Breakdown, 18-Month Roadmap & Team */}
      <section id="roadmap" className="py-20 border-t border-industrial-800 bg-industrial-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <RoadmapBudget />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Scanner Modal */}
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
