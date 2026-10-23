// Domain types for AI-Driven Laser QR Marking System

export type StatusTag = 'Demonstrated' | 'Simulation' | 'In Development' | 'Planned' | 'Requires Validation';

export interface ComponentRecord {
  id: string;
  category: 'Elastic Rail Clip (ERC-III)' | 'GFN-66 Insulating Liner' | 'Metal Sleeper Fastener' | 'Fishplate Bolt' | 'Custom Industrial Specimen';
  manufacturer: string;
  batchNumber: string;
  manufacturingDate: string;
  installationDate?: string;
  depotLocation: string;
  material: string;
  specification: string;
  status: 'Manufactured' | 'In Depot' | 'Installed' | 'Maintenance Due' | 'Flagged Inconsistency';
  lifecycleEvents: LifecycleEvent[];
  qrPayload: string;
  notes?: string;
  // Field wear & AI inputs
  serviceDays: number;
  vibrationCycleHours: number;
  environmentalExposure: 'Arid' | 'Moderate' | 'Coastal / Corrosive' | 'Heavy Industrial';
  lastInspectionWearScore: number; // 0 to 100
  provenanceHash: string;
  syncStatus: 'Synchronized with UDM/TMS (Mock)' | 'Offline Cached (Deferred Sync)' | 'Pending Verification';
}

export interface LifecycleEvent {
  id: string;
  timestamp: string;
  type: 'CREATED' | 'GCODE_GENERATED' | 'LASER_ENGRAVED' | 'DEPOT_DISPATCH' | 'TRACK_INSTALL' | 'INSPECTION' | 'MAINTENANCE_ADVISORY';
  location: string;
  operator: string;
  description: string;
  statusTag: StatusTag;
}

export interface MachineSubsystem {
  id: string;
  name: string;
  category: 'Structure' | 'Motion' | 'Optics' | 'Electronics' | 'Safety' | 'Workpiece';
  description: string;
  specifications: string[];
  currentStatus: StatusTag;
  explodedOffset: [number, number, number];
  subsystemRole: string;
}

export interface GCodeInstruction {
  line: number;
  raw: string;
  type: 'RAPID' | 'LINEAR' | 'LASER_ON' | 'LASER_OFF' | 'DWELL' | 'INIT';
  x?: number;
  y?: number;
  z?: number;
  power?: number;
  feedRate?: number;
}

export interface HardwareBridgeConfig {
  mode: 'SIMULATION' | 'LIVE_HARDWARE';
  bridgeEndpoint: string;
  baudRate: number;
  connected: boolean;
  armed: boolean;
  safetyInterlockClosed: boolean;
  emergencyStopEngaged: boolean;
  lastHeartbeat?: string;
  deviceFirmware?: string;
}

export interface AIAnalyticsResult {
  healthScore: number; // 0 - 100
  anomalyScore: number; // 0.0 - 1.0
  riskCategory: 'Low Risk / Optimal' | 'Moderate Wear / Monitor' | 'Critical Maintenance Due' | 'Provenance Anomaly / Flagged';
  predictedRemainingDays: number;
  contributingSignals: { signal: string; impact: string; level: 'normal' | 'warn' | 'alert' }[];
  advisoryText: string;
  counterfeitAnalysis: {
    status: 'AUTHENTIC_RECORD_MATCH' | 'UNREGISTERED_BATCH' | 'LOCATION_ANOMALY';
    confidenceNote: string;
    requiresManualVerification: boolean;
  };
}
