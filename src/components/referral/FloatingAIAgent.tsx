import React, { useState } from "react";

const FloatingAIAgent: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Agent"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.2" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Chat Panel */}
      {open && (
        <div className="fixed z-50 bottom-24 right-6 w-80 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-blue-600 text-white">
            <span className="font-semibold">AI Agent</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700">
            <div className="mb-2">AI: Hello! How can I assist you with this case?</div>
            {/* Chat history/messages will go here */}
          </div>
          <div className="p-2 border-t bg-gray-50">
            <textarea className="w-full rounded-md border border-gray-300 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" rows={2} placeholder="Type your message..." />
            <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm font-semibold">Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIAgent;
