import React, { useRef, useState } from 'react'
import { useScenario } from '../hooks/useScenario'
import ScenarioList from '../components/scenario/ScenarioList'
import ScenarioChat from '../components/scenario/ScenarioChat'

const pageStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sc-fade  { animation: fadeIn  0.3s ease-out both; }
  .sc-slide { animation: slideUp 0.35s ease-out both; }
`

// ── Processing panel ──────────────────────────────────────────────────────────
const GEN_STEPS = [
  { label: 'Uploading',            done: true  },
  { label: 'Extracting text',      done: true  },
  { label: 'Identifying clauses',  done: true  },
  { label: 'Generating scenarios', done: false },
  { label: 'Ready',                done: false },
]

function GeneratingPanel() {
  return React.createElement('div', {
    className: 'sc-fade',
    style: {
      background: '#1e2030', borderRadius: 14,
      padding: '16px 20px', minWidth: 200,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      flexShrink: 0,
    }
  },
    React.createElement('p', {
      style: {
        fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
        color: '#6b7280', textTransform: 'uppercase', marginBottom: 12, marginTop: 0,
      }
    }, 'Analyzing'),

    GEN_STEPS.map((step, i) =>
      React.createElement('div', {
        key: step.label,
        style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }
      },
        React.createElement('div', {
          style: {
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: step.done ? '#22c55e' : i === 3 ? '#f97316' : '#2d3148',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }
        },
          step.done
            ? React.createElement('svg', { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none' },
                React.createElement('path', {
                  d: 'M2 5L4 7.5L8 2.5',
                  stroke: 'white', strokeWidth: '1.6',
                  strokeLinecap: 'round', strokeLinejoin: 'round',
                })
              )
            : i === 3
              ? React.createElement('span', {
                  style: {
                    width: 8, height: 8,
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'block',
                    animation: 'spin 0.8s linear infinite',
                  }
                })
              : React.createElement('span', {
                  style: { fontSize: 8, color: '#4a5570', fontWeight: 700 }
                }, i + 1)
        ),
        React.createElement('span', {
          style: {
            fontSize: 12.5,
            color: step.done ? '#4ade80' : i === 3 ? '#fff' : '#4a5570',
            fontWeight: i === 3 ? 600 : 400,
          }
        }, step.label)
      )
    )
  )
}

// ── File input row ────────────────────────────────────────────────────────────
function FileRow({ file, onChange }) {
  const ref = useRef()

  return React.createElement('div', null,
    React.createElement('label', {
      style: {
        display: 'block', fontSize: 13.5, fontWeight: 500,
        color: '#2a2a2a', marginBottom: 8,
      }
    },
      'Contract File ',
      React.createElement('span', {
        style: { fontWeight: 400, color: '#9ca3af' }
      }, '(PDF or Image)')
    ),
    React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: 10,
        border: `1.5px solid ${file ? '#86efac' : '#e5e7eb'}`,
        borderRadius: 10, padding: '5px',
        background: file ? '#f0fdf4' : '#fff',
        transition: 'all 0.15s',
      }
    },
      React.createElement('button', {
        type: 'button',
        onClick: () => ref.current.click(),
        style: {
          background: '#111827', color: '#fff', border: 'none',
          borderRadius: 7, padding: '8px 18px', fontSize: 13,
          fontWeight: 500, cursor: 'pointer', flexShrink: 0,
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
        }
      },
        React.createElement('svg', { width: 13, height: 13, viewBox: '0 0 14 14', fill: 'none' },
          React.createElement('path', {
            d: 'M2 10V11.5C2 12.05 2.45 12.5 3 12.5H11C11.55 12.5 12 12.05 12 11.5V10',
            stroke: 'white', strokeWidth: '1.4', strokeLinecap: 'round',
          }),
          React.createElement('path', {
            d: 'M7 1.5V9M7 1.5L4.5 4M7 1.5L9.5 4',
            stroke: 'white', strokeWidth: '1.4', strokeLinecap: 'round', strokeLinejoin: 'round',
          })
        ),
        file ? 'Change File' : 'Choose File'
      ),
      React.createElement('input', {
        ref,
        type: 'file',
        accept: '.pdf,.jpg,.jpeg,.png,.tiff,.bmp,.webp',
        style: { display: 'none' },
        onChange: e => onChange(e.target.files[0] || null),
      }),
      React.createElement('span', {
        style: {
          flex: 1, fontSize: 13, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 4,
          color: file ? '#15803d' : '#9ca3af',
          fontWeight: file ? 500 : 400,
        }
      },
        file
          ? React.createElement('span', {
              style: { display: 'flex', alignItems: 'center', gap: 6 }
            },
              React.createElement('svg', { width: 13, height: 13, viewBox: '0 0 13 13', fill: 'none' },
                React.createElement('circle', { cx: 6.5, cy: 6.5, r: 5.5, stroke: '#22c55e', strokeWidth: 1.4 }),
                React.createElement('path', {
                  d: 'M3.5 6.5L5.5 8.5L9.5 4.5',
                  stroke: '#22c55e', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
                })
              ),
              file.name
            )
          : 'No file chosen — PDF, JPG, PNG accepted'
      ),
      file && React.createElement('button', {
        type: 'button',
        onClick: () => onChange(null),
        style: {
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 10px', color: '#9ca3af', fontSize: 18, lineHeight: 1,
        }
      }, '\u00d7')
    )
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, className }) {
  return React.createElement('div', {
    className,
    style: {
      background: '#fff', borderRadius: 18,
      border: '1.5px solid #e9e9e4',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      padding: '24px 26px', marginBottom: 16,
    }
  }, children)
}

// ── Main ScenarioPage ─────────────────────────────────────────────────────────
export default function ScenarioPage() {
  const {
    file, setFile,
    loading, qaLoading,
    scenarios, error,
    chatHistory,
    generate, ask,
    hasScenarios,
  } = useScenario()

  const [activeIdx, setActiveIdx] = useState(null)

  const handleSelectScenario = (text, idx) => {
    setActiveIdx(idx)
    ask(text)
  }

  const handleManualAsk = (q) => {
    setActiveIdx(null)
    ask(q)
  }

  const canGenerate = !!file && !loading

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#f5f5f0',
      padding: '32px 24px',
      maxWidth: 760,
      margin: '0 auto',
      fontFamily: 'DM Sans, sans-serif',
    }
  },
    // Inject styles
    React.createElement('style', null, pageStyles),

    // Page header
    React.createElement('div', { style: { marginBottom: 28 } },
      React.createElement('div', {
        style: {
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#ede9fe', borderRadius: 20,
          padding: '4px 12px', marginBottom: 12,
        }
      },
        React.createElement('span', { style: { fontSize: 14 } }, '\u26a1'),
        React.createElement('span', {
          style: {
            fontSize: 11, fontWeight: 600, color: '#7c3aed',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }
        }, 'If\u2013Then Scenarios')
      ),
      React.createElement('h1', {
        style: { fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' }
      }, 'Contract Scenario Explorer'),
      React.createElement('p', {
        style: { fontSize: 14, color: '#6b7280', margin: 0 }
      }, 'Understand what happens in different situations \u2014 upload your contract and explore the consequences.')
    ),

    // Upload card
    React.createElement(Card, null,
      React.createElement('h2', {
        style: { fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 5px' }
      }, 'Upload Contract'),
      React.createElement('p', {
        style: { fontSize: 13, color: '#9ca3af', margin: '0 0 18px' }
      }, 'Upload a PDF or image \u2014 the AI will automatically generate If-Then scenarios.'),
      React.createElement('div', {
        style: { borderTop: '1px solid #f3f4f6', paddingTop: 18 }
      },
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'flex-start', gap: 16 }
        },
          React.createElement('div', { style: { flex: 1 } },
            React.createElement(FileRow, { file, onChange: setFile }),

            error && React.createElement('div', {
              className: 'sc-fade',
              style: {
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: '11px 14px',
                fontSize: 13, color: '#dc2626',
                display: 'flex', gap: 8, marginTop: 12,
              }
            },
              React.createElement('span', null, '\u26a0'),
              React.createElement('span', null, error)
            ),

            React.createElement('button', {
              onClick: generate,
              disabled: !canGenerate,
              style: {
                marginTop: 14, width: '100%', padding: '12px 0',
                background: canGenerate ? '#6366f1' : '#f3f4f6',
                color: canGenerate ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: 11,
                fontSize: 14, fontWeight: 600,
                cursor: canGenerate ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }
            },
              loading
                ? React.createElement(React.Fragment, null,
                    React.createElement('span', {
                      style: {
                        width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%', display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }
                    }),
                    'Analyzing contract...'
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement('span', null, '\u26a1'),
                    'Generate Scenarios'
                  )
            )
          ),
          loading && React.createElement(GeneratingPanel)
        )
      )
    ),

    // Scenarios list card
    hasScenarios && React.createElement(Card, { className: 'sc-slide' },
      React.createElement('h2', {
        style: { fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }
      }, 'Generated Scenarios'),
      React.createElement('p', {
        style: { fontSize: 13, color: '#9ca3af', margin: '0 0 18px' }
      }, 'Click any scenario to get a detailed answer from the AI'),
      React.createElement('div', { style: { borderTop: '1px solid #f3f4f6', paddingTop: 18 } },
        React.createElement(ScenarioList, {
          scenarios,
          onSelect: handleSelectScenario,
          activeIdx,
        })
      )
    ),

    // Chat Q&A
    React.createElement(ScenarioChat, {
      chatHistory,
      onAsk: handleManualAsk,
      loading: qaLoading,
      disabled: !hasScenarios,
    })
  )
}