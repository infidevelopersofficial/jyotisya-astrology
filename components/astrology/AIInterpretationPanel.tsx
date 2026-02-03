"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface AIInterpretationPanelProps {
  chartData: any;
  chartName: string;
}

export default function AIInterpretationPanel({ chartData, chartName }: AIInterpretationPanelProps) {
  // Manual state management for full control over the stream
  const [completion, setCompletion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // AbortController to handle stopping the requested
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const stop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setCompletion("");
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Send minimal necessary data to save tokens
      const { planets, ascendant } = chartData;
      const minimalData = { 
          ascendant, 
          planets: planets.map((p: any) => ({ 
              name: p.name, 
              sign: p.sign, 
              house: p.house, 
              nakshatra: p.nakshatra,
              isRetro: p.isRetro,
              dignity: p.dignity 
          }))
      };
      
      console.log("Generating AI reading with data:", minimalData);

      const response = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           chartData: minimalData,
           prompt: "Please interpret this chart." 
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setCompletion((prev) => prev + text);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error("AI Error:", err);
        setError(err.message || "Failed to generate reading");
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            AI Astrologer Insights <span className="text-sm font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded ml-2">Beta</span>
          </h2>
          <p className="text-slate-400">
            Get a personalized reading for <span className="text-white font-medium">{chartName}</span> powered by Vedic logic.
          </p>
        </div>
        
        {!isLoading && !completion && (
            <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
            <span>✨</span> Generate Reading
            </button>
        )}
        
        {isLoading && (
            <button
            onClick={stop}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-600 transition-all flex items-center gap-2"
            >
            <span>⏹</span> Stop Generation
            </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200">
           <strong>Error:</strong> {error}
        </div>
      )}

      {/* Output Area */}
      {(completion || isLoading) && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 min-h-[300px] shadow-inner">
           {completion ? (
            <div className="prose prose-invert prose-purple max-w-none">
                <ReactMarkdown>{completion}</ReactMarkdown>
            </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-48 space-y-4 text-slate-500 animate-pulse">
                <div className="text-4xl">🔮</div>
                <p>Consulting the stars...</p>
             </div>
           )}
           
           {/* Typing Indicator */}
           {isLoading && completion && (
             <div className="mt-4 flex gap-1 justify-center opacity-50">
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           )}
        </div>
      )}
      
      {!completion && !isLoading && !error && (
         <div className="bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
               📜
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Reveal Your Destiny?</h3>
            <p className="text-slate-500 max-w-md mx-auto">
               Our AI Astrologer analyzes planetary strength, dignities, and house positions to create a unique narrative just for you.
            </p>
         </div>
      )}
    </div>
  );
}
