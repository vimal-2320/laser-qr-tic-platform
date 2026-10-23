import type { ComponentRecord, MachineSubsystem } from '../types';

export const PROJECT_METADATA = {
  title: "AI-Driven Laser QR Code Marking System for Smart Industrial Traceability and Predictive Maintenance",
  shortTitle: "AI-Driven Laser QR Marking System",
  subtitle: "An Edge-AI Enabled Laser Marking & Scanning Platform for Permanent, Tamper-Proof Identification of Railway Track Fittings and Industrial Components.",
  institution: "Kongu Engineering College",
  department: "Department of Electronics and Instrumentation Engineering",
  address: "Thoppupalayam, Perundurai, Erode, Tamil Nadu – 638060",
  domain: "Artificial Intelligence",
  callForProposal: "SASTRA – TCS Technology Innovation Centre (TIC) Funding Programme",
  currentTRL: "TRL 3 — Laboratory Proof of Concept (QR → G-code → Engraving Pipeline Validated)",
  durationMonths: 18,
  totalFunding: 5000000, // ₹50 Lakhs
  pi: {
    name: "Dr. T. Kalavathi Devi",
    role: "Principal Investigator",
    designation: "Professor & Academic Supervisor",
    email: "kalavathi@kongu.ac.in",
    phone: "+91 9942155300"
  },
  headOfInstitution: {
    name: "Dr. R. Parameshwaran",
    designation: "Head of Institution",
    email: "paramesh_r.mts@kongu.edu",
    phone: "+91 9865919915"
  },
  team: [
    {
      name: "Vimal PK",
      role: "Student Innovator & Team Lead",
      focus: "System Integration, Embedded Firmware (ESP32/GRBL), & AI Pipeline",
      email: "vimalpk.24eie@kongu.edu"
    },
    {
      name: "Naveena R",
      role: "Team Member",
      focus: "Software Development, Cloud/Edge Backend & Traceability Data Schema",
      email: "naveenar.24eie@kongu.edu"
    },
    {
      name: "Tamilarasu M",
      role: "Team Member",
      focus: "Hardware Integration, Stepper Motion Testing & Mechanical Alignment",
      email: "tamilarasum.24eie@kongu.edu"
    }
  ]
};

export const BUDGET_BREAKDOWN = [
  {
    category: "Hardware & Laser Engraving Equipment",
    amount: 1500000,
    percentage: 30,
    details: "Industrial-grade laser modules, CNC gantry mechanical structure, ESP32 units, stepper motors (NEMA 17/23), DRV8825 drivers, optical alignment fixtures, protective enclosure, safety interlocks.",
    nature: "Capital Expenditure"
  },
  {
    category: "Software & AI Development",
    amount: 1000000,
    percentage: 20,
    details: "Computer-vision alignment algorithm development, scikit-learn anomaly detection & predictive maintenance models, mobile scanning app (ZXing), FastAPI backend & cloud sync schema.",
    nature: "Revenue Expenditure"
  },
  {
    category: "Testing & Field Deployment",
    amount: 1000000,
    percentage: 20,
    details: "Accelerated weathering & salt-spray corrosion tests, abrasion resistance evaluation, IEC 60825 laser-safety compliance testing, pilot deployment at partner zonal railway depot.",
    nature: "Capital & Revenue"
  },
  {
    category: "Manpower",
    amount: 1000000,
    percentage: 20,
    details: "Student researchers, dedicated Vision/ML research associate, faculty consulting time, and technical support staff honoraria over 18 months.",
    nature: "Revenue Expenditure"
  },
  {
    category: "Miscellaneous & Contingency",
    amount: 500000,
    percentage: 10,
    details: "Travel for depot validation & field trials, technical documentation, patent filing (IPR) support, and contingency reserve.",
    nature: "Contingency"
  }
];

