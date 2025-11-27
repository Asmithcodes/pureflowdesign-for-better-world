import React from 'react';
import { ProjectData, ProjectType, EffluentType } from '../types';
import { PARAMETER_DETAILS, EFFLUENT_TYPES } from '../constants';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import SpannerIcon from './icons/SpannerIcon';
import Card from './Card';
import SparklesIcon from './icons/SparklesIcon';

interface Step2Props {
    data: ProjectData;
    onDataChange: (data: Partial<ProjectData>) => void;
    onBack: () => void;
    onGenerate: () => void;
    isLoading: boolean;
    aiAdjustedParams?: Set<string>;
    aiInstructionSummary: string;
    onSummaryChange: (newSummary: string) => void;
}

const ParameterInput: React.FC<{
    label: string;
    unit: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isAiAdjusted?: boolean;
}> = ({ label, unit, value, min, max, step, onChange, isAiAdjusted }) => (
    <div>
        <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
            <span>{label}</span>
            {isAiAdjusted && (
                <span className="ml-2 group relative">
                    <SparklesIcon className="w-4 h-4 text-blue-500" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Auto-adjusted by AI from your instructions. You can still change it.
                    </span>
                </span>
            )}
        </label>
        <div className="flex items-center space-x-3">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <input
                type="number"
                value={value}
                onChange={onChange}
                className="w-28 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-2 text-center"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400 w-24 text-right">{unit}</span>
        </div>
    </div>
);


const Step2_Parameters: React.FC<Step2Props> = ({ data, onDataChange, onBack, onGenerate, isLoading, aiAdjustedParams, aiInstructionSummary, onSummaryChange }) => {
    const params = PARAMETER_DETAILS[data.projectType];

    const handleChange = (paramName: keyof ProjectData, value: string) => {
        onDataChange({ [paramName]: Number(value) });
    };

    const handleEffluentTypeChange = (effluentType: EffluentType) => {
        const currentTypes = data.effluentTypes || [];
        const newTypes = currentTypes.includes(effluentType)
            ? currentTypes.filter(et => et !== effluentType)
            : [...currentTypes, effluentType];
        onDataChange({ effluentTypes: newTypes });
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Step 2: Input Parameters</h3>
            
            {aiInstructionSummary && (
                <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <label htmlFor="ai-summary" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                        AI's Understanding of Your Instructions
                    </label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Based on your provided notes, files, and recordings, this is what the AI understood. Please review and edit if necessary before generating the design.
                    </p>
                    <textarea
                        id="ai-summary"
                        value={aiInstructionSummary}
                        onChange={(e) => onSummaryChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-500 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] text-sm"
                        aria-label="AI-generated summary of your special instructions"
                    />
                </div>
            )}

            <div className="space-y-6">
                {params.map(p => (
                    <ParameterInput
                        key={p.name}
                        label={p.label}
                        unit={p.unit}
                        value={data[p.name as keyof ProjectData] as number}
                        min={p.min}
                        max={p.max}
                        step={p.step}
                        onChange={(e) => handleChange(p.name as keyof ProjectData, e.target.value)}
                        isAiAdjusted={aiAdjustedParams?.has(p.name)}
                    />
                ))}

                {(data.projectType === ProjectType.ETP || data.projectType === ProjectType.CETP) && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Key Pollutants to Treat (Optional)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                            {EFFLUENT_TYPES.map(et => (
                                <Card
                                    key={et.id}
                                    isSelected={(data.effluentTypes || []).includes(et.id)}
                                    onClick={() => handleEffluentTypeChange(et.id)}
                                >
                                    <span className="font-semibold text-sm">{et.name}</span>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SpannerIcon className="w-5 h-5" />
                    <span>{isLoading ? 'Generating...' : 'Generate Design'}</span>
                </button>
            </div>
        </div>
    );
};

export default Step2_Parameters;