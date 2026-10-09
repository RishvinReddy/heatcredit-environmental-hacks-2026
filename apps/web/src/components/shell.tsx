"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, LayoutDashboard, FileText, Activity, 
  Beaker, ShieldCheck, Database, Zap, FileSpreadsheet, 
  Map, Cloud, Server, Hexagon, X
} from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navItems = [
    { name: "OVERVIEW", href: "/overview", icon: LayoutDashboard },
    { name: "ASSESSMENTS", href: "/assessment", icon: FileText },
    { name: "INTELLIGENCE", href: "/intelligence", icon: Activity },
    { name: "INTERVENTIONS", href: "/lab", icon: Beaker },
    { name: "OPTIMIZER", href: "/optimizer/demo-id", icon: ShieldCheck },
    { name: "SCENARIOS", href: "/scenarios", icon: FileSpreadsheet },
    { name: "REPORTS", href: "/reports", icon: Map },
  ];

  const secondaryNav = [
    { name: "METHODOLOGY", href: "/methodology" },
    { name: "ARCHITECTURE", href: "/architecture" },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground selection:bg-primary/20 selection:text-foreground">
      
      {/* LEFT RAIL */}
      <nav className="w-64 border-r border-border/40 bg-muted/10 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-border/40 shrink-0">
          <Link href="/overview" className="flex items-center gap-2 font-bold tracking-tight hover:opacity-80 transition-opacity">
            <Hexagon className="h-5 w-5 text-primary" />
            HeatCredit <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1 font-mono">Workspace</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-2 mb-3">Core Modules</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/overview');
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                  <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-2 mb-3">System Resources</div>
            {secondaryNav.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP COMMAND BAR */}
        <header className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
          <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 hover:bg-muted/50 border border-border/40 rounded-md px-3 py-1.5 w-72 transition-colors">
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search workspace...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="px-2 py-1 bg-primary/5 text-primary border border-primary/20 rounded-md">ENV HACKS 2026</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto relative z-10 bg-muted/5">
          {children}
        </main>

        {/* BOTTOM SYSTEM STATUS BAR */}
        <footer className="h-8 border-t border-border/40 bg-muted/10 flex items-center justify-between px-6 shrink-0 text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> AWS: CONNECTED</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> API: ONLINE</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> ENGINE: OPERATIONAL</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Cloud className="h-3 w-3" /> WEATHER: AVAILABLE</div>
            <div className="flex items-center gap-2"><Database className="h-3 w-3" /> DATA: SYNCHRONIZED</div>
          </div>
        </footer>
      </div>

      {/* COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-2xl bg-background border border-border/60 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
              <div className="flex items-center px-4 py-4 border-b border-border/40 gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input autoFocus placeholder="Type a command or search..." className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground" />
                <button onClick={() => setCmdOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2 mb-1">Commands</div>
                {navItems.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setCmdOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    Go to {item.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
