// import { BirthChartData } from "@/types/astrology/birthChart.types"; // Removing incorrect import
import PdfContainer from "./PdfContainer";
import PdfPage from "./PdfPage";

export interface KundliReportData {
  user: { name: string };
  basicDetails: {
    date: string;
    time: string;
    location: string;
    dayOfWeek: string;
  };
  planetaryPositions: Array<{
    name: string;
    sign: string;
    longitude: number;
    nakshatra: string;
    pada: number | string;
  }>;
  panchang: {
    tithi: string;
    vara: string;
    nakshatra: string;
    yoga: string;
  };
  charts: {
     D1: string | null; // SVG code or null
  };
}

interface KundliReportProps {
  data: KundliReportData;
}

/**
 * The standard "Free" Kundli Report.
 * Renders into the hidden PDF container.
 */
export default function KundliReport({ data }: KundliReportProps) {
  const { user, basicDetails, planetaryPositions, panchang } = data;

  return (
    <PdfContainer id="kundli-report-root">
      {/* Page 1: Cover & Birth Details */}
      <PdfPage pageNumber={1} title="Birth Horoscope">
        <div className="flex h-full flex-col items-center justify-center text-center">
           <div className="mb-8 rounded-full bg-orange-50 p-6 border-4 border-orange-100">
               <span className="text-6xl">🕉️</span>
           </div>
           
           <h1 className="text-4xl font-bold text-slate-800 mb-2 font-serif uppercase tracking-widest">
              Janma Kundli
           </h1>
           <div className="h-1 w-20 bg-orange-500 mb-8 mx-auto"></div>
           
           <h2 className="text-2xl font-light text-slate-600 mb-12">
              For {user?.name || "Devotee"}
           </h2>
           
           {/* Birth Details Box */}
           <div className="w-full max-w-md bg-slate-50 border border-slate-200 p-8 rounded-lg shadow-sm text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="text-slate-500">Date of Birth:</div>
                 <div className="font-medium text-slate-900">{basicDetails.date}</div>
                 
                 <div className="text-slate-500">Time of Birth:</div>
                 <div className="font-medium text-slate-900">{basicDetails.time}</div>
                 
                 <div className="text-slate-500">Place of Birth:</div>
                 <div className="font-medium text-slate-900">{basicDetails.location}</div>
                 
                 <div className="text-slate-500">Day:</div>
                 <div className="font-medium text-slate-900">{basicDetails.dayOfWeek}</div>
              </div>
           </div>
           
           <div className="mt-auto mb-12 text-sm text-slate-400">
              <p>Generated on {new Date().toLocaleDateString()}</p>
           </div>
        </div>
      </PdfPage>

      {/* Page 2: Planetary Positions */}
      <PdfPage pageNumber={2} title="Planetary Details">
         <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-orange-500 pl-3">
               Planetary Positions (Nirayana)
            </h3>
            
            <table className="w-full text-sm text-slate-700 border-collapse">
               <thead>
                  <tr className="bg-orange-50 text-orange-900 border-b border-orange-200">
                     <th className="p-3 text-left font-semibold">Planet</th>
                     <th className="p-3 text-left font-semibold">Rashi (Sign)</th>
                     <th className="p-3 text-right font-semibold">Longitude</th>
                     <th className="p-3 text-left font-semibold pl-8">Nakshatra</th>
                     <th className="p-3 text-left font-semibold">Pada</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {planetaryPositions.map((planet) => (
                     <tr key={planet.name} className="even:bg-slate-50/50">
                        <td className="p-3 font-medium">{planet.name}</td>
                        <td className="p-3">{planet.sign}</td>
                        <td className="p-3 text-right font-mono text-xs">{planet.longitude.toFixed(2)}°</td>
                        <td className="p-3 pl-8">{planet.nakshatra}</td>
                        <td className="p-3">{planet.pada}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            
            <div className="mt-8 grid grid-cols-2 gap-8">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Avakahada Chakra</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Paya (Foot)</span> <span className="font-medium">Gold</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Varna</span> <span className="font-medium">Kshatriya</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Yoni</span> <span className="font-medium">Gaja</span>
                     </div>
                     <div className="flex justify-between pb-1">
                        <span>Gana</span> <span className="font-medium">Deva</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Panchang</h4>
                   <div className="space-y-2 text-xs text-slate-600">
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Tithi</span> <span className="font-medium">{panchang.tithi}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Vara</span> <span className="font-medium">{panchang.vara}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Nakshatra</span> <span className="font-medium">{panchang.nakshatra}</span>
                     </div>
                     <div className="flex justify-between pb-1">
                        <span>Yoga</span> <span className="font-medium">{panchang.yoga}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </PdfPage>
    </PdfContainer>
  );
}
