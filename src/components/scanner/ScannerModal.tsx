import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  Zap, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  WifiOff, 
  FileCheck,
  ScanLine
} from 'lucide-react';
import type { ComponentRecord } from '../../types';
import { componentRegistry } from '../../services/componentRegistry';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordFound: (record: ComponentRecord) => void;
  activeDemoComponent: ComponentRecord;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onRecordFound,
  activeDemoComponent
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'camera' | 'upload'>('demo');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('Offline decoder ready (No internet needed)');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [decodedPayload, setDecodedPayload] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop camera stream & processing loop
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setDecodedPayload(null);
    }
  }, [isOpen, stopCamera]);

  // Real-time camera optical scan loop using offline jsQR
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (code && code.data) {
      setDecodedPayload(code.data);
      setScanStatus(`QR Code Detected: "${code.data.slice(0, 32)}..."`);
      stopCamera();

      // Resolve component locally via offline registry
      const resolved = componentRegistry.resolveScannedPayload(code.data);
      setTimeout(() => {
        onRecordFound(resolved);
      }, 600);
      return;
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [onRecordFound, stopCamera]);

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setScanStatus('Acquiring camera stream (Offline client-side processing)...');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera MediaDevices API is unavailable in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus('Scanning optical feed for QR codes in real-time...');
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err: any) {
      setCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or camera device unavailable.');
      setScanStatus('Camera unavailable. You can upload an image file or use Instant Demo Scan.');
    }
  };

  // Instant 1-click Demo Scan
  const handleScanDemoQR = () => {
    setIsScanning(true);
    setScanStatus('Decoding active specimen payload offline...');
    setTimeout(() => {
      setIsScanning(false);
      const resolved = componentRegistry.resolveScannedPayload(activeDemoComponent.qrPayload);
      setScanStatus(`Decoded: ${resolved.id}`);
      onRecordFound(resolved);
    }, 450);
  };

  // Decode uploaded image file offline using jsQR
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus(`Analyzing "${file.name}" offline...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          setIsScanning(false);
          setScanStatus('Canvas failure reading image.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });

        setIsScanning(false);
        if (code && code.data) {
          setDecodedPayload(code.data);
          setScanStatus(`Decoded QR: "${code.data}"`);
          const resolved = componentRegistry.resolveScannedPayload(code.data);
          setTimeout(() => {
            onRecordFound(resolved);
          }, 600);
        } else {
          // If no raw QR was recognized in image, allow fallback demo match
          setScanStatus('No valid QR matrix found in file. Using demo component fallback.');
          const resolved = componentRegistry.resolveScannedPayload(activeDemoComponent.qrPayload);
          setTimeout(() => {
            onRecordFound(resolved);
          }, 800);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-industrial-900 border border-industrial-700 rounded-2xl shadow-2xl overflow-hidden cad-corner">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyanAccent animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>FIELD MOBILE SCANNER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <WifiOff className="w-3 h-3" /> OFFLINE FIRST
              </span>
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded text-industrial-400 hover:text-white hover:bg-industrial-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-industrial-800 bg-industrial-950 text-xs font-mono">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('demo');
            }}
            className={`flex-1 py-3 text-center transition ${
              activeTab === 'demo'
                ? 'bg-industrial-900 text-cyanAccent font-bold border-b-2 border-cyanAccent'
                : 'text-industrial-400 hover:text-white'
            }`}
          >
            INSTANT DEMO SCAN
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex-1 py-3 text-center transition ${
              activeTab === 'camera'
                ? 'bg-industrial-900 text-cyanAccent font-bold border-b-2 border-cyanAccent'
                : 'text-industrial-400 hover:text-white'
            }`}
          >
            LIVE WEBCAM
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex-1 py-3 text-center transition ${
              activeTab === 'upload'
                ? 'bg-industrial-900 text-cyanAccent font-bold border-b-2 border-cyanAccent'
                : 'text-industrial-400 hover:text-white'
            }`}
          >
            FILE UPLOAD
          </button>
        </div>

        {/* Hidden Processing Canvas for video analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'demo' && (
            <div className="text-center space-y-4">
              <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 max-w-xs mx-auto">
                <span className="text-[10px] font-mono text-industrial-400 block mb-1">
                  CURRENT ACTIVE SPECIMEN
                </span>
                <p className="text-sm font-mono font-bold text-cyanAccent">{activeDemoComponent.id}</p>
                <p className="text-xs text-industrial-300">{activeDemoComponent.category}</p>
                <div className="mt-2 text-[10px] font-mono text-industrial-500 truncate">
                  Payload: {activeDemoComponent.qrPayload}
                </div>
              </div>

              <p className="text-xs text-industrial-300 max-w-sm mx-auto">
                Decodes and retrieves the digital twin record completely client-side. Zero internet dependency required.
              </p>

              <button
                onClick={handleScanDemoQR}
                disabled={isScanning}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyanAccent text-black font-mono font-bold text-xs hover:bg-cyan-300 transition shadow-cyan-glow disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PARSING QR MATRIX...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>DECODE SPECIMEN RECORD</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4 text-center">
              {cameraError ? (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-left">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                    <AlertCircle className="w-4 h-4" /> Camera Unavailable
                  </div>
                  <p className="text-xs text-industrial-300">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-3 px-3 py-1.5 rounded bg-industrial-800 text-xs text-industrial-200 hover:text-white"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-56 bg-industrial-950 rounded-xl overflow-hidden border border-industrial-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Real-time scanning HUD overlay */}
                  <div className="absolute inset-8 border-2 border-cyanAccent/70 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="w-full h-0.5 bg-cyanAccent/60 absolute animate-pulse" />
                    <ScanLine className="w-8 h-8 text-cyanAccent/80 animate-bounce" />
                  </div>
                </div>
              )}

              <p className="text-[11px] font-mono text-industrial-400">
                Point your device camera at ANY laser-marked or printed QR code. Offline parser decodes in real time.
              </p>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="text-center space-y-4">
              <label className="block w-full border-2 border-dashed border-industrial-700 hover:border-cyanAccent rounded-xl p-8 cursor-pointer bg-industrial-950 transition">
                <Upload className="w-8 h-8 text-cyanAccent mx-auto mb-2" />
                <span className="text-xs font-semibold text-white block">
                  Select or drop a QR code image to decode offline
                </span>
                <span className="text-[11px] text-industrial-400">
                  Runs client-side pure Canvas image processing (jsQR)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {isScanning && (
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyanAccent">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning image pixels for 2D barcode modules...</span>
                </div>
              )}
            </div>
          )}

          {/* Status Bar */}
          <div className="bg-industrial-950 px-3.5 py-2.5 rounded-lg border border-industrial-800 flex items-center justify-between text-xs font-mono">
            <span className="text-industrial-400">STATUS:</span>
            <span className="text-cyanAccent truncate max-w-[280px]">{scanStatus}</span>
          </div>

          {decodedPayload && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Decoded payload: {decodedPayload}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
