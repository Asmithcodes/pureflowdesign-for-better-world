import React, { useState, useRef, useEffect } from 'react';
import { DesignResults, ProjectData } from '../types';
import InteractivePfd from './InteractivePfd';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import RefreshIcon from './icons/RefreshIcon';
import Loader from './Loader';
import { generateHtmlReport, generateDocxReport, generateRtfReport } from '../utils/docxGenerator';
import { svgToPngDataUrl } from '../utils/fileUtils';

type Tab = 'summary' | 'calculations' | 'pfd' | 'bom' | 'compliance' | 'clientScope' | 'abbreviations';

interface Step3ResultsProps {
    results: DesignResults;
    onReset: () => void;
    projectData: ProjectData;
    onRegeneratePfd: () => void;
    isRegeneratingPfd: boolean;
}

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

const Step3_Results: React.FC<Step3ResultsProps> = ({ results, onReset, projectData, onRegeneratePfd, isRegeneratingPfd }) => {
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPfdMenuOpen, setIsPfdMenuOpen] = useState(false);
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

    const pfdMenuRef = useRef<HTMLDivElement>(null);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, close: () => void) => {
         useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    close();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [ref, close]);
    }

    useOutsideAlerter(pfdMenuRef, () => setIsPfdMenuOpen(false));
    useOutsideAlerter(downloadMenuRef, () => setIsDownloadMenuOpen(false));


    const getFilenameSlug = () => projectData.projectType
            .toLowerCase()
            .replace(/\s+/g, '-') 
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    
    const handleSavePfdAsSvg = () => {
        if (!results.processFlowDiagram?.svgContent) return;

        const filename = `${getFilenameSlug()}-pid.svg`;

        const blob = new Blob([results.processFlowDiagram.svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSavePfdAsPng = async () => {
        if (!results.processFlowDiagram?.svgContent) return;

        try {
            const pngUrl = await svgToPngDataUrl(results.processFlowDiagram.svgContent);
            const filename = `${getFilenameSlug()}-pid.png`;

            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
             console.error("Error converting SVG to PNG for download.", e);
             alert("Sorry, there was an error converting the P&ID to a PNG file.");
        }
    };


    const handleDownloadHtml = () => {
        setIsDownloadMenuOpen(false);
        setIsDownloading(true);
        try {
            generateHtmlReport(results, projectData);
        } catch (error) {
            console.error("Failed to generate HTML report:", error);
            alert("Sorry, there was an error creating the report. Please try again.");
        } finally {
             // Give a brief moment for the download to initiate before resetting the button state
            setTimeout(() => setIsDownloading(false), 500);
        }
    };
    
    const handleDownloadDocx = async () => {
        setIsDownloadMenuOpen(false);
        setIsDownloading(true);
        try {
            await generateDocxReport(results, projectData);
        } catch (error) {
            console.error("Failed to generate DOCX report:", error);
            alert("Sorry, there was an error creating the DOC report. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadRtf = () => {
        setIsDownloadMenuOpen(false);
        setIsDownloading(true);
        try {
            generateRtfReport(results, projectData);
        } catch (error) {
            console.error("Failed to generate RTF report:", error);
            alert("Sorry, there was an error creating the RTF report. Please try again.");
        } finally {
            // Give a brief moment for the download to initiate
            setTimeout(() => setIsDownloading(false), 500);
        }
    };

    const clientScopeItems = [
        "All civil works",
        "Incoming pipeline up to battery limit",
        "Treated water outlet pipeline from battery limit",
        "Three-phase incoming power supply up to control panel",
        "Treated water storage and associated pumping systems",
        "Material lifting and unloading above 50 kg (using forklifts, cranes, etc.) to be arranged by the client, including site unloading",
        "Provision of network connectivity (Internet / Wi-Fi) for the control panel, if required"
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'summary':
                const formattedSummary = results.reportSummary
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />');
                return (
                    <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedSummary }} />
                );
            case 'calculations':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Parameter</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Value</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Unit</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.designCalculations.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.parameter}</td>
                                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{item.value}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{item.unit}</td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'pfd':
                return (
                    <div>
                        {results.processFlowDiagram?.svgContent || isRegeneratingPfd ? (
                           <>
                                <div className="flex justify-end mb-4 gap-2">
                                     <button
                                        type="button"
                                        onClick={onRegeneratePfd}
                                        disabled={isRegeneratingPfd}
                                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
                                        aria-label={isRegeneratingPfd ? "Regenerating P&ID" : "Regenerate P&ID"}
                                    >
                                        {isRegeneratingPfd ? (
                                            <>
                                                <Loader className="h-5 w-5 text-slate-500" />
                                                <span className="ml-2">Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshIcon className="w-5 h-5 mr-2" />
                                                Regenerate P&ID
                                            </>
                                        )}
                                    </button>
                                    <div className="relative inline-block text-left" ref={pfdMenuRef}>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setIsPfdMenuOpen(!isPfdMenuOpen)}
                                                className="inline-flex justify-center w-full rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500"
                                                id="menu-button"
                                                aria-expanded="true"
                                                aria-haspopup="true"
                                            >
                                                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                                Save P&ID
                                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                                            </button>
                                        </div>
                                        {isPfdMenuOpen && (
                                            <div
                                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none z-10"
                                                role="menu"
                                                aria-orientation="vertical"
                                                aria-labelledby="menu-button"
                                            >
                                                <div className="py-1" role="none">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handleSavePfdAsSvg(); setIsPfdMenuOpen(false); }}
                                                        className="text-slate-700 dark:text-slate-300 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                                        role="menuitem"
                                                        id="menu-item-0"
                                                    >
                                                        Save as SVG (Vector)
                                                    </a>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handleSavePfdAsPng(); setIsPfdMenuOpen(false); }}
                                                        className="text-slate-700 dark:text-slate-300 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                                        role="menuitem"
                                                        id="menu-item-1"
                                                    >
                                                        Save as PNG (Image)
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="relative">
                                    <InteractivePfd svgContent={results.processFlowDiagram.svgContent} />
                                    {isRegeneratingPfd && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-lg z-10">
                                            <div className="flex flex-col items-center">
                                                <Loader />
                                                <p className="mt-2 text-slate-600 dark:text-slate-400 font-semibold">Generating new P&ID...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-8 text-slate-500">
                                <p>Process & Instrumentation Diagram was not generated.</p>
                                <button
                                    onClick={onRegeneratePfd}
                                    disabled={isRegeneratingPfd}
                                    className="mt-4 inline-flex items-center justify-center rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-wait"
                                >
                                     {isRegeneratingPfd ? (
                                        <>
                                            <Loader className="h-5 w-5 text-blue-600" />
                                            <span className="ml-2">Generating...</span>
                                        </>
                                     ) : (
                                        'Try to Generate P&ID'
                                     )}
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'bom':
                 return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Item Name</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Quantity</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Unit</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Vendor Suggestion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.billOfMaterials.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{item.unit}</td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{item.vendorSuggestion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'compliance':
                 return (
                    <ul className="space-y-4">
                        {results.complianceChecklist.map(item => (
                            <li key={item.id} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${item.compliant ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {item.compliant ? '✓' : '✗'}
                                </div>
                                <div>
                                    <p className="font-semibold">{item.item}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.details}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                );
            case 'clientScope':
                return (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <ul className="list-disc pl-5 space-y-2">
                            {clientScopeItems.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                );
            case 'abbreviations':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Term</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Definition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.abbreviations.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium font-mono text-slate-800 dark:text-slate-200">{item.term}</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">{item.definition}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default: return null;
        }
    };
    
    const tabTitles: Record<Tab, string> = {
        summary: 'Report Summary',
        calculations: 'Design Calculations',
        pfd: 'Process & Instrumentation Diagram',
        bom: 'Bill of Materials',
        compliance: 'Compliance Checklist',
        clientScope: 'Client Scope / Exclusions',
        abbreviations: 'Abbreviations & Acronyms',
    };
    
    const reportTitle = `${projectData.projectType} ${projectData.flowRate} KLD (${projectData.flowRate} m³/day)`;

    return (
        <div>
            <h3 className="text-xl font-semibold mb-2 text-center">Step 3: Design Results</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Here is the preliminary design generated by the AI assistant.</p>
            
            <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>Summary</TabButton>
                    <TabButton active={activeTab === 'pfd'} onClick={() => setActiveTab('pfd')}>P&amp;ID</TabButton>
                    <TabButton active={activeTab === 'calculations'} onClick={() => setActiveTab('calculations')}>Calculations</TabButton>
                    <TabButton active={activeTab === 'bom'} onClick={() => setActiveTab('bom')}>BOM</TabButton>
                    <TabButton active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')}>Compliance</TabButton>
                    <TabButton active={activeTab === 'clientScope'} onClick={() => setActiveTab('clientScope')}>Client Scope</TabButton>
                    <TabButton active={activeTab === 'abbreviations'} onClick={() => setActiveTab('abbreviations')}>Abbreviations</TabButton>
                </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg min-h-[300px]">
                 <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{tabTitles[activeTab]}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{reportTitle}</p>
                </div>
                {renderTabContent()}
            </div>

            <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                    onClick={onReset}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Start a New Design
                </button>
                <div className="relative" ref={downloadMenuRef}>
                    <button
                        onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                        disabled={isDownloading}
                        className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span>{isDownloading ? 'Preparing...' : 'Download Report'}</span>
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                    {isDownloadMenuOpen && (
                        <div className="origin-top-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownloadHtml(); }}
                                    className="text-slate-700 dark:text-slate-300 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Download as HTML
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownloadDocx(); }}
                                    className="text-slate-700 dark:text-slate-300 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Download as DOC
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownloadRtf(); }}
                                    className="text-slate-700 dark:text-slate-300 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Download as RTF
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3_Results;