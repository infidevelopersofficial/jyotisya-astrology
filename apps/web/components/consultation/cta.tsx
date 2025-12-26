"use client";

import Image from "next/image";
import { Button } from "@digital-astrology/ui";
import Link from "next/link";
import { useLocaleContext } from "@components/providers/intl-provider";

export default function ConsultationCTA(): React.ReactElement {
  const { copy } = useLocaleContext();
  const { consultation } = copy;

  return (
    <section className="px-6 lg:px-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-900/60 via-purple-800/50 to-rose-900/60 p-10 shadow-astro backdrop-blur">
        <Image
          src="https://images.unsplash.com/photo-1574068468668-a05a11f871da?auto=format&fit=crop&w=1200&q=80"
          alt="Astrologer consultation"
          fill
          className="pointer-events-none -z-10 object-cover opacity-30"
        />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-white">{consultation.title}</h2>
              <p className="mt-2 text-sm text-slate-200">{consultation.description}</p>
              <ul className="mt-4 grid gap-2 text-xs text-slate-200 md:grid-cols-2">
                <li>✅ KP, Nadi, Prashna, Tarot specialists</li>
                <li>✅ Support in हिंदी, English, தமிழ், తెలుగు</li>
                <li>✅ Audio/Video call recordings available</li>
                <li>✅ Secure Jyotishya wallet & UPI</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/consultations">{consultation.explore}</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/consultations?intent=book">{consultation.book}</Link>
              </Button>
            </div>
          </div>
        </div>
    </section>
  );
}
