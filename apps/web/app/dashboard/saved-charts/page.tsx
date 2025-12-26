import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SavedChartsList from "@/components/saved-charts/SavedChartsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Charts | Digital Astrology",
  description: "View and manage your saved birth charts",
};

export default async function SavedChartsPage() {
  // Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/saved-charts");
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      <SavedChartsList />
    </div>
  );
}
