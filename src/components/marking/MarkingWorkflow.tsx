import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { ComponentRecord } from '../../types';
import { INITIAL_DEMO_COMPONENTS } from '../../data/mockData';
import { generateLaserGCode, type GeneratedGCodeResult } from '../../services/gcodeGenerator';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Download, 
  Copy, 
  Check, 
  Zap, 
  Cpu, 
  Settings2, 
  Sliders, 
  FileCode, 
  Layers,
  ArrowRight,
  Flame
} from 'lucide-react';

interface MarkingWorkflowProps {
  onSimulationStateChange?: (isSimulating: boolean, progress: number, currentCoord?: { x: number; y: number; laserActive: boolean } | null) => void;
  onComponentMarked?: (component: ComponentRecord) => void;
  activeComponent: ComponentRecord;
  setActiveComponent: (comp: ComponentRecord) => void;
}

export const MarkingWorkflow: React.FC<MarkingWorkflowProps> = ({
  onSimulationStateChange,
  onComponentMarked,
  activeComponent,
  setActiveComponent
}) => {
  // Preset selector
  const [selectedPresetId, setSelectedPresetId] = useState<string>(activeComponent.id);

  // Form editable states
  const [componentId, setComponentId] = useState<string>(activeComponent.id);
  const [category, setCategory] = useState<ComponentRecord['category']>(activeComponent.category);
  const [manufacturer, setManufacturer] = useState<string>(activeComponent.manufacturer);
  const [batchNumber, setBatchNumber] = useState<string>(activeComponent.batchNumber);
  const [depotLocation, setDepotLocation] = useState<string>(activeComponent.depotLocation);

  // QR & GCode State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
  const [gcodeResult, setGcodeResult] = useState<GeneratedGCodeResult | null>(null);
  const [copiedGcode, setCopiedGcode] = useState(false);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0); // 0 to 1
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [activeGCodeLine, setActiveGCodeLine] = useState<number>(0);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);

  // Toolpath 2D Canvas Ref
  const toolpathCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Update form when preset changes
  const handleSelectPreset = (id: string) => {
    const comp = INITIAL_DEMO_COMPONENTS.find(c => c.id === id);
    if (!comp) return;
    setSelectedPresetId(id);
    setActiveComponent(comp);
    setComponentId(comp.id);
    setCategory(comp.category);
    setManufacturer(comp.manufacturer);
    setBatchNumber(comp.batchNumber);
    setDepotLocation(comp.depotLocation);
    resetSimulation();
  };

  // Generate QR Code & Matrix
  useEffect(() => {
    const payload = `IR-TIC://v1/rail/component?id=${encodeURIComponent(componentId)}&batch=${encodeURIComponent(batchNumber)}&cat=${encodeURIComponent(category)}`;
    
    // Generate data URL for image display
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#00f2fe',
        light: '#0b1320'
      }
    }).then(url => {
      setQrDataUrl(url);
    });

    // Generate raw matrix for G-code toolpath
    const rawQr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const size = rawQr.modules.size;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(rawQr.modules.get(r, c)));
      }
      matrix.push(row);
    }
    setQrMatrix(matrix);

    // Generate GCode
    const gcode = generateLaserGCode(matrix, 20, 850, 255);
    setGcodeResult(gcode);
  }, [componentId, batchNumber, category]);

  // Sync simulation state with parent (and 3D machine viewer)
  useEffect(() => {
    if (onSimulationStateChange) {
      const seg = gcodeResult?.segments[activeSegmentIndex];
      const coord = seg ? { x: seg.endX, y: seg.endY, laserActive: seg.laserActive } : null;
      onSimulationStateChange(isPlaying, simProgress, coord);
    }
  }, [isPlaying, simProgress, activeSegmentIndex, gcodeResult, onSimulationStateChange]);

  // Simulation tick loop
  useEffect(() => {
    if (!isPlaying || !gcodeResult) return;

    const totalSegments = gcodeResult.segments.length;
    const durationMs = (gcodeResult.estimatedDurationSec * 1000) / simSpeed;
    const startTime = performance.now() - simProgress * durationMs;

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1.0, elapsed / durationMs);
      setSimProgress(progress);

      const currentSeg = Math.min(totalSegments - 1, Math.floor(progress * totalSegments));
      setActiveSegmentIndex(currentSeg);

      // Estimate active G-code instruction line
      const totalInstr = gcodeResult.instructions.length;
      const activeLine = Math.min(totalInstr - 1, Math.floor(progress * totalInstr));
      setActiveGCodeLine(activeLine);

      if (progress >= 1.0) {
        setIsPlaying(false);
        setSimulationComplete(true);
        if (onComponentMarked) {
          const updatedRecord: ComponentRecord = {
            ...activeComponent,
            id: componentId,
            category,
            manufacturer,
            batchNumber,
            depotLocation,
            qrPayload: `IR-TIC://v1/rail/component?id=${encodeURIComponent(componentId)}&batch=${encodeURIComponent(batchNumber)}&org=KEC-TIC`,
            status: 'Manufactured'
          };
          onComponentMarked(updatedRecord);
        }
      } else {
        requestRef.current = requestAnimationFrame(tick);
      }
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, simSpeed, gcodeResult]);

  // Draw 2D Toolpath Canvas Preview
  useEffect(() => {
    const canvas = toolpathCanvasRef.current;
    if (!canvas || !gcodeResult) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.fillStyle = '#080c12';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Scale mm coordinates to canvas pixels
    // Marking size is 20mm, leave padding
    const padding = 35;
    const scale = (width - padding * 2) / 20;

    // Draw full toolpath in background
    gcodeResult.segments.forEach((seg, idx) => {
      const isPast = idx <= activeSegmentIndex;
      const isCurrent = idx === activeSegmentIndex && isPlaying;

      const px1 = padding + seg.startX * scale;
      const py1 = height - (padding + seg.startY * scale);
      const px2 = padding + seg.endX * scale;
      const py2 = height - (padding + seg.endY * scale);

      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);

      if (seg.laserActive) {
        if (isPast) {
          // Burned mark
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 3.5;
          ctx.shadowBlur = isCurrent ? 12 : 2;
          ctx.shadowColor = '#00f2fe';
        } else {
          // Planned laser line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
      } else {
        // Rapid travel move
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }

      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });

    // Draw active CNC laser focal spot
    if (gcodeResult.segments[activeSegmentIndex]) {
      const seg = gcodeResult.segments[activeSegmentIndex];
      const cx = padding + seg.endX * scale;
      const cy = height - (padding + seg.endY * scale);

      if (isPlaying && seg.laserActive) {
        // Red laser burn spark
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3b30';
        ctx.shadowColor = '#ff3b30';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Idle cursor crosshair
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.moveTo(cx - 8, cy);
        ctx.lineTo(cx + 8, cy);
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx, cy + 8);
        ctx.stroke();
      }
    }
  }, [gcodeResult, activeSegmentIndex, isPlaying]);

  const togglePlay = () => {
    if (simulationComplete) {
      resetSimulation();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setSimProgress(0);
    setActiveSegmentIndex(0);
    setActiveGCodeLine(0);
    setSimulationComplete(false);
  };

  const handleStepForward = () => {
    if (!gcodeResult) return;
    setIsPlaying(false);
    const nextSeg = Math.min(gcodeResult.segments.length - 1, activeSegmentIndex + 5);
    setActiveSegmentIndex(nextSeg);
    setSimProgress(nextSeg / gcodeResult.segments.length);
  };

  const copyGcodeToClipboard = () => {
    if (!gcodeResult) return;
    navigator.clipboard.writeText(gcodeResult.gcodeText);
    setCopiedGcode(true);
    setTimeout(() => setCopiedGcode(false), 2000);
  };

  return (
    <div className="bg-industrial-900 border border-industrial-700/80 rounded-2xl p-6 shadow-2xl">
      {/* Header & Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-industrial-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
              MODULE 01
            </span>
            <span className="text-xs font-mono text-industrial-400">DEMONSTRATED LAB PIPELINE (TRL 3)</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            QR Generation → G-Code Vectorization → Laser Marking Simulator
          </h3>
          <p className="text-sm text-industrial-300 mt-1">
            Validates end-to-end data translation from digital component metadata into precision CNC laser toolpaths.
          </p>
        </div>

        {/* Specimen Preset Selector */}
        <div className="flex items-center gap-2 bg-industrial-950 p-2 rounded-xl border border-industrial-800">
          <span className="text-xs font-mono text-industrial-400 pl-1">PRESET:</span>
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-industrial-850 border border-industrial-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:border-cyanAccent cursor-pointer"
          >
            {INITIAL_DEMO_COMPONENTS.map(c => (
              <option key={c.id} value={c.id}>
                {c.category} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: 4 Connected Functional Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* ==================================================== */}
        {/* STEP 1: COMPONENT REGISTRATION (Col 1-4) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider text-cyanAccent uppercase flex items-center gap-1.5 font-bold">
              <span>01.</span> COMPONENT REGISTRATION
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              VALIDATED
            </span>
          </div>

          <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-3">
            <div>
              <label className="text-[11px] font-mono text-industrial-400 block mb-1">COMPONENT IDENTIFIER (ID)</label>
              <input
                type="text"
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
                className="w-full bg-industrial-900 border border-industrial-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyanAccent"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-industrial-400 block mb-1">EQUIPMENT CATEGORY</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as any;
                  setCategory(newCat);
                  setActiveComponent({ ...activeComponent, category: newCat });
                }}
                className="w-full bg-industrial-900 border border-industrial-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyanAccent"
              >
                <option value="Elastic Rail Clip (ERC-III)">Elastic Rail Clip (ERC-III)</option>
                <option value="GFN-66 Insulating Liner">GFN-66 Insulating Liner</option>
                <option value="Metal Sleeper Fastener">Metal Sleeper Fastener</option>
                <option value="Fishplate Bolt">Fishplate Bolt</option>
                <option value="Custom Industrial Specimen">Custom Industrial Specimen</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-industrial-400 block mb-1">MANUFACTURER</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-industrial-900 border border-industrial-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyanAccent"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-industrial-400 block mb-1">BATCH NUMBER</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full bg-industrial-900 border border-industrial-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyanAccent"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-industrial-400 block mb-1">ALLOCATED DEPOT / YARD</label>
              <input
                type="text"
                value={depotLocation}
                onChange={(e) => setDepotLocation(e.target.value)}
                className="w-full bg-industrial-900 border border-industrial-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyanAccent"
              />
            </div>
          </div>

          {/* QR Code Matrix Output Card */}
          <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 flex items-center gap-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Generated Component QR"
                className="w-24 h-24 rounded-lg bg-industrial-900 p-1 border border-cyanAccent/30 shadow-cyan-glow"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-industrial-900 animate-pulse border border-industrial-800" />
            )}
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-mono text-cyanAccent uppercase">ENCODED QR MATRIX</span>
              <p className="text-xs font-mono text-white font-semibold">
                {qrMatrix.length} x {qrMatrix.length} Modules
              </p>
              <p className="text-[11px] text-industrial-400 truncate">
                Payload: IR-TIC://v1/rail/component?id={componentId}
              </p>
              <a
                href={qrDataUrl}
                download={`${componentId}-qr.png`}
                className="inline-flex items-center gap-1 text-[11px] text-cyanAccent hover:underline pt-1"
              >
                <Download className="w-3 h-3" /> Save QR Image
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 2 & 3: TOOLPATH & G-CODE PREVIEW (Col 5-8) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider text-cyanAccent uppercase flex items-center gap-1.5 font-bold">
              <span>02.</span> G-CODE TOOLPATH RASTER
            </h4>
            <span className="text-[10px] font-mono text-industrial-400">
              GRBL_ESP32 SYNTAX
            </span>
          </div>

          {/* 2D CNC Canvas Preview */}
          <div className="relative bg-industrial-950 rounded-xl border border-industrial-800 p-2 overflow-hidden shadow-inner flex flex-col items-center">
            <canvas
              ref={toolpathCanvasRef}
              width={320}
              height={260}
              className="rounded-lg w-full max-w-[320px] h-[260px] border border-industrial-800"
            />
            {/* Overlay Status info */}
            <div className="w-full flex items-center justify-between px-2 pt-2 text-[10px] font-mono text-industrial-400">
              <span>AREA: 20mm x 20mm</span>
              <span>FEED: 850 mm/min</span>
              <span className="text-cyanAccent">POWER: 100% PWM</span>
            </div>
          </div>

          {/* Live G-Code Stream Terminal */}
          <div className="bg-industrial-950 p-3 rounded-xl border border-industrial-800 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-industrial-800">
              <span className="text-[10px] text-industrial-400 flex items-center gap-1.5">
                <FileCode className="w-3 h-3 text-cyanAccent" /> GENERATED G-CODE STREAM
              </span>
              <button
                onClick={copyGcodeToClipboard}
                className="text-[10px] text-industrial-300 hover:text-white flex items-center gap-1 hover:underline"
              >
                {copiedGcode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedGcode ? 'COPIED' : 'COPY'}
              </button>
            </div>

            <div className="h-28 overflow-y-auto space-y-1 text-[11px] pr-1">
              {gcodeResult?.instructions.slice(0, 40).map((inst, idx) => (
                <div
                  key={idx}
                  className={`px-1.5 py-0.5 rounded flex items-center justify-between transition-colors ${
                    activeGCodeLine === idx 
                      ? 'bg-cyanAccent/20 text-cyanAccent font-bold border-l-2 border-cyanAccent'
                      : 'text-industrial-400'
                  }`}
                >
                  <span>{inst.raw}</span>
                  <span className="text-[9px] text-industrial-500">{inst.type}</span>
                </div>
              ))}
              {gcodeResult && gcodeResult.instructions.length > 40 && (
                <div className="text-[10px] text-industrial-500 text-center pt-1">
                  ... +{gcodeResult.instructions.length - 40} more lines (M2 End of Program)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 4: MARKING SIMULATION CONTROLS & STATUS (Col 9-12) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider text-amberAccent uppercase flex items-center gap-1.5 font-bold">
              <span>03.</span> SIMULATE LASER ENGRAVING
            </h4>
            <span className="text-[10px] font-mono text-amberAccent bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SIMULATION MODE
            </span>
          </div>

          <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-4">
            {/* Operational State Banner */}
            <div className="flex items-center justify-between bg-industrial-900 p-3 rounded-lg border border-industrial-800">
              <div>
                <span className="text-[10px] font-mono text-industrial-400 block">MACHINE STATE:</span>
                <span className={`text-xs font-mono font-bold ${
                  simulationComplete 
                    ? 'text-emerald-400' 
                    : isPlaying 
                    ? 'text-amber-400 animate-pulse' 
                    : 'text-industrial-300'
                }`}>
                  {simulationComplete 
                    ? 'SIMULATION COMPLETE — MARK GENERATED' 
                    : isPlaying 
                    ? 'ABLATING SUBSTRATE (ACTIVE)' 
                    : 'STANDBY — READY'}
                </span>
              </div>
              <Flame className={`w-5 h-5 ${isPlaying ? 'text-laser-laser animate-bounce' : 'text-industrial-600'}`} />
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-industrial-400">ENGRAVING PROGRESS</span>
                <span className="text-white font-bold">{Math.round(simProgress * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-industrial-900 rounded-full overflow-hidden border border-industrial-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyanAccent via-amberAccent to-laser-laser rounded-full transition-all duration-75 shadow-cyan-glow"
                  style={{ width: `${simProgress * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-industrial-400 mt-1">
                <span>EST: {gcodeResult?.estimatedDurationSec}s</span>
                <span>SEGMENT: {activeSegmentIndex} / {gcodeResult?.segments.length || 0}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={togglePlay}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold transition shadow-lg ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                    : 'bg-cyanAccent hover:bg-cyan-300 text-black shadow-cyan-glow'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : simulationComplete ? 'RE-RUN SIM' : 'ENGRAVE'}</span>
              </button>

              <button
                onClick={resetSimulation}
                className="p-2.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 text-industrial-300 hover:text-white border border-industrial-700 transition"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleStepForward}
                disabled={isPlaying || simulationComplete}
                className="p-2.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 text-industrial-300 hover:text-white border border-industrial-700 transition disabled:opacity-40"
                title="Step Forward (+5 segments)"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Live 3D Workstation Sync Indicator */}
            {isPlaying && (
              <a
                href="#machine-3d"
                className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] font-mono text-red-300 hover:bg-red-500/20 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>3D Workstation laser & sparks active</span>
                </span>
                <span className="text-cyanAccent underline">View 3D Workstation ➔</span>
              </a>
            )}

            {/* Speed Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-industrial-400">SIM SPEED:</span>
              <div className="flex items-center gap-1 bg-industrial-900 p-1 rounded-lg border border-industrial-800">
                {[1, 2, 5].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                      simSpeed === spd 
                        ? 'bg-cyanAccent text-black font-bold' 
                        : 'text-industrial-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Safety & Realism Disclaimer */}
            <div className="bg-industrial-900/60 p-2.5 rounded-lg border border-industrial-800 text-[10px] text-industrial-400 leading-relaxed">
              <span className="font-bold text-amber-400">SAFETY BOUNDARY:</span> Browser simulation does not transmit live motion or pulse commands to physical machinery. Physical laser activation requires live hardware mode with armed interlocks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
