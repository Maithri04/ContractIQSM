import React, { useState, useRef, useEffect } from 'react'

const styles = `
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

function ChatBubble({ item }) {
  return React.createElement('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 8 }
  },
    // Question (right)
    React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
      React.createElement('div', {
        style: {
          background: '#1f2937', color: '#f9fafb',
          borderRadius: '14px 14px 4px 14px',
          padding: '10px 14px', fontSize: 13.5,
          maxWidth: '80%', lineHeight: 1.5,
        }
      }, item.question)
    ),
    // Answer (left)
    React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-start' } },
      item.loading
        ? React.createElement('div', {
            style: {
              background: '#f3f4f6',
              borderRadius: '14px 14px 14px 4px',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 6,
            }
          },
            [0, 1, 2].map(i =>
              React.createElement('span', {
                key: i,
                style: {
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#9ca3af', display: 'inline-block',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }
              })
            )
          )
        : React.createElement('div', {
            style: {
              background: item.isError ? '#fef2f2' : '#f0f4ff',
              border: `1px solid ${item.isError ? '#fecaca' : '#e0e7ff'}`,
              color: item.isError ? '#dc2626' : '#1e3a8a',
              borderRadius: '14px 14px 14px 4px',
              padding: '12px 16px', fontSize: 13.5,
              maxWidth: '85%', lineHeight: 1.65,
            }
          }, item.answer)
    )
  )
}

export default function ScenarioChat({ chatHistory, onAsk, loading, disabled }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSubmit = () => {
    if (!input.trim() || loading || disabled) return
    onAsk(input.trim())
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const canSend = input.trim() && !loading && !disabled

  return React.createElement('div', {
    style: {
      background: '#fff',
      border: '1.5px solid #e9e9e4',
      borderRadius: 18,
      overflow: 'hidden',
    }
  },
    // Inject keyframe styles
    React.createElement('style', null, styles),

    // Header
    React.createElement('div', {
      style: {
        padding: '14px 20px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 10,
      }
    },
      React.createElement('span', { style: { fontSize: 16 } }, '\uD83D\uDCAC'),
      React.createElement('div', null,
        React.createElement('p', {
          style: { fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0 }
        }, 'Ask a What-If Question'),
        React.createElement('p', {
          style: { fontSize: 12, color: '#9ca3af', margin: 0 }
        }, 'Ask anything about your contract scenarios')
      )
    ),

    // Chat history
    React.createElement('div', {
      style: {
        padding: '16px 20px',
        minHeight: chatHistory.length ? 100 : 0,
        maxHeight: 360,
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 16,
      }
    },
      chatHistory.length === 0 && !disabled &&
        React.createElement('p', {
          style: { fontSize: 13, color: '#d1d5db', textAlign: 'center', padding: '20px 0', margin: 0 }
        }, 'Click a scenario above or type your own question below'),

      disabled &&
        React.createElement('p', {
          style: { fontSize: 13, color: '#d1d5db', textAlign: 'center', padding: '20px 0', margin: 0 }
        }, 'Generate scenarios first to enable Q&A'),

      chatHistory.map((item, i) =>
        React.createElement(ChatBubble, { key: i, item })
      ),
      React.createElement('div', { ref: bottomRef })
    ),

    // Input row
    React.createElement('div', {
      style: {
        padding: '12px 16px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex', gap: 10, alignItems: 'center',
        background: '#fafaf8',
      }
    },
      React.createElement('input', {
        value: input,
        onChange: e => setInput(e.target.value),
        onKeyDown: handleKey,
        disabled,
        placeholder: disabled ? 'Upload a contract first...' : 'Ask a what-if question...',
        style: {
          flex: 1,
          border: '1.5px solid #e5e7eb', borderRadius: 10,
          padding: '10px 14px', fontSize: 13.5,
          fontFamily: 'DM Sans, sans-serif',
          color: '#1f2937',
          background: disabled ? '#f9fafb' : '#fff',
          outline: 'none',
        }
      }),
      React.createElement('button', {
        onClick: handleSubmit,
        disabled: !canSend,
        style: {
          flexShrink: 0,
          width: 40, height: 40, borderRadius: 10,
          background: canSend ? '#1f2937' : '#f3f4f6',
          border: 'none',
          cursor: canSend ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }
      },
        loading
          ? React.createElement('span', {
              style: {
                width: 14, height: 14,
                border: '2px solid #d1d5db', borderTopColor: '#6b7280',
                borderRadius: '50%', display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }
            })
          : React.createElement('svg', {
              width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none'
            },
              React.createElement('path', {
                d: 'M14 8L2 2L5.5 8L2 14L14 8Z',
                stroke: canSend ? '#fff' : '#d1d5db',
                strokeWidth: '1.5', strokeLinejoin: 'round',
              })
            )
      )
    )
  )
}