import { INITIAL_DEMO_COMPONENTS } from '../data/mockData';
import type { ComponentRecord, LifecycleEvent } from '../types';

const STORAGE_KEY = 'kec_tic_rail_components_v1';

export class ComponentRegistry {
  private components: ComponentRecord[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.components = JSON.parse(stored);
      } else {
        this.components = [...INITIAL_DEMO_COMPONENTS];
        this.persist();
      }
    } catch {
      this.components = [...INITIAL_DEMO_COMPONENTS];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.components));
    } catch {
      // Ignore if localStorage unavailable
    }
  }

  public getAll(): ComponentRecord[] {
    return [...this.components];
  }

  public getById(id: string): ComponentRecord | undefined {
    return this.components.find(c => c.id.toLowerCase() === id.toLowerCase());
  }

  public save(component: ComponentRecord) {
    const idx = this.components.findIndex(c => c.id.toLowerCase() === component.id.toLowerCase());
    if (idx >= 0) {
      this.components[idx] = component;
    } else {
      this.components.unshift(component);
    }
    this.persist();
  }

  /**
   * Resolves ANY scanned QR payload string offline:
   * 1. Checks if ID exists in local registry.
   * 2. If it's a URL or IR-TIC payload, parses URL query params.
   * 3. If totally new / unknown, auto-registers as a new offline-discovered track specimen!
   */
  public resolveScannedPayload(payload: string): ComponentRecord {
    const trimmed = payload.trim();

    // 1. Check direct ID match
    const directMatch = this.components.find(c => 
      c.id.toLowerCase() === trimmed.toLowerCase() ||
      c.qrPayload.toLowerCase() === trimmed.toLowerCase()
    );
    if (directMatch) {
      return this.recordScanEvent(directMatch, "Existing component recognized by offline ZXing match.");
    }

    // 2. Parse URI format: IR-TIC://... or https://...?id=...
    let parsedId = '';
    let parsedBatch = '';
    let parsedCategory: ComponentRecord['category'] = 'Custom Industrial Specimen';

    try {
      if (trimmed.includes('?')) {
        const queryStr = trimmed.split('?')[1];
        const params = new URLSearchParams(queryStr);
        if (params.get('id')) parsedId = params.get('id')!;
        if (params.get('batch')) parsedBatch = params.get('batch')!;
        if (params.get('cat')) {
          const cat = params.get('cat')!;
          if (cat.includes('ERC')) parsedCategory = 'Elastic Rail Clip (ERC-III)';
          else if (cat.includes('GFN')) parsedCategory = 'GFN-66 Insulating Liner';
          else if (cat.includes('Fastener')) parsedCategory = 'Metal Sleeper Fastener';
          else if (cat.includes('Fishplate')) parsedCategory = 'Fishplate Bolt';
        }
      }
    } catch {
      // Fallback
    }

    if (!parsedId) {
      // Generate clean ID from raw text
      const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 24);
      parsedId = sanitized ? `SCANNED-${sanitized}` : `SCANNED-VAL-${Date.now().toString().slice(-4)}`;
    }

    // Check if parsed ID already exists
    const existing = this.getById(parsedId);
    if (existing) {
      return this.recordScanEvent(existing, "Decoded from URI query parameters.");
    }

    // 3. Create newly discovered offline record
    const newRecord: ComponentRecord = {
      id: parsedId,
      category: parsedCategory,
      manufacturer: "Offline Discovered Specimen (Field Scan)",
      batchNumber: parsedBatch || `BATCH-FIELD-${new Date().getFullYear()}`,
      manufacturingDate: new Date().toISOString().split('T')[0],
      installationDate: new Date().toISOString().split('T')[0],
      depotLocation: "Zonal Field Patrol Corridor (Offline Ingest)",
      material: "High-Strength Structural Steel (Field Sample)",
      specification: "IRS-Field / RDSO Audit Verification Queue",
      status: "In Depot",
      serviceDays: 1,
      vibrationCycleHours: 24,
      environmentalExposure: "Moderate",
      lastInspectionWearScore: 18,
      provenanceHash: `SHA256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      syncStatus: "Offline Cached (Deferred Sync)",
      notes: `Decoded locally without internet connection from raw payload: "${trimmed.slice(0, 80)}"`,
      qrPayload: trimmed,
      lifecycleEvents: [
        {
          id: `ev-new-${Date.now()}-1`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'CREATED',
          location: 'Field Mobile Scan Station',
          operator: 'Field Inspector (Offline ZXing App)',
          description: `Discovered and catalogued offline from QR mark: ${parsedId}`,
          statusTag: 'Demonstrated'
        },
        {
          id: `ev-new-${Date.now()}-2`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'INSPECTION',
          location: 'Field Mobile Scan Station',
          operator: 'Offline Traceability Engine',
          description: 'Queued in local device cache for deferred synchronization to central UDM/TMS ledger.',
          statusTag: 'Demonstrated'
        }
      ]
    };

    this.save(newRecord);
    return newRecord;
  }

  private recordScanEvent(comp: ComponentRecord, detail: string): ComponentRecord {
    const updatedEvent: LifecycleEvent = {
      id: `ev-scan-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: 'INSPECTION',
      location: 'Local Field Inspection Point',
      operator: 'Field Inspector (Offline App)',
      description: `Offline scan verified: ${detail}`,
      statusTag: 'Demonstrated'
    };

    const updated: ComponentRecord = {
      ...comp,
      lifecycleEvents: [updatedEvent, ...comp.lifecycleEvents]
    };

    this.save(updated);
    return updated;
  }
}

export const componentRegistry = new ComponentRegistry();
