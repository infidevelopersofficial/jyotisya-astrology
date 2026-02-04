"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { exportReportAsPdf } from "@/lib/pdf";

interface AIInterpretationPanelProps {
  chartData: any;
  chartName: string;
  birthDetails?: {
    date: string;
    time: string;
    location: string;
  };
  // Lifted state props for persistence across tab switches
  completion: string;
  setCompletion: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
  onClear?: () => void;
}

export default function AIInterpretationPanel({
  chartData,
  chartName,
  birthDetails,
  completion,
  setCompletion,
  isLoading,
  setIsLoading,
  error,
  setError,
  onClear,
}: AIInterpretationPanelProps) {
  // AbortController stays local (it's transient per-generation)
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        accumulated += text;
        setCompletion(accumulated);
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

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      // Wait for hidden PDF element to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const fileName = `${chartName.replace(/\s+/g, "_")}_AI_Reading.pdf`;
      await exportReportAsPdf({ 
        elementId: "ai-insights-pdf-root", 
        fileName 
      });
    } catch (err) {
      console.error("PDF download failed:", err);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleStartNew = () => {
    if (onClear) {
      onClear();
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
        
        {/* Initial state - show Generate button */}
        {!isLoading && !completion && (
            <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
            <span>✨</span> Generate Reading
            </button>
        )}
        
        {/* Loading state - show Stop button */}
        {isLoading && (
            <button
            onClick={stop}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-600 transition-all flex items-center gap-2"
            >
            <span>⏹</span> Stop Generation
            </button>
        )}

        {/* Completed state - show action buttons */}
        {!isLoading && completion && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 
                         hover:from-emerald-500 hover:to-teal-500 
                         text-white font-medium rounded-xl shadow-lg 
                         shadow-emerald-500/20 transition-all 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
            >
              {downloadingPdf ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span>📥</span>
                  Download PDF
                </>
              )}
            </button>
            
            <button
              onClick={handleStartNew}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-white 
                         border border-slate-600 hover:border-slate-500 
                         rounded-xl transition-all flex items-center gap-2"
            >
              <span>🔄</span>
              Start New Reading
            </button>
          </div>
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

      {/* Hidden PDF Template (rendered when completion exists) */}
      {completion && (
        <div className="absolute -z-50 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
          <AIInsightsPdfTemplate
            chartName={chartName}
            birthDetails={birthDetails}
            insight={completion}
            generatedAt={new Date()}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Hidden PDF Template Component for html2canvas capture
 */
function AIInsightsPdfTemplate({
  chartName,
  birthDetails,
  insight,
  generatedAt,
}: {
  chartName: string;
  birthDetails?: { date: string; time: string; location: string };
  insight: string;
  generatedAt: Date;
}) {
  return (
    <div 
      id="ai-insights-pdf-root" 
      className="bg-white text-slate-900 p-8"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-orange-500 pb-6 mb-6">
        <div className="text-4xl mb-2">🔮</div>
        <h1 className="text-2xl font-bold text-slate-800">AI Jyotish Reading</h1>
        <p className="text-slate-500 mt-1">For {chartName}</p>
      </div>

      {/* Birth Details */}
      {birthDetails && (
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-slate-500">Date:</span>{" "}
              <span className="font-medium">{birthDetails.date}</span>
            </div>
            <div>
              <span className="text-slate-500">Time:</span>{" "}
              <span className="font-medium">{birthDetails.time}</span>
            </div>
            <div>
              <span className="text-slate-500">Place:</span>{" "}
              <span className="font-medium">{birthDetails.location}</span>
            </div>
          </div>
        </div>
      )}

      {/* Reading Content */}
      <div className="prose prose-sm prose-slate max-w-none leading-relaxed">
        <ReactMarkdown>{insight}</ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>Generated by Jyotishya AI Astrologer • {generatedAt.toLocaleString()}</p>
      </div>
    </div>
  );
}
