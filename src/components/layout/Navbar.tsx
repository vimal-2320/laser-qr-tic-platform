import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  QrCode, 
  BrainCircuit, 
  Calendar, 
  Users, 
  Radio, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';
import type { HardwareBridgeConfig } from '../../types';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenHardwareModal: () => void;
  hardwareConfig: HardwareBridgeConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenScanner,
  onOpenHardwareModal,
  hardwareConfig
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Problem & Context', href: '#problem' },
    { label: 'Solution Pillars', href: '#solution' },
    { label: '3D Digital Twin', href: '#machine-3d' },
    { label: 'Marking Simulator', href: '#marking-sim' },
    { label: 'Digital Record', href: '#traceability' },
    { label: 'AI Analytics', href: '#ai-analytics' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Roadmap & Budget', href: '#roadmap' },
    { label: 'Team', href: '#team' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-industrial-950/90 backdrop-blur-md border-b border-industrial-800 shadow-xl py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyanAccent to-blue-600 flex items-center justify-center shadow-cyan-glow group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-black font-bold fill-current" />
          </div>
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
              Kongu Engineering College • SASTRA-TCS TIC
            </p>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-mono text-industrial-300">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="hover:text-cyanAccent transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls: Mode Pill & Scanner Button */}
        <div className="flex items-center gap-3">
          {/* Operating Mode Status Pill */}
          <button
            onClick={onOpenHardwareModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
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
            <span className="hidden sm:inline">
              {hardwareConfig.mode === 'SIMULATION' ? 'SIMULATION MODE' : hardwareConfig.connected ? 'LIVE CONNECTED' : 'LIVE DISCONNECTED'}
            </span>
          </button>

          {/* Quick Scanner Action */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyanAccent text-black text-xs font-mono font-bold hover:bg-cyan-300 transition shadow-cyan-glow"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SCAN QR</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 text-industrial-300 hover:text-white rounded-lg hover:bg-industrial-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-industrial-950/98 border-b border-industrial-800 px-4 py-4 space-y-2 text-xs font-mono shadow-2xl">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-industrial-300 hover:text-cyanAccent border-b border-industrial-900 last:border-none"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
