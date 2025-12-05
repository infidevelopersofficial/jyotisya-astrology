import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BirthChartGeneratorV2 from '@components/astrology/birth-chart-generator-v2'

export const metadata = {
  title: 'Birth Chart | Jyotishya',
  description: 'Generate your Vedic birth chart (Kundli) with planetary positions',
}

export default async function BirthChartPage() {
  // Server-side authentication check
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/signin?callbackUrl=/dashboard/birth-chart')
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">
          🌟 Your Birth Chart (Kundli)
        </h1>
        <p className="text-slate-300">
          Generate your Vedic astrology birth chart with detailed planetary positions
        </p>
      </div>

      {/* Birth Chart Generator Component */}
      <BirthChartGeneratorV2 userId={user.id} userEmail={user.email || ''} />

      {/* Info Section */}
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          About Your Birth Chart
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-orange-300">
              What is a Birth Chart?
            </h4>
            <p className="text-sm text-slate-300">
              A birth chart (Kundli) is a map of the sky at the exact moment of your birth.
              It shows planetary positions, houses, and nakshatras that influence your life.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-orange-300">
              Divisional Charts
            </h4>
            <p className="text-sm text-slate-300">
              D1 (Rasi) shows overall life, D9 (Navamsa) reveals marriage prospects,
              and D10 (Dasamsa) indicates career path.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-orange-300">
              Why Birth Time Matters
            </h4>
            <p className="text-sm text-slate-300">
              Accurate birth time is crucial as the ascendant (lagna) changes every 2 hours,
              affecting house placements and predictions.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-orange-300">
              Data Privacy
            </h4>
            <p className="text-sm text-slate-300">
              Your birth details are cached for 24 hours to save API quota.
              No data is shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
