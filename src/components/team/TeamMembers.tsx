import React from 'react';
import { PROJECT_METADATA } from '../../data/mockData';
import { 
  Users, 
  Award, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap, 
  Cpu, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const TeamMembers: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Institutional Banner with College Logo */}
      <div className="bg-industrial-900 border border-industrial-700 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyanAccent/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Prominent KEC College Logo */}
            <div className="bg-white p-3 rounded-2xl border-2 border-industrial-600 shadow-xl shrink-0 flex items-center justify-center">
              <img 
                src="/assets/kec_logo.png" 
                alt="Kongu Engineering College" 
                className="h-16 w-auto object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/30">
                  ESTABLISHED INSTITUTION
                </span>
                <span className="text-xs font-mono text-industrial-400">AUTONOMOUS STATUS</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide">
                {PROJECT_METADATA.institution}
              </h3>
              <p className="text-sm text-cyanAccent font-mono">
                {PROJECT_METADATA.department}
              </p>
              <p className="text-xs text-industrial-400">
                {PROJECT_METADATA.address}
              </p>
            </div>
          </div>

          <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 text-center sm:text-right shrink-0">
            <span className="text-[10px] font-mono text-industrial-400 block uppercase">HEAD OF INSTITUTION</span>
            <span className="text-base font-bold text-white block mt-0.5">{PROJECT_METADATA.headOfInstitution.name}</span>
            <span className="text-xs font-mono text-industrial-400 block">{PROJECT_METADATA.headOfInstitution.email}</span>
            <span className="text-[11px] font-mono text-industrial-500">{PROJECT_METADATA.headOfInstitution.phone}</span>
          </div>
        </div>
      </div>

      {/* Principal Investigator (PI) Card */}
      <div className="bg-industrial-900 border border-cyanAccent/40 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/40 inline-flex items-center gap-1.5 uppercase">
              <Award className="w-3.5 h-3.5" /> PRINCIPAL INVESTIGATOR (PI)
            </span>
            <h4 className="text-xl font-bold text-white mt-1.5">{PROJECT_METADATA.pi.name}</h4>
            <p className="text-xs text-industrial-300 font-mono mt-0.5">
              {PROJECT_METADATA.pi.designation} • Department of Electronics and Instrumentation Engineering
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <a 
              href={`mailto:${PROJECT_METADATA.pi.email}`} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-industrial-950 text-industrial-200 hover:text-white border border-industrial-800 hover:border-cyanAccent transition"
            >
              <Mail className="w-3.5 h-3.5 text-cyanAccent" />
              <span>{PROJECT_METADATA.pi.email}</span>
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-industrial-950 text-industrial-200 border border-industrial-800">
              <Phone className="w-3.5 h-3.5 text-cyanAccent" />
              <span>{PROJECT_METADATA.pi.phone}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-industrial-300 leading-relaxed mt-4">
          Provides academic supervision, technical guidance in instrumentation standards, laser product safety (IEC 60825), and serves as the primary institutional point of contact for the SASTRA–TCS Technology Innovation Centre.
        </p>
      </div>

      {/* Student Innovator Team Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyanAccent" />
            <h4 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
              STUDENT RESEARCH & INNOVATION TEAM
            </h4>
          </div>
          <span className="text-xs font-mono text-industrial-400">
            UNDERGRADUATE RESEARCHERS IN EIE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROJECT_METADATA.team.map((member, idx) => {
            const isLead = member.role.includes('Lead');
            return (
              <div 
                key={idx}
                className={`bg-industrial-900 rounded-2xl p-6 border transition space-y-4 relative ${
                  isLead 
                    ? 'border-cyanAccent shadow-cyan-glow bg-gradient-to-b from-industrial-900 to-industrial-950' 
                    : 'border-industrial-700/80 hover:border-industrial-600'
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isLead 
                      ? 'bg-cyanAccent text-black font-extrabold' 
                      : 'bg-industrial-800 text-industrial-300'
                  }`}>
                    {member.role}
                  </span>
                  <Users className="w-4 h-4 text-industrial-500" />
                </div>

                {/* Name & Focus */}
                <div>
                  <h5 className="text-lg font-bold text-white">{member.name}</h5>
                  <p className="text-xs text-cyanAccent font-mono mt-1">
                    {member.focus}
                  </p>
                </div>

                {/* Technical Domain Badges */}
                <div className="pt-2 border-t border-industrial-800 space-y-2">
                  <span className="text-[10px] font-mono text-industrial-400 uppercase block">CORE RESPONSIBILITIES:</span>
                  <p className="text-xs text-industrial-300 leading-relaxed">
                    {idx === 0 && "End-to-end cyber-physical architecture, ESP32 firmware with GRBL motion timers, Python G-code raster engine, and ML anomaly integration."}
                    {idx === 1 && "PostgreSQL database schema, FastAPI REST endpoints, ZXing mobile scanning integration, and deferred sync protocol for Indian Railways."}
                    {idx === 2 && "Mechanical CNC gantry construction, NEMA 17 stepper testing, DRV8825 current tuning, workholding fixture design, and optical alignment."}
                  </p>
                </div>

                {/* Email */}
                <div className="pt-3 border-t border-industrial-800/80">
                  <a 
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 text-xs font-mono text-industrial-400 hover:text-cyanAccent truncate transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyanAccent shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIC Support Request Summary */}
      <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
          <span className="text-xs font-mono font-bold text-cyanAccent uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> SASTRA – TCS TIC SUPPORT REQUEST
          </span>
          <span className="text-[10px] font-mono text-industrial-400">18-MONTH PROGRAMME</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-industrial-300">
          <div className="bg-industrial-900 p-3.5 rounded-xl border border-industrial-800 space-y-1">
            <span className="text-white font-mono font-bold block">1. Research Associate & Mentorship</span>
            <p className="leading-relaxed">
              Dedicated Vision/ML research associate funding and faculty consulting time for accelerated computer-vision alignment development.
            </p>
          </div>
          <div className="bg-industrial-900 p-3.5 rounded-xl border border-industrial-800 space-y-1">
            <span className="text-white font-mono font-bold block">2. Laser Safety & Compliance Testing</span>
            <p className="leading-relaxed">
              Support for IEC 60825 certified laser emission testing, enclosure interlock validation, and accelerated salt-spray weathering trials.
            </p>
          </div>
          <div className="bg-industrial-900 p-3.5 rounded-xl border border-industrial-800 space-y-1">
            <span className="text-white font-mono font-bold block">3. Field Access & Tech Transfer</span>
            <p className="leading-relaxed">
              Access to partner railway track depots or approved track fitting manufacturing sites for Months 13–18 live pilot trials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
