import React, { useState, useEffect } from 'react';
import { DocumentData, BlockLabel } from '../../types';
import ImageViewer from './ImageViewer';
import TextEditor from './TextEditor';
import { reconstructCleanText, generateMarkdown, generateHTML, generateEPUB } from '../../utils/reconstruction';
import { DownloadIcon, CheckCircleIcon } from '../Icons';

interface EditorViewProps {
  doc: DocumentData;
  onBack: () => void;
  onSave: (docId: string, newText: string) => void;
}

const EditorView: React.FC<EditorViewProps> = ({ doc, onBack, onSave }) => {
  const [activePage, setActivePage] = useState(0);
  const [cleanText, setCleanText] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  
  // State for block filters
  const [selectedLabels, setSelectedLabels] = useState<BlockLabel[]>([BlockLabel.TITLE, BlockLabel.MAIN_TEXT]);

  // Initialize text on load
  useEffect(() => {
    // If we have previously saved text from the server, use it.
    // Otherwise, reconstruct from blocks using default filters.
    if (doc.savedText) {
      setCleanText(doc.savedText);
    } else {
      const initialText = reconstructCleanText(doc.pages, selectedLabels);
      setCleanText(initialText);
    }
    // We only want to run this init logic once when doc changes, 
    // we don't depend on selectedLabels here because that's for manual updates later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const handleTextChange = (newText: string) => {
    setCleanText(newText);
    setIsSaved(false);
  };

  const toggleLabel = (label: BlockLabel) => {
    setSelectedLabels(prev => {
      const newLabels = prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label];
      
      // Trigger reconstruction immediately using the new labels
      // Note: This will overwrite manual edits if they haven't been saved/exported.
      const newText = reconstructCleanText(doc.pages, newLabels);
      setCleanText(newText);
      setIsSaved(false); // Mark as unsaved
      
      return newLabels;
    });
  };

  const handleSave = () => {
    onSave(doc.id, cleanText);
    setIsSaved(true);
  };

  const handleDownload = async (format: 'md' | 'txt' | 'html' | 'epub') => {
    let blob: Blob;
    let extension = format;

    if (format === 'html') {
      blob = generateHTML(cleanText, doc.name);
    } else if (format === 'epub') {
      blob = await generateEPUB(cleanText, doc.name);
      extension = 'epub';
    } else {
      blob = generateMarkdown(cleanText);
    }
    
    const url = URL.createObjectURL(blob);
    // document.createElement now correctly refers to the global DOM document
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\.[^/.]+$/, "")}_clean.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const availableLabels = [
    BlockLabel.TITLE, 
    BlockLabel.MAIN_TEXT, 
    BlockLabel.HEADER, 
    BlockLabel.FOOTER, 
    BlockLabel.FOOTNOTE, 
    BlockLabel.CAPTION
  ];

  const filterControls = (
    <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap pl-2 border-l border-slate-200 dark:border-slate-700">Include:</span>
      {availableLabels.map(label => (
        <label key={label} className="flex items-center space-x-1 cursor-pointer group select-none">
          <input 
            type="checkbox" 
            checked={selectedLabels.includes(label)}
            onChange={() => toggleLabel(label)}
            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500 bg-white dark:bg-slate-700"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 capitalize">
            {label.toLowerCase().replace('_', ' ')}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-10 shrink-0 transition-colors">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            &larr; Back
          </button>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white truncate max-w-xs" title={doc.name}>
            {doc.name}
          </h1>
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-300">
            {doc.pages.length} Pages
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              isSaved 
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
              : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaved ? <><CheckCircleIcon className="w-4 h-4 mr-1"/> Saved</> : 'Save Changes'}
          </button>
          
          <div className="relative group">
            <button className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 flex items-center">
              <DownloadIcon className="w-4 h-4 mr-2" /> Export
            </button>
            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
               <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <button onClick={() => handleDownload('md')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">Markdown (.md)</button>
                <button onClick={() => handleDownload('epub')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">EPUB (.epub)</button>
                <button onClick={() => handleDownload('html')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">HTML (.html)</button>
                <button onClick={() => handleDownload('txt')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">Plain Text (.txt)</button>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image Viewer */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div className="flex-1 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
            {doc.pages[activePage] && (
              <ImageViewer page={doc.pages[activePage]} />
            )}
          </div>
          {/* Pagination */}
          <div className="h-14 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-4 shrink-0 transition-colors">
            <button 
              disabled={activePage === 0}
              onClick={() => setActivePage(p => p - 1)}
              className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-50 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Page {activePage + 1} of {doc.pages.length}
            </span>
            <button 
              disabled={activePage === doc.pages.length - 1}
              onClick={() => setActivePage(p => p + 1)}
              className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-50 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right: Text Editor */}
        <div className="w-1/2 h-full">
          <TextEditor 
            text={cleanText} 
            onChange={handleTextChange} 
            headerControls={filterControls}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorView;