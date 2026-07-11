import React from "react";
import { HoroscopeData } from "@/types/astrology/horoscope.types";
import { WhatsAppShareButton } from "@/components/ui/whatsapp-share-button";

interface DailyHoroscopePanelProps {
  kundliId: string;
  data: HoroscopeData;
  className?: string;
}

export const DailyHoroscopePanel: React.FC<DailyHoroscopePanelProps> = ({
  data,
  className = "",
}) => {
  const shareText = `My Daily Horoscope for ${data.sunSign}:\n\n${data.text || "Coming soon!"}`;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Horoscope</h3>
        <WhatsAppShareButton text={shareText} className="!px-3 !py-1.5 text-xs" />
      </div>

      <div className="space-y-2">
        <p className="text-gray-700">Sign: {data.sunSign}</p>

        {data.text ? (
          <p className="text-gray-700 leading-relaxed">{data.text}</p>
        ) : (
          <p className="text-gray-500 italic">
            Personalized horoscope coming soon. This space is reserved for your daily reading.
          </p>
        )}
      </div>
    </div>
  );
};