export const ROADMAP_PHASES = [
  {
    phase: "Phase 1: Design & Architecture",
    duration: "Months 1 – 3",
    status: "Planned",
    keyMilestones: [
      "Finalise high-precision system architecture & embedded specifications",
      "Procure industrial-grade laser diode modules & rigid CNC gantry frames",
      "Refine Python segno → G-code raster/vector translation pipeline",
      "Design IEC 60825 compliant protective enclosure with hardware interlocks"
    ],
    deliverables: "Architecture blueprint, laser safety enclosure CAD, refined G-code engine."
  },
  {
    phase: "Phase 2: Prototype Development",
    duration: "Months 4 – 6",
    status: "Planned",
    keyMilestones: [
      "Integrate CNC laser marking unit with ESP32 & GRBL_ESP32 motion firmware",
      "Develop computer-vision guided camera alignment for curved track fittings",
      "Develop offline-first Android mobile scanning app based on ZXing library",
      "Establish PostgreSQL backend data schema & RESTful API endpoints"
    ],
    deliverables: "Working integrated marking unit, camera alignment module, mobile scan app."
  },
  {
    phase: "Phase 3: Testing & Validation",
    duration: "Months 7 – 12",
    status: "Planned",
    keyMilestones: [
      "Conduct accelerated durability, vibration, and weathering tests on engraved steel samples",
      "Train scikit-learn anomaly detection and predictive maintenance window models",
      "Develop & validate mock Indian Railways UDM (ireps.gov.in) & TMS (irecept.gov.in) data exchange APIs",
      "IEC 60825 laser emission testing and operator safety verification"
    ],
    deliverables: "Durability test certification report, ML model evaluation package, validated mock APIs."
  },
  {
    phase: "Phase 4: Field Pilot & Transfer",
    duration: "Months 13 – 18",
    status: "Planned",
    keyMilestones: [
      "Conduct on-site pilot trial at a partner zonal track depot or approved fitting manufacturing plant",
      "Initiate authenticated live data sync trials with railway authorities",
      "Evaluate field scanning reliability under diverse outdoor lighting & grime conditions",
      "Compile comprehensive technical documentation, IP filings, and technology-transfer materials"
    ],
    deliverables: "Pilot operational dataset, final TIC closure report, commercialization package."
  }
];

export const MACHINE_SUBSYSTEMS: MachineSubsystem[] = [
  {
    id: "base_frame",
    name: "Rigid Industrial Base Frame",
    category: "Structure",
    description: "Heavy-gauge anodized aluminum profile bed designed to absorb CNC vibrations and maintain micrometric positioning accuracy during high-speed laser rastering.",
    specifications: ["Extruded T-Slot 2040 Aluminum", "Vibration-damped footings", "Bed dimensions: 400mm x 350mm"],
    currentStatus: "Demonstrated",
    explodedOffset: [0, -0.9, 0],
    subsystemRole: "Provides mechanical rigidity and reference datum plane for the XY coordinate axes."
  },
  {
    id: "gantry_rails",
    name: "Dual X/Y Linear Motion Rails",
    category: "Motion",
    description: "Hardened steel guide rods with precision linear ball bearings and synchronous GT2 timing belts, minimizing backlash during delicate QR code micro-marking.",
    specifications: ["Dual optical-axis steel rails", "GT2 6mm neoprene belts with fiberglass core", "Travel accuracy: ±0.05 mm"],
    currentStatus: "Demonstrated",
    explodedOffset: [0, 0.4, 0.6],
    subsystemRole: "Translates motor torque into smooth orthogonal motion across the workpiece plane."
  },
  {
    id: "stepper_drive",
    name: "NEMA 17 Stepper Motors & DRV8825",
    category: "Motion",
    description: "High-torque 1.8° step angle bipolar stepper motors paired with DRV8825 microstepping drivers operating at up to 1/32 step resolution for smooth, quiet motion.",
    specifications: ["NEMA 17 42x48mm", "Holding torque: 0.45 N.m", "DRV8825 thermal-overload protection with heatsinks"],
    currentStatus: "Demonstrated",
    explodedOffset: [0.8, 0.2, 0],
    subsystemRole: "Delivers discrete positional steps calibrated in GRBL_ESP32 step/mm settings."
  },
  {
    id: "esp32_controller",
    name: "ESP32 Controller & GRBL Firmware",
    category: "Electronics",
    description: "Dual-core Xtensa 32-bit LX6 microcontroller running GRBL_ESP32 firmware. Handles real-time G-code parsing, hardware timer step generation, and Wi-Fi/Bluetooth telemetry.",
    specifications: ["ESP32-WROOM-32 (240MHz)", "GRBL_ESP32 CNC motion interpreter", "Integrated emergency halt and optical limit switches"],
    currentStatus: "Demonstrated",
    explodedOffset: [-0.9, 0.3, 0.3],
    subsystemRole: "Acts as the embedded brain executing motion trajectories and coordinating PWM laser intensity."
  },
  {
    id: "laser_module",
    name: "Precision Diode Laser Marking Head",
    category: "Optics",
    description: "High-focus laser module with adjustable focal collimator lens. Currently uses lab-grade diode laser (TRL 3); planned upgrade to industrial fiber/DPSS source in Phase 3.",
    specifications: ["Focal spot size: ~0.08 mm", "TTL/PWM hardware modulated (0-100%)", "Active heat pipe and high-RPM cooling fan"],
    currentStatus: "Demonstrated",
    explodedOffset: [0, 0.9, 0],
    subsystemRole: "Focuses coherent optical energy to ablate/oxidize the metal surface in micro-pixel QR matrices."
  },
  {
    id: "workpiece_holder",
    name: "Workholding Jig & Railway Fitting",
    category: "Workpiece",
    description: "Adjustable magnetic clamping vise holding sample railway track fittings such as Elastic Rail Clips (ERC Mark III) and insulating liners for localized surface marking.",
    specifications: ["Quick-release toggle clamps", "Height-adjustable Z-jack reference", "Sample: Grade 55Si7 spring steel rail clip"],
    currentStatus: "Demonstrated",
    explodedOffset: [0, -0.3, -0.5],
    subsystemRole: "Firmly immobilizes safety-critical railway hardware during laser ablation."
  },
  {
    id: "safety_enclosure",
    name: "Proposed IEC 60825 Safety Enclosure",
    category: "Safety",
    description: "Laser-protective tinted acrylic shield (OD6+ attenuation @ 450nm) equipped with dual magnetic safety interlock switches and front panel Emergency Stop button.",
    specifications: ["Class 1 laser enclosure standard (planned)", "Fail-safe hardware interlock circuit", "Emergency Stop mushroom latch switch"],
    currentStatus: "Planned",
    explodedOffset: [0, 1.3, 0],
    subsystemRole: "Guarantees zero stray radiation exposure to operators in accordance with IEC 60825 standards."
  }
];

