# AI-Driven Laser QR Code Marking System — TIC Interactive Platform

> **SASTRA – TCS Technology Innovation Centre (TIC) Incubation Proposal**  
> **Domain:** Artificial Intelligence  
> **Institution:** Kongu Engineering College, Perundurai, Erode, Tamil Nadu – 638060  
> **Department:** Department of Electronics and Instrumentation Engineering  
> **Principal Investigator:** Dr. T. Kalavathi Devi (Professor, EIE)  
> **Student Innovators:** Vimal PK (Lead), Naveena R, Tamilarasu M  
> **Current Readiness:** TRL 3 — Laboratory Proof of Concept (QR → G-code → Engraving Pipeline Validated)  
> **Funding Ask:** ₹50,00,000 (18 Months)

---

## 1. Quick Start & Local Execution

Ensure **Node.js v18+** (tested on Node v22.19.0) is installed.

```bash
# 1. Navigate to the project directory
cd "C:\Users\vimal\.gemini\antigravity\scratch\laser-qr-tic-platform"

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
# or
npx vite --host

# 4. Open in browser:
# http://localhost:5173
```

### Production Build & Preview

```bash
# Compile TypeScript & bundle production assets
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Platform Architecture & Features

This interactive website was built from scratch to present the complete engineering narrative of the TIC project:

### 🎮 1. Interactive 3D Digital Twin Machine (`MachineViewer.tsx`)
- **WebGL CAD Visualization:** Procedural 3D model of the CNC laser workstation built with Three.js.
- **7 Subsystems:** Rigid Aluminum Base Frame, Dual X/Y Linear Rails, NEMA 17 Stepper Drives + DRV8825, ESP32 Controller Box, Diode Laser Optics, Workholding Vise & Elastic Rail Clip (ERC-III), and Proposed IEC 60825 Protective Enclosure.
- **Exploded View Animation:** Smooth vector separation of machine groups with one-click reassembly.
- **Camera Presets:** Perspective, Engineering Isometric, Top Plan, and Front Elevation.
- **Component Inspector:** Raycast-click on any physical part to display its engineering role, specs, and TRL status.
- **Synchronized Laser Firing:** Simulated laser beam and focal spark burn progressively into the 3D metal workpiece during marking runs.

### ⚡ 2. QR-to-G-Code & Laser Marking Simulator (`MarkingWorkflow.tsx`)
- **Step 1 — Registration:** Provision component records with ID, Category (ERC-III, GFN-66 Liner, Metal Fastener), Batch, and Depot.
- **Step 2 — QR Generation:** Genuine browser QR matrix generation (`qrcode` library) encoding `IR-TIC://` protocol URIs.
- **Step 3 — Toolpath Rasterization:** Translates QR matrix into standard GRBL_ESP32 G-code (`G21`, `G90`, `M3 S255`, `G1 F850`, `M5`).
- **Step 4 — Simulation Controls:** Play, pause, step-forward, 1x/2x/5x speed selector, 2D toolpath canvas preview, and progressive burn marks.

### 📱 3. Field Mobile QR Scanner (`ScannerModal.tsx`)
- **Instant Demo Scan:** Decodes the actively engraved demo QR code with 1-click.
- **Live Optical Stream:** WebCam scanning with explicit permission checks and automatic stream cleanup.
- **File Upload:** Decodes uploaded image files via ZXing-style canvas analysis.
- **Audit Record (`ComponentRecordCard.tsx`):** Displays component metadata, manufacturing origin, cumulative service days, cryptographic provenance hash, and full lifecycle event timeline.

### 🧠 4. AI-Assisted Maintenance & Anomaly Engine (`AnalyticsEngine.tsx`)
- **Multi-Signal Heuristics:** Interactive sliders for Cumulative Service Days, Surface Wear Index, Environmental Zone, and Overdue Status.
- **Outputs:** Health Score (0–100%), Anomaly Index (Isolation Forest distance), Next Maintenance Window (days), and Risk Category.
- **Anti-Counterfeit Flag:** Injects simulated supply-chain hash mismatches to illustrate tamper detection.

### 🏛️ 5. System Architecture & Interoperability (`ArchitectureDiagram.tsx`)
- Six connected layers: Layer A (QR Identity), Layer B (CNC Motion & GRBL_ESP32), Layer C (Vision Alignment & ZXing), Layer D (FastAPI & PostgreSQL), Layer E (scikit-learn Analytics), Layer F (Indian Railways UDM/TMS Integration).

### 💰 6. Financial Budget & 18-Month Roadmap (`RoadmapBudget.tsx`)
- **₹50 Lakhs Budget:** Exactly mapped to Hardware (₹15L), Software/AI (₹10L), Testing & Field (₹10L), Manpower (₹10L), and Contingency (₹5L).
- **4 Gated Phases:** Design (M1–3), Prototype (M4–6), Validation (M7–12), Deployment (M13–18).

---

## 3. Hardware Bridge Architecture & Laser Safety

The platform distinguishes between **Simulation Mode** (default) and **Live Hardware Mode**:
- **Simulation Mode:** Deterministic, safe, browser-contained simulation. No commands transmitted to external devices.
- **Live Hardware Mode:** Typed adapter communicating with a local bridge service via WebSocket (`ws://localhost:8088/grbl`).
- **Safety Interlock Policy:** Web buttons cannot override physical machine safety. Physical laser activation requires Class 1 enclosure interlocks closed and physical E-Stop switch cleared by an authorized operator.
