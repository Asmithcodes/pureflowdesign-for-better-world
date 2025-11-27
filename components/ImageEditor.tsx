import React, { useState, useCallback, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import Loader from './Loader';
import PhotoIcon from './icons/PhotoIcon';
import SparklesIcon from './icons/SparklesIcon';

const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ file: File, url: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setOriginalImage({ file, url: URL.createObjectURL(file) });
                setEditedImage(null);
                setError(null);
            } else {
                setError('Please upload a valid image file (PNG, JPG, etc.).');
            }
        }
    };

    const handleDragEvents = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt) {
            setError('Please upload an image and enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        try {
            const base64Data = await fileToBase64(originalImage.file);
            const resultBase64 = await editImage(base64Data, originalImage.file.type, prompt);
            setEditedImage(`data:${originalImage.file.type};base64,${resultBase64}`);
        } catch (e) {
            setError('Failed to edit image. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">AI Image Editor</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Edit images with the power of a simple text prompt.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
                
                {!originalImage && (
                     <div
                        onDragEnter={handleDragEvents}
                        onDragLeave={handleDragEvents}
                        onDragOver={handleDragEvents}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
                        }`}
                    >
                        <PhotoIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">Drag & drop an image here</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">or click to select a file</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files)}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                )}
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                {originalImage && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <h3 className="font-semibold text-lg">Original Image</h3>
                             <img src={originalImage.url} alt="Original" className="rounded-lg shadow-md w-full h-auto aspect-square object-cover" />
                             <button onClick={() => setOriginalImage(null)} className="text-sm text-blue-600 hover:underline w-full text-center mt-2">Change Image</button>
                        </div>
                        <div className="space-y-2">
                             <h3 className="font-semibold text-lg">Edited Image</h3>
                             <div className="rounded-lg shadow-md w-full h-auto aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                {isLoading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader />
                                        <p className="mt-2 text-sm text-slate-500">Generating...</p>
                                    </div>
                                ) : editedImage ? (
                                    <img src={editedImage} alt="Edited" className="rounded-lg w-full h-full object-cover" />
                                ) : (
                                    <p className="text-slate-500">Your edited image will appear here</p>
                                )}
                             </div>
                        </div>
                    </div>
                )}


                {originalImage && (
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <label htmlFor="prompt" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Describe your edit
                        </label>
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <input
                                id="prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., Add a retro filter, remove the person in the background"
                                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt}
                                className="w-full sm:w-auto bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span>{isLoading ? 'Applying...' : 'Apply Edit'}</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ImageEditor;
