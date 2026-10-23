import React, { useState } from 'react';
import { 
  Zap, 
  QrCode, 
  Layers, 
  Cpu, 
  BrainCircuit, 
  Calendar, 
  FileText, 
  Users,
  Menu, 
  X,
  Radio
} from 'lucide-react';
import { ProjectLogo } from './ProjectLogo';
import type { HardwareBridgeConfig } from '../../types';

export type NavigationTab = 
  | 'workstation-simulator'
  | 'field-scanner'
  | 'ai-analytics'
  | 'architecture'
  | 'budget-roadmap'
  | 'team'
  | 'tic-overview';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenScanner: () => void;
  onOpenHardwareModal: () => void;
  hardwareConfig: HardwareBridgeConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenHardwareModal,
  hardwareConfig
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'workstation-simulator', label: '3D Workstation & Simulator', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'field-scanner', label: 'Offline Scanner', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'ai-analytics', label: 'AI Analytics', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { id: 'architecture', label: 'Architecture', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'budget-roadmap', label: 'Budget & Roadmap', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'team', label: 'Team Members', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'tic-overview', label: 'TIC Overview', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-industrial-950/95 backdrop-blur-md border-b border-industrial-800 shadow-xl">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Creative Project Logo & Title */}
        <div className="flex items-center gap-3">
          <ProjectLogo size={40} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-white font-mono">
                AI-LASER QR
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                TRL 3 PoC
              </span>
            </div>
            <p className="text-[10px] text-industrial-400 font-mono tracking-tight hidden sm:block">
              Edge-AI Laser Marking Platform • TIC Prototype
            </p>
          </div>
        </div>

        {/* Action Controls: Operating Mode & Offline Scanner Shortcut */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenHardwareModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              hardwareConfig.mode === 'SIMULATION'
                ? 'bg-industrial-900 border-cyanAccent/40 text-cyanAccent hover:bg-industrial-850'
                : hardwareConfig.connected
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              hardwareConfig.mode === 'SIMULATION'
                ? 'bg-cyanAccent animate-pulse'
                : hardwareConfig.connected
                ? 'bg-emerald-400'
                : 'bg-amber-400 animate-ping'
            }`} />
            <span className="hidden md:inline">
              {hardwareConfig.mode === 'SIMULATION' ? 'SIMULATION MODE' : hardwareConfig.connected ? 'LIVE CONNECTED' : 'LIVE DISCONNECTED'}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('field-scanner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyanAccent text-black text-xs font-mono font-bold hover:bg-cyan-300 transition shadow-cyan-glow"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OFFLINE SCAN</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 text-industrial-300 hover:text-white rounded-lg hover:bg-industrial-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Industrial Workstation Module Tab Bar */}
      <div className="bg-industrial-900 border-t border-industrial-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto gap-1 py-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-industrial-950 text-cyanAccent font-bold border border-cyanAccent/50 shadow-cyan-glow'
                    : 'text-industrial-300 hover:text-white hover:bg-industrial-850/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-industrial-950 border-b border-industrial-800 px-4 py-3 space-y-1 text-xs font-mono">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition ${
                activeTab === tab.id ? 'bg-cyanAccent/10 text-cyanAccent font-bold' : 'text-industrial-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
