import React, { useRef, useState } from 'react';
import { useScenario } from '../hooks/useScenario';
import ScenarioList from '../components/scenario/ScenarioList';
import ScenarioChat from '../components/scenario/ScenarioChat';

function FileRow({ file, onChange }) {
  const ref = useRef();

  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Contract File <span className="font-normal text-gray-400">(PDF or Image)</span>
      </label>
      <div className={`flex items-center gap-3 p-1.5 border-2 rounded-xl transition-all ${
        file ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
      }`}>
        <button
          type="button"
          onClick={() => ref.current.click()}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          {file ? 'Change File' : 'Choose File'}
        </button>
        <input
          ref={ref}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(e.target.files[0] || null)}
        />
        <span className={`flex-1 text-sm truncate ${file ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
          {file ? file.name : 'No file chosen — PDF, JPG, PNG accepted'}
        </span>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default function ScenarioPage() {
  const {
    file, setFile,
    loading, qaLoading,
    scenarios, error,
    chatHistory,
    generate, ask,
    hasScenarios,
  } = useScenario();

  const [activeIdx, setActiveIdx] = useState(null);

  const handleSelectScenario = (text, idx) => {
    setActiveIdx(idx);
    ask(text);
  };

  const handleManualAsk = (q) => {
    setActiveIdx(null);
    ask(q);
  };

  const canGenerate = !!file && !loading;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <span>⚡</span> If–Then Scenarios
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Understand what happens in different situations
          </h1>
          <p className="text-gray-500">
            Upload your contract and our AI will automatically extract conditional scenarios and answer them.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Analyze Contract</h2>
          <p className="text-sm text-gray-500 mb-6">Upload a PDF or image to generate scenarios.</p>
          
          <div className="space-y-4">
            <FileRow file={file} onChange={setFile} />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={!canGenerate}
              className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                canGenerate
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing contract...
                </>
              ) : (
                <>
                  <span>⚡</span> Generate Scenarios
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scenarios List */}
        {hasScenarios && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Generated Scenarios</h2>
            <p className="text-sm text-gray-500 mb-6">Click any scenario to see the AI's answer based on your contract.</p>
            
            <ScenarioList
              scenarios={scenarios}
              onSelect={handleSelectScenario}
              activeIdx={activeIdx}
            />
          </div>
        )}

        {/* Chat Section */}
        <ScenarioChat
          chatHistory={chatHistory}
          onAsk={handleManualAsk}
          loading={qaLoading}
          disabled={!hasScenarios}
        />
        
      </div>
    </div>
  );
}
