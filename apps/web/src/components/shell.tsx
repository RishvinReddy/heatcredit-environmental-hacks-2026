"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, FileText, Activity,
  Beaker, ShieldCheck, Database, FileSpreadsheet,
  Map, Cloud, Hexagon, X, Menu
} from "lucide-react";
import { fetchHealth } from "@/lib/api";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Check actual live API connectivity
  useEffect(() => {
    let mounted = true;
    async function checkApi() {
      try {
        await fetchHealth();
        if (mounted) setApiOnline(true);
      } catch {
        if (mounted) setApiOnline(false);
      }
    }
    checkApi();
    return () => { mounted = false; };
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "OVERVIEW", href: "/overview", icon: LayoutDashboard },
    { name: "ASSESSMENTS", href: "/assessment", icon: FileText },
    { name: "INTELLIGENCE", href: "/intelligence", icon: Activity },
    { name: "INTERVENTIONS", href: "/interventions", icon: Beaker },
    { name: "OPTIMIZER", href: "/optimizer", icon: ShieldCheck },
    { name: "SCENARIOS", href: "/scenarios", icon: FileSpreadsheet },
    { name: "REPORTS", href: "/report", icon: Map },
  ];

  const secondaryNav = [
    { name: "METHODOLOGY", href: "/methodology" },
    { name: "ARCHITECTURE", href: "/architecture" },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground selection:bg-primary/20 selection:text-foreground">

      {/* DESKTOP SIDEBAR RAIL */}
      <nav aria-label="Main Navigation" className="hidden md:flex w-64 border-r border-border/50 bg-card/40 flex-col shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-border/40 shrink-0">
          <Link href="/overview" className="flex items-center gap-2 font-bold tracking-tight hover:opacity-85 transition-opacity focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1">
            <Hexagon className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-tight">HeatCredit</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground ml-1 font-mono font-medium border border-border/60 px-1.5 py-0.5 rounded">Console</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2.5">Core Modules</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === "/" && item.href === "/overview");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-wide transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2.5">System Resources</div>
            {secondaryNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  pathname === item.href
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.nav
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label="Mobile Navigation"
              className="relative w-72 bg-card border-r border-border flex flex-col h-full shadow-2xl z-50"
            >
              <div className="h-14 flex items-center justify-between px-6 border-b border-border/40">
                <Link href="/overview" className="flex items-center gap-2 font-bold tracking-tight">
                  <Hexagon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold">HeatCredit</span>
                </Link>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2">Core Modules</div>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname === "/" && item.href === "/overview");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2">System Resources</div>
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted/50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP COMMAND BAR */}
        <header className="h-14 border-b border-border/40 bg-background/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 hover:bg-muted/40 border border-border/40 rounded-md px-3 py-1.5 w-44 sm:w-64 md:w-72 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Search workspace (Press Ctrl+K or Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left truncate">Search workspace...</span>
              <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border/50 bg-background px-1 font-mono text-[9px] font-medium opacity-90">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="px-2 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded-sm text-[11px] font-semibold tracking-wide">ENV HACKS 2026</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto relative z-10 bg-background">
          {children}
        </main>

        {/* BOTTOM SYSTEM STATUS BAR */}
        <footer className="border-t border-border/40 bg-card/60 flex flex-wrap items-center justify-between px-4 sm:px-6 py-1.5 min-h-8 shrink-0 text-[10px] font-mono font-medium tracking-wider text-muted-foreground uppercase z-20 gap-x-6 gap-y-1">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>AWS: CONNECTED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${apiOnline === false ? "bg-destructive" : "bg-primary animate-pulse"}`} />
              <span>API: {apiOnline === false ? "OFFLINE" : "ONLINE"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>ENGINE: DETERMINISTIC</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3 w-3 text-primary" />
              <span>WEATHER: OPEN-METEO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-primary" />
              <span>DATA: EVIDENCE-BACKED</span>
            </div>
          </div>
        </footer>
      </div>

      {/* COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setCmdOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              <div className="flex items-center px-4 py-3.5 border-b border-border/40 gap-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Type a command or jump to module..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setCmdOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-sm"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-2">
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 mb-1">Navigation</div>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setCmdOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-xs font-medium"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>Go to {item.name.toLowerCase()}</span>
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
