import React, { useCallback, useState } from 'react';
import { UploadCloudIcon, FileIcon } from './Icons';
import { ProcessingOptions } from '../types';

interface UploadViewProps {
  onFileSelect: (files: FileList, options: ProcessingOptions) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ProcessingOptions['model']>('gemini-2.5-flash');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files, { model: selectedModel });
    }
  }, [onFileSelect, selectedModel]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files, { model: selectedModel });
    }
  }, [onFileSelect, selectedModel]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 transition-colors duration-200">
      <div className="w-full max-w-2xl text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">Convert Documents to Clean Text</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Upload PDFs or Images. Our AI extracts main content, ignoring headers, footers, and footnotes automatically.
        </p>
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 transition-colors">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select AI Model</label>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as any)}
          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced)</option>
          <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite (Faster)</option>
        </select>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-xl p-12 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center space-y-4 bg-white dark:bg-slate-800
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
        />
        <div className="p-4 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full transition-colors">
          <UploadCloudIcon className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            PDF, JPG, PNG (Max 10MB)
          </p>
        </div>
        <label
          htmlFor="file-upload"
          className="mt-4 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
        >
          Select File
        </label>
      </div>
    </div>
  );
};

export default UploadView;