
import React from 'react';

interface ProjectSetupWizardProps {
    currentStep: number;
    totalSteps: number;
    children: React.ReactNode;
}

const ProjectSetupWizard: React.FC<ProjectSetupWizardProps> = ({ currentStep, totalSteps, children }) => {
    const progressPercentage = ((currentStep - 1) / (totalSteps -1)) * 100;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-center text-slate-700 dark:text-slate-300">Project Design Wizard</h2>
                <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${progressPercentage}%` }}>
                    </div>
                </div>
                 <div className="flex justify-between mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>Project Type</span>
                    <span>Parameters</span>
                    <span>Results</span>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
                {children}
            </div>
        </div>
    );
};

export default ProjectSetupWizard;
