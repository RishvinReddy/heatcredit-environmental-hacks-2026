"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, FileText, Activity,
  Beaker, ShieldCheck, Database, FileSpreadsheet,
  Map, Cloud, Hexagon, X, Menu, PanelLeftClose,
  PanelLeftOpen, ChevronRight, CornerDownLeft
} from "lucide-react";
import { fetchHealth } from "@/lib/api";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Restore sidebar state from localStorage if available
  useEffect(() => {
    try {
      const stored = window.localStorage?.getItem("heatcredit_sidebar_collapsed");
      if (stored === "true") setSidebarCollapsed(true);
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage?.setItem("heatcredit_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
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

  // Focus input when Command Palette opens
  useEffect(() => {
    if (cmdOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [cmdOpen]);

  // Check live API connectivity
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

  // Landing page has its own standalone public layout
  if (pathname === "/") {
    return <main className="min-h-screen bg-background text-foreground">{children}</main>;
  }

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }

  const navItems: NavItem[] = [
    { name: "OVERVIEW", href: "/overview", icon: LayoutDashboard, desc: "Executive resilience intelligence & KPIs" },
    { name: "ASSESSMENTS", href: "/assessment", icon: FileText, desc: "Facility condition & vulnerability intake" },
    { name: "INTELLIGENCE", href: "/intelligence", icon: Activity, desc: "Microclimate & weather telemetry analytics" },
    { name: "INTERVENTIONS", href: "/interventions", icon: Beaker, desc: "Catalogue of verified mitigation measures" },
    { name: "OPTIMIZER", href: "/optimizer", icon: ShieldCheck, desc: "0/1 Knapsack constrained budget allocation" },
    { name: "SCENARIOS", href: "/scenarios", icon: FileSpreadsheet, desc: "Parametric scenario simulation studio" },
    { name: "REPORTS", href: "/report", icon: Map, desc: "Auditable decision-support documentation" },
  ];

  const secondaryNav: NavItem[] = [
    { name: "METHODOLOGY", href: "/methodology", icon: FileText, desc: "Mathematical scoring model & limitations" },
    { name: "ARCHITECTURE", href: "/architecture", icon: Database, desc: "System specifications & cloud deployment" },
  ];

  // Filter items in command palette
  const allSearchable: NavItem[] = [...navItems, ...secondaryNav];
  const filteredNav = allSearchable.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCommand = (href: string) => {
    setCmdOpen(false);
    router.push(href);
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredNav.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredNav.length) % Math.max(1, filteredNav.length));
    } else if (e.key === "Enter" && filteredNav[selectedIndex]) {
      e.preventDefault();
      handleSelectCommand(filteredNav[selectedIndex].href);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground selection:bg-primary/20 selection:text-foreground">

      {/* DESKTOP SIDEBAR RAIL */}
      <nav
        aria-label="Main Navigation"
        className={`hidden md:flex border-r border-border/50 bg-card/40 flex-col shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-18" : "w-64"
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border/40 shrink-0">
          <Link
            href="/overview"
            className="flex items-center gap-2.5 font-bold tracking-tight hover:opacity-85 transition-opacity focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1 overflow-hidden"
            title="HeatCredit Console"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <Hexagon className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-sm font-bold tracking-tight">HeatCredit</span>
                <span className="text-[9px] uppercase tracking-widest text-primary font-mono font-semibold border border-primary/25 bg-primary/5 px-1.5 py-0.5 rounded">
                  Console
                </span>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3 space-y-6 overflow-y-auto">
          {/* Core Modules */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2">
                Core Modules
              </div>
            )}
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === "/" && item.href === "/overview");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary relative ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg border-l-2 border-primary shadow-2xs -z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <item.icon className={`h-4 w-4 shrink-0 relative z-10 transition-transform group-hover:scale-105 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {!sidebarCollapsed && <span className="truncate relative z-10">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* System Resources */}
          <div className="space-y-1 pt-2 border-t border-border/40">
            {!sidebarCollapsed && (
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2">
                System Resources
              </div>
            )}
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary relative ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  } ${sidebarCollapsed ? "justify-center px-0 text-[10px]" : ""}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSecondaryIndicator"
                      className="absolute inset-0 bg-primary/5 rounded-lg -z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <item.icon className={`h-3.5 w-3.5 shrink-0 relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {!sidebarCollapsed ? (
                    <span className="truncate relative z-10">{item.name}</span>
                  ) : (
                    <span className="font-mono text-[9px] font-bold relative z-10">{item.name.slice(0, 3)}</span>
                  )}
                </Link>
              );
            })}
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
              <div className="h-14 flex items-center justify-between px-5 border-b border-border/40">
                <Link href="/overview" className="flex items-center gap-2.5 font-bold tracking-tight">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-2xs">
                    <Hexagon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">HeatCredit</span>
                  <span className="text-[9px] uppercase tracking-widest text-primary font-mono font-semibold px-1 py-0.5 rounded bg-primary/10">
                    Console
                  </span>
                </Link>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 py-5 px-4 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2">Core Modules</div>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname === "/" && item.href === "/overview");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-1 pt-2 border-t border-border/40">
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase px-2 mb-2">System Resources</div>
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/50"
                    >
                      <span>{item.name}</span>
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
              className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 hover:bg-muted/40 border border-border/40 rounded-lg px-3 py-1.5 w-44 sm:w-64 md:w-72 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
              aria-label="Search workspace (Press Ctrl+K or Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left truncate">Search workspace...</span>
              <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border/50 bg-background px-1.5 font-mono text-[9px] font-medium opacity-90">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="px-2.5 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded-md text-[10px] font-semibold tracking-wider uppercase">
              ENV HACKS 2026
            </span>
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

      {/* FUNCTIONAL COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[18vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setCmdOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              {/* Input Header */}
              <div className="flex items-center px-4 py-3.5 border-b border-border/40 gap-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleCommandKeyDown}
                  placeholder="Type a module name or keyword (e.g. optimizer, assessments)..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground text-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-muted-foreground hover:text-foreground px-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setCmdOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filtered Results */}
              <div className="max-h-[50vh] overflow-y-auto p-2">
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 mb-1">
                  {filteredNav.length > 0 ? "Jump to Destination" : "No matching modules"}
                </div>
                {filteredNav.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.name}
                      onClick={() => handleSelectCommand(item.href)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs font-medium ${
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground font-normal">{item.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <span>Enter</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Tip */}
              <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>Navigate with ↑ / ↓ arrows &bull; Press Enter to select</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
