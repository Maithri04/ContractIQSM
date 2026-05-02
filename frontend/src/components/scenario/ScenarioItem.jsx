import React from 'react';

export default function ScenarioItem({ text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        active 
          ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
          : 'border-gray-100 bg-white hover:border-blue-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-lg mt-0.5 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
          {active ? '⚡' : '✧'}
        </span>
        <div>
          <p className={`font-semibold ${active ? 'text-blue-900' : 'text-gray-700'}`}>
            {text}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Click to see what the contract says →
          </p>
        </div>
      </div>
    </button>
  );
}
