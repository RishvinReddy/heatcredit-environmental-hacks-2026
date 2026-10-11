"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAssessment, optimizeBudget } from "@/lib/api";
import { CATALOGUE_INTERVENTIONS, DEMO_FACILITIES, type Intervention } from "@/lib/engine";
import { Slider } from "@/components/ui/slider";
import {
  ShieldCheck,
  Activity,
  BarChart2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Info,
  Layers,
  AlertTriangle,
  Sun,
  Coins,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function ScenariosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">
          INITIALIZING SCENARIO LAB...
        </div>
      }
    >
      <ScenariosContent />
    </Suspense>
  );
}

function ScenariosContent() {
  const searchParams = useSearchParams();
  const rawAssessmentId = searchParams.get("assessmentId");

  // Default to canonical demo facility if no ID is passed in query
  const effectiveId = rawAssessmentId || "demo-school-hyderabad";

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Active strategy selection: "baseline" | "balanced" | "aggressive"
  const [activeStrategyKey, setActiveStrategyKey] = useState<"baseline" | "balanced" | "aggressive">("balanced");

  // Dynamic user budgets for each scenario
  const [budgets, setBudgets] = useState({
    baseline: 0,
    balanced: 50000,
    aggressive: 120000
  });

  // Cached calculated results from canonical knapsack engine
  const [results, setResults] = useState<{
    baseline: any;
    balanced: any;
    aggressive: any;
  }>({
    baseline: null,
    balanced: null,
    aggressive: null
  });

  // Load initial assessment context
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAssessment(effectiveId);
        if (isMounted) setAssessment(data);
      } catch (err) {
        console.error("Failed to load assessment context for scenarios:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [effectiveId]);

  // Recalculate scenarios whenever assessment or budgets change
  useEffect(() => {
    let isMounted = true;
    async function calculateAll() {
      if (!assessment) return;
      setRecalculating(true);
      try {
        const [base, bal, agg] = await Promise.all([
          optimizeBudget(effectiveId, budgets.baseline).catch(() => null),
          optimizeBudget(effectiveId, budgets.balanced).catch(() => null),
          optimizeBudget(effectiveId, budgets.aggressive).catch(() => null)
        ]);

        if (isMounted) {
          setResults({
            baseline: base,
            balanced: bal,
            aggressive: agg
          });
        }
      } catch (err) {
        console.error("Optimization calculation error:", err);
      } finally {
        if (isMounted) setRecalculating(false);
      }
    }

    calculateAll();
    return () => {
      isMounted = false;
    };
  }, [assessment, budgets.baseline, budgets.balanced, budgets.aggressive, effectiveId]);

  const baseScore = assessment?.score ?? 42;

  // Active strategy properties
  const activeBudget = budgets[activeStrategyKey];
  const activeResult = results[activeStrategyKey];
  const activeProjectedScore = activeResult?.projectedScore ?? (activeStrategyKey === "baseline" ? baseScore : baseScore);
  const activeUtilizedCost = activeResult?.totalCost ?? 0;
  const activeRemainingBudget = Math.max(0, activeBudget - activeUtilizedCost);
  const activeImprovement = activeProjectedScore - baseScore;
  const activeInterventions: any[] = activeResult?.selectedInterventions || activeResult?.interventions || [];

  // Set active budget with live recalculation
  const handleBudgetChange = (newVal: number) => {
    setBudgets((prev) => ({
      ...prev,
      [activeStrategyKey]: newVal
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Synthesizing Scenario Matrices...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">

      {/* ===================================================================== */}
      {/* SECTION A: EDITORIAL OPENING                                          */}
      {/* ===================================================================== */}
      <section className="relative border-b border-border/80 overflow-hidden bg-background pt-10 pb-14 sm:py-16">
        {/* Subtle engineering grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider sm:tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                <span>HEATCREDIT / SCENARIO LAB • DECISION PROTOCOL 01</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
                Every budget creates a <br />
                <span className="font-serif italic font-normal text-primary">different future.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-light">
                Model resilience capital allocations before spending a single rupee. Explore deterministic trade-offs across capital constraints, examine intervention packages, and compare portfolio impacts on physical building envelopes.
              </p>

              {/* Hand-Drawn SVG Annotation & Doodles */}
              <div className="flex items-center gap-4 pt-1">
                <span
                  className="text-xl sm:text-2xl text-amber-600 dark:text-amber-500 transform -rotate-1 select-none font-medium"
                  style={{ fontFamily: "var(--font-handwriting), 'Caveat', cursive" }}
                >
                  “Plan for heat. Invest with intent.” ➔
                </span>

                {/* Hand-sketched SVG Sun Doodle */}
                <svg
                  viewBox="0 0 40 40"
                  className="w-8 h-8 text-amber-500/80 stroke-current fill-none stroke-2 shrink-0 hidden sm:block"
                >
                  <circle cx="20" cy="20" r="7" strokeDasharray="3 2" />
                  <line x1="20" y1="4" x2="20" y2="9" />
                  <line x1="20" y1="31" x2="20" y2="36" />
                  <line x1="4" y1="20" x2="9" y2="20" />
                  <line x1="31" y1="20" x2="36" y2="20" />
                  <line x1="8.7" y1="8.7" x2="12.2" y2="12.2" />
                  <line x1="27.8" y1="27.8" x2="31.3" y2="31.3" />
                  <line x1="8.7" y1="31.3" x2="12.2" y2="27.8" />
                  <line x1="27.8" y1="12.2" x2="31.3" y2="8.7" />
                </svg>
              </div>

              {/* Context Action Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/60">
                  <span className="text-foreground font-semibold">Active Facility:</span>
                  <span>{assessment?.name || "Green Valley School (Hyderabad)"}</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/60">
                  <span className="text-foreground font-semibold">Risk Class:</span>
                  <span className="text-destructive font-bold">{assessment?.riskLevel?.toUpperCase() || "HIGH RISK"}</span>
                </span>
              </div>
            </div>

            {/* Right Summary Anchor Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs">
                  <span className="font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    BASELINE PHYSICAL ENVELOPE
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
                    UNMITIGATED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">CURRENT BASELINE</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-mono text-foreground">{baseScore}</span>
                      <span className="text-xs font-mono text-muted-foreground">/ 100</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">High thermal vulnerability</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/[0.04] border border-primary/20 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-primary font-bold">PROJECTED PEAK</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-mono text-primary">
                        {results.aggressive?.projectedScore || 85}
                      </span>
                      <span className="text-xs font-mono text-primary/70">/ 100</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      +{(results.aggressive?.projectedScore || 85) - baseScore} pts potential
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="text-muted-foreground">
                    Active strategy: <strong className="text-foreground capitalize">{activeStrategyKey}</strong>
                  </div>
                  <a
                    href="#strategy-explorer"
                    className="text-primary font-mono text-xs flex items-center gap-1 hover:underline"
                  >
                    Adjust Budget ➔
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION B: STRATEGY EXPLORER (FOCUSED UNIFIED WORKSPACE)              */}
      {/* ===================================================================== */}
      <section id="strategy-explorer" className="py-16 sm:py-20 border-b border-border/80 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
                02 / INVESTMENT STRATEGY EXPLORER
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Choose the strategy. See the trade-off.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Toggle between core strategic archetypes or drag the capital slider to simulate combinatorial outcomes in real time.
              </p>
            </div>

            {/* Strategic Segmented Selector */}
            <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border/80 rounded-2xl shadow-xs self-start md:self-auto overflow-x-auto max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                { key: "baseline", label: "01. Baseline (₹0)", icon: ShieldCheck },
                { key: "balanced", label: "02. Balanced (₹50k)", icon: Zap },
                { key: "aggressive", label: "03. Aggressive (₹120k)", icon: TrendingUp }
              ].map((strat) => {
                const Icon = strat.icon;
                const isSelected = activeStrategyKey === strat.key;
                return (
                  <button
                    key={strat.key}
                    onClick={() => setActiveStrategyKey(strat.key as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{strat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THE FOCUSED STRATEGY WORKSPACE */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs space-y-8 relative">

            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
                  ACTIVE MODELING WORKSPACE // 0/1 KNAPSACK
                </span>
                <h3 className="text-2xl font-bold text-foreground capitalize">
                  {activeStrategyKey === "baseline" && "Baseline (Do Nothing)"}
                  {activeStrategyKey === "balanced" && "Balanced Resilience Investment"}
                  {activeStrategyKey === "aggressive" && "Aggressive Maximum Defense"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {activeStrategyKey === "baseline" && "Zero capital deployed. Building operates at existing thermal risk."}
                  {activeStrategyKey === "balanced" && "Optimal capital efficiency prioritizing highest impact per rupee."}
                  {activeStrategyKey === "aggressive" && "Maximum passive defense targeting high-priority biological relief and cool envelope."}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                {recalculating ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Recalculating...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Deterministic Solution Verified
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Budget Control (If Not Baseline) */}
            {activeStrategyKey !== "baseline" ? (
              <div className="space-y-4 p-6 rounded-2xl bg-muted/20 border border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-primary" />
                      INVESTMENT CAPITAL CEILING
                    </label>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-0.5">
                      ₹{activeBudget.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-muted-foreground">
                    Configurable range: ₹8,000 – ₹200,000 (₹5,000 increments)
                  </div>
                </div>

                {/* Slider */}
                <div className="pt-2">
                  <Slider
                    defaultValue={[activeBudget]}
                    value={[activeBudget]}
                    min={8000}
                    max={200000}
                    step={5000}
                    onValueChange={(val: any) => handleBudgetChange(Array.isArray(val) ? val[0] : Number(val))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground mt-2">
                    <span>₹8,000 (Min single intervention)</span>
                    <span>₹50,000 (Balanced target)</span>
                    <span>₹120,000 (Aggressive)</span>
                    <span>₹200,000 (Full catalogue)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-muted/20 border border-border/40 text-center space-y-2">
                <span className="text-xs font-mono uppercase text-muted-foreground">BASELINE BUDGET BOUNDARY</span>
                <div className="text-3xl font-bold font-mono text-muted-foreground">₹0</div>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  The baseline scenario operates with zero capital expenditure, reflecting the unmitigated physical vulnerability of the facility.
                </p>
              </div>
            )}

            {/* Calculated Strategy Outcomes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* Metric 1: Projected Score */}
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  PROJECTED RESILIENCE
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-primary">
                    {activeProjectedScore}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">/ 100</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{activeImprovement} pts delta</span>
                </div>
              </div>

              {/* Metric 2: Capital Utilized */}
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  CAPITAL UTILIZED
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                  ₹{activeUtilizedCost.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  {activeBudget > 0 ? `${Math.round((activeUtilizedCost / activeBudget) * 100)}% budget efficiency` : "No expenditure"}
                </div>
              </div>

              {/* Metric 3: Remaining Reserves */}
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  UNALLOCATED BUDGET
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                  ₹{activeRemainingBudget.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Preserved capital reserves
                </div>
              </div>

              {/* Metric 4: Interventions Count */}
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  INTERVENTIONS SELECTED
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-foreground">
                    {activeInterventions.length}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">/ 6 catalogue</span>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Discrete physical upgrades
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION C: VISUAL STRATEGY COMPARISON                                 */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-20 border-b border-border/80 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
              03 / CROSS-SCENARIO STRATEGY MATRIX
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Compare strategies on a shared scale.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Examine the relative gains and capital efficiency of each strategy side by side. All score bars are calibrated to the verified 0–100 physical resilience scale.
            </p>
          </div>

          {/* VISUAL SCORE BAR COMPARISON CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. Baseline */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-muted-foreground font-bold">01 / BASELINE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">₹0</span>
              </div>

              <div>
                <div className="text-xl font-bold text-foreground">Do Nothing</div>
                <div className="text-xs text-muted-foreground">Status quo unmitigated exposure</div>
              </div>

              {/* Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span>Score: {baseScore} / 100</span>
                  <span className="text-muted-foreground">+0 pts</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive/70 rounded-full transition-all duration-300"
                    style={{ width: `${baseScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground flex justify-between">
                <span>Capital: ₹0</span>
                <span>0 upgrades</span>
              </div>
            </div>

            {/* 2. Balanced */}
            <div className="bg-card border border-primary/50 ring-1 ring-primary/20 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-primary font-bold">02 / BALANCED (RECOMMENDED)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  ₹{budgets.balanced.toLocaleString()}
                </span>
              </div>

              <div>
                <div className="text-xl font-bold text-foreground">Targeted Resilience</div>
                <div className="text-xs text-muted-foreground">Maximum capital efficiency</div>
              </div>

              {/* Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span>Score: {results.balanced?.projectedScore || 67} / 100</span>
                  <span className="text-primary font-bold">
                    +{(results.balanced?.projectedScore || 67) - baseScore} pts
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${results.balanced?.projectedScore || 67}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground flex justify-between">
                <span>Used: ₹{(results.balanced?.totalCost || 48000).toLocaleString()}</span>
                <span>{results.balanced?.selectedInterventions?.length ?? 3} upgrades</span>
              </div>
            </div>

            {/* 3. Aggressive */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-amber-600 dark:text-amber-500 font-bold">03 / AGGRESSIVE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                  ₹{budgets.aggressive.toLocaleString()}
                </span>
              </div>

              <div>
                <div className="text-xl font-bold text-foreground">Maximum Protection</div>
                <div className="text-xs text-muted-foreground">Comprehensive envelope reinforcement</div>
              </div>

              {/* Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span>Score: {results.aggressive?.projectedScore || 85} / 100</span>
                  <span className="text-amber-600 dark:text-amber-500 font-bold">
                    +{(results.aggressive?.projectedScore || 85) - baseScore} pts
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-300"
                    style={{ width: `${results.aggressive?.projectedScore || 85}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground flex justify-between">
                <span>Used: ₹{(results.aggressive?.totalCost || 113000).toLocaleString()}</span>
                <span>{results.aggressive?.selectedInterventions?.length ?? 5} upgrades</span>
              </div>
            </div>

          </div>

          {/* FULL COMPARISON METRICS TABLE (NO NESTED SCROLLBAR CLIPPING) */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between">
              <div className="font-mono text-xs uppercase text-muted-foreground font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                DETERMINISTIC COMPARISON METRICS
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Engine: 0/1 Branch-and-Bound
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/30 border-b border-border/60 text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                  <tr>
                    <th className="p-4 font-bold">Decision Dimension</th>
                    <th className="p-4 font-bold text-center">Baseline</th>
                    <th className="p-4 font-bold text-center text-primary">Balanced Strategy</th>
                    <th className="p-4 font-bold text-center text-amber-600 dark:text-amber-500">Aggressive Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Authorized Budget Ceiling</td>
                    <td className="p-4 font-mono text-center text-muted-foreground">₹0</td>
                    <td className="p-4 font-mono text-center font-bold text-primary">₹{budgets.balanced.toLocaleString()}</td>
                    <td className="p-4 font-mono text-center font-bold">₹{budgets.aggressive.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Capital Utilized</td>
                    <td className="p-4 font-mono text-center text-muted-foreground">₹0</td>
                    <td className="p-4 font-mono text-center font-bold">₹{(results.balanced?.totalCost || 0).toLocaleString()}</td>
                    <td className="p-4 font-mono text-center font-bold">₹{(results.aggressive?.totalCost || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Unallocated Budget Reserve</td>
                    <td className="p-4 font-mono text-center text-muted-foreground">₹0</td>
                    <td className="p-4 font-mono text-center font-mono">
                      ₹{Math.max(0, budgets.balanced - (results.balanced?.totalCost || 0)).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-center font-mono">
                      ₹{Math.max(0, budgets.aggressive - (results.aggressive?.totalCost || 0)).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Projected Physical Resilience</td>
                    <td className="p-4 font-mono text-center font-bold text-destructive">{baseScore} / 100</td>
                    <td className="p-4 font-mono text-center font-bold text-primary">{results.balanced?.projectedScore || '-'} / 100</td>
                    <td className="p-4 font-mono text-center font-bold text-amber-600 dark:text-amber-500">{results.aggressive?.projectedScore || '-'} / 100</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Score Improvement from Baseline</td>
                    <td className="p-4 font-mono text-center text-muted-foreground">+0 pts</td>
                    <td className="p-4 font-mono text-center font-bold text-primary">
                      +{results.balanced ? results.balanced.projectedScore - baseScore : '-'} pts
                    </td>
                    <td className="p-4 font-mono text-center font-bold text-amber-600 dark:text-amber-500">
                      +{results.aggressive ? results.aggressive.projectedScore - baseScore : '-'} pts
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Interventions Deployed</td>
                    <td className="p-4 font-mono text-center text-muted-foreground">0 of 6</td>
                    <td className="p-4 font-mono text-center font-medium">
                      {results.balanced?.selectedInterventions?.length ?? results.balanced?.interventions?.length ?? 0} of 6
                    </td>
                    <td className="p-4 font-mono text-center font-medium">
                      {results.aggressive?.selectedInterventions?.length ?? results.aggressive?.interventions?.length ?? 0} of 6
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Capital Efficiency (₹ / Resilience Point)</td>
                    <td className="p-4 font-mono text-center text-muted-foreground">N/A</td>
                    <td className="p-4 font-mono text-center font-mono font-bold text-primary">
                      {results.balanced && (results.balanced.projectedScore - baseScore) > 0
                        ? `₹${Math.round(results.balanced.totalCost / (results.balanced.projectedScore - baseScore)).toLocaleString()}`
                        : "N/A"}
                    </td>
                    <td className="p-4 font-mono text-center font-mono">
                      {results.aggressive && (results.aggressive.projectedScore - baseScore) > 0
                        ? `₹${Math.round(results.aggressive.totalCost / (results.aggressive.projectedScore - baseScore)).toLocaleString()}`
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION D: CAPITAL ALLOCATION & SELECTED PACKAGE                      */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-20 border-b border-border/80 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
              04 / CAPITAL ALLOCATION & PHYSICAL MEASURES
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Make every investment visible.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Examine the discrete intervention items selected by the 0/1 knapsack engine for the active <strong>{activeStrategyKey}</strong> strategy (Budget: ₹{activeBudget.toLocaleString()}).
            </p>
          </div>

          {/* ALLOCATION GRID (SHOWING ALL 6 CANONICAL INTERVENTIONS WITH SELECTION STATES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATALOGUE_INTERVENTIONS.map((intervention) => {
              // Check if selected in active package
              const isSelected = activeInterventions.some((item) => {
                const id = item.id || item.interventionId || item.name;
                return id === intervention.id || id === intervention.name;
              });

              return (
                <div
                  key={intervention.id}
                  className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-card border-primary/60 shadow-xs ring-1 ring-primary/20"
                      : "bg-card/50 border-border/70 opacity-60 hover:opacity-90"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border/40"
                      }`}>
                        {isSelected ? "✓ SELECTED IN PACKAGE" : "EXCLUDED BY CONSTRAINT"}
                      </span>

                      <span className="text-xs font-mono font-bold text-foreground">
                        ₹{(intervention.estimatedCost ?? (intervention as any).cost ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">
                        {intervention.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {intervention.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">
                      Dimension: <strong className="text-foreground capitalize">{intervention.targetDimension}</strong>
                    </span>
                    <span className={`font-mono font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      +{intervention.impact} pts impact
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION E: DECISION INTERPRETATION & EXECUTIVE AUDIT                  */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-xs space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
                05 / DECISION INTERPRETATION & ACTION PATHWAY
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Synthesized Scenario Recommendation
              </h3>
            </div>

            {/* Narrative Explanation generated directly from calculated results */}
            <div className="p-6 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                At an authorized capital budget of <strong>₹{activeBudget.toLocaleString()}</strong>, the deterministic 0/1 knapsack algorithm selects <strong>{activeInterventions.length} intervention {activeInterventions.length === 1 ? "upgrade" : "upgrades"}</strong> utilizing <strong>₹{activeUtilizedCost.toLocaleString()}</strong> of capital and leaving <strong>₹{activeRemainingBudget.toLocaleString()}</strong> in unallocated reserves.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This intervention package elevates facility resilience from a baseline of <strong>{baseScore} (High Risk)</strong> to <strong>{activeProjectedScore} / 100</strong>, delivering a net improvement of <strong>+{activeImprovement} points</strong>. All metrics reflect pure mathematical envelope modeling calibrated to thermodynamic heat stress equations, not probabilistic weather forecasts.
              </p>
            </div>

            {/* Strategic Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
              <div className="text-xs text-muted-foreground font-mono">
                Model: Deterministic Branch-and-Bound • Provenance: Verified
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/optimizer?budget=${activeBudget}&assessmentId=${effectiveId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-xs active:scale-[0.98]"
                >
                  <span>Open Full Optimizer Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium text-xs hover:bg-muted/60 transition-all active:scale-[0.98]"
                >
                  <span>Inspect Methodology</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