export const INITIAL_DEMO_COMPONENTS: ComponentRecord[] = [
  {
    id: "IR-ERC-2026-8842",
    category: "Elastic Rail Clip (ERC-III)",
    manufacturer: "Southern Track Spares Ltd.",
    batchNumber: "BATCH-2026-Q1-098",
    manufacturingDate: "2026-02-14",
    installationDate: "2026-04-10",
    depotLocation: "Southern Railway Depot, Erode Junction (ED)",
    material: "High-grade 55Si7 Silico-Manganese Spring Steel",
    specification: "IRS T-31 / RDSO Spec. M&C/PCN/100",
    status: "Installed",
    serviceDays: 196,
    vibrationCycleHours: 3200,
    environmentalExposure: "Coastal / Corrosive",
    lastInspectionWearScore: 24, // low wear
    provenanceHash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    syncStatus: "Synchronized with UDM/TMS (Mock)",
    notes: "Marked via ESP32 GRBL laser pipeline. Validated readability at 30cm under direct sunlight.",
    qrPayload: "IR-TIC://v1/rail/component?id=IR-ERC-2026-8842&batch=BATCH-2026-Q1-098&org=KEC-TIC",
    lifecycleEvents: [
      {
        id: "ev-1",
        timestamp: "2026-02-14 09:30",
        type: "CREATED",
        location: "KEC Lab Engraving Cell #1",
        operator: "Vimal PK (Team Lead)",
        description: "Component record provisioned in local database schema.",
        statusTag: "Demonstrated"
      },
      {
        id: "ev-2",
        timestamp: "2026-02-14 10:15",
        type: "LASER_ENGRAVED",
        location: "KEC Lab Engraving Cell #1",
        operator: "Tamilarasu M (HW Lead)",
        description: "Permanent 16x16mm QR matrix etched onto toe section using diode laser at 850 mm/min.",
        statusTag: "Demonstrated"
      },
      {
        id: "ev-3",
        timestamp: "2026-03-02 14:00",
        type: "DEPOT_DISPATCH",
        location: "Central Stores, Erode",
        operator: "Naveena R (Software Dev)",
        description: "Batch receipt logged via mock UDM portal adapter.",
        statusTag: "Demonstrated"
      },
      {
        id: "ev-4",
        timestamp: "2026-04-10 11:20",
        type: "TRACK_INSTALL",
        location: "Km 392/14, Up Line, Salem Division",
        operator: "Field Inspector P. Kumar (Mock)",
        description: "Installed on 60kg UIC rail with composite sleeper pad. Mobile ZXing scan verified.",
        statusTag: "Simulation"
      },
      {
        id: "ev-5",
        timestamp: "2026-08-20 16:45",
        type: "INSPECTION",
        location: "Km 392/14, Up Line",
        operator: "Track Section Inspector (Mock)",
        description: "Routine track audit: Toe load verified within RDSO limits (850–1100 kg). Surface intact.",
        statusTag: "Simulation"
      }
    ]
  },
  {
    id: "IR-GFN-2026-3104",
    category: "GFN-66 Insulating Liner",
    manufacturer: "Perundurai Polymer Engineering Works",
    batchNumber: "POLY-2026-B04",
    manufacturingDate: "2026-01-18",
    installationDate: "2026-03-05",
    depotLocation: "Salem Track Depot (SA)",
    material: "Glass-Filled Nylon 66 (GFN-66)",
    specification: "RDSO T-3706",
    status: "Installed",
    serviceDays: 232,
    vibrationCycleHours: 4100,
    environmentalExposure: "Moderate",
    lastInspectionWearScore: 48,
    provenanceHash: "SHA256:d8a5c2d3e1f0e4b8a7c9f6e5d4c3b2a1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5",
    syncStatus: "Synchronized with UDM/TMS (Mock)",
    notes: "Non-metallic composite marking test specimen. High contrast achieved without thermal deformation.",
    qrPayload: "IR-TIC://v1/rail/component?id=IR-GFN-2026-3104&batch=POLY-2026-B04&org=KEC-TIC",
    lifecycleEvents: [
      {
        id: "ev-10",
        timestamp: "2026-01-18 11:00",
        type: "CREATED",
        location: "KEC Instrumentation Prototype Station",
        operator: "Vimal PK",
        description: "GFN-66 sample registered for polymer marking trials.",
        statusTag: "Demonstrated"
      },
      {
        id: "ev-11",
        timestamp: "2026-01-18 11:45",
        type: "LASER_ENGRAVED",
        location: "KEC Lab Engraving Cell #1",
        operator: "Tamilarasu M",
        description: "Fast-vector raster marking at reduced power (45%) to prevent substrate melting.",
        statusTag: "Demonstrated"
      }
    ]
  },
  {
    id: "IR-FAST-2025-9921",
    category: "Metal Sleeper Fastener",
    manufacturer: "Coimbatore Precision Forgings",
    batchNumber: "CPF-2025-M09",
    manufacturingDate: "2025-09-12",
    installationDate: "2025-11-01",
    depotLocation: "Palakkad Division Marshalling Yard",
    material: "Forged Carbon Steel MS-40",
    specification: "IRS T-12",
    status: "Maintenance Due",
    serviceDays: 406,
    vibrationCycleHours: 7200,
    environmentalExposure: "Coastal / Corrosive",
    lastInspectionWearScore: 78, // High wear -> triggers AI advisory
    provenanceHash: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    syncStatus: "Offline Cached (Deferred Sync)",
    notes: "High cumulative tonnage zone. Marked micro-QR scanned in offline mobile test.",
    qrPayload: "IR-TIC://v1/rail/component?id=IR-FAST-2025-9921&batch=CPF-2025-M09&org=KEC-TIC",
    lifecycleEvents: [
      {
        id: "ev-20",
        timestamp: "2025-09-12 14:00",
        type: "CREATED",
        location: "Forging QC Lab",
        operator: "Naveena R",
        description: "Sleeper fastener specimen enrolled.",
        statusTag: "Demonstrated"
      },
      {
        id: "ev-21",
        timestamp: "2026-10-15 08:30",
        type: "MAINTENANCE_ADVISORY",
        location: "Palakkad Yard Line 4",
        operator: "AI Diagnostic Engine (Simulation)",
        description: "Wear index exceeded 75 threshold. Scheduled replacement advisory issued.",
        statusTag: "Simulation"
      }
    ]
  }
];
