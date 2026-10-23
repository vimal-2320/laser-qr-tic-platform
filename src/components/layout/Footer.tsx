import React from 'react';
import { PROJECT_METADATA } from '../../data/mockData';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-industrial-950 border-t border-industrial-800 pt-10 pb-8 text-industrial-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Col 1: Project Identity & KEC Logo */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-lg border border-industrial-700 shadow-md">
                <img 
                  src="/assets/kec_logo.png" 
                  alt="Kongu Engineering College Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
                  {PROJECT_METADATA.shortTitle}
                </h4>
                <p className="text-[10px] text-cyanAccent font-mono">
                  {PROJECT_METADATA.department}
                </p>
              </div>
            </div>

            <p className="text-xs text-industrial-300 leading-relaxed max-w-md">
              {PROJECT_METADATA.subtitle}
            </p>

            <div className="text-[11px] font-mono text-industrial-400 space-y-1">
              <div>Institution: <strong className="text-industrial-200">{PROJECT_METADATA.institution} (Autonomous)</strong></div>
              <div>Principal Investigator: <strong className="text-industrial-200">{PROJECT_METADATA.pi.name}</strong></div>
              <div>Student Team: Vimal PK (Lead), Naveena R, Tamilarasu M</div>
            </div>
          </div>

          {/* Col 2: Open Source Stack & References */}
          <div className="md:col-span-4 space-y-2">
            <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
              CORE STANDARDS & TECHNOLOGIES
            </h5>
            <ul className="space-y-1.5 text-xs text-industrial-300">
              <li>
                <a href="https://github.com/bdring/Grbl_Esp32" target="_blank" rel="noreferrer" className="hover:text-cyanAccent inline-flex items-center gap-1">
                  GRBL_ESP32 Firmware <ExternalLink className="w-3 h-3 text-industrial-500" />
                </a>
              </li>
              <li>
                <a href="https://lasergrbl.com/" target="_blank" rel="noreferrer" className="hover:text-cyanAccent inline-flex items-center gap-1">
                  LaserGRBL Open G-Code Streaming <ExternalLink className="w-3 h-3 text-industrial-500" />
                </a>
              </li>
              <li>
                <a href="https://segno.readthedocs.io/" target="_blank" rel="noreferrer" className="hover:text-cyanAccent inline-flex items-center gap-1">
                  Segno Python QR Generation <ExternalLink className="w-3 h-3 text-industrial-500" />
                </a>
              </li>
              <li>
                <a href="https://github.com/zxing/zxing" target="_blank" rel="noreferrer" className="hover:text-cyanAccent inline-flex items-center gap-1">
                  ZXing ("Zebra Crossing") Mobile Decoding <ExternalLink className="w-3 h-3 text-industrial-500" />
                </a>
              </li>
              <li>
                <a href="https://www.ireps.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyanAccent inline-flex items-center gap-1">
                  Indian Railways UDM Portal (ireps.gov.in) <ExternalLink className="w-3 h-3 text-industrial-500" />
                </a>
              </li>
              <li>
                <a href="https://www.irecept.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyanAccent inline-flex items-center gap-1">
                  Track Management System (TMS) Portal <ExternalLink className="w-3 h-3 text-industrial-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Research Status & Compliance Notice */}
          <div className="md:col-span-3 space-y-2">
            <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
              FACTUAL STATUS BOUNDARY
            </h5>
            <div className="bg-industrial-900 p-3 rounded-lg border border-industrial-800 text-[11px] text-industrial-400 space-y-2 leading-relaxed">
              <p>
                <strong className="text-cyanAccent">TRL 3 Status:</strong> QR-generation → G-code → engraving pipeline validated in laboratory.
              </p>
              <p>
                <strong className="text-amber-400">Planned Work:</strong> IEC 60825 laser safety certification, vision-guided alignment, durability weathering tests, and live UDM/TMS integration are proposed in the 18-month roadmap.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-industrial-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-industrial-500">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/kec_logo.png" 
              alt="KEC" 
              className="h-5 w-auto bg-white p-0.5 rounded"
            />
            <span>© {new Date().getFullYear()} Kongu Engineering College — SASTRA–TCS Technology Innovation Centre (TIC) Submission.</span>
          </div>
          <div className="text-cyanAccent font-semibold text-xs tracking-wide">
            Made and developed by US
          </div>
        </div>
      </div>
    </footer>
  );
};
