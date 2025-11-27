// FIX: Import Modality for image editing.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DesignResults, ProjectData, ProjectType, EffluentType } from '../types';
import { PARAMETER_DETAILS, TECHNOLOGIES } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        designCalculations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    parameter: { type: Type.STRING },
                    value: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ["parameter", "value", "unit", "description"],
            },
        },
        processFlowDiagram: {
            type: Type.OBJECT,
            properties: {
                svgContent: {
                    type: Type.STRING,
                    description: "A complete, well-structured, professional, CAD-style SVG string representing the Process & Instrumentation Diagram (P&ID). CRITICAL FOR RESPONSIVENESS: The root `<svg>` element MUST have a `viewBox` attribute that is tightly cropped around the entire drawing content. To ensure the diagram scales correctly within its container, the root `<svg>` element MUST NOT have `width` or `height` attributes. The overall layout of the diagram should be compact, aiming for a standard landscape aspect ratio (like 16:9 or 4:3) to ensure it is fully visible without excessive scrolling. The SVG must be scalable and viewable in a browser. Each major equipment component (like tanks, pumps, filters) must be wrapped in a '<g>' tag with a unique 'id' (e.g., 'unit-aeration-tank') and a class 'equipment-unit'. Inside the group, include shapes for the component and a '<title>' tag with a short description of the component (e.g., 'Aeration Tank - 150 m3'). All pipes connecting the equipment must be '<path>' elements with the class 'pipe-flow'. Instrumentation should be represented with standard symbols and also have a '<title>' as well. CRITICAL: All text labels and annotations MUST be rendered as native SVG '<text>' elements (i.e., vector text). Do not use raster images for text or convert text characters into '<path>' elements. The text must remain selectable and scalable. All text elements within the SVG must have a uniform and readable font size, such as 12px. Text should be neatly aligned with its corresponding component or line, using appropriate 'text-anchor' attributes (e.g., 'middle', 'start', 'end') for professional alignment. Under absolutely no circumstances should any text use a bold font weight. ALL text must have a normal font weight. This is a non-negotiable requirement for technical clarity. You MUST include a legend within the SVG. The legend should be a group ('<g>') element with id='pid-legend', placed in a corner (e.g., bottom-right). The legend must have a title ('Legend') and clearly explain the symbols used for different equipment (e.g., a circle for a pump, a rectangle for a tank) and line styles for pipes (e.g., a solid line for main process flow, dashed for backwash). The legend elements must NOT have the 'equipment-unit' class."
                },
            },
            required: ["svgContent"],
        },
        complianceChecklist: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    item: { type: Type.STRING },
                    compliant: { type: Type.BOOLEAN },
                    details: { type: Type.STRING },
                },
                required: ["id", "item", "compliant", "details"],
            },
        },
        billOfMaterials: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    vendorSuggestion: { type: Type.STRING },
                },
                required: ["name", "quantity", "unit", "vendorSuggestion"],
            },
        },
        reportSummary: {
            type: Type.STRING,
            description: "A summary of the design in Markdown format.",
        },
        abbreviations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
            },
            description: "A list of all technical acronyms (like BOD, COD, ETP) used in the report and their full definitions.",
        }
    },
    required: ["designCalculations", "processFlowDiagram", "complianceChecklist", "billOfMaterials", "reportSummary", "abbreviations"],
};

