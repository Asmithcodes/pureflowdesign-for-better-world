import React, { useState, useRef, useCallback } from 'react';
import { ProjectData, AttachedFile, ProjectType } from '../types';
import { PROJECT_TYPES, LOCATIONS, TECHNOLOGIES } from '../constants';
import Card from './Card';
import ChevronRightIcon from './icons/ChevronRightIcon';
import PaperClipIcon from './icons/PaperClipIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import TrashIcon from './icons/TrashIcon';
import StopCircleIcon from './icons/StopCircleIcon';
import { fileToAttachedFile, blobToAttachedFile } from '../utils/fileUtils';

interface Step1Props {
    data: ProjectData;
    onDataChange: (data: Partial<ProjectData>) => void;
    onNext: () => void;
}

const Step1_ProjectType: React.FC<Step1Props> = ({ data, onDataChange, onNext }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [recorderError, setRecorderError] = useState<string | null>(null);
    const [isProposal, setIsProposal] = useState(
        !!(data.fromAddress || data.toAddress || data.estimatedPrice)
    );

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        try {
            // FIX: Replaced `Array.from(files).map(...)` with a `for...of` loop.
            // This is a more robust way to iterate over a FileList and avoids potential
            // TypeScript type inference issues where `file` could be inferred as `unknown`,
            // leading to the "Argument of type 'unknown' is not assignable to parameter of type 'File'" error.
            const filePromises: Promise<AttachedFile>[] = [];
            for (const file of files) {
                filePromises.push(fileToAttachedFile(file));
            }
            const newFiles = await Promise.all(filePromises);
            onDataChange({ specialInstructionsFiles: [...(data.specialInstructionsFiles || []), ...newFiles] });
        } catch (error) {
            console.error("Error reading files:", error);
            // Optionally, show an error to the user
        }
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = [...(data.specialInstructionsFiles || [])];
        updatedFiles.splice(index, 1);
        onDataChange({ specialInstructionsFiles: updatedFiles });
    };

    const handleStartRecording = async () => {
        setRecorderError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setIsRecording(true);
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioURL(audioUrl);
                    try {
                        const audioFile = await blobToAttachedFile(audioBlob, `voice-instruction-${Date.now()}.webm`, mimeType);
                        onDataChange({ specialInstructionsAudio: audioFile });
                    } catch (error) {
                        console.error("Error processing audio file:", error);
                        setRecorderError("Could not process audio recording.");
                    }
                };
                mediaRecorderRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setRecorderError("Microphone access denied. Please enable it in your browser settings.");
            }
        } else {
            setRecorderError("Audio recording is not supported by your browser.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // Stop all media tracks to turn off the recording indicator
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleDeleteAudio = () => {
        setAudioURL(null);
        onDataChange({ specialInstructionsAudio: undefined });
    };
    
    const handleProposalToggle = (checked: boolean) => {
        setIsProposal(checked);
        if (!checked) {
            onDataChange({
                fromAddress: '',
                toAddress: '',
                estimatedPrice: undefined,
            });
        }
    };

    // Determine capacity label and unit based on project type
    const isWaterProject = data.projectType !== ProjectType.SWM && data.projectType !== ProjectType.WTE;
    const capacityLabel = isWaterProject ? "Plant Capacity (KLD)" : "Plant Capacity (TPD)";

    return (
        <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Step 1: Project Setup</h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Select Project Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PROJECT_TYPES.map(pt => (
                            <Card 
                                key={pt.id}
                                isSelected={data.projectType === pt.id}
                                onClick={() => onDataChange({ projectType: pt.id, technology: undefined })}
                            >
                                <span className="font-semibold">{pt.name}</span>
                            </Card>
                        ))}
                    </div>
                </div>

                {data.projectType && (
                     <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Select Technology</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {TECHNOLOGIES[data.projectType].map(tech => (
                                 <Card
                                     key={tech.id}
                                     isSelected={data.technology === tech.id}
                                     onClick={() => onDataChange({ technology: tech.id })}
                                 >
                                     <div>
                                         <span className="font-semibold">{tech.name}</span>
                                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tech.description}</p>
                                     </div>
                                 </Card>
                             ))}
                         </div>
                     </div>
                )}

                <div>
                    <label htmlFor="location" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Select Location / Regulatory Body</label>
                    <select
                        id="location"
                        value={data.location}
                        onChange={(e) => onDataChange({ location: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {LOCATIONS.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
             <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                    <input
                        id="proposal-checkbox"
                        type="checkbox"
                        checked={isProposal}
                        onChange={(e) => handleProposalToggle(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-700"
                    />
                    <label htmlFor="proposal-checkbox" className="ml-3 block text-md font-medium text-slate-700 dark:text-slate-300">
                        Create a Proposal!!
                    </label>
                </div>
                {isProposal && (
                    <div className="mt-4 space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                            <label htmlFor="fromAddress" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">From (Your Address)</label>
                            <textarea
                                id="fromAddress"
                                value={data.fromAddress || ''}
                                onChange={(e) => onDataChange({ fromAddress: e.target.value })}
                                placeholder={"e.g., Your Company Name\n123 Engineering Rd\nHyderabad, Telangana 500081"}
                                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-sm"
                                aria-label="Your address for the report footer"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label htmlFor="toAddress" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">To (Recipient's Address)</label>
                            <textarea
                                id="toAddress"
                                value={data.toAddress || ''}
                                onChange={(e) => onDataChange({ toAddress: e.target.value })}
                                placeholder={"e.g., Client Company Name\n456 Industrial Area\nChennai, Tamil Nadu 600032"}
                                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-sm"
                                aria-label="Recipient's address for the report header"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label htmlFor="estimatedPrice" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Quotation Value</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 dark:text-slate-400 sm:text-sm">INR</span>
                                </div>
                                <input
                                    type="number"
                                    id="estimatedPrice"
                                    value={data.estimatedPrice === undefined ? '' : data.estimatedPrice}
                                    onChange={(e) => onDataChange({ estimatedPrice: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="5000000"
                                    className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 pl-12 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    aria-label="Estimated project price in Indian Rupees"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <label htmlFor="flowRate" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {capacityLabel}
                </label>
                <div className="relative">
                    <input
                        type="number"
                        id="flowRate"
                        value={data.flowRate}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                                onDataChange({ flowRate: val });
                            }
                        }}
                        className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 pr-12 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 100"
                        min="1"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                         <span className="text-slate-500 dark:text-slate-400 sm:text-sm">
                             {isWaterProject ? 'KLD' : 'TPD'}
                         </span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {isWaterProject 
                        ? "Key permeator for calculating the plant design (1 KLD = 1 m³/day)." 
                        : "Key parameter for plant design."}
                </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Special Instructions (Optional)</label>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Provide any specific requirements, constraints, or preferred technologies. You can type, attach files, or record a voice note.
                </p>
                
                <textarea
                    value={data.specialInstructionsText}
                    onChange={(e) => onDataChange({ specialInstructionsText: e.target.value })}
                    placeholder="e.g., 'Prioritize MBBR technology due to space constraints...', 'The client requires a tertiary treatment stage for water reuse.'"
                    className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                />

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-12 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center space-x-2 font-medium text-slate-700 dark:text-slate-200 transition-colors">
                            <PaperClipIcon className="w-5 h-5" />
                            <span>Attach Files</span>
                        </button>
                        <div className="mt-2 space-y-2">
                            {(data.specialInstructionsFiles || []).map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm">
                                    <span className="truncate text-slate-600 dark:text-slate-300">{file.name}</span>
                                    <button onClick={() => handleRemoveFile(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                         {!isRecording && !audioURL && (
                             <button onClick={handleStartRecording} className="w-full h-12 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center space-x-2 font-medium text-slate-700 dark:text-slate-200 transition-colors">
                                 <MicrophoneIcon className="w-5 h-5" />
                                 <span>Record Voice Note</span>
                             </button>
                         )}
                         {isRecording && (
                             <button onClick={handleStopRecording} className="w-full h-12 bg-red-500 text-white rounded-lg flex items-center justify-center space-x-2 font-medium animate-pulse">
                                 <StopCircleIcon className="w-5 h-5" />
                                 <span>Stop Recording</span>
                             </button>
                         )}
                         {audioURL && !isRecording && (
                             <div className="space-y-2">
                                 <audio src={audioURL} controls className="w-full h-9" />
                                 <button onClick={handleDeleteAudio} className="w-full text-sm text-red-600 hover:underline">Delete Recording</button>
                             </div>
                         )}
                         {recorderError && <p className="text-xs text-red-500 mt-2">{recorderError}</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={onNext}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors"
                >
                    <span>Next</span>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Step1_ProjectType;