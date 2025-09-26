import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Payment } from '../types';
import { BrainCircuitIcon } from './Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
  isInsight?: boolean;
}

export const AISentinel: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const ai = useMemo(() => {
    // As per instructions, API_KEY is assumed to be in the environment.
    // In a real production app, this key would be handled by a backend proxy
    // to avoid exposing it on the client-side.
    try {
      // This environment does not use a bundler, so we must rely on 'process.env'
      // being available in the execution context, or gracefully disable the feature.
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.warn("API_KEY environment variable not set. AI Sentinel will not function.");
        return null;
      }
      return new GoogleGenAI({ apiKey });
    } catch (error) {
      console.warn("Could not initialize AI Sentinel. It's possible the 'process' object is not defined in this environment.", error);
      return null;
    }
  }, []);

  const initialInsights = useMemo(() => {
    const flaggedPayments = payments.filter(p => p.ai_flag);
    const insights = new Set<string>();
    if (flaggedPayments.length > 0) {
        insights.add(`Sentinel has detected ${flaggedPayments.length} transactions with anomalies. Hover over the icon on the card for details.`);
    }
    const highPriorityPending = payments.filter(p => p.priority === 'High' && p.status === 'pending_approval');
    if (highPriorityPending.length > 0) {
        insights.add(`There are ${highPriorityPending.length} high-priority payments pending approval.`);
    }
    return Array.from(insights);
  }, [payments]);

  useEffect(() => {
    if (initialInsights.length > 0 && messages.length === 0) {
      setMessages([{ 
        role: 'model', 
        text: `Quantum Sentinel online. Initial analysis complete.\n\n- ${initialInsights.join('\n- ')}\n\nHow can I help you analyze this settlement data?`,
        isInsight: true,
      }]);
    }
  }, [initialInsights, messages.length]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !ai) {
      if (!ai) alert("AI Sentinel is offline: API Key not configured.");
      return;
    }

    const newUserMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a summarized context for the AI
      const dataSummary = payments.map(({ id, user, amount, status, priority, ai_flag }) => ({
        id: id.substring(0, 10),
        user: user.name,
        amount: amount.amount_in_tokens,
        status,
        priority,
        is_flagged: !!ai_flag,
      }));

      const systemInstruction = `You are the Quantum Sentinel, an AI financial analyst embedded in a blockchain settlement dashboard.
      Your goal is to provide concise, insightful answers based on the provided transaction data.
      Analyze the JSON data provided in the user's message to answer their question.`;

      const contents = `
      DATA:
      ${JSON.stringify(dataSummary, null, 2)}

      USER QUESTION:
      ${input}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        }
      });

      const aiResponse: Message = { role: 'model', text: response.text };
      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: Message = { role: 'model', text: "Sorry, I encountered an error while analyzing the data. Please check the console for details." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <BrainCircuitIcon className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-slate-300">AI Sentinel</h2>
      </div>
      <div ref={chatContainerRef} className="max-h-60 overflow-y-auto pr-2 space-y-4 text-sm">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BrainCircuitIcon className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-1" />}
            <div className={`p-3 rounded-lg max-w-lg whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-slate-800 text-slate-200'
                : msg.isInsight
                ? 'bg-slate-950 text-slate-200 border-l-4 border-cyan-500'
                : 'bg-slate-950 text-slate-300'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex gap-3">
                <BrainCircuitIcon className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-1 animate-pulse" />
                <div className="p-3 rounded-lg bg-slate-950 text-slate-400">
                    Analyzing...
                </div>
            </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about transactions, users, or anomalies..."
          disabled={isLoading || !ai}
          className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
        />
      </form>
    </div>
  );
};