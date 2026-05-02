import React, { useState } from 'react'

export default function ScenarioItem({ text, index, active, onClick }) {
  const [hovered, setHovered] = useState(false)

  const parts = text.includes('→') ? text.split('→') : [text]
  const ifPart   = parts[0]?.trim() || text
  const thenPart = parts[1]?.trim() || null

  return React.createElement('button', {
    onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '13px 16px',
      border: `1.5px solid ${active ? '#6366f1' : hovered ? '#d1d5db' : '#e9e9e4'}`,
      borderRadius: 12,
      background: active ? '#f5f3ff' : hovered ? '#fafaf8' : '#fff',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.15s ease',
      boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
      fontFamily: 'DM Sans, sans-serif',
    }
  },
    // Index bubble
    React.createElement('span', {
      style: {
        flexShrink: 0,
        width: 22, height: 22,
        borderRadius: '50%',
        background: active ? '#6366f1' : '#f3f4f6',
        color: active ? '#fff' : '#6b7280',
        fontSize: 11, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1, transition: 'background 0.15s',
      }
    }, index + 1),

    // Text content
    React.createElement('div', { style: { flex: 1 } },
      React.createElement('span', {
        style: {
          fontSize: 13.5, fontWeight: 500,
          color: active ? '#4338ca' : '#1f2937',
          lineHeight: 1.5, display: 'block',
        }
      }, ifPart),
      thenPart && React.createElement('span', { style: { display: 'block', marginTop: 5 } },
        React.createElement('span', {
          style: {
            display: 'inline-block',
            background: active ? '#ddd6fe' : '#f3f4f6',
            color: active ? '#4338ca' : '#374151',
            fontSize: 12, fontWeight: 500,
            padding: '2px 8px', borderRadius: 6,
          }
        }, '\u2192 ' + thenPart)
      )
    ),

    // Arrow
    React.createElement('span', {
      style: {
        flexShrink: 0,
        color: active ? '#6366f1' : '#d1d5db',
        fontSize: 18, marginTop: 1,
        transition: 'color 0.15s',
      }
    }, '\u203a')
  )
}