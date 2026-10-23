import type { HardwareBridgeConfig } from '../types';

export interface HardwareTelemetry {
  x: number;
  y: number;
  z: number;
  laserPwm: number;
  feedRate: number;
  status: 'IDLE' | 'RUN' | 'HOLD' | 'ALARM' | 'DISCONNECTED';
  bufferState: string;
}

export class HardwareAdapterService {
  private config: HardwareBridgeConfig = {
    mode: 'SIMULATION',
    bridgeEndpoint: 'ws://localhost:8088/grbl',
    baudRate: 115200,
    connected: false,
    armed: false,
    safetyInterlockClosed: false,
    emergencyStopEngaged: true, // safe default
    deviceFirmware: 'GRBL_ESP32 v1.3a [Planned Bridge]'
  };

  private listeners: ((config: HardwareBridgeConfig) => void)[] = [];
  private telemetryListeners: ((telemetry: HardwareTelemetry) => void)[] = [];
  private socket: WebSocket | null = null;

  public getConfig(): HardwareBridgeConfig {
    return { ...this.config };
  }

  public subscribe(cb: (config: HardwareBridgeConfig) => void) {
    this.listeners.push(cb);
    cb(this.config);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public subscribeTelemetry(cb: (telemetry: HardwareTelemetry) => void) {
    this.telemetryListeners.push(cb);
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.config }));
  }

  public setMode(mode: 'SIMULATION' | 'LIVE_HARDWARE') {
    this.config.mode = mode;
    if (mode === 'SIMULATION') {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      this.config.connected = false;
      this.config.armed = false;
    }
    this.notify();
  }

  public async connectLiveBridge(endpoint: string): Promise<{ success: boolean; message: string }> {
    this.config.bridgeEndpoint = endpoint;
    this.notify();

    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(endpoint);
        const timeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            this.config.connected = false;
            this.notify();
            resolve({
              success: false,
              message: `Connection timed out to ${endpoint}. Hardware bridge service is not running locally. Please start the local ESP32 bridge.`
            });
          }
        }, 2500);

        ws.onopen = () => {
          clearTimeout(timeout);
          this.socket = ws;
          this.config.connected = true;
          this.config.lastHeartbeat = new Date().toISOString();
          this.notify();
          resolve({
            success: true,
            message: `Successfully connected to local GRBL_ESP32 bridge at ${endpoint}.`
          });
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          this.config.connected = false;
          this.notify();
          resolve({
            success: false,
            message: `Could not connect to ${endpoint}. In live mode, run the local bridge daemon or revert to Simulation Mode.`
          });
        };

        ws.onclose = () => {
          this.config.connected = false;
          this.config.armed = false;
          this.notify();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.telemetryListeners.forEach(cb => cb(data));
          } catch {
            // raw GRBL string
          }
        };
      } catch (err: any) {
        this.config.connected = false;
        this.notify();
        resolve({
          success: false,
          message: `Network error opening socket: ${err.message || 'Check endpoint configuration'}`
        });
      }
    });
  }

  public disconnectLiveBridge() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.config.connected = false;
    this.config.armed = false;
    this.notify();
  }

  public armSafetyInterlock(armed: boolean, pinCode?: string): boolean {
    if (this.config.mode === 'SIMULATION') {
      this.config.armed = armed;
      this.config.safetyInterlockClosed = true;
      this.config.emergencyStopEngaged = false;
      this.notify();
      return true;
    }

    // Safety gate for Live hardware
    if (armed && (!this.config.connected || this.config.emergencyStopEngaged)) {
      return false;
    }
    this.config.armed = armed;
    this.notify();
    return true;
  }

  public toggleEmergencyStop() {
    this.config.emergencyStopEngaged = !this.config.emergencyStopEngaged;
    if (this.config.emergencyStopEngaged) {
      this.config.armed = false;
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Send immediate GRBL hardware feed hold & laser off
        this.socket.send("!\nM5\n");
      }
    }
    this.notify();
  }
}

export const hardwareAdapter = new HardwareAdapterService();
