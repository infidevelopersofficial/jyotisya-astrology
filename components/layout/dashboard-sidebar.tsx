"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  FolderHeart,
  CalendarDays,
  MessageCircle,
  Orbit,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User
} from "lucide-react";
import { clsx } from "clsx";

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}


const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/birth-chart", label: "Kundli Generator", icon: Sparkles },
  { href: "/dashboard/charts", label: "Saved Charts", icon: FolderHeart },
  { href: "/dashboard/panchang", label: "Daily Panchang", icon: CalendarDays },
  { href: "/dashboard/consultations", label: "My Consultations", icon: MessageCircle },
  { href: "/dashboard/transits", label: "Transits", icon: Orbit },
];

export default function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle window resize to auto-collapse on smaller screens if needed, 
  // but usually we just rely on media queries for hiding.
  
  return (
    <>
      {/* Mobile Trigger Button - Visible only on mobile */}
      <div className="md:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            "p-2 rounded-lg bg-[#050816] border border-white/10 text-white shadow-lg",
            isMobileOpen && "hidden"
          )}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#050816] border-r border-white/5 md:sticky md:top-20 md:h-[calc(100vh-80px)]",
            isCollapsed ? "w-[80px]" : "w-72"
        )}
        initial={false}
        animate={{
          width: isMobileOpen 
            ? 280 // Mobile width
            : isCollapsed 
                ? 80 
                : 288, // Desktop expanded width (w-72 = 18rem = 288px)
          x: isMobileOpen ? 0 : "0%", // Reset transform
        }}
        // Mobile slide-in logic is handled by class toggling or x transform 
        // simpler to handle mobile visibility via classes and fixed positioning
      >
        <div className={cn(
            "flex h-full flex-col px-3 py-4 transition-all duration-300 relative",
            // Mobile specific styles: hidden by default unless open
            "md:flex", 
            !isMobileOpen && "hidden md:flex" 
        )}>
            {/* Close Button (Mobile Only) */}
            <div className="md:hidden flex justify-end mb-4 px-2">
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Logo/Header Area (Optional, or just spacer) */}
            <div className={cn("mb-6 flex items-center px-2", isCollapsed ? "justify-center" : "justify-between")}>
                 {!isCollapsed && (
                     <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Menu</span>
                 )}
                 {/* Desktop Collapse Toggle */}
                 <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                 >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                 </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2 flex-1">
                {LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                                isActive 
                                    ? "bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-400" 
                                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                                isCollapsed ? "justify-center" : ""
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                            <link.icon className={cn(
                                "transition-colors",
                                isActive ? "text-orange-400" : "text-slate-500 group-hover:text-white",
                                isCollapsed ? "w-6 h-6" : "w-5 h-5"
                            )} />
                            
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="whitespace-nowrap"
                                >
                                    {link.label}
                                </motion.span>
                            )}
                            
                            {/* Hover Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {link.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom/Footer Area */}
            <div className="mt-auto border-t border-white/5 pt-4">
                {!isCollapsed ? (
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 border border-indigo-500/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-500/20 w-12 h-12 rounded-full blur-xl" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">Pro Tip</p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            Complete your profile to get more accurate daily predictions.
                        </p>
                        <button className="text-xs text-indigo-300 hover:text-white font-medium transition-colors">
                            Complete Profile →
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                         <button className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" title="Profile Settings">
                            <User className="w-5 h-5" />
                         </button>
                    </div>
                )}
            </div>
        </div>
      </motion.aside>
    </>
  );
}
