/* eslint-disable react/no-unescaped-entities */
"use client";

import { useBirthChart } from "@/hooks/astrology/useBirthChart";
import { useBirthChartActions } from "@/hooks/astrology/useBirthChartActions";
import BirthChartForm from "./BirthChartForm";
import BirthChartDisplay from "./BirthChartDisplay";
import DivisionalChartsPanel from "./DivisionalChartsPanel";
import KundliReport, { KundliReportData } from "@/components/reports/KundliReport";
import { exportChartAsPdf, exportReportAsPdf } from "@/lib/pdf";
import {
  getFullChartName,
  getFormattedBirthDateTime,
  buildDownloadFilename,
  DIVISIONAL_CHARTS,
} from "@/services/astrology/birthChartService";
import { useToast } from "@/components/ui/toast"; 
import { useMemo, useState } from "react";
import { useYogas } from "@/hooks/astrology/useYogas";
import { useDasha } from "@/hooks/astrology/useDasha";
import { Yoga, YogaSummary, DashaResult } from "@/types/astrology/birthChart.types";
import { calculateDignity, calculateFunctionalNature, calculateStrengthScore } from "@/lib/astrology/calculations/Dignity";
import { NAKSHATRA_DATA } from "@/lib/astrology/calculations/NakshatraInfo";
import { generateRemedies, Remedy } from "@/lib/astrology/calculations/Remedies";

interface BirthChartGeneratorProps {
  userId: string;
  userEmail: string;
}

