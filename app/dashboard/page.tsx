import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DailyHoroscopeGrid from "@components/horoscope/daily-grid";
import PanchangHighlights from "@components/sections/panchang-highlights";
import { PageContainer, PageSection } from "@/components/layout/page-container";
import SmartWelcome from "@/components/dashboard/SmartWelcome";

export default async function DashboardPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "there";

  return (
    <PageContainer size="xl">
      {/* Smart Welcome Section */}
      <SmartWelcome displayName={displayName} />

      {/* Daily Horoscope */}
      <PageSection title="Your Daily Horoscope">
        <DailyHoroscopeGrid />
      </PageSection>

      {/* Panchang */}
      <PageSection title="Today's Panchang">
        <PanchangHighlights />
      </PageSection>

      {/* Quick Actions */}
      <PageSection title="Explore More">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Your Birth Chart"
            description="Generate your Vedic Kundli with planetary positions"
            href="/dashboard/birth-chart"
            gradient="from-yellow-500 to-orange-500"
            icon="🌟"
          />
          <ActionCard
            title="Saved Charts"
            description="View and manage your saved birth charts"
            href="/dashboard/charts"
            gradient="from-blue-500 to-cyan-500"
            icon="📂"
          />
          <ActionCard
            title="View All Horoscopes"
            description="Explore daily, weekly, and monthly predictions"
            href="/#daily-horoscope"
            gradient="from-orange-500 to-pink-500"
          />
          <ActionCard
            title="Consult Astrologers"
            description="Connect with expert astrologers"
            href="/consultations"
            gradient="from-purple-500 to-indigo-500"
          />
          <ActionCard
            title="Explore Products"
            description="Browse spiritual items and remedies"
            href="/shop"
            gradient="from-green-500 to-teal-500"
          />
        </div>
      </PageSection>
    </PageContainer>
  );
}

function ActionCard({
  title,
  description,
  href,
  gradient,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  gradient: string;
  icon?: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
        <div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-2xl`}
        >
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
