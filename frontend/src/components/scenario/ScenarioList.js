import React from 'react'
import ScenarioItem from './ScenarioItem'

export default function ScenarioList({ scenarios, onSelect, activeIdx }) {
  if (!scenarios.length) return null

  return React.createElement('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 10 }
  },
    React.createElement('p', {
      style: {
        fontSize: 11, fontWeight: 600, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.09em',
        marginBottom: 4, marginTop: 0,
      }
    }, scenarios.length + ' scenarios generated \u2014 click any to get the answer'),

    scenarios.map((s, i) =>
      React.createElement(ScenarioItem, {
        key: i,
        index: i,
        text: s,
        active: activeIdx === i,
        onClick: () => onSelect(s, i),
      })
    )
  )
}