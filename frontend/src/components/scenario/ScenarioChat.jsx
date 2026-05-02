import React, { useState, useRef, useEffect } from 'react';

function ChatBubble({ item }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Question (right) */}
      <div className="flex justify-end">
        <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] shadow-sm">
          {item.question}
        </div>
      </div>
      
      {/* Answer (left) */}
      <div className="flex justify-start">
        {item.loading ? (
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></span>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] leading-relaxed ${
              item.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-900 border border-blue-100'
            }`}
          >
            {item.answer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScenarioChat({ chatHistory, onAsk, loading, disabled }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSubmit = () => {
    if (!input.trim() || loading || disabled) return;
    onAsk(input.trim());
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const canSend = input.trim() && !loading && !disabled;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
        <span className="text-xl">💬</span>
        <div>
          <h3 className="font-bold text-gray-900 m-0">Ask a What-If Question</h3>
          <p className="text-xs text-gray-500 m-0">Ask anything about your contract scenarios</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="p-6 flex-1 max-h-[400px] overflow-y-auto">
        {chatHistory.length === 0 && !disabled && (
          <p className="text-sm text-gray-400 text-center py-8">
            Click a scenario above or type your own question below.
          </p>
        )}

        {disabled && (
          <p className="text-sm text-gray-400 text-center py-8">
            Generate scenarios first to enable Q&A.
          </p>
        )}

        {chatHistory.map((item, i) => (
          <ChatBubble key={i} item={item} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Row */}
      <div className="px-4 py-4 border-t border-gray-100 flex gap-3 items-center bg-gray-50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder={disabled ? 'Upload a contract first...' : 'Ask a what-if question...'}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${
            canSend
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
