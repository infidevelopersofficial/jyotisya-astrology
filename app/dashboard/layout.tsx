import Link from "next/link";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/birth-chart", label: "Kundli Generator", icon: "✨" },
  { href: "/dashboard/charts", label: "Saved Charts", icon: "📂" },
  { href: "/dashboard/panchang", label: "Daily Panchang", icon: "📅" },
  { href: "/dashboard/consultations", label: "My Consultations", icon: "💬" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden w-64 border-r border-white/5 bg-[#050816] md:block">
        <div className="flex h-full flex-col px-4 py-6">
          <nav className="space-y-1">
            {DASHBOARD_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto border-t border-white/5 pt-6">
             <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 border border-indigo-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">Pro Tip</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                   Complete your profile to get more accurate daily predictions.
                </p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-cosmic-blue p-4 md:p-8">
         <div className="md:hidden flex items-center gap-4 overflow-x-auto mb-6 pb-2 border-b border-white/5">
            {DASHBOARD_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white border border-white/5 bg-[#050816]"
                >
                    <span>{link.icon}</span>
                    {link.label}
                </Link>
            ))}
         </div>
         
         <div className="mb-6">
            <Breadcrumbs />
         </div>

         {children}
      </main>
    </div>
  );
}
