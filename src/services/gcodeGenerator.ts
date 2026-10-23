import type { GCodeInstruction } from '../types';

export interface ToolpathSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  laserActive: boolean;
  power: number;
}

export interface GeneratedGCodeResult {
  gcodeText: string;
  instructions: GCodeInstruction[];
  segments: ToolpathSegment[];
  estimatedDurationSec: number;
  totalModules: number;
  activeModules: number;
  matrixSize: number;
}

/**
 * Converts a QR code boolean matrix into realistic CNC Laser G-Code instructions.
 * GRBL_ESP32 compatible (M3 S[0-255] PWM, G1 feedrate).
 */
export function generateLaserGCode(
  matrix: boolean[][],
  markingSizeMm: number = 20, // default 20mm x 20mm for track clips
  feedRateMmMin: number = 850,
  laserPowerPwm: number = 255
): GeneratedGCodeResult {
  const matrixSize = matrix.length;
  const moduleSize = markingSizeMm / matrixSize;

  const instructions: GCodeInstruction[] = [];
  const segments: ToolpathSegment[] = [];
  const gcodeLines: string[] = [];

  let lineCount = 1;

  const addInstr = (
    raw: string,
    type: GCodeInstruction['type'],
    coords?: { x?: number; y?: number; z?: number; power?: number; feedRate?: number }
  ) => {
    instructions.push({
      line: lineCount++,
      raw,
      type,
      ...coords
    });
    gcodeLines.push(raw);
  };

  // Header & Safety
  addInstr(`; ========================================================`, 'INIT');
  addInstr(`; KEC-TIC AI-DRIVEN LASER QR MARKING TOOLPATH`, 'INIT');
  addInstr(`; Target: Metallic Track Fitting / Rail Clip Specimen`, 'INIT');
  addInstr(`; Matrix: ${matrixSize}x${matrixSize} | Size: ${markingSizeMm}mm x ${markingSizeMm}mm`, 'INIT');
  addInstr(`; Controller: ESP32 running GRBL_ESP32`, 'INIT');
  addInstr(`; ========================================================`, 'INIT');
  addInstr(`G21 ; Units in millimeters`, 'INIT');
  addInstr(`G90 ; Absolute coordinates`, 'INIT');
  addInstr(`G17 ; XY plane selection`, 'INIT');
  addInstr(`G0 Z2.000 F600 ; Focus clearance height`, 'RAPID', { z: 2.0 });
  addInstr(`G0 X0.000 Y0.000 F1500 ; Rapid home reference`, 'RAPID', { x: 0, y: 0 });
  addInstr(`M5 ; Guarantee laser off during transit`, 'LASER_OFF');

  let activeModules = 0;
  let currentX = 0;
  let currentY = 0;
  let totalDistanceMm = 0;

  // Horizontal raster lines with continuous burn segments (reduces start/stop overhead)
  for (let r = 0; r < matrixSize; r++) {
    // Invert Y so standard top-left QR matrix maps naturally to CNC positive quadrant
    const yCoord = Number(((matrixSize - 1 - r) * moduleSize).toFixed(3));
    
    // Zig-zag scanning to optimize CNC travel
    const cols = r % 2 === 0 
      ? Array.from({ length: matrixSize }, (_, i) => i)
      : Array.from({ length: matrixSize }, (_, i) => matrixSize - 1 - i);

    let inRun = false;
    let runStartX = 0;

    for (let cIdx = 0; cIdx < cols.length; cIdx++) {
      const c = cols[cIdx];
      const isBlack = matrix[r][c];

      if (isBlack) {
        activeModules++;
        const modStartX = Number((c * moduleSize).toFixed(3));
        const modEndX = Number(((c + 1) * moduleSize).toFixed(3));

        if (!inRun) {
          inRun = true;
          runStartX = r % 2 === 0 ? modStartX : modEndX;
        }

        // If at the end of the line, close run
        if (cIdx === cols.length - 1) {
          const runEndX = r % 2 === 0 ? modEndX : modStartX;
          emitRun(runStartX, runEndX, yCoord);
          inRun = false;
        }
      } else {
        if (inRun) {
          // Close run
          const prevC = cols[cIdx - 1];
          const runEndX = r % 2 === 0 ? Number(((prevC + 1) * moduleSize).toFixed(3)) : Number((prevC * moduleSize).toFixed(3));
          emitRun(runStartX, runEndX, yCoord);
          inRun = false;
        }
      }
    }
  }

  function emitRun(x1: number, x2: number, y: number) {
    // Rapid move to start of run if not already there
    if (Math.abs(currentX - x1) > 0.001 || Math.abs(currentY - y) > 0.001) {
      addInstr(`G0 X${x1.toFixed(3)} Y${y.toFixed(3)}`, 'RAPID', { x: x1, y });
      segments.push({
        startX: currentX,
        startY: currentY,
        endX: x1,
        endY: y,
        laserActive: false,
        power: 0
      });
      totalDistanceMm += Math.hypot(x1 - currentX, y - currentY);
      currentX = x1;
      currentY = y;
    }

    // Laser ON
    addInstr(`M3 S${laserPowerPwm} ; Laser ON`, 'LASER_ON', { power: laserPowerPwm });

    // Linear burn move
    addInstr(`G1 X${x2.toFixed(3)} Y${y.toFixed(3)} F${feedRateMmMin}`, 'LINEAR', {
      x: x2,
      y,
      feedRate: feedRateMmMin,
      power: laserPowerPwm
    });

    segments.push({
      startX: currentX,
      startY: currentY,
      endX: x2,
      endY: y,
      laserActive: true,
      power: laserPowerPwm
    });
    totalDistanceMm += Math.hypot(x2 - currentX, y - currentY);
    currentX = x2;
    currentY = y;

    // Laser OFF
    addInstr(`M5 ; Laser OFF`, 'LASER_OFF');
  }

  // Footer: safely return home and disable spindle/laser
  addInstr(`M5 ; Laser safety shutdown`, 'LASER_OFF');
  addInstr(`G0 Z5.000 F600 ; Retract laser head`, 'RAPID', { z: 5.0 });
  addInstr(`G0 X0.000 Y0.000 F1200 ; Return to origin`, 'RAPID', { x: 0, y: 0 });
  addInstr(`M2 ; End of program`, 'INIT');

  const estimatedDurationSec = Math.max(8, Number(((totalDistanceMm / feedRateMmMin) * 60 * 1.15).toFixed(1)));

  return {
    gcodeText: gcodeLines.join('\n'),
    instructions,
    segments,
    estimatedDurationSec,
    totalModules: matrixSize * matrixSize,
    activeModules,
    matrixSize
  };
}