export default function BirthChartGeneratorV2({
  userId: _userId,
  userEmail: _userEmail,
}: BirthChartGeneratorProps) {
  const {
    state,
    activeTab,
    showHelp,
    expandedPlanet,
    setBirthData,
    setActiveTab,
    setShowHelp,
    setExpandedPlanet,
    setError,
    generateBirthChart,
    selectDivisional,
  } = useBirthChart();

  const {
    downloadingPNG,
    downloadingPDF,
    copiedLink,
    savingChart,
    savedChartId,
    handleDownloadPNG,
    handleCopyShareLink,
    handleSaveChart,
  } = useBirthChartActions({
    birthData: state.birthData,
    chartData: state.chartData,
    selectedDivisional: state.selectedDivisional,
    setError,
  });

  const { toast } = useToast(); 
  
  // Hooks for Advanced Report Data
  const { fetchYogas } = useYogas();
  const { fetchDasha } = useDasha();
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportExtras, setReportExtras] = useState<{
    yogas?: { list: Yoga[]; summary: YogaSummary | null };
    dasha?: { current: string; periods: any[] };
    interpretation?: any;
  }>({});

  // Prepare data for the PDF report
  const reportData = useMemo<KundliReportData | null>(() => {
    const { birthData, chartData } = state;
    if (!chartData?.data?.planets) return null;

    const planets = chartData.data.planets;
    

    const ascendant = chartData.data.ascendant || 0;
    const ascendantSign = Math.floor(ascendant / 30) + 1; // 1-12
    
    // Safely map planets with Dignity Calculation
    const mappedPlanets = planets.map((p) => {
       const signNum = Math.floor(p.normDegree / 30) + 1;
       
       // Calculate Rulership (Approximate Host for Dignity)
       // This needs a helper really, but we can do a simplified check for now OR
       // improve calculateDignity to take sign number since we have OWN_SIGNS.
       // My calculateDignity uses signPosition (number). HostPlanet is needed for friendship.
       // Let's create a quick host lookup here or update Dignity.ts? 
       // For now, I will use a simple mapping for host.
       
       const signOwners = [null, "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
       const host = signOwners[signNum] || "Neutral";

       const dignity = calculateDignity(p.name, signNum, p.normDegree % 30, host);
       const nature = calculateFunctionalNature(p.name, ascendantSign);
       const strength = calculateStrengthScore(dignity, p.isRetro === true || p.isRetro === "true");

       return {
         name: p.name,
         sign: p.sign || "Unknown",
         longitude: p.fullDegree,
         nakshatra: p.nakshatra || "-",
         pada: "-", 
         // Advanced Props
         house: 1, // Placeholder, calculated later in D1
         isRetro: !!p.isRetro,
         dignity,
         nature,
         strength
       };
    });

    // Remedies Generation
    let chartRemedies: Remedy[] = [];
    mappedPlanets.forEach(p => {
       const newRemedies = generateRemedies(p.name, p.nature, p.strength, p.dignity);
       chartRemedies = [...chartRemedies, ...newRemedies];
    });


    // Nakshatra Deep Dive
    const moon = mappedPlanets.find(p => p.name === "Moon");
    const nakshatraInfo = moon && moon.nakshatra ? NAKSHATRA_DATA[moon.nakshatra] : undefined;


    return {
      user: { name: birthData.chartName || "User" },
      basicDetails: {
        date: new Date(birthData.dateTime).toLocaleDateString(),
        time: new Date(birthData.dateTime).toLocaleTimeString(),
        location: birthData.location,
        dayOfWeek: new Date(birthData.dateTime).toLocaleDateString("en-US", { weekday: "long" }),
      },
      planetaryPositions: mappedPlanets,
      nakshatraInfo, 
      remedies: chartRemedies, // Pass remedies
      panchang: {
        tithi: "-", // Not currently in API response
        vara: new Date(birthData.dateTime).toLocaleDateString("en-US", { weekday: "long" }),
        nakshatra: "-",
        yoga: "-",
      },
      charts: {
        D1: {
            ascendant: chartData.data.ascendant || 0,
            planets: mappedPlanets.map(p => ({
               name: p.name,
               house: planets.find(pl => pl.name === p.name)?.house || 1,
               sign: p.sign,
               degree: p.longitude,
               isRetro: false // TODO: Pass isRetro if available
            }))
        }
      },
      ...reportExtras // Spread extra data (yogas, dasha) when available
    };
  }, [state.birthData, state.chartData, reportExtras]);

  const handleDownloadChartPDF = async () => {
    if (!state.birthData) return;
    const fullChartName = getFullChartName(
      state.birthData,
      state.selectedDivisional,
      DIVISIONAL_CHARTS
    );
    const filename = buildDownloadFilename(
      state.birthData,
      state.selectedDivisional,
      "pdf"
    );
    const formatted = getFormattedBirthDateTime(state.birthData.dateTime);
    await exportChartAsPdf({
      elementId: "rasi-chart",
      fileName: filename,
      chartName: fullChartName,
      birthDate: formatted.full,
      birthPlace: state.birthData.location,
    });
    toast("Chart PDF Downloaded", "success");
  };

  const handleGeneratePdf = async (interpretation?: any) => {
    if (!state.birthData) return;
    setIsGeneratingPdf(true);
    
    try {
      // 1. Fetch Advanced Data on Demand
      // We assume date/lat/lon are valid if chartData exists
      const commonOptions = {
         dateTime: state.birthData.dateTime,
         latitude: state.birthData.latitude,
         longitude: state.birthData.longitude,
         timezone: state.birthData.timezone
      };

      console.log("Fetching Advanced Report Data...");
      
      // Parallel Fetch
      const [yogaData, dashaData] = await Promise.all([
         fetchYogas(commonOptions).catch(e => { console.error("Yoga fetch failed", e); return undefined; }),
         fetchDasha({ ...commonOptions, yearsToCalculate: 80 }).catch(e => { console.error("Dasha fetch failed", e); return undefined; })
      ]);

      // 2. Process Dasha Data for Report
      let dashaProcessed = undefined;
      // @ts-ignore - checking if dashaData is valid DashaResult
      if (dashaData && dashaData.mahadashas) { 
         // @ts-ignore
         const res = dashaData as DashaResult;
         dashaProcessed = {
            current: `${res.currentMahadasha} / ${res.currentAntardasha}`,
            periods: res.mahadashas.map((m: any) => ({
               planet: m.planet,
               start_date: m.start_date,
               end_date: m.end_date
            }))
         };
      }

      // 3. Update State to Render Hidden Report
      setReportExtras({
         // @ts-ignore
         yogas: yogaData ? { list: yogaData.yogas, summary: yogaData.summary } : undefined,
         dasha: dashaProcessed,
         interpretation: interpretation // Pass interpretation from UI if available
      });

      // 4. Wait for Render (Critical)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!document.getElementById("kundli-report-root")) {
         throw new Error("Report element not found");
      }

      const fileName = `${state.birthData.chartName?.replace(/\s+/g, "_") || "Report"}_Kundli.pdf`;
      await exportReportAsPdf({ elementId: "kundli-report-root", fileName });
      
      toast("Detailed Kundli Report Downloaded", "success");
    } catch (e) {
      console.error("PDF Generation failed", e);
      setError("Failed to generate PDF report");
      toast("PDF Generation Failed", "error");
    } finally {
      setIsGeneratingPdf(false);
      // Optional: Clear extras after download to free memory? 
      // setReportExtras({});
    }
  };

  return (
    <div className="space-y-8">
      {/* Compact Help Toggle */}
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

      {/* Compact Progress Indicator - Mobile First */}
      <div className="relative">
        {/* Mobile: Compact dots */}
        <div className="flex items-center justify-center gap-3 md:hidden">
          {["form", "chart", "divisional"].map((step, i) => {
            const isActive = activeTab === step;
            const isCompleted = step === "form" ? !!state.chartData : step === "chart" ? activeTab === "divisional" : false;
            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white shadow-lg"
                      : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-slate-600 bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : i + 1}
                </div>
                {i < 2 && (
                  <div className={`h-0.5 w-6 rounded-full ${
                    isCompleted ? "bg-gradient-to-r from-green-500 to-orange-500" : "bg-slate-700"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: Full stepper */}
        <div className="hidden md:flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === "form"
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : state.chartData
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-600 bg-slate-800 text-slate-400"
              }`}
            >
              {state.chartData ? "✓" : "1"}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                activeTab === "form" || state.chartData ? "text-white" : "text-slate-500"
              }`}
            >
              Enter Details
            </span>
          </div>

          {/* Connector 1 */}
          <div className="relative flex-1 px-6">
            <div className="h-0.5 w-full bg-slate-700">
              {state.chartData && (
                <div className="h-full w-full bg-gradient-to-r from-green-500 to-orange-500"></div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === "chart" && state.chartData
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : state.chartData
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-600 bg-slate-800 text-slate-400"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                state.chartData ? "text-white" : "text-slate-500"
              }`}
            >
              View Chart
            </span>
          </div>

          {/* Connector 2 */}
          <div className="relative flex-1 px-6">
            <div className="h-0.5 w-full bg-slate-700">
              {activeTab === "divisional" && state.chartData && (
                <div className="h-full w-full bg-gradient-to-r from-orange-500 to-purple-500"></div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === "divisional" && state.chartData
                  ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : state.chartData
                    ? "border-slate-600 bg-slate-700 text-slate-400"
                    : "border-slate-600 bg-slate-800 text-slate-400"
              }`}
            >
              3
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                activeTab === "divisional" && state.chartData ? "text-white" : "text-slate-500"
              }`}
            >
              Explore More
            </span>
          </div>
        </div>
      </div>

      {/* Simplified Tabs - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-semibold transition-all min-h-[48px] active:scale-[0.98] ${
            activeTab === "form"
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className="text-lg sm:text-xl">📝</span>
          <span className="text-sm sm:text-base">Details</span>
        </button>

        <button
          onClick={() => setActiveTab("chart")}
          disabled={!state.chartData}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-semibold transition-all min-h-[48px] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === "chart"
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:hover:bg-white/5"
          }`}
        >
          <span className="text-lg sm:text-xl">🌟</span>
          <span className="text-sm sm:text-base">Chart</span>
        </button>

        <button
          onClick={() => setActiveTab("divisional")}
          disabled={!state.chartData}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-semibold transition-all min-h-[48px] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === "divisional"
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:hover:bg-white/5"
          }`}
        >
          <span className="text-lg sm:text-xl">📊</span>
          <span className="text-sm sm:text-base">Explore</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "form" && (
        <BirthChartForm
          birthData={state.birthData}
          setBirthData={setBirthData}
          loading={state.loading}
          error={state.error}
          showHelp={showHelp}
          onGenerate={generateBirthChart}
          onDismissError={() => setError(null)}
        />
      )}

      {activeTab === "chart" && state.chartData && (
        <BirthChartDisplay
          birthData={state.birthData}
          chartData={state.chartData}
          svgData={state.svgData["D1"]}
          showHelp={showHelp}
          expandedPlanet={expandedPlanet}
          onTogglePlanet={(name) => setExpandedPlanet(expandedPlanet === name ? null : name)}
          onSwitchToForm={() => setActiveTab("form")}
          onSwitchToDivisional={() => setActiveTab("divisional")}
          downloadingPNG={downloadingPNG}
          downloadingPDF={isGeneratingPdf || downloadingPDF} // Use combined loading state
          copiedLink={copiedLink}
          savingChart={savingChart}
          savedChartId={savedChartId}
          onDownloadPNG={handleDownloadPNG}
          onDownloadPDF={handleGeneratePdf}
          onDownloadChartPDF={handleDownloadChartPDF}
          onCopyLink={handleCopyShareLink}
          onSaveChart={handleSaveChart}
        />
      )}

      {activeTab === "divisional" && state.chartData && (
        <DivisionalChartsPanel
          svgData={state.svgData}
          divisionalData={state.divisionalData}
          selectedDivisional={state.selectedDivisional}
          onSelectDivisional={selectDivisional}
        />
      )}
      
      {/* Hidden PDF Report (Rendered only when chart data exists) */}
      {state.chartData && reportData && (
         <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden h-0 w-0">
            <KundliReport data={reportData} />
         </div>
      )}
    </div>
  );
}
