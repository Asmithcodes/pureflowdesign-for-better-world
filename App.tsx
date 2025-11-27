import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProjectData, DesignResults, ProjectType, EffluentType, AttachedFile } from './types';
import Header from './components/Header';
import ProjectSetupWizard from './components/ProjectSetupWizard';
import Step1_ProjectType from './components/Step1_ProjectType';
import Step2_Parameters from './components/Step2_Parameters';
import Step3_Results from './components/Step3_Results';
import { generateDesign, analyzeInstructionsForParameters, regeneratePfd } from './services/geminiService';
import ManualsModal from './components/ManualsModal';
import SandClockIcon from './components/icons/SandClockIcon';
import MagnifyingGlassIcon from './components/icons/MagnifyingGlassIcon';

type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
    const [step, setStep] = useState(1);
    const [projectData, setProjectData] = useState<ProjectData>({
        projectType: ProjectType.STP,
        technology: undefined,
        location: 'Telangana',
        flowRate: 100,
        inputBOD: 250,
        inputCOD: 500,
        outputBOD: 10,
        outputCOD: 50,
        effluentTypes: [],
        specialInstructionsText: '',
        specialInstructionsFiles: [],
        fromAddress: '',
        toAddress: '',
        estimatedPrice: undefined,
    });
    const [results, setResults] = useState<DesignResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRegeneratingPfd, setIsRegeneratingPfd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isManualsOpen, setIsManualsOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem('theme') as Theme) || 'system'
    );
    const [elapsedTime, setElapsedTime] = useState(0);
    const [aiAdjustedParams, setAiAdjustedParams] = useState<Set<string>>(new Set());
    const [aiInstructionSummary, setAiInstructionSummary] = useState('');
    const timerIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        if (isLoading) {
            timerIntervalRef.current = window.setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isLoading]);


    const handleNext = useCallback(() => setStep(prev => prev + 1), []);
    const handleBack = useCallback(() => setStep(prev => prev - 1), []);

    const handleDataChange = useCallback((data: Partial<ProjectData>) => {
        setProjectData(prev => ({ ...prev, ...data }));
    }, []);

    const handleNextFromStep1 = useCallback(async () => {
        const hasSpecialInstructions =
            projectData.specialInstructionsText?.trim() ||
            (projectData.specialInstructionsFiles && projectData.specialInstructionsFiles.length > 0) ||
            projectData.specialInstructionsAudio;

        if (hasSpecialInstructions) {
            setIsAnalyzing(true);
            setError(null);
            try {
                const { parameters: suggestedParams, summary } = await analyzeInstructionsForParameters(projectData);
                const cleanedParams: Partial<ProjectData> = {};
                for (const key in suggestedParams) {
                    if (suggestedParams[key as keyof ProjectData] != null) {
                        // FIX: Correctly handle dynamic property assignment to prevent a TypeScript error.
                        // When assigning to an object property using a dynamic key (of a union type), TypeScript
                        // requires the value to be assignable to an intersection of all possible property types,
                        // which often resolves to 'never'. Casting the target object to 'any' for the assignment
                        // is a standard workaround for this limitation.
                        (cleanedParams as any)[key] = suggestedParams[key as keyof ProjectData];
                    }
                }
                setAiAdjustedParams(new Set(Object.keys(cleanedParams)));
                setProjectData(prev => ({...prev, ...cleanedParams}));
                setAiInstructionSummary(summary);
            } catch (e) {
                console.error("Failed to analyze instructions:", e);
                setError("Could not automatically extract parameters from your instructions. Please review and enter them manually.");
            } finally {
                setIsAnalyzing(false);
            }
        } else {
             setAiAdjustedParams(new Set());
             setAiInstructionSummary('');
        }
        handleNext();
    }, [projectData, handleNext]);

    const handleDesignGeneration = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setElapsedTime(0);
        try {
            // FIX: Create a final project data object for generation. It now correctly
            // includes the original files and audio, using the potentially user-edited summary
            // as the definitive text instruction. This ensures the AI has full context
            // (e.g., from images) to generate the P&ID.
            const finalProjectData = {
                ...projectData,
                specialInstructionsText: aiInstructionSummary,
            };
            const design = await generateDesign(finalProjectData);
            setResults(design);
            handleNext();
        } catch (e) {
            setError('Failed to generate design. Please check your inputs and try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [projectData, handleNext, aiInstructionSummary]);

    const handleRegeneratePfd = useCallback(async () => {
        if (!results) return;
        setIsRegeneratingPfd(true);
        setError(null);
        try {
            const finalProjectData = {
                ...projectData,
                specialInstructionsText: aiInstructionSummary,
            };
            const newPfdData = await regeneratePfd(finalProjectData);
            setResults(prevResults => {
                if (!prevResults) return null;
                return {
                    ...prevResults,
                    processFlowDiagram: {
                        svgContent: newPfdData.svgContent
                    }
                };
            });
        } catch (e) {
            setError('Failed to regenerate P&ID. Please try again.');
            console.error(e);
        } finally {
            setIsRegeneratingPfd(false);
        }
    }, [results, projectData, aiInstructionSummary]);


    const handleReset = useCallback(() => {
        setStep(1);
        setProjectData({
            projectType: ProjectType.STP,
            technology: undefined,
            location: 'Telangana',
            flowRate: 100,
            inputBOD: 250,
            inputCOD: 500,
            outputBOD: 10,
            outputCOD: 50,
            effluentTypes: [],
            specialInstructionsText: '',
            specialInstructionsFiles: [],
            specialInstructionsAudio: undefined,
            fromAddress: '',
            toAddress: '',
            estimatedPrice: undefined,
        });
        setResults(null);
        setError(null);
        setAiAdjustedParams(new Set());
        setAiInstructionSummary('');
    }, []);

    const renderWizard = () => {
        const renderStepContent = () => {
            if (isAnalyzing) {
                return (
                   <div className="flex flex-col items-center justify-center h-64">
                       <MagnifyingGlassIcon className="w-12 h-12 text-blue-600 animate-pulse" />
                       <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Analyzing Instructions...</p>
                       <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">Extracting key parameters and summarizing your requirements.</p>
                   </div>
               )
           }

            if (isLoading && step === 2) {
                 return (
                    <div className="flex flex-col items-center justify-center h-64">
                        <SandClockIcon className="w-12 h-12 text-blue-600 animate-pulse" />
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Generating your plant design...</p>
                        <p className="mt-2 text-3xl font-mono text-slate-700 dark:text-slate-300">{elapsedTime}s</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">Engaging Thinking Mode for enhanced accuracy.</p>
                    </div>
                )
            }

            switch (step) {
                case 1:
                    return <Step1_ProjectType data={projectData} onDataChange={handleDataChange} onNext={handleNextFromStep1} />;
                case 2:
                    return <Step2_Parameters 
                                data={projectData} 
                                onDataChange={handleDataChange} 
                                onBack={handleBack} 
                                onGenerate={handleDesignGeneration} 
                                isLoading={isLoading} 
                                aiAdjustedParams={aiAdjustedParams}
                                aiInstructionSummary={aiInstructionSummary}
                                onSummaryChange={setAiInstructionSummary}
                            />;
                case 3:
                    return results ? <Step3_Results 
                                        results={results} 
                                        onReset={handleReset} 
                                        projectData={projectData} 
                                        onRegeneratePfd={handleRegeneratePfd}
                                        isRegeneratingPfd={isRegeneratingPfd}
                                    /> : <div className="text-center p-8 text-red-500">No results to display. Please start over.</div>;
                default:
                    return <Step1_ProjectType data={projectData} onDataChange={handleDataChange} onNext={handleNextFromStep1} />;
            }
        };

        const currentStepForProgressBar = isAnalyzing ? 1 : step;

        return (
             <ProjectSetupWizard currentStep={currentStepForProgressBar} totalSteps={3}>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}
                {renderStepContent()}
            </ProjectSetupWizard>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <Header 
                onShowManuals={() => setIsManualsOpen(true)}
                theme={theme}
                setTheme={setTheme}
            />
            <main className="container mx-auto px-4 py-8">
               {renderWizard()}
            </main>
            <ManualsModal isOpen={isManualsOpen} onClose={() => setIsManualsOpen(false)} />
        </div>
    );
};

export default App;