const generateSystemInstruction = (projectData: ProjectData) => `
You are a world-class expert engineering assistant from India, specializing in the design of water and wastewater treatment plants. Your expertise is rooted in Indian regulatory, design, and operational standards (CPCB, BIS, state-level PCB norms).

Your task is to generate a complete, modular, and step-by-step preliminary design for a ${projectData.projectType}.

**User-Provided Context:**
The user may provide special instructions via text, attached files (images, documents), or a voice recording. You MUST carefully analyze all provided materials and prioritize them in your design. For instance, if the user mentions a specific technology in a voice note or a document, you should incorporate it. If they provide a site layout image, consider it for the P&ID layout.

**Critical Instructions:**
1.  **Strictly Adhere to Indian Standards:** All calculations, suggestions, and compliance checks must be based on the standards applicable in ${projectData.location}, India. Mention specific IS codes or CPCB guidelines where relevant.
2.  **Modular & Structured Output:** Generate a single, valid JSON object that strictly conforms to the provided schema. Do not include any text, markdown formatting, or explanations outside of the JSON structure.
3.  **Action-Oriented & Practical:** The design should be practical for Indian engineers, contractors, and government clients. Vendor suggestions should be for brands commonly available and trusted in India.
4.  **Complete All Sections:** You must provide data for all fields in the JSON schema: \`designCalculations\`, \`processFlowDiagram\`, \`complianceChecklist\`, \`billOfMaterials\`, \`reportSummary\`, and \`abbreviations\`. Do not leave any section empty.
5.  **Define Acronyms:** You must populate the \`abbreviations\` array with definitions for all technical acronyms used throughout the generated report (e.g., BOD, COD, STP, P&ID).
`;

const generatePrompt = (projectData: ProjectData) => {
    const etpDetails = projectData.projectType === ProjectType.ETP && projectData.effluentTypes && projectData.effluentTypes.length > 0
        ? `
**ETP Specifics:**
- **Key Pollutants to Treat:** ${projectData.effluentTypes.join(', ')}.
- **Required Technologies:** Based on these pollutants, incorporate specific treatment technologies. For Heavy Metals, include chemical precipitation and coagulation/flocculation. For Oils and Greases, include oil skimmers/separators. For High TDS, consider advanced processes like reverse osmosis or evaporators as a final step. Detail these in the design calculations and process flow.`
        : '';

    const technologyDetails = projectData.technology ? `
**Selected Technology:**
- The user has specifically requested the **${projectData.technology}** technology. You MUST base your entire design, including the P&ID, calculations, and component selection, on this technology.` : '';

    const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const toAddressDetails = projectData.toAddress ? `
**Report Addressing:**
The 'reportSummary' MUST begin by formally addressing the recipient. Start with the following address block, then leave one line of vertical space.
Then add the Subject line, followed by the Offer Date and Validity on the same line or immediately below.

**To Address:**
${projectData.toAddress}

**Header Details:**
Sub: Offer for the requirement | Offer Date: ${currentDate} | Validity: 30 Calendar Days
` : '';

    const commercialDetails = projectData.estimatedPrice && projectData.estimatedPrice > 0 ? `
**Commercial Offer Details:**
- **Estimated Price:** ${projectData.estimatedPrice} INR
- **Payment Terms:** 80% as advance, and the balance upon commissioning the project.
- **Taxes:** GST and other applicable taxes are extra.
- **Instruction:** Based on these details, you MUST include a professional section titled "### Commercial Offer" within the 'reportSummary'.
` : '';

    const projectParams = PARAMETER_DETAILS[projectData.projectType];
    const detailsList = projectParams.map(param => {
        const value = projectData[param.name as keyof ProjectData];
        if (value !== undefined) {
            return `- **${param.label}:** ${value} ${param.unit}`;
        }
        return null;
    }).filter(Boolean).join('\n');


    return `
Based on the following project parameters, generate a preliminary design report.

${toAddressDetails}

**Project Details:**
- **Project Type:** ${projectData.projectType}
${technologyDetails}
- **Location:** ${projectData.location}, India
${detailsList}
- **Plant Capacity (Key Design Parameter):** ${projectData.flowRate} ${['SWM','WTE'].includes(projectData.projectType) ? 'TPD' : 'KLD'}
${etpDetails}
${commercialDetails}

**Additional Mandatory Report Sections (to be included in 'reportSummary'):**
- **Recommended use of processed water:** You MUST include a section with this exact title, formatted as "### Recommended use of processed water". In this section, provide expert advice on the best suitable reuse applications for the treated water, considering the project type (e.g., for an STP, suggest reuse for landscaping, flushing, or construction; for an ETP, consider process reuse if quality permits).

**Your Task:**
Generate the complete design in the required JSON format.
- **P&ID SVG:** For the 'processFlowDiagram', you MUST generate a valid, professional, CAD-style SVG string as specified in the schema. The diagram should be clear, professional, and follow standard P&ID conventions.`;
};

