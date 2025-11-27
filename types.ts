export enum ProjectType {
    STP = "Sewage Treatment Plant (STP)",
    ETP = "Effluent Treatment Plant (ETP)",
    WTP = "Water Treatment Plant (WTP)",
    RO = "Reverse Osmosis (RO) Plant",
    CETP = "Common Effluent Treatment Plant (CETP)",
    SWM = "Solid Waste Management (SWM)",
    WTE = "Waste to Energy (WTE)",
}

export enum EffluentType {
    HeavyMetals = "Heavy Metals",
    OilsAndGrease = "Oils and Greases",
    HighTDS = "High TDS Effluents",
}

export interface AttachedFile {
    name: string;
    mimeType: string;
    data: string; // base64 encoded string
}

export interface ProjectData {
    projectType: ProjectType;
    technology?: string;
    location: string;
    flowRate: number; // m3/day
    inputBOD: number; // mg/L
    inputCOD: number; // mg/L
    outputBOD: number; // mg/L
    outputCOD: number; // mg/L
    effluentTypes?: EffluentType[];
    specialInstructionsText?: string;
    specialInstructionsFiles?: AttachedFile[];
    specialInstructionsAudio?: AttachedFile;
    fromAddress?: string;
    toAddress?: string;
    estimatedPrice?: number;
}

export interface DesignCalculation {
    parameter: string;
    value: string;
    unit: string;
    description: string;
}

export interface ComplianceItem {
    id: string;
    item: string;
    compliant: boolean;
    details: string;
}

export interface BOMItem {
    name: string;
    quantity: number;
    unit: string;
    vendorSuggestion: string;
}

export interface ProcessFlowDiagram {
    svgContent: string;
}

export interface AbbreviationItem {
    term: string;
    definition: string;
}

export interface DesignResults {
    designCalculations: DesignCalculation[];
    processFlowDiagram: ProcessFlowDiagram;
    complianceChecklist: ComplianceItem[];
    billOfMaterials: BOMItem[];
    reportSummary: string;
    abbreviations: AbbreviationItem[];
}