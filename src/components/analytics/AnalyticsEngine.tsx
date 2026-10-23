import React, { useState, useMemo } from 'react';
import type { ComponentRecord, AIAnalyticsResult } from '../../types';
import { 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Sliders, 
  TrendingDown, 
  Activity, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface AnalyticsEngineProps {
  component: ComponentRecord;
}

export const AnalyticsEngine: React.FC<AnalyticsEngineProps> = ({ component }) => {
  // Interactive user-adjustable simulation parameters
  const [serviceDays, setServiceDays] = useState<number>(component.serviceDays);
  const [wearScore, setWearScore] = useState<number>(component.lastInspectionWearScore);
  const [vibrationHours, setVibrationHours] = useState<number>(component.vibrationCycleHours);
  const [isOverdue, setIsOverdue] = useState<boolean>(component.status === 'Maintenance Due');
  const [environment, setEnvironment] = useState<ComponentRecord['environmentalExposure']>(component.environmentalExposure);
  const [simulatedBatchTamper, setSimulatedBatchTamper] = useState<boolean>(false);

  // Compute deterministic AI-assisted analytics result
  const analytics: AIAnalyticsResult = useMemo(() => {
    let penalty = 0;
    const signals: AIAnalyticsResult['contributingSignals'] = [];

    // Service Days Impact
    if (serviceDays > 365) {
      penalty += 20;
      signals.push({
        signal: 'Extended Service Exposure (> 1 Year)',
        impact: '-20% Lifetime Reserve',
        level: 'warn'
      });
    } else if (serviceDays > 180) {
      penalty += 10;
      signals.push({
        signal: 'Mid-Cycle Operating Interval',
        impact: '-10% Nominal Ageing',
        level: 'normal'
      });
    }

    // Wear Score Impact
    if (wearScore > 70) {
      penalty += 35;
      signals.push({
        signal: 'High Physical Wear Index (> 70)',
        impact: '-35% Structural Fatigue Risk',
        level: 'alert'
      });
    } else if (wearScore > 40) {
      penalty += 15;
      signals.push({
        signal: 'Moderate Surface Abrasion Observed',
        impact: '-15% Gradual Wear',
        level: 'warn'
      });
    }

    // Overdue Flag
    if (isOverdue) {
      penalty += 25;
      signals.push({
        signal: 'Overdue Scheduled Track Audit',
        impact: '-25% Compliance Deficiency',
        level: 'alert'
      });
    }

    // Environmental Zone
    if (environment === 'Coastal / Corrosive') {
      penalty += 15;
      signals.push({
        signal: 'Saline Coastal Atmosphere (High Chloride Corrosion)',
        impact: '-15% Accelerated Oxidation Factor',
        level: 'warn'
      });
    }

    // Batch Tamper / Provenance Inconsistency
    if (simulatedBatchTamper) {
      penalty += 45;
      signals.push({
        signal: 'Cryptographic Provenance Hash Mismatch with Central UDM Registry',
        impact: '-45% High Counterfeit / Unregistered Specimen Probability',
        level: 'alert'
      });
    }

    const healthScore = Math.max(5, Math.min(100, 100 - penalty));
    const anomalyScore = Number(((100 - healthScore) / 100).toFixed(2));

    let riskCategory: AIAnalyticsResult['riskCategory'] = 'Low Risk / Optimal';
    let advisoryText = 'Component operating within nominal tolerances. Maintain scheduled track patrol inspections.';

    if (simulatedBatchTamper) {
      riskCategory = 'Provenance Anomaly / Flagged';
      advisoryText = 'CRITICAL ALERT: Specimen QR code resolves to unauthenticated hash. Immediately quarantine component for metallurgical verification before installation.';
    } else if (healthScore < 40 || isOverdue) {
      riskCategory = 'Critical Maintenance Due';
      advisoryText = 'URGENT: Accelerated fatigue and wear detected. Issue priority work order for track replacement and toe-load verification.';
    } else if (healthScore < 70) {
      riskCategory = 'Moderate Wear / Monitor';
      advisoryText = 'ADVISORY: Surface micro-abrasion detected. Log for next divisional track maintenance cycle; schedule non-destructive ultrasonic testing.';
    }

    const predictedRemainingDays = Math.max(14, Math.round((healthScore / 100) * 450));

    return {
      healthScore,
      anomalyScore,
      riskCategory,
      predictedRemainingDays,
      contributingSignals: signals,
      advisoryText,
      counterfeitAnalysis: {
        status: simulatedBatchTamper ? 'UNREGISTERED_BATCH' : 'AUTHENTIC_RECORD_MATCH',
        confidenceNote: simulatedBatchTamper
          ? 'Batch checksum does not match signed manufacturer keys in mock UDM registry.'
          : 'Manufacturer batch and cryptographic hash match recorded manufacturing lot.',
        requiresManualVerification: simulatedBatchTamper || healthScore < 50
      }
    };
  }, [serviceDays, wearScore, vibrationHours, isOverdue, environment, simulatedBatchTamper]);

  const resetParams = () => {
    setServiceDays(component.serviceDays);
    setWearScore(component.lastInspectionWearScore);
    setVibrationHours(component.vibrationCycleHours);
    setIsOverdue(component.status === 'Maintenance Due');
    setEnvironment(component.environmentalExposure);
    setSimulatedBatchTamper(false);
  };

  return (
    <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Title & Methodology Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amberAccent/10 text-amberAccent border border-amberAccent/30">
              MODULE 02
            </span>
            <span className="text-xs font-mono text-industrial-400">
              PREDICTIVE MAINTENANCE & ANOMALY ENGINE (PLANNED SCIKIT-LEARN PIPELINE)
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyanAccent" /> AI Lifecycle Intelligence & Anomaly Scoring
          </h3>
          <p className="text-xs text-industrial-300 mt-1">
            Demonstrates how component age, track wear observations, and supply-chain records are synthesized into actionable maintenance advisories.
          </p>
        </div>

        <button
          onClick={resetParams}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 text-xs font-mono text-industrial-300 hover:text-white border border-industrial-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RESET TO FIELD VALUES</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================================================== */}
        {/* LEFT COLUMN: INTERACTIVE SIMULATION CONTROLS (Col 1-5) */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 bg-industrial-950 p-5 rounded-xl border border-industrial-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyanAccent uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> SIMULATION TELEMETRY INPUTS
            </span>
            <span className="text-[10px] font-mono text-industrial-500">SAMPLE DATA</span>
          </div>

          {/* Service Days Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-industrial-400">Cumulative Service Days:</span>
              <span className="text-white font-bold">{serviceDays} Days</span>
            </div>
            <input
              type="range"
              min="10"
              max="730"
              step="10"
              value={serviceDays}
              onChange={(e) => setServiceDays(Number(e.target.value))}
              className="w-full accent-cyanAccent cursor-pointer"
            />
          </div>

          {/* Wear Index Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-industrial-400">Reported Surface Wear Index:</span>
              <span className={`font-bold ${wearScore > 65 ? 'text-amber-400' : 'text-cyanAccent'}`}>
                {wearScore} / 100
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={wearScore}
              onChange={(e) => setWearScore(Number(e.target.value))}
              className="w-full accent-cyanAccent cursor-pointer"
            />
          </div>

          {/* Environmental Exposure */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-industrial-400 block">Environmental Climate Zone:</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as any)}
              className="w-full bg-industrial-900 border border-industrial-700 text-white rounded px-3 py-1.5 text-xs font-mono focus:border-cyanAccent cursor-pointer"
            >
              <option value="Moderate">Moderate Inland Zone</option>
              <option value="Coastal / Corrosive">Coastal / Corrosive (Saline Mist)</option>
              <option value="Heavy Industrial">Heavy Industrial Yard (Acid/Dust)</option>
              <option value="Arid">Arid / High Thermal Swing</option>
            </select>
          </div>

          {/* Overdue Checkbox */}
          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-industrial-900 border border-industrial-800 cursor-pointer hover:border-industrial-700 transition">
            <input
              type="checkbox"
              checked={isOverdue}
              onChange={(e) => setIsOverdue(e.target.checked)}
              className="accent-amberAccent w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-white block">Simulate Overdue Track Inspection</span>
              <span className="text-[10px] text-industrial-400">Exceeds 180-day RDSO mandated inspection window</span>
            </div>
          </label>

          {/* Counterfeit / Tamper Simulation Switch */}
          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 cursor-pointer hover:border-red-500/60 transition">
            <input
              type="checkbox"
              checked={simulatedBatchTamper}
              onChange={(e) => setSimulatedBatchTamper(e.target.checked)}
              className="accent-red-500 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-red-400 block">Simulate Supply-Chain Anomaly</span>
              <span className="text-[10px] text-industrial-400">Inject mismatched batch hash to test anti-counterfeit flag</span>
            </div>
          </label>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: PREDICTIVE DIAGNOSTICS & ADVISORY (Col 6-12) */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Health Score */}
            <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-industrial-400 uppercase block mb-1">HEALTH SCORE</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-mono ${
                  analytics.healthScore >= 70 ? 'text-emerald-400' : analytics.healthScore >= 45 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {analytics.healthScore}
                </span>
                <span className="text-xs text-industrial-500">/ 100</span>
              </div>
              <div className="w-full bg-industrial-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${
                    analytics.healthScore >= 70 ? 'bg-emerald-400' : analytics.healthScore >= 45 ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${analytics.healthScore}%` }}
                />
              </div>
            </div>

            {/* Anomaly Score */}
            <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-industrial-400 uppercase block mb-1">ANOMALY INDEX</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-mono ${
                  analytics.anomalyScore < 0.35 ? 'text-cyanAccent' : analytics.anomalyScore < 0.65 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {analytics.anomalyScore}
                </span>
                <span className="text-xs text-industrial-500">(0.0 - 1.0)</span>
              </div>
              <span className="text-[10px] font-mono text-industrial-400 block mt-2">
                Isolation Forest Distance
              </span>
            </div>

            {/* Remaining Useful Life */}
            <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-industrial-400 uppercase block mb-1">NEXT WINDOW</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-white">
                  ~{analytics.predictedRemainingDays}
                </span>
                <span className="text-xs text-industrial-500">Days</span>
              </div>
              <span className="text-[10px] font-mono text-industrial-400 block mt-2">
                Estimated Service Reserve
              </span>
            </div>
          </div>

          {/* Advisory Alert Banner */}
          <div className={`p-4 rounded-xl border ${
            analytics.riskCategory === 'Provenance Anomaly / Flagged'
              ? 'bg-red-500/10 border-red-500/40 text-red-300'
              : analytics.riskCategory === 'Critical Maintenance Due'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-start gap-3">
              {analytics.riskCategory === 'Provenance Anomaly / Flagged' ? (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : analytics.riskCategory === 'Critical Maintenance Due' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider block">
                  ADVISORY: {analytics.riskCategory}
                </span>
                <p className="text-xs mt-1 leading-relaxed text-industrial-200">
                  {analytics.advisoryText}
                </p>
              </div>
            </div>
          </div>

          {/* Contributing Signal Factors */}
          <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-industrial-400 uppercase block mb-1">
              CONTRIBUTING TELEMETRY & LIFECYCLE SIGNALS
            </span>
            {analytics.contributingSignals.length === 0 ? (
              <div className="text-xs text-industrial-400 italic">All parameters within baseline tolerances.</div>
            ) : (
              analytics.contributingSignals.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-industrial-900 last:border-none">
                  <span className="text-industrial-300 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.level === 'alert' ? 'bg-red-400' : item.level === 'warn' ? 'bg-amber-400' : 'bg-cyanAccent'
                    }`} />
                    {item.signal}
                  </span>
                  <span className={`font-mono text-[11px] ${
                    item.level === 'alert' ? 'text-red-400 font-semibold' : 'text-industrial-400'
                  }`}>
                    {item.impact}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Transparent Research Disclaimer */}
          <div className="text-[10px] text-industrial-400 bg-industrial-950/70 p-3 rounded-lg border border-industrial-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-cyanAccent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-industrial-200">Scientific & Operational Disclaimer:</strong> This demonstration implements transparent rule-based heuristics and sample feature vectors reflecting the proposed scikit-learn anomaly detection architecture. It has not yet undergone live field validation against Indian Railways track failure records. Model training with real operational datasets is scheduled for Phase 3 (Months 7–12).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
