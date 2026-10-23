import React, { useState } from 'react';
import { BUDGET_BREAKDOWN, ROADMAP_PHASES, PROJECT_METADATA } from '../../data/mockData';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users, 
  Award, 
  Mail, 
  Phone, 
  Building2,
  PieChart,
  ArrowRight
} from 'lucide-react';

export const RoadmapBudget: React.FC = () => {
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState<number>(0);

  return (
    <div className="space-y-12">
      {/* ==================================================== */}
      {/* BUDGET ESTIMATE (₹50 LAKHS) */}
      {/* ==================================================== */}
      <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                PROPOSED FINANCIAL PLAN
              </span>
              <span className="text-xs font-mono text-industrial-400">
                SASTRA – TCS TIC INCUBATION PROGRAMME
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              ₹50,00,000 Capital & Revenue Budget Allocation
            </h3>
            <p className="text-xs text-industrial-300 mt-1">
              Milestone-based release aligning funds with verifiable progress across the 18-month duration.
            </p>
          </div>

          <div className="bg-industrial-950 px-4 py-2.5 rounded-xl border border-cyanAccent/30 text-right">
            <span className="text-[10px] font-mono text-industrial-400 block uppercase">TOTAL GRANT REQUEST</span>
            <span className="text-2xl font-bold font-mono text-cyanAccent">₹50,00,000</span>
          </div>
        </div>

        {/* Budget Visual Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-industrial-950 rounded-lg overflow-hidden flex border border-industrial-800">
            {BUDGET_BREAKDOWN.map((item, idx) => {
              const colors = ['bg-cyanAccent', 'bg-blue-500', 'bg-amberAccent', 'bg-emerald-400', 'bg-purple-500'];
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedBudgetIndex(idx)}
                  className={`${colors[idx % colors.length]} h-full cursor-pointer hover:opacity-90 transition-opacity`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.category}: ₹${(item.amount / 100000).toFixed(1)} Lakhs (${item.percentage}%)`}
                />
              );
            })}
          </div>

          {/* Quick Category Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-industrial-300 pt-1">
            {BUDGET_BREAKDOWN.map((item, idx) => {
              const dotColors = ['bg-cyanAccent', 'bg-blue-500', 'bg-amberAccent', 'bg-emerald-400', 'bg-purple-500'];
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedBudgetIndex(idx)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition ${
                    selectedBudgetIndex === idx ? 'bg-industrial-800 text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx]}`} />
                  <span>{item.category.split(' ')[0]} (₹{item.amount / 100000}L)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Details Card */}
        <div className="bg-industrial-950 p-5 rounded-xl border border-industrial-800 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyanAccent uppercase">
                {BUDGET_BREAKDOWN[selectedBudgetIndex].nature}
              </span>
              <span className="text-xs text-industrial-500">•</span>
              <span className="text-xs font-mono text-industrial-400">
                {BUDGET_BREAKDOWN[selectedBudgetIndex].percentage}% of Total Allocation
              </span>
            </div>
            <h4 className="text-base font-bold text-white">
              {BUDGET_BREAKDOWN[selectedBudgetIndex].category}
            </h4>
            <p className="text-xs text-industrial-300 leading-relaxed">
              {BUDGET_BREAKDOWN[selectedBudgetIndex].details}
            </p>
          </div>

          <div className="md:col-span-4 bg-industrial-900/80 p-4 rounded-xl border border-industrial-800 flex flex-col justify-center text-center">
            <span className="text-[10px] font-mono text-industrial-400 uppercase mb-1">PROPOSED ALLOCATION</span>
            <span className="text-2xl font-bold font-mono text-white">
              ₹{(BUDGET_BREAKDOWN[selectedBudgetIndex].amount / 100000).toLocaleString('en-IN')},00,000
            </span>
            <span className="text-[11px] font-mono text-cyanAccent mt-1">
              ₹{BUDGET_BREAKDOWN[selectedBudgetIndex].amount / 100000} Lakhs
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 18-MONTH ROADMAP TIMELINE */}
      {/* ==================================================== */}
      <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amberAccent/10 text-amberAccent border border-amberAccent/30">
                EXECUTION ROADMAP
              </span>
              <span className="text-xs font-mono text-industrial-400">
                FOUR SEQUENTIAL VALIDATION GATES
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              18-Month Development & Deployment Timeline
            </h3>
            <p className="text-xs text-industrial-300 mt-1">
              Rigorous progression from current laboratory proof-of-concept (TRL 3) to field-tested railway pilot (TRL 7).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              CURRENT STATUS: TRL 3 ACHIEVED
            </span>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ROADMAP_PHASES.map((p, idx) => {
            const isSelected = selectedPhaseIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedPhaseIndex(idx)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-industrial-850 border-cyanAccent shadow-cyan-glow'
                    : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyanAccent uppercase">
                    PHASE 0{idx + 1}
                  </span>
                  <span className="text-[9px] font-mono text-industrial-400">
                    {p.duration}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white truncate">{p.phase.split(':')[1] || p.phase}</h5>
              </button>
            );
          })}
        </div>

        {/* Selected Phase Active Card */}
        <div className="bg-industrial-950 p-5 rounded-xl border border-industrial-800 space-y-4 cad-corner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-industrial-800">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyanAccent uppercase">
                {ROADMAP_PHASES[selectedPhaseIndex].duration} • MILESTONE CRITERIA
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {ROADMAP_PHASES[selectedPhaseIndex].phase}
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-industrial-900 text-amber-400 border border-industrial-700">
              {ROADMAP_PHASES[selectedPhaseIndex].status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-industrial-400 uppercase block">KEY TECHNICAL MILESTONES:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROADMAP_PHASES[selectedPhaseIndex].keyMilestones.map((ms, i) => (
                <div key={i} className="flex items-start gap-2 bg-industrial-900/60 p-3 rounded-lg border border-industrial-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyanAccent shrink-0 mt-1.5" />
                  <span className="text-xs text-industrial-200 leading-relaxed">{ms}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-industrial-400">PHASE DELIVERABLES:</span>
            <span className="text-cyanAccent font-semibold">{ROADMAP_PHASES[selectedPhaseIndex].deliverables}</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TEAM & INSTITUTIONAL CONTEXT */}
      {/* ==================================================== */}
      <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="pb-4 border-b border-industrial-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
              INVESTIGATOR & INNOVATOR TEAM
            </span>
            <span className="text-xs font-mono text-industrial-400">
              KONGU ENGINEERING COLLEGE (AUTONOMOUS)
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Department of Electronics & Instrumentation Engineering
          </h3>
          <p className="text-xs text-industrial-300 mt-1">
            Combines rigorous academic supervision in instrumentation with hands-on rapid prototyping in embedded systems and applied AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Principal Investigator */}
          <div className="bg-industrial-950 p-4 rounded-xl border border-cyanAccent/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyanAccent/20 text-cyanAccent">
                PRINCIPAL INVESTIGATOR
              </span>
              <Award className="w-4 h-4 text-cyanAccent" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">{PROJECT_METADATA.pi.name}</h5>
              <p className="text-[11px] text-industrial-400">{PROJECT_METADATA.pi.designation}</p>
            </div>
            <div className="text-[10px] font-mono space-y-1 text-industrial-400 pt-2 border-t border-industrial-800">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-cyanAccent" />
                <span>{PROJECT_METADATA.pi.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-cyanAccent" />
                <span>{PROJECT_METADATA.pi.phone}</span>
              </div>
            </div>
          </div>

          {/* Student Innovator Team */}
          {PROJECT_METADATA.team.map((member, i) => (
            <div key={i} className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-industrial-900 text-industrial-300">
                  {member.role.toUpperCase()}
                </span>
                <Users className="w-4 h-4 text-industrial-500" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">{member.name}</h5>
                <p className="text-[11px] text-industrial-400 leading-snug">{member.focus}</p>
              </div>
              <div className="text-[10px] font-mono space-y-1 text-industrial-400 pt-2 border-t border-industrial-800">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-cyanAccent" />
                  <span>{member.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Institution Info Footer */}
        <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-industrial-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyanAccent" />
            <span>Kongu Engineering College, Perundurai, Erode, Tamil Nadu – 638060</span>
          </div>
          <div>
            Head of Institution: <strong className="text-white">{PROJECT_METADATA.headOfInstitution.name}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