// FIX: Add missing function exports to resolve errors in App.tsx and ImageEditor.tsx.
const analysisSchema = (projectType: ProjectType) => {
    const parameterProperties: { [key: string]: { type: Type; description: string, items?: { type: Type } } } = {};
    PARAMETER_DETAILS[projectType].forEach(param => {
        parameterProperties[param.name] = {
            type: Type.NUMBER,
            description: `The value for "${param.label}" in ${param.unit}.`
        };
    });

    parameterProperties['technology'] = {
        type: Type.STRING,
        description: `The specific treatment technology mentioned (e.g., "MBBR", "SBR", "ZLD"). Possible values: ${TECHNOLOGIES[projectType].map(t => t.id).join(', ')}.`
    };

    if (projectType === ProjectType.ETP) {
        parameterProperties['effluentTypes'] = {
            type: Type.ARRAY,
            description: `An array of strings for effluent types to treat. Possible values: "${EffluentType.HeavyMetals}", "${EffluentType.OilsAndGrease}", "${EffluentType.HighTDS}".`,
            items: { type: Type.STRING }
        };
    }

    return {
        type: Type.OBJECT,
        properties: {
            parameters: {
                type: Type.OBJECT,
                properties: parameterProperties,
                description: "The extracted parameters. Only include a parameter if a specific value is mentioned or clearly implied. Do not guess or use default values."
            },
            summary: {
                type: Type.STRING,
                description: "A concise, one-paragraph summary of all the user's special instructions, combining information from text, files, and audio. This summary will be shown to the user for confirmation."
            }
        },
        required: ["parameters", "summary"],
    };
};

export const analyzeInstructionsForParameters = async (projectData: ProjectData): Promise<{ parameters: Partial<ProjectData>, summary: string }> => {
    const model = 'gemini-2.5-flash-lite';
    const schema = analysisSchema(projectData.projectType);
    
    const systemInstruction = `You are an intelligent assistant that extracts key technical parameters and summarizes instructions for designing a water treatment plant. Analyze the provided text, files (images, documents), and audio. Your goal is to populate a JSON object with specific values and create a comprehensive summary.`;

    const parameterList = PARAMETER_DETAILS[projectData.projectType].map(p => `- ${p.label} (${p.unit})`).join('\n');
    let etpInfo = '';
    if (projectData.projectType === ProjectType.ETP) {
        etpInfo = `For ETP projects, also identify the key pollutants to treat (effluentTypes), which can include "Heavy Metals", "Oils and Greases", or "High TDS Effluents".`;
    }
    
    // FIX: To avoid a potential 500 error from the API with multi-part text,
    // embed the user's text note directly into the main prompt rather than sending it as a separate part.
    const userTextNote = projectData.specialInstructionsText
        ? `\n\nUser's text note: "${projectData.specialInstructionsText}"`
        : "";

    const textPrompt = `
        Analyze the user's special instructions provided in the attached files and audio recording.${userTextNote}
        Extract the following parameters for a ${projectData.projectType}:
        ${parameterList}
        - technology (e.g. MBBR, SBR)
        ${etpInfo}

        Also, create a concise, one-paragraph summary of all the user's instructions. This summary should synthesize all information from the text, files, and audio into a coherent overview.

        Return your findings in a single, valid JSON object that strictly adheres to the provided schema. Only include parameters for which you can find a specific value in the user's instructions. Do not invent or assume values.
    `;

    const parts: any[] = [{ text: textPrompt }];
    
    if (projectData.specialInstructionsFiles) {
        for (const file of projectData.specialInstructionsFiles) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    }
    if (projectData.specialInstructionsAudio) {
        parts.push({
            inlineData: {
                mimeType: projectData.specialInstructionsAudio.mimeType,
                data: projectData.specialInstructionsAudio.data,
            }
        });
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            thinkingConfig: { thinkingBudget: 32768 },
        }
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error parsing JSON from parameter analysis:", response.text);
        throw new Error("Failed to analyze instructions. The AI response was not valid JSON.");
    }
};

