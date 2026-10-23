import React from 'react';
import type { ComponentRecord } from '../../types';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Wrench, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle, 
  Calendar, 
  Cpu, 
  FileText,
  Activity,
  Layers
} from 'lucide-react';

interface ComponentRecordCardProps {
  record: ComponentRecord;
  onClose?: () => void;
}

export const ComponentRecordCard: React.FC<ComponentRecordCardProps> = ({ record, onClose }) => {
  return (
    <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
              DIGITAL ASSET TWIN
            </span>
            <span className="text-xs font-mono text-industrial-400">
              {record.syncStatus}
            </span>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white tracking-wide">
            {record.id}
          </h3>
          <p className="text-xs text-industrial-300 mt-0.5">
            {record.category} • {record.specification}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
            record.status === 'Installed'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : record.status === 'Maintenance Due'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-cyanAccent/10 text-cyanAccent border-cyanAccent/30'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{record.status.toUpperCase()}</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-industrial-400 hover:text-white p-1 text-sm rounded bg-industrial-800 hover:bg-industrial-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Primary Metadata 3-Column Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Manufacturing Origin */}
        <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-2.5">
          <span className="text-[10px] font-mono tracking-widest text-industrial-400 uppercase flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-cyanAccent" /> PRODUCTION PROVENANCE
          </span>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Manufacturer:</div>
            <div className="text-xs font-semibold text-white">{record.manufacturer}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Batch Identifier:</div>
            <div className="text-xs font-mono text-cyanAccent">{record.batchNumber}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Manufacture Date:</div>
            <div className="text-xs text-industrial-200">{record.manufacturingDate}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Substrate Material:</div>
            <div className="text-xs text-industrial-200">{record.material}</div>
          </div>
        </div>

        {/* Column 2: Track Deployment Status */}
        <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-2.5">
          <span className="text-[10px] font-mono tracking-widest text-industrial-400 uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amberAccent" /> FIELD DEPLOYMENT
          </span>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Assigned Depot / Line:</div>
            <div className="text-xs font-semibold text-white">{record.depotLocation}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Installation Date:</div>
            <div className="text-xs text-industrial-200">{record.installationDate || 'Pre-commissioning'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Cumulative Service Days:</div>
            <div className="text-xs font-mono text-white">{record.serviceDays} Days</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Environmental Zone:</div>
            <div className="text-xs text-industrial-200">{record.environmentalExposure}</div>
          </div>
        </div>

        {/* Column 3: Authenticity & Interoperability */}
        <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-2.5">
          <span className="text-[10px] font-mono tracking-widest text-industrial-400 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AUTHENTICITY VALIDATION
          </span>
          <div className="space-y-1">
            <div className="text-[11px] text-industrial-400">Provenance Cryptographic Hash:</div>
            <div className="text-[10px] font-mono text-industrial-300 break-all bg-industrial-900 p-1.5 rounded border border-industrial-800">
              {record.provenanceHash}
            </div>
          </div>
          <div className="pt-1">
            <div className="text-[10px] text-industrial-400 leading-tight">
              <span className="text-cyanAccent font-semibold">Integrity Protocol:</span> Matched against Indian Railways UDM/TMS mock ledger.
            </div>
          </div>
          <div className="text-[10px] text-amber-400/90 leading-tight bg-amber-500/10 p-2 rounded border border-amber-500/20">
            <strong>Security Note:</strong> Optical QR scan alone does not prove genuineness. True anti-counterfeiting requires cross-verifying the provenance hash with authorized central database records.
          </div>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono tracking-wider text-industrial-300 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyanAccent" /> ASSET LIFECYCLE AUDIT TRAIL
          </h4>
          <span className="text-[11px] font-mono text-industrial-400">
            {record.lifecycleEvents.length} Recorded Events
          </span>
        </div>

        <div className="relative pl-6 border-l-2 border-industrial-800 space-y-4">
          {record.lifecycleEvents.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-industrial-900 border-2 border-cyanAccent group-hover:scale-125 transition-transform" />
              
              <div className="bg-industrial-950 p-3 rounded-xl border border-industrial-800 hover:border-industrial-700 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold font-mono text-white">
                    {ev.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-industrial-400">{ev.timestamp}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      ev.statusTag === 'Demonstrated' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ev.statusTag}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-industrial-300 mb-1">{ev.description}</p>
                
                <div className="flex items-center gap-4 text-[10px] font-mono text-industrial-500">
                  <span>📍 {ev.location}</span>
                  <span>👤 {ev.operator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
