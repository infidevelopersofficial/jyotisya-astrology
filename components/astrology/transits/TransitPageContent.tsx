"use client";

import { useState } from "react";
import BirthChartForm from "../birth-chart/BirthChartForm";
import TransitView from "./TransitView";
import { BirthData } from "@/types/astrology/birthChart.types";

interface TransitPageContentProps {
  initialBirthData?: BirthData;
}

export default function TransitPageContent({ initialBirthData }: TransitPageContentProps) {
  const [birthData, setBirthData] = useState<BirthData>(
    initialBirthData || {
      dateTime: "", // ISO string
      location: "",
      latitude: 0,
      longitude: 0,
      timezone: 5.5,
      chartName: "",
    }
  );

  const [isGenerated, setIsGenerated] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleGenerate = () => {
    if (birthData.dateTime && birthData.latitude && birthData.longitude) {
      setIsGenerated(true);
    }
  };

  const activeView = isGenerated ? "transits" : "form";

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         {/* Title is handled by the Page wrapper usually, but we can put controls here */}
         <div className="flex items-center gap-2">
            {activeView === "transits" && (
                <button
                    onClick={() => setIsGenerated(false)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                    <span>←</span>
                    <span>Check Another Chart</span>
                </button>
            )}
         </div>

         {/* Help Toggle */}
         <div className="flex items-center justify-end">
            <button
            onClick={() => setShowHelp(!showHelp)}
            className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                showHelp
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                : "border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            >
            <span className="text-lg">💡</span>
            <span>{showHelp ? "Help enabled" : "Enable help"}</span>
            {showHelp && <span className="text-xs opacity-75">✓</span>}
            </button>
        </div>
      </div>

      {activeView === "form" && (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold text-white">Enter Birth Details</h2>
                <p className="text-slate-400">
                    To calculate your personal transits (Gochar), we need your exact birth details.
                </p>
            </div>
            <BirthChartForm
                birthData={birthData}
                setBirthData={setBirthData}
                loading={false}
                error={null}
                showHelp={showHelp}
                onGenerate={handleGenerate}
                onDismissError={() => {}}
            />
        </div>
      )}

      {activeView === "transits" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TransitView
                birthDetails={{
                    dateTime: birthData.dateTime,
                    latitude: birthData.latitude,
                    longitude: birthData.longitude,
                    timezone: birthData.timezone,
                    location: birthData.location || "",
                    userName: birthData.chartName || "User",
                }}
            />
        </div>
      )}
    </div>
  );
}
