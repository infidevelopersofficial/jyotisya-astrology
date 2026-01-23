"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, User, Calendar, Percent, Moon, ArrowUpCircle } from "lucide-react";
import { useSavedCharts } from "@/hooks/user/useSavedCharts";
import { getSunSignFromDate } from "@/services/astrology/birthChartService";

interface SmartWelcomeProps {
    displayName: string;
}

export default function SmartWelcome({ displayName }: SmartWelcomeProps) {
    const { charts, loading } = useSavedCharts();
    const [stats, setStats] = useState({
        sunSign: "Sagittarius ♐",
        moonSign: "Taurus ♉",
        ascendant: "Gemini ♊",
        chartsCount: 0,
        completion: 40, // Base completion for signing up
        nextConsultation: "None scheduled"
    });

    useEffect(() => {
        if (!loading && charts.length > 0) {
            // Assume the first chart created is the user's "primary" chart for now
            // In a fuller app, we'd have a 'isPrimary' flag
            const primary = charts[0];
            if (primary) {
                const sign = getSunSignFromDate(new Date(primary.birthDate));
                setStats(prev => ({
                    ...prev,
                    sunSign: `${sign} ☀️`,
                    chartsCount: charts.length,
                    completion: 75,
                }));
            }
        }
    }, [charts, loading]);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f3c] to-[#0f1225] p-6 shadow-xl border border-white/5">
            {/* Background Decorations */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl" />

            <div className="relative z-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {displayName}!
                        </h1>
                        <p className="text-slate-400 max-w-lg mb-6 leading-relaxed">
                             Your cosmic journey is unfolding perfectly. Here is your daily astrological snapshot.
                        </p>

                        <div className="flex flex-wrap gap-3">
                             {/* Sun Sign */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-2.5 min-w-[140px]">
                                 <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                     <Sparkles className="w-4 h-4" />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Sun Sign</p>
                                     <p className="text-sm font-semibold text-white">{stats.sunSign}</p>
                                 </div>
                             </div>

                             {/* Moon Sign */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-2.5 min-w-[140px]">
                                 <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                     <Moon className="w-4 h-4" />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Moon Sign</p>
                                     <p className="text-sm font-semibold text-white">{stats.moonSign}</p>
                                 </div>
                             </div>

                             {/* Ascendant */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-2.5 min-w-[140px]">
                                 <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                     <ArrowUpCircle className="w-4 h-4" />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Ascendant</p>
                                     <p className="text-sm font-semibold text-white">{stats.ascendant}</p>
                                 </div>
                             </div>

                             {/* Profile Completion */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-2.5 min-w-[160px]">
                                 <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                     <Percent className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-slate-400">Profile</p>
                                        <span className="text-[10px] text-green-400 font-medium">{stats.completion}%</span>
                                     </div>
                                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                         <div 
                                            className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                                            style={{ width: `${stats.completion}%` }}
                                         />
                                     </div>
                                 </div>
                             </div>

                             {/* Next Consultation */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-2.5">
                                 <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                     <Calendar className="w-4 h-4" />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Next Session</p>
                                     <div className="flex items-center gap-2">
                                         <p className="text-sm font-semibold text-white">{stats.nextConsultation}</p>
                                         <Link href="/consultations" className="text-[10px] text-orange-400 hover:text-orange-300 font-medium uppercase tracking-wide">
                                            Book Now →
                                         </Link>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-6 md:mt-0 flex flex-col gap-3">
                        {stats.completion < 100 && (
                            <Link 
                               href="/dashboard/birth-chart"
                               className="group flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
                            >
                                <div>
                                    <p className="text-sm font-bold">Complete Your Profile</p>
                                    <p className="text-xs text-purple-200/80">Unlock deeper predictions</p>
                                </div>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                        
                        <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-slate-400 mb-1">Saved Charts</p>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-300" />
                                <span className="text-lg font-bold text-white">{stats.chartsCount}</span>
                                <span className="text-xs text-slate-500">profiles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
