import { ProjectType, EffluentType } from './types';

export const PROJECT_TYPES = [
    { id: ProjectType.STP, name: 'Sewage Treatment Plant (STP)' },
    { id: ProjectType.ETP, name: 'Effluent Treatment Plant (ETP)' },
    { id: ProjectType.CETP, name: 'Common Effluent Treatment Plant (CETP)' },
    { id: ProjectType.WTP, name: 'Water Treatment Plant (WTP)' },
    { id: ProjectType.RO, name: 'Reverse Osmosis (RO) Plant' },
    { id: ProjectType.SWM, name: 'Solid Waste Management (SWM)' },
    { id: ProjectType.WTE, name: 'Waste to Energy (WTE)' },
];

export const LOCATIONS = [
    { id: 'Andhra Pradesh', name: 'Andhra Pradesh (APPCB)' },
    { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh (APSPCB)' },
    { id: 'Assam', name: 'Assam (PCBA)' },
    { id: 'Bihar', name: 'Bihar (BSPCB)' },
    { id: 'Chhattisgarh', name: 'Chhattisgarh (CECB)' },
    { id: 'Delhi', name: 'Delhi (DPCC)' },
    { id: 'Goa', name: 'Goa (GSPCB)' },
    { id: 'Gujarat', name: 'Gujarat (GPCB)' },
    { id: 'Haryana', name: 'Haryana (HSPCB)' },
    { id: 'Himachal Pradesh', name: 'Himachal Pradesh (HPSPCB)' },
    { id: 'Jharkhand', name: 'Jharkhand (JSPCB)' },
    { id: 'Karnataka', name: 'Karnataka (KSPCB)' },
    { id: 'Kerala', name: 'Kerala (KSPCB)' },
    { id: 'Madhya Pradesh', name: 'Madhya Pradesh (MPPCB)' },
    { id: 'Maharashtra', name: 'Maharashtra (MPCB)' },
    { id: 'Manipur', name: 'Manipur (MPCB)' },
    { id: 'Meghalaya', name: 'Meghalaya (MSPCB)' },
    { id: 'Mizoram', name: 'Mizoram (MPCB)' },
    { id: 'Nagaland', name: 'Nagaland (NPCB)' },
    { id: 'Odisha', name: 'Odisha (OSPCB)' },
    { id: 'Puducherry', name: 'Puducherry (PPCC)' },
    { id: 'Punjab', name: 'Punjab (PPCB)' },
    { id: 'Rajasthan', name: 'Rajasthan (RSPCB)' },
    { id: 'Sikkim', name: 'Sikkim (SPCB)' },
    { id: 'Tamil Nadu', name: 'Tamil Nadu (TNPCB)' },
    { id: 'Telangana', name: 'Telangana (TSPCB)' },
    { id: 'Tripura', name: 'Tripura (TSPCB)' },
    { id: 'Uttar Pradesh', name: 'Uttar Pradesh (UPPCB)' },
    { id: 'Uttarakhand', name: 'Uttarakhand (UEPPCB)' },
    { id: 'West Bengal', name: 'West Bengal (WBPCB)' },
    { id: 'CPCB', name: 'Central (CPCB) - Pan-India' },
];

export const EFFLUENT_TYPES = [
    { id: EffluentType.HeavyMetals, name: 'Heavy Metals' },
    { id: EffluentType.OilsAndGrease, name: 'Oils and Greases' },
    { id: EffluentType.HighTDS, name: 'High TDS Effluents' },
];

export const TECHNOLOGIES: { [key in ProjectType]: { id: string; name: string; description: string }[] } = {
    [ProjectType.STP]: [
        { id: 'MBBR', name: 'MBBR', description: 'Moving Bed Biofilm Reactor' },
        { id: 'SBR', name: 'SBR', description: 'Sequencing Batch Reactor' },
        { id: 'MBR', name: 'MBR', description: 'Membrane Bioreactor' },
        { id: 'ASP', name: 'ASP', description: 'Activated Sludge Process' },
    ],
    [ProjectType.ETP]: [
        { id: 'ZLD', name: 'ZLD', description: 'Zero Liquid Discharge' },
        { id: 'Physico-Chemical', name: 'Physico-Chemical', description: 'Chemical treatment and clarification' },
        { id: 'Biological', name: 'Advanced Biological', description: 'Biological treatment with nutrient removal' },
    ],
    [ProjectType.CETP]: [
        { id: 'ZLD', name: 'ZLD', description: 'Zero Liquid Discharge' },
        { id: 'Physico-Chemical', name: 'Physico-Chemical', description: 'Chemical treatment and clarification' },
        { id: 'Biological', name: 'Advanced Biological', description: 'Biological treatment with nutrient removal' },
    ],
    [ProjectType.WTP]: [
        { id: 'Conventional', name: 'Conventional Filtration', description: 'Coagulation, flocculation, sedimentation, filtration' },
        { id: 'UF', name: 'Ultrafiltration (UF)', description: 'Membrane-based filtration for fine particles' },
        { id: 'NF', name: 'Nanofiltration (NF)', description: 'Membrane-based filtration for hardness and organics' },
    ],
    [ProjectType.RO]: [
        { id: 'Single Pass', name: 'Single Pass RO', description: 'Standard Reverse Osmosis process' },
        { id: 'Double Pass', name: 'Double Pass RO', description: 'Two-stage RO for high purity water' },
    ],
    [ProjectType.SWM]: [
        { id: 'OWC', name: 'Organic Waste Composter (OWC)', description: 'Mechanical composting for organic fraction of MSW' },
        { id: 'Composting', name: 'Composting', description: 'Aerobic decomposition of organic waste' },
        { id: 'Vermicomposting', name: 'Vermicomposting', description: 'Using earthworms to decompose waste' },
        { id: 'Incineration', name: 'Incineration', description: 'Controlled burning of waste' },
        { id: 'Landfill', name: 'Sanitary Landfill', description: 'Engineered disposal of residual waste' },
    ],
    [ProjectType.WTE]: [
        { id: 'Incineration', name: 'Incineration', description: 'Mass burn combustion to generate heat/electricity' },
        { id: 'Gasification', name: 'Gasification', description: 'Converting waste into syngas' },
        { id: 'Anaerobic Digestion', name: 'Anaerobic Digestion', description: 'Biogas production from organic waste' },
    ],
};

export const PARAMETER_DETAILS: { [key in ProjectType]: { name: string; label: string; unit: string; min: number; max: number; step: number }[] } = {
    [ProjectType.STP]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'KLD', min: 1, max: 10000, step: 1 },
        { name: 'inputBOD', label: 'Influent BOD', unit: 'mg/L', min: 50, max: 1000, step: 10 },
        { name: 'inputCOD', label: 'Influent COD', unit: 'mg/L', min: 100, max: 2000, step: 10 },
        { name: 'outputBOD', label: 'Effluent BOD Target', unit: 'mg/L', min: 5, max: 30, step: 1 },
        { name: 'outputCOD', label: 'Effluent COD Target', unit: 'mg/L', min: 10, max: 100, step: 5 },
    ],
    [ProjectType.ETP]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'KLD', min: 1, max: 10000, step: 1 },
        { name: 'inputBOD', label: 'Influent BOD', unit: 'mg/L', min: 100, max: 5000, step: 50 },
        { name: 'inputCOD', label: 'Influent COD', unit: 'mg/L', min: 200, max: 10000, step: 50 },
        { name: 'outputBOD', label: 'Effluent BOD Target', unit: 'mg/L', min: 10, max: 100, step: 5 },
        { name: 'outputCOD', label: 'Effluent COD Target', unit: 'mg/L', min: 50, max: 250, step: 10 },
    ],
     [ProjectType.CETP]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'KLD', min: 1, max: 10000, step: 1 },
        { name: 'inputBOD', label: 'Influent BOD', unit: 'mg/L', min: 100, max: 5000, step: 50 },
        { name: 'inputCOD', label: 'Influent COD', unit: 'mg/L', min: 200, max: 10000, step: 50 },
        { name: 'outputBOD', label: 'Effluent BOD Target', unit: 'mg/L', min: 10, max: 100, step: 5 },
        { name: 'outputCOD', label: 'Effluent COD Target', unit: 'mg/L', min: 50, max: 250, step: 10 },
    ],
    [ProjectType.WTP]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'KLD', min: 100, max: 50000, step: 100 },
        { name: 'inputBOD', label: 'Influent Turbidity', unit: 'NTU', min: 1, max: 500, step: 5 },
        { name: 'inputCOD', label: 'Influent Hardness', unit: 'mg/L as CaCO₃', min: 50, max: 1000, step: 10 },
        { name: 'outputBOD', label: 'Effluent Turbidity Target', unit: 'NTU', min: 0, max: 5, step: 1 },
        { name: 'outputCOD', label: 'Effluent Hardness Target', unit: 'mg/L as CaCO₃', min: 0, max: 150, step: 5 },
    ],
    [ProjectType.RO]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'KLD', min: 1, max: 5000, step: 1 },
        { name: 'inputBOD', label: 'Influent TDS', unit: 'mg/L', min: 200, max: 45000, step: 100 },
        { name: 'inputCOD', label: 'Influent Hardness', unit: 'mg/L as CaCO₃', min: 50, max: 2000, step: 20 },
        { name: 'outputBOD', label: 'Effluent TDS Target', unit: 'mg/L', min: 10, max: 500, step: 10 },
        { name: 'outputCOD', label: 'Recovery Rate Target', unit: '%', min: 25, max: 90, step: 1 },
    ],
    [ProjectType.SWM]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'TPD', min: 10, max: 5000, step: 10 },
        { name: 'inputBOD', label: 'Moisture Content', unit: '%', min: 10, max: 80, step: 1 },
        { name: 'inputCOD', label: 'Organic Fraction', unit: '%', min: 20, max: 90, step: 1 },
        { name: 'outputBOD', label: 'Combustible Fraction', unit: '%', min: 10, max: 70, step: 1 },
    ],
    [ProjectType.WTE]: [
        { name: 'flowRate', label: 'Plant Capacity', unit: 'TPD', min: 10, max: 5000, step: 10 },
        { name: 'inputBOD', label: 'Moisture Content', unit: '%', min: 10, max: 80, step: 1 },
        { name: 'inputCOD', label: 'Calorific Value', unit: 'kcal/kg', min: 800, max: 4000, step: 50 },
    ],
};