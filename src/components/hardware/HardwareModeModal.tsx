import React, { useState, useEffect } from 'react';
import type { HardwareBridgeConfig } from '../../types';
import { hardwareAdapter } from '../../services/hardwareBridge';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Power, 
  Sliders, 
  Terminal,
  X
} from 'lucide-react';

interface HardwareModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModeChanged?: (config: HardwareBridgeConfig) => void;
}

export const HardwareModeModal: React.FC<HardwareModeModalProps> = ({
  isOpen,
  onClose,
  onModeChanged
}) => {
  const [config, setConfig] = useState<HardwareBridgeConfig>(hardwareAdapter.getConfig());
  const [endpointInput, setEndpointInput] = useState<string>(config.bridgeEndpoint);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const unsub = hardwareAdapter.subscribe((updated) => {
      setConfig(updated);
      if (onModeChanged) onModeChanged(updated);
    });
    return unsub;
  }, [onModeChanged]);

  const handleSwitchMode = (mode: 'SIMULATION' | 'LIVE_HARDWARE') => {
    hardwareAdapter.setMode(mode);
    if (mode === 'SIMULATION') {
      setStatusMessage('Switched to internal deterministic simulation mode.');
    } else {
      setStatusMessage('Live hardware mode active. Real bridge connection required.');
    }
  };

  const handleConnectLive = async () => {
    setConnecting(true);
    setStatusMessage(`Attempting WebSocket handshake with ${endpointInput}...`);
    const res = await hardwareAdapter.connectLiveBridge(endpointInput);
    setConnecting(false);
    setStatusMessage(res.message);
  };

  const handleDisconnectLive = () => {
    hardwareAdapter.disconnectLiveBridge();
    setStatusMessage('Hardware bridge disconnected.');
  };

  const handleToggleEStop = () => {
    hardwareAdapter.toggleEmergencyStop();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-industrial-900 border border-industrial-700 rounded-2xl shadow-2xl overflow-hidden cad-corner">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyanAccent" />
            <h3 className="text-base font-bold text-white tracking-wide">
              OPERATING MODE & HARDWARE BRIDGE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-industrial-400 hover:text-white hover:bg-industrial-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSwitchMode('SIMULATION')}
              className={`p-4 rounded-xl border text-left transition ${
                config.mode === 'SIMULATION'
                  ? 'bg-industrial-850 border-cyanAccent shadow-cyan-glow'
                  : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white">SIMULATION MODE</span>
                <CheckCircle2 className={`w-4 h-4 ${config.mode === 'SIMULATION' ? 'text-cyanAccent' : 'text-industrial-600'}`} />
              </div>
              <p className="text-[11px] text-industrial-400 leading-snug">
                Fully functional deterministic demo. Runs in-browser without physical machine.
              </p>
            </button>

            <button
              onClick={() => handleSwitchMode('LIVE_HARDWARE')}
              className={`p-4 rounded-xl border text-left transition ${
                config.mode === 'LIVE_HARDWARE'
                  ? 'bg-industrial-850 border-amberAccent shadow-amber-glow'
                  : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white">LIVE HARDWARE</span>
                {config.connected ? (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amberAccent" />
                )}
              </div>
              <p className="text-[11px] text-industrial-400 leading-snug">
                Connects to local ESP32 / GRBL bridge daemon via WebSocket or Serial.
              </p>
            </button>
          </div>

          {/* Live Hardware Configuration & State */}
          {config.mode === 'LIVE_HARDWARE' && (
            <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-industrial-300 font-bold uppercase">
                  LOCAL GRBL_ESP32 BRIDGE
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  config.connected 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {config.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono text-industrial-400 block mb-1">
                  BRIDGE WEBSOCKET / SERIAL ENDPOINT:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    disabled={config.connected}
                    placeholder="ws://localhost:8088/grbl"
                    className="flex-1 bg-industrial-900 border border-industrial-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyanAccent disabled:opacity-50"
                  />
                  {config.connected ? (
                    <button
                      onClick={handleDisconnectLive}
                      className="px-4 py-1.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold hover:bg-red-500/30 transition"
                    >
                      DISCONNECT
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectLive}
                      disabled={connecting}
                      className="px-4 py-1.5 rounded bg-amberAccent text-black text-xs font-mono font-bold hover:bg-amber-400 transition disabled:opacity-50"
                    >
                      {connecting ? 'CONNECTING...' : 'CONNECT'}
                    </button>
                  )}
                </div>
              </div>

              {/* Safety Interlock Controls */}
              <div className="pt-2 border-t border-industrial-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-industrial-400">HARDWARE EMERGENCY STOP:</span>
                  <button
                    onClick={handleToggleEStop}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      config.emergencyStopEngaged
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse'
                        : 'bg-industrial-800 text-industrial-300 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{config.emergencyStopEngaged ? 'E-STOP ENGAGED' : 'CLEAR E-STOP'}</span>
                  </button>
                </div>

                <div className="bg-amber-500/10 p-2.5 rounded border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed">
                  <strong>Critical Machine Safety Rule:</strong> Physical diode laser activation is prohibited unless an authorized operator physically clears the E-Stop and confirms Class 1 protective enclosure interlocks. Web commands cannot override hardware latch switches.
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="bg-industrial-950 px-3.5 py-2.5 rounded-lg border border-industrial-800 text-xs font-mono text-industrial-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyanAccent shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-industrial-950 border-t border-industrial-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-xs font-mono text-white transition"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
