import React from 'react';
import ScenarioItem from './ScenarioItem';

export default function ScenarioList({ scenarios, onSelect, activeIdx }) {
  if (!scenarios || !scenarios.length) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        {scenarios.length} scenarios generated — click any to get the answer
      </p>
      <div className="space-y-3">
        {scenarios.map((s, i) => (
          <ScenarioItem
            key={i}
            text={s}
            active={activeIdx === i}
            onClick={() => onSelect(s, i)}
          />
        ))}
      </div>
    </div>
  );
}
