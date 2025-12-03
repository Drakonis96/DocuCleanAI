import React from 'react';

interface TextEditorProps {
  text: string;
  onChange: (newText: string) => void;
  headerControls?: React.ReactNode;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange, headerControls }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clean Transcription</span>
          {headerControls}
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">Markdown Format Support</span>
      </div>
      <textarea
        className="flex-1 w-full h-full p-8 resize-none focus:outline-none font-serif text-lg leading-relaxed text-slate-800"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
};

export default TextEditor;