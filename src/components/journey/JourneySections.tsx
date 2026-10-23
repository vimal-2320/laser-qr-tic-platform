import React, { useState } from 'react';
import { PROJECT_METADATA } from '../../data/mockData';
import { ProjectLogo } from '../layout/ProjectLogo';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Eye, 
  FileText, 
  Activity, 
  Database, 
  Radio, 
  Terminal,
  Play,
  Cpu,
  Smartphone
} from 'lucide-react';

interface JourneySectionsProps {
  onScrollToSection: (sectionId: string) => void;
  onRunSimulation: () => void;
}

export const HeroSection: React.FC<JourneySectionsProps> = ({ onScrollToSection, onRunSimulation }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-cad-grid">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyanAccent/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amberAccent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        {/* Creative Project Logo Header */}
        <div className="flex justify-center mb-1">
          <ProjectLogo size={64} />
        </div>

        {/* Top Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-industrial-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-industrial-700/80 shadow-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyanAccent animate-pulse" />
          <span className="text-white font-semibold">SASTRA – TCS TIC CALL FOR PROPOSAL</span>
          <span className="text-industrial-500">•</span>
          <span className="text-cyanAccent">DOMAIN: ARTIFICIAL INTELLIGENCE</span>
          <span className="text-industrial-500">•</span>
          <span className="text-emerald-400 font-bold">TRL 3 LAB PROOF OF CONCEPT</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto">
          AI-Driven Laser QR Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent via-blue-400 to-cyan-300">Marking System</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-industrial-300 max-w-3xl mx-auto font-normal leading-relaxed">
          {PROJECT_METADATA.subtitle}
        </p>

        {/* Institutional & Team Attribution Banner */}
        <div className="text-xs font-mono text-industrial-400 flex flex-wrap items-center justify-center gap-3 pt-2">
          <span>Institution: <strong className="text-white">{PROJECT_METADATA.institution}</strong></span>
          <span className="text-industrial-600">|</span>
          <span>Dept. of Electronics & Instrumentation Engineering</span>
          <span className="text-industrial-600">|</span>
          <span>PI: <strong className="text-cyanAccent">{PROJECT_METADATA.pi.name}</strong></span>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onScrollToSection('machine-3d')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyanAccent hover:bg-cyan-300 text-black font-mono font-bold text-xs sm:text-sm transition shadow-cyan-glow cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>EXPLORE 3D MACHINE</span>
          </button>

          <button
            onClick={() => {
              onScrollToSection('marking-sim');
              onRunSimulation();
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-industrial-850 hover:bg-industrial-800 text-white font-mono font-bold text-xs sm:text-sm border border-industrial-700 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-amberAccent" />
            <span>RUN LIVE SIMULATION</span>
          </button>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-10 text-left">
          <div className="bg-industrial-900/80 p-3.5 rounded-xl border border-industrial-800">
            <span className="text-[10px] font-mono text-cyanAccent uppercase block">SURFACE DURABILITY</span>
            <span className="text-sm font-bold text-white">Permanent Laser Ablation</span>
            <p className="text-[11px] text-industrial-400 mt-0.5">Outlasts paint and peelable stickers</p>
          </div>
          <div className="bg-industrial-900/80 p-3.5 rounded-xl border border-industrial-800">
            <span className="text-[10px] font-mono text-cyanAccent uppercase block">EDGE CAPABILITY</span>
            <span className="text-sm font-bold text-white">Offline ZXing Scanning</span>
            <p className="text-[11px] text-industrial-400 mt-0.5">Zero network dependency in track yards</p>
          </div>
          <div className="bg-industrial-900/80 p-3.5 rounded-xl border border-industrial-800">
            <span className="text-[10px] font-mono text-cyanAccent uppercase block">ANALYTICS ENGINE</span>
            <span className="text-sm font-bold text-white">AI Anomaly Scoring</span>
            <p className="text-[11px] text-industrial-400 mt-0.5">Predictive maintenance advisories</p>
          </div>
          <div className="bg-industrial-900/80 p-3.5 rounded-xl border border-industrial-800">
            <span className="text-[10px] font-mono text-cyanAccent uppercase block">GRANT REQUEST</span>
            <span className="text-sm font-bold text-white">₹50 Lakhs / 18 Months</span>
            <p className="text-[11px] text-industrial-400 mt-0.5">4 Gated development milestones</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProblemSection: React.FC = () => {
  const problemPoints = [
    {
      num: "01",
      title: "Identity Fades in Harsh Weather",
      desc: "Traditional paint stencils and adhesive labels degrade rapidly under rain, dust, UV exposure, and continuous track vibrations.",
      impact: "Loss of optical traceability within months of field installation."
    },
    {
      num: "02",
      title: "Counterfeit & Sub-standard Infiltration",
      desc: "Without a cryptographically or physically tamper-proof mark, substandard parts can enter safety-critical infrastructure undetected.",
      impact: "Severe safety risk and compromised structural integrity across track fittings."
    },
    {
      num: "03",
      title: "Broken Lifecycle Audit Trail",
      desc: "Once surface identification is eroded, the manufacturing batch, metallurgy spec, and installation history cannot be retrieved.",
      impact: "Undermines preventive maintenance and defect liability tracking."
    },
    {
      num: "04",
      title: "Manual, Error-Prone Inspection Logging",
      desc: "Field engineers rely on manual paper books and fragmented spreadsheets that are slow and difficult to reconcile with central portals.",
      impact: "Disconnection from Indian Railways UDM (ireps.gov.in) and TMS systems."
    },
    {
      num: "05",
      title: "Reactive Rather than Predictive Repairs",
      desc: "Without continuous digital usage-history, track maintenance is triggered only after visible wear or component fracture occurs.",
      impact: "Higher downtime, increased operating cost, and safety exposure."
    }
  ];

  return (
    <section id="problem" className="py-20 border-t border-industrial-800/80 bg-industrial-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amberAccent/10 text-amberAccent border border-amberAccent/30">
              INDUSTRIAL CONTEXT
            </span>
            <span className="text-xs font-mono text-industrial-400">THE CRITICAL TRACEABILITY GAP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Safety-Critical Track Fittings Need Identity That Survives the Elements
          </h2>
          <p className="text-sm text-industrial-300 mt-2 leading-relaxed">
            Indian Railways operates 69,439 route km and over 1.11 lakh running-track km. Tens of millions of Elastic Rail Clips (ERC), liners, and fasteners endure intense mechanical strain with inadequate permanent identification.
          </p>
        </div>

        {/* Network Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-industrial-900 p-5 rounded-xl border border-industrial-800">
            <span className="text-3xl font-extrabold font-mono text-cyanAccent">69,439 km</span>
            <p className="text-xs font-semibold text-white mt-1">Route Network Length</p>
            <p className="text-[11px] text-industrial-400 mt-0.5">Indian Railways 2024–25 Master Data</p>
          </div>
          <div className="bg-industrial-900 p-5 rounded-xl border border-industrial-800">
            <span className="text-3xl font-extrabold font-mono text-white">~54 Crore</span>
            <p className="text-xs font-semibold text-white mt-1">Total Addressable Fittings</p>
            <p className="text-[11px] text-industrial-400 mt-0.5">~18 cr sleepers & ~36 cr clips across network</p>
          </div>
          <div className="bg-industrial-900 p-5 rounded-xl border border-industrial-800">
            <span className="text-3xl font-extrabold font-mono text-amberAccent">1 Partner Depot</span>
            <p className="text-xs font-semibold text-white mt-1">Obtainable First Beachhead</p>
            <p className="text-[11px] text-industrial-400 mt-0.5">Zonal depot pilot target in Months 13–18</p>
          </div>
        </div>

        {/* 5 Problem Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemPoints.map((item, idx) => (
            <div key={idx} className="bg-industrial-900 p-5 rounded-xl border border-industrial-800 hover:border-industrial-700 transition space-y-2">
              <span className="text-xs font-mono font-bold text-amberAccent">
                {item.num}. SHORTCOMING
              </span>
              <h4 className="text-base font-bold text-white">{item.title}</h4>
              <p className="text-xs text-industrial-300 leading-relaxed">{item.desc}</p>
              <div className="pt-2 border-t border-industrial-800 text-[11px] font-mono text-industrial-400">
                <span className="text-red-400 font-semibold">Impact:</span> {item.impact}
              </div>
            </div>
          ))}
        </div>

        {/* Competitive Comparison Table */}
        <div className="bg-industrial-900 rounded-xl border border-industrial-800 overflow-hidden">
          <div className="p-4 bg-industrial-850 border-b border-industrial-800 flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              QUALITATIVE COMPARATIVE LANDSCAPE
            </h4>
            <span className="text-[10px] font-mono text-industrial-400">BENCHMARK MATRIX</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-industrial-950 text-industrial-400 font-mono text-[11px] border-b border-industrial-800">
                <tr>
                  <th className="p-3.5">Identification Method</th>
                  <th className="p-3.5">Physical Durability</th>
                  <th className="p-3.5">Traceability Workflow</th>
                  <th className="p-3.5">Offline Field Scan</th>
                  <th className="p-3.5">AI Lifecycle Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800 text-industrial-300">
                <tr>
                  <td className="p-3.5 font-semibold text-white">Paint / Stencil</td>
                  <td className="p-3.5 text-red-400">Low (Fades quickly)</td>
                  <td className="p-3.5">Manual logging</td>
                  <td className="p-3.5 text-industrial-500">No</td>
                  <td className="p-3.5 text-industrial-500">None</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Adhesive Barcode Labels</td>
                  <td className="p-3.5 text-red-400">Low–Medium (Peels)</td>
                  <td className="p-3.5">Manual scanning</td>
                  <td className="p-3.5 text-industrial-500">No</td>
                  <td className="p-3.5 text-industrial-500">None</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Die-Stamp / Dot-Peen</td>
                  <td className="p-3.5 text-amber-400">High durability</td>
                  <td className="p-3.5">Manual optical readout</td>
                  <td className="p-3.5 text-industrial-400">Yes (Alphanumeric)</td>
                  <td className="p-3.5 text-industrial-500">None</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Commercial Laser OEMs</td>
                  <td className="p-3.5 text-emerald-400">High durability</td>
                  <td className="p-3.5">Proprietary / Isolated</td>
                  <td className="p-3.5 text-emerald-400">Yes</td>
                  <td className="p-3.5 text-industrial-400">Limited / Hardware only</td>
                </tr>
                <tr className="bg-cyanAccent/5 font-semibold">
                  <td className="p-3.5 text-cyanAccent flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" /> OUR PROPOSED SYSTEM
                  </td>
                  <td className="p-3.5 text-emerald-400">Permanent Laser Ablation</td>
                  <td className="p-3.5 text-cyanAccent">Integrated UDM/TMS Ready</td>
                  <td className="p-3.5 text-emerald-400">Yes (ZXing Edge-AI)</td>
                  <td className="p-3.5 text-cyanAccent">Predictive & Anomaly Built-in</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SolutionSection: React.FC = () => {
  const pillars = [
    {
      step: "01",
      title: "Permanent Physical Identification",
      desc: "Laser micro-ablation alters the metal crystal structure directly, creating a mark that cannot be peeled, washed, or easily forged.",
      tag: "Demonstrated TRL-3"
    },
    {
      step: "02",
      title: "AI-Guided Precision Alignment",
      desc: "Computer-vision algorithms detect component surface boundaries and curvature, automatically compensating focal distance and angle.",
      tag: "Phase 2 Planned"
    },
    {
      step: "03",
      title: "Edge-AI Mobile Scanning",
      desc: "On-device ZXing decoder enables instant QR readout in dark tunnels and remote track corridors without continuous cloud connectivity.",
      tag: "Phase 2 Planned"
    },
    {
      step: "04",
      title: "Predictive Lifecycle Intelligence",
      desc: "Backend machine-learning algorithms analyze cumulative service days, vibration cycles, and track wear to forecast maintenance windows.",
      tag: "Phase 3 Planned"
    },
    {
      step: "05",
      title: "UDM / TMS Railway Interoperability",
      desc: "Designed to interface directly with Indian Railways Unified Data Management and Track Management System registries.",
      tag: "Mock Validated"
    }
  ];

  return (
    <section id="solution" className="py-20 border-t border-industrial-800/80 bg-industrial-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
              PROPOSED SOLUTION
            </span>
            <span className="text-xs font-mono text-industrial-400">FIVE CONNECTED SOLUTION PILLARS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engrave Once. Scan Anywhere. Predict Throughout Lifecycle.
          </h2>
          <p className="text-sm text-industrial-300 mt-2 leading-relaxed">
            Our unified platform bridges physical marking hardware, low-cost embedded controllers, edge scanning applications, and cloud-based predictive maintenance analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pillars.map((p, idx) => (
            <div key={idx} className="bg-industrial-950 p-5 rounded-xl border border-industrial-800 space-y-2 hover:border-cyanAccent/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyanAccent">{p.step}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-industrial-900 text-industrial-400 border border-industrial-800">
                  {p.tag}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white pt-1">{p.title}</h4>
              <p className="text-xs text-industrial-300 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Slide Deck Image Feature Card */}
        <div className="bg-industrial-950 rounded-2xl border border-industrial-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-industrial-800">
            <div>
              <span className="text-[10px] font-mono text-cyanAccent uppercase">
                AUTHENTIC PROJECT SUBMISSION SLIDE DECK
              </span>
              <h4 className="text-base font-bold text-white">
                SASTRA – TCS Technology Innovation Centre (TIC) Deck Overview
              </h4>
            </div>
            <span className="text-xs font-mono text-industrial-400">
              Department of EIE • Kongu Engineering College
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-industrial-800 bg-industrial-900 group">
            <img
              src="/assets/tic_project_slides.jpg"
              alt="TIC Project Presentation Deck Slides"
              className="w-full object-cover rounded-xl transition duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute bottom-3 right-3 bg-industrial-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-industrial-700 text-[10px] font-mono text-industrial-300">
              Original Submission Slides (All 13 Panels)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
