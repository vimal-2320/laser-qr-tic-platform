import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Smartphone, 
  Layers, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Server,
  Zap,
  Radio
} from 'lucide-react';

interface ArchitectureNode {
  id: string;
  layer: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  layerTitle: string;
  name: string;
  tech: string;
  role: string;
  input: string;
  output: string;
  status: 'Demonstrated' | 'In Development' | 'Planned' | 'Mock Stage';
  isHighlighted?: boolean;
}

const ARCH_NODES: ArchitectureNode[] = [
  {
    id: 'layer_a',
    layer: 'A',
    layerTitle: 'Component Identity & QR Generation',
    name: 'Python segno & Pillow Pipeline',
    tech: 'Python 3.10+, segno, Pillow (PIL)',
    role: 'Synthesizes unique component identifier, batch number, and manufacturing metadata into high-density 2D QR bitmaps.',
    input: 'Component ID, Batch No, Manufacturer Lot, Depot Allocation',
    output: 'Optimized binary module matrix (e.g. 21x21 / 25x25 boolean array)',
    status: 'Demonstrated'
  },
  {
    id: 'layer_b',
    layer: 'B',
    layerTitle: 'Toolpath & CNC Machine Control',
    name: 'ESP32 & GRBL_ESP32 Firmware',
    tech: 'ESP32 (240MHz Xtensa LX6), GRBL_ESP32, DRV8825, NEMA 17, Diode Laser Head',
    role: 'Converts QR matrix to linear raster G-code (M3 S255 PWM) and executes synchronized XY motion with micro-stepping.',
    input: 'G-Code program stream via USB serial or Wi-Fi UART buffer',
    output: 'Precision laser-ablated physical mark etched into metal surface',
    status: 'Demonstrated'
  },
  {
    id: 'layer_c',
    layer: 'C',
    layerTitle: 'Vision Alignment & Field Capture',
    name: 'Vision-Guided Alignment & ZXing Scanner',
    tech: 'OpenCV / Edge-AI Camera, ZXing ("Zebra Crossing") Android Mobile App',
    role: 'Compensates for track clip curvature during marking; decodes laser QR in low-light and dirty railway track conditions.',
    input: 'Optical surface image stream from mobile camera or inspection lens',
    output: 'Decoded payload URI with local GPS stamp and offline cache queue',
    status: 'In Development'
  },
  {
    id: 'layer_d',
    layer: 'D',
    layerTitle: 'Backend Intelligence Platform',
    name: 'FastAPI / Flask & PostgreSQL',
    tech: 'FastAPI / Python, PostgreSQL, SQLAlchemy, Pydantic, Redis cache',
    role: 'Maintains master digital asset records, event timelines, batch provenance hashes, and deferred offline sync queues.',
    input: 'Encrypted JSON scan payloads and depot inspection logs',
    output: 'Synchronized asset state, audit trail history, and REST endpoints',
    status: 'In Development'
  },
  {
    id: 'layer_e',
    layer: 'E',
    layerTitle: 'AI Analytics & Lifecycle Engine',
    name: 'scikit-learn Predictive Analytics',
    tech: 'Python scikit-learn, Isolation Forest, Random Forest Regressor',
    role: 'Performs multi-signal anomaly detection on wear rate, tracks service windows, and flags potential counterfeit or diverted parts.',
    input: 'Historical inspection intervals, cumulative tonnage, environmental factors',
    output: 'Predictive maintenance window advisories and supply-chain risk scores',
    status: 'Planned'
  },
  {
    id: 'layer_f',
    layer: 'F',
    layerTitle: 'External Interoperability',
    name: 'Indian Railways UDM & TMS Integration',
    tech: 'IREPS UDM (www.ireps.gov.in) & TMS (www.irecept.gov.in) REST Adapters',
    role: 'Bi-directional interoperability with official Indian Railways Track Management System and Unified Data Management portals.',
    input: 'Verified field track fitting audit records and replacement alerts',
    output: 'Automated asset inventory reconciliation and depot work orders',
    status: 'Mock Stage'
  }
];

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCH_NODES[0]);

  return (
    <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
              ARCHITECTURE & DATA FLOW
            </span>
            <span className="text-xs font-mono text-industrial-400">
              SIX CONNECTED SYSTEM LAYERS
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            End-to-End Cyber-Physical Architecture
          </h3>
          <p className="text-xs text-industrial-300 mt-1">
            Seamless convergence of embedded motion control, edge scanning, backend ledger, and predictive AI analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-industrial-400">
          <span className="w-2 h-2 rounded-full bg-cyanAccent animate-ping" />
          <span>Select any subsystem node below to inspect data boundaries</span>
        </div>
      </div>

      {/* Interactive Node Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARCH_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-4 rounded-xl border transition cursor-pointer relative ${
                isSelected
                  ? 'bg-industrial-850 border-cyanAccent shadow-cyan-glow'
                  : 'bg-industrial-950/80 border-industrial-800 hover:border-industrial-700 hover:bg-industrial-900'
              }`}
            >
              {/* Layer tag & Status badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-industrial-900 text-cyanAccent border border-industrial-700">
                  LAYER {node.layer}
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold ${
                  node.status === 'Demonstrated'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : node.status === 'In Development'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : node.status === 'Mock Stage'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {node.status.toUpperCase()}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{node.name}</h4>
              <p className="text-[11px] font-mono text-cyanAccent/90 mb-2 truncate">{node.tech}</p>
              <p className="text-xs text-industrial-300 line-clamp-2 leading-relaxed">
                {node.role}
              </p>

              {/* Selection Indicator line */}
              {isSelected && (
                <div className="mt-3 pt-2 border-t border-cyanAccent/30 flex items-center justify-between text-[10px] font-mono text-cyanAccent">
                  <span>ACTIVE NODE</span>
                  <span>CLICKED TO INSPECT ➔</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Specification Panel */}
      <div className="bg-industrial-950 p-5 rounded-xl border border-cyanAccent/40 space-y-4 cad-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-industrial-800">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyanAccent uppercase">
              LAYER {selectedNode.layer} DETAILED INTERFACE SPECIFICATION
            </span>
            <h4 className="text-lg font-bold text-white mt-0.5">{selectedNode.name}</h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-industrial-400">READINESS LEVEL:</span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-industrial-900 text-white border border-industrial-700">
              {selectedNode.status}
            </span>
          </div>
        </div>

        <p className="text-xs text-industrial-200 leading-relaxed">
          {selectedNode.role}
        </p>

        {/* I/O Data Flow Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-industrial-900 p-3.5 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] font-mono text-industrial-400 uppercase block">CORE TECHNOLOGIES:</span>
            <p className="text-xs font-mono text-cyanAccent font-semibold">{selectedNode.tech}</p>
          </div>

          <div className="bg-industrial-900 p-3.5 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] font-mono text-industrial-400 uppercase block">INPUT DATA STREAM:</span>
            <p className="text-xs text-industrial-200">{selectedNode.input}</p>
          </div>

          <div className="bg-industrial-900 p-3.5 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] font-mono text-industrial-400 uppercase block">OUTPUT DELIVERABLE:</span>
            <p className="text-xs text-emerald-300">{selectedNode.output}</p>
          </div>
        </div>

        {/* Interoperability Caveat for Layer F */}
        {selectedNode.layer === 'F' && (
          <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30 text-xs text-amber-300 leading-relaxed">
            <strong>Railway Integration Boundary Note:</strong> Live connection to Indian Railways UDM (ireps.gov.in) and TMS (irecept.gov.in) production servers requires formal IT authorization and credentials under Indian Railways CRIS guidelines. During current TRL-3 and prototype phases, mock REST adapters simulate genuine message formats.
          </div>
        )}
      </div>
    </div>
  );
};