export const generateDesign = async (projectData: ProjectData): Promise<DesignResults> => {
    const model = 'gemini-2.5-flash-lite';
    const systemInstruction = generateSystemInstruction(projectData);
    const textPrompt = generatePrompt(projectData);

    const parts: any[] = [{ text: textPrompt }];

    if (projectData.specialInstructionsFiles) {
        for (const file of projectData.specialInstructionsFiles) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    }
    
    if (projectData.specialInstructionsAudio) {
        parts.push({
            inlineData: {
                mimeType: projectData.specialInstructionsAudio.mimeType,
                data: projectData.specialInstructionsAudio.data,
            }
        });
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            // Per developer manual, use max thinking budget for this model.
            thinkingConfig: { thinkingBudget: 32768 },
        }
    });

    try {
        const jsonText = response.text.trim();
        const designResults = JSON.parse(jsonText) as DesignResults;
        return designResults;
    } catch (e) {
        console.error("Error parsing JSON from Gemini response:", response.text);
        throw new Error("Failed to parse the design results from the AI. The response was not valid JSON.");
    }
};

const pfdSchema = {
    type: Type.OBJECT,
    properties: {
        svgContent: responseSchema.properties.processFlowDiagram.properties.svgContent,
    },
    required: ["svgContent"],
};

export const regeneratePfd = async (projectData: ProjectData): Promise<{ svgContent: string }> => {
    const model = 'gemini-2.5-flash-lite';

    const systemInstruction = `You are a world-class expert engineering assistant from India, specializing in creating professional, CAD-style Process & Instrumentation Diagram (P&IDs) for water treatment plants. Your task is to generate ONLY a valid SVG string based on the user's project data and instructions. Adhere strictly to Indian engineering standards and P&ID conventions. The SVG must conform to all requirements specified in the schema.`;

    const textPrompt = `
        Based on the provided project data and special instructions (including any attached files or audio), regenerate the Process & Instrumentation Diagram (P&ID).

        Project Type: ${projectData.projectType}
        Technology Preference: ${projectData.technology || 'Not specified'}
        Plant Capacity: ${projectData.flowRate} ${['SWM','WTE'].includes(projectData.projectType) ? 'TPD' : 'KLD'}
        Influent BOD: ${projectData.inputBOD} mg/L
        Target Effluent BOD: ${projectData.outputBOD} mg/L
        Special Instructions Summary: ${projectData.specialInstructionsText}

        Your task is to generate a single, valid JSON object containing only the 'svgContent' key, with the value being the complete SVG string for the P&ID.
    `;

    const parts: any[] = [{ text: textPrompt }];
    if (projectData.specialInstructionsFiles) {
        for (const file of projectData.specialInstructionsFiles) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    }
    if (projectData.specialInstructionsAudio) {
        parts.push({
            inlineData: {
                mimeType: projectData.specialInstructionsAudio.mimeType,
                data: projectData.specialInstructionsAudio.data,
            }
        });
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: pfdSchema,
            thinkingConfig: { thinkingBudget: 32768 },
        }
    });

    try {
        const jsonText = response.text.trim();
        const pfdData = JSON.parse(jsonText);
        return { svgContent: pfdData.svgContent };
    } catch (e) {
        console.error("Error parsing JSON from PFD regeneration:", response.text);
        throw new Error("Failed to regenerate PFD. The AI response was not valid JSON.");
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash-lite';

    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [imagePart, textPart],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("No image was returned from the edit image call.");
};