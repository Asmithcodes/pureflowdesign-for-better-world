import React, { useState, useEffect, useRef } from 'react';

interface ManualsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'user' | 'developer';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            active 
            ? 'bg-blue-600 text-white' 
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
    >
        {children}
    </button>
);

const ManualsModal: React.FC<ManualsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('user');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    useEffect(() => {
        if (isOpen) {
            modalRef.current?.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const userManualContent = (
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <h4>Welcome to the PureFlowDesign AI Assistant</h4>
            <p>This application is an expert engineering assistant designed to help you create preliminary designs for water and wastewater treatment plants, specifically tailored to Indian regulatory standards.</p>
            
            <h4>How It Works: Technical Flow</h4>
            <p>
                This web application provides a user-friendly interface to gather your project requirements. Here’s a high-level overview of the technical process:
            </p>
            <ol>
                <li><strong>Data Collection:</strong> Your inputs from the wizard (project type, parameters, text notes, files, and voice recordings) are collected in the browser.</li>
                <li><strong>API Request:</strong> The application securely packages this data and sends it to Google's powerful AI.</li>
                <li><strong>AI Processing:</strong> The AI analyzes your requirements, performs calculations, and generates a complete design.</li>
                <li><strong>Structured Response:</strong> The AI returns the design as a structured JSON object, ensuring all data is consistent and complete.</li>
                <li><strong>Displaying Results:</strong> The application parses this data and displays it in the organized, multi-tab results view.</li>
            </ol>

            <h4>Core Libraries & APIs</h4>
            <ul>
                <li><strong>AI Engine:</strong> The core intelligence is powered by the <strong>Google Gemini API</strong>, specifically using the advanced <code>gemini-2.5-pro</code> model. This model excels at complex reasoning, making it ideal for engineering tasks. We utilize its "Thinking Mode" feature, allowing the AI more time to process your request for higher accuracy.</li>
                <li><strong>Frontend Framework:</strong> The user interface is built with <strong>React</strong>, a leading JavaScript library for building modern, interactive web applications.</li>
                <li><strong>Styling:</strong> The app's visual design is implemented with <strong>Tailwind CSS</strong>, enabling a responsive and clean aesthetic.</li>
            </ul>

            <hr />

            <h4>Using the Design Wizard: A Step-by-Step Guide</h4>
            
            <h5>Step 1: Project Setup</h5>
            <p>This is where you define the foundational details of your project.</p>
            <ul>
                <li><strong>Project Type:</strong> Choose from Sewage Treatment Plant (STP), Effluent Treatment Plant (ETP), Water Treatment Plant (WTP), or Reverse Osmosis (RO) Plant. Your choice determines the design logic and parameters.</li>
                <li><strong>Location / Regulatory Body:</strong> Select the Indian state or the central CPCB standard. This is crucial as it sets the specific compliance standards the AI will follow for the design.</li>
                <li><strong>Special Instructions (Optional but Recommended):</strong> This powerful feature allows you to provide detailed context to the AI.
                    <ul>
                        <li><strong>Text Input:</strong> Type any specific constraints, client requirements, or notes (e.g., "Use MBBR technology due to limited space").</li>
                        <li><strong>Attach Files:</strong> Upload documents like site layout images (PNG, JPG), requirement documents (PDF), or data sheets. The AI will analyze these files.</li>
                        <li><strong>Record Voice Note:</strong> For convenience, you can record a voice memo directly in the app. The AI will process the audio.</li>
                    </ul>
                    <p>The AI is instructed to give these special instructions the highest priority to ensure your design is customized.</p>
                </li>
            </ul>

            <h5>Step 2: Input Parameters</h5>
            <p>Here you provide the core technical specifications for the plant.</p>
            <ul>
                <li><strong>Parameter Sliders:</strong> Use the interactive sliders to set values for Flow Rate, Influent/Effluent BOD & COD, etc. The available parameters will adapt based on the project type you selected in Step 1.</li>
                <li><strong>Key Pollutants (for ETP):</strong> If designing an ETP, you can select specific pollutants like Heavy Metals or Oils and Greases. This tells the AI to incorporate specialized treatment units for these contaminants.</li>
            </ul>

            <h5>Step 3: Generate & View Results</h5>
            <p>After clicking "Generate Design," the AI will process your request. You'll then be presented with a comprehensive, multi-tab report.</p>
            <ul>
                <li><strong>Report Summary:</strong> A concise, readable overview of the proposed design.</li>
                <li><strong>Process & Instrumentation Diagram (P&ID):</strong> A professional, CAD-style SVG diagram. It's fully interactive—click on any major equipment to see its details.</li>
                <li><strong>Design Calculations:</strong> The core engineering data, showing the calculations for tank sizes, chemical dosing, and more.</li>
                <li><strong>Bill of Materials (BOM):</strong> A detailed list of all required equipment, including quantities and suggestions for vendors commonly available in India.</li>
                <li><strong>Compliance Checklist:</strong> A checklist that verifies the design against the standards of the location you selected.</li>
                <li><strong>Abbreviations:</strong> A helpful glossary of all technical terms and acronyms used in the report.</li>
            </ul>
            
            <h4>Downloading Your Report</h4>
            <p>You have two options for exporting your design:</p>
            <ul>
                <li><strong>Download Report:</strong> This button generates a single, self-contained HTML file. This professional report includes all sections of your design and embeds the high-quality SVG P&ID, perfect for printing or sharing.</li>
                <li><strong>Save P&ID:</strong> This button, found in the P&ID tab, allows you to download just the interactive SVG diagram file.</li>
            </ul>
        </div>
    );
    
    const developerManualContent = (
         <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <h4>Project Structure</h4>
            <ul>
                <li><code>App.tsx</code>: The main application component. It manages state for the wizard steps and modal visibility.</li>
                <li><code>/components</code>: Contains all reusable React components that form the UI.</li>
                <li><code>/services/geminiService.ts</code>: This is the core of the AI functionality. It contains the functions for making API calls to the Google Gemini models.</li>
                <li><code>types.ts</code>: Defines all TypeScript types and interfaces used throughout the application, ensuring data consistency.</li>
                 <li><code>constants.ts</code>: Stores application-wide constants, such as the list of project types, locations, and default parameters.</li>
            </ul>
             <h4>Gemini API Integration</h4>
            <p>All interactions with the Gemini API are centralized in <code>geminiService.ts</code>.</p>
            <ul>
                <li><strong><code>generateDesign</code></strong>: This function uses the powerful <code>gemini-2.5-pro</code> model. It leverages <strong>Thinking Mode</strong> with a maxed-out budget (32768) to handle complex engineering calculations. It sends a detailed prompt and a system instruction, and requests a structured JSON response that conforms to a predefined schema. This schema includes a professional, CAD-style SVG for the P&ID.</li>
            </ul>
              <h4>How to Extend the App</h4>
             <ul>
                 <li><strong>Adding a New Project Type</strong>: To add a new plant type, first update the <code>ProjectType</code> enum in <code>types.ts</code>. Then, add its name to the <code>PROJECT_TYPES</code> array and its specific parameters to the <code>PARAMETER_DETAILS</code> object in <code>constants.ts</code>. The UI will automatically adapt.</li>
                 <li><strong>Modifying API Prompts</strong>: To change the AI's behavior, adjust the prompt-generation functions (<code>generateSystemInstruction</code> and <code>generatePrompt</code>) in <code>geminiService.ts</code>.</li>
             </ul>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manuals-title"
        >
            <div 
                ref={modalRef}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 id="manuals-title" className="text-xl font-bold">Manuals</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
                </div>
                
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <TabButton active={activeTab === 'user'} onClick={() => setActiveTab('user')}>User Manual</TabButton>
                        <TabButton active={activeTab === 'developer'} onClick={() => setActiveTab('developer')}>Developer Manual</TabButton>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {activeTab === 'user' ? userManualContent : developerManualContent}
                </div>

                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-right">
                    <button 
                        onClick={onClose}
                        className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualsModal;