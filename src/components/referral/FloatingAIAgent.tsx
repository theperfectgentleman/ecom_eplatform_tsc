import React, { useState, useEffect, useRef } from "react";
import genaiWhiteIcon from "@/img/genai_white.png";
import { useToast } from "@/components/ui/toast/useToast";
import { Loader2, Send } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Common suggestions for the AI agent to help with
const COMMON_SUGGESTIONS = [
  "How do I create a new case?",
  "What does the priority level mean?",
  "How to search for patients?",
  "Guide me through the referral process",
  "What information is needed for a complete case?",
];

const FloatingAIAgent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Hello! I'm your Encompas AI assistant. How can I help you with case management today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of chat on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simple response mapping for demo purposes
    try {
      // In a production app, this would be an API call to an AI service
      setTimeout(() => {
        let response = "I'm sorry, I don't have an answer for that specific question yet.";
        
        // Simple keyword matching for demo purposes
        if (content.toLowerCase().includes("new case")) {
          response = "To create a new case, click the 'New Case' button at the top right of the referral page. Fill in all required fields including patient information, priority level, and clinical details.";
        } else if (content.toLowerCase().includes("priority")) {
          response = "The priority levels are: Critical (highest urgency), Urgent (needs prompt attention), Opened (standard case), and Closed (resolved). The color coding helps quickly identify case priority.";
        } else if (content.toLowerCase().includes("search") || content.toLowerCase().includes("patient")) {
          response = "You can search for patients by typing their name or ID in the patient search field. The system will show matching patients as you type. You can select an existing patient or create a new one.";
        } else if (content.toLowerCase().includes("referral")) {
          response = "For referrals, check the 'Referral Needed' box in the form. This will expand additional fields where you can enter the referring facility, destination facility, transportation means, and reason for referral.";
        }
        
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
      
      // For a real implementation with actual API:
      // const aiService = await fetch('/api/ai/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: content })
      // });
      // const response = await aiService.json();
      // setMessages(prev => [...prev, { 
      //   id: `ai-${Date.now()}`, 
      //   type: "ai", 
      //   content: response.message, 
      //   timestamp: new Date() 
      // }]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response from the AI agent.",
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:scale-105 transition-all"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Agent"
      >
        <img src={genaiWhiteIcon} alt="AI Agent" className="w-12 h-12" />
      </button>
      
      {/* Chat Panel */}
      {open && (
        <div className="fixed z-50 bottom-24 right-6 w-96 h-[500px] max-h-[80vh] max-w-[95vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-10 duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-600 text-white">
            <div className="flex items-center gap-2">
              <img src={genaiWhiteIcon} alt="AI Agent" className="w-6 h-6" />
              <span className="font-semibold">Encompas AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto text-sm bg-gray-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`mb-3 ${msg.type === "user" ? "flex justify-end" : "flex justify-start"}`}
              >
                <div 
                  className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.type === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-right mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-1 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="relative">
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 pr-10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" 
                rows={2} 
                placeholder="Type your message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button 
                className={`absolute right-2 bottom-2 p-1 rounded-full ${
                  inputValue.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIAgent;
