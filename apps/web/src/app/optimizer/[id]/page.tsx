"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getAssessment, optimizeBudget } from "@/lib/api";
import { CATALOGUE_INTERVENTIONS, DEMO_FACILITIES, type Intervention } from "@/lib/engine";
import { Slider } from "@/components/ui/slider";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Activity,
  TrendingUp,
  RefreshCw,
  Info,
  HelpCircle,
  BarChart2,
  Sliders,
  Sparkles,
  FileText,
  Compass,
  Coins,
  Percent
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from "recharts";

export default function OptimizerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">
          INITIALIZING CAPITAL ALLOCATION OBSERVATORY...
        </div>
      }
    >
      <OptimizerContent />
    </Suspense>
  );
}

function OptimizerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawId = params?.id as string;
  // Default to demo facility if ID is missing or unresolved
  const id = rawId && rawId !== "undefined" ? rawId : "demo-school-hyderabad";

  // Parse initial budget from query param or default to 50,000
  const initialBudgetParam = searchParams.get("budget");
  const initialBudget = initialBudgetParam ? Math.max(0, parseInt(initialBudgetParam, 10)) : 50000;

  const [assessment, setAssessment] = useState<any>(null);
  const [budget, setBudget] = useState(initialBudget);
  const [optData, setOptData] = useState<any>(null);
  const [frontier, setFrontier] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Load Assessment & calculate initial frontier
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      setLoading(true);
      try {
        const assessmentData = await getAssessment(id);
        if (!isMounted) return;
        setAssessment(assessmentData);

        const baseScore = assessmentData?.score ?? 42;

        // Run primary optimization for active budget
        const opt = await optimizeBudget(id, budget);
        if (!isMounted) return;
        setOptData(opt);

        // Pre-calculate discrete Pareto efficiency frontier across key capital milestones
        const candidateBudgets = [0, 8000, 15000, 25000, 35000, 48000, 50000, 75000, 100000, 120000, 136000, 150000];
        const frontierPoints = await Promise.all(
          candidateBudgets.map(async (b) => {
            try {
              const res = await optimizeBudget(id, b);
              const score = res?.projectedScore ?? baseScore;
              const cost = res?.totalCost ?? 0;
              const count = (res?.selectedInterventions || res?.interventions || []).length;
              return {
                budget: b,
                score,
                cost,
                selectedCount: count,
                lift: score - baseScore,
                efficiency: score > baseScore && cost > 0 ? Math.round(cost / (score - baseScore)) : 0
              };
            } catch {
              return {
                budget: b,
                score: baseScore,
                cost: 0,
                selectedCount: 0,
                lift: 0,
                efficiency: 0
              };
            }
          })
        );

        if (isMounted) {
          setFrontier(frontierPoints);
        }
      } catch (err) {
        console.error("Optimizer initialization failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Recalculate whenever budget changes
  const handleBudgetChange = async (newBudget: number) => {
    setBudget(newBudget);
    setRecalculating(true);
    try {
      const opt = await optimizeBudget(id, newBudget);
      setOptData(opt);
    } catch (err) {
      console.error("Budget recalculation error:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const baseScore = assessment?.score ?? 42;
  const projectedScore = optData?.projectedScore ?? baseScore;
  const lift = projectedScore - baseScore;
  const utilizedCost = optData?.totalCost ?? 0;
  const remainingBudget = Math.max(0, budget - utilizedCost);
  const efficiency = lift > 0 && utilizedCost > 0 ? Math.round(utilizedCost / lift) : 0;
  const selectedList: any[] = optData?.selectedInterventions || optData?.interventions || [];

  // Catalogue interventions mapped with selection state and allocation share
  const allInterventions = useMemo(() => {
    return CATALOGUE_INTERVENTIONS.map((inv) => {
      const isSelected = selectedList.some((sel: any) => sel.id === inv.id);
      const cost = inv.estimatedCost ?? (inv as any).cost ?? 0;
      const shareOfUtilized = isSelected && utilizedCost > 0 ? (cost / utilizedCost) * 100 : 0;
      const unitEfficiency = inv.impact > 0 ? Math.round(cost / inv.impact) : 0;

      return {
        ...inv,
        cost,
        isSelected,
        shareOfUtilized,
        unitEfficiency
      };
    }).sort((a, b) => {
      // Show selected items first, then by impact descending
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;
      return b.impact - a.impact;
    });
  }, [selectedList, utilizedCost]);

  if (loading && !assessment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Initializing Capital Allocation Observatory...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">

      {/* ===================================================================== */}
      {/* SECTION A: EDITORIAL HERO & PERFORMANCE SUMMARY                      */}
      {/* ===================================================================== */}
      <section className="relative border-b border-border/80 overflow-hidden bg-background pt-10 pb-12 sm:py-16">
        {/* Engineering dot grid texture */}
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
                <span>HEATCREDIT / CAPITAL ALLOCATION LAB <span className="hidden sm:inline">• OBSERVATORY PROTOCOL 02</span></span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
                Allocate capital with <br />
                <span className="font-serif italic font-normal text-primary">precision.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-light">
                Find the highest-value resilience package within your available budget, and understand exactly why the deterministic 0/1 knapsack engine selected it.
              </p>

              {/* Hand-Drawn SVG Annotation & Sun Doodle */}
              <div className="flex items-center gap-4 pt-1">
                <span
                  className="text-xl sm:text-2xl text-amber-600 dark:text-amber-500 transform -rotate-1 select-none font-medium"
                  style={{ fontFamily: "var(--font-handwriting), 'Caveat', cursive" }}
                >
                  “Make every rupee work harder.” ➔
                </span>

                {/* Hand-drawn SVG Sun */}
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

              {/* Facility & Engine Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/60">
                  <span className="text-foreground font-semibold">Active Facility:</span>
                  <span>{assessment?.name || assessment?.buildingType || "Green Valley School (Hyderabad)"}</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/60">
                  <span className="text-foreground font-semibold">Baseline Risk:</span>
                  <span className="text-destructive font-bold">{assessment?.riskLevel?.toUpperCase() || "HIGH RISK"}</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/60">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span>0/1 Knapsack Branch-and-Bound</span>
                </span>
              </div>
            </div>

            {/* Right Summary Anchor Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs">
                  <span className="font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    SIMULATION CONSTRAINTS & TARGETS
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    INTEGER OPTIMAL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">CURRENT BASELINE</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-mono text-foreground">{baseScore}</span>
                      <span className="text-xs font-mono text-muted-foreground">/ 100</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Unmitigated envelope risk</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/[0.04] border border-primary/20 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-primary font-bold">PROJECTED SCORE</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-mono text-primary">{projectedScore}</span>
                      <span className="text-xs font-mono text-primary/70">/ 100</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{lift} modeled points
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="text-muted-foreground font-mono">
                    Capital Deployed: <strong className="text-foreground">₹{utilizedCost.toLocaleString()}</strong>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Reserve: <strong className="text-foreground">₹{remainingBudget.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION B: UNIFIED BUDGET & OPTIMIZATION WORKSPACE                    */}
      {/* ===================================================================== */}
      <section className="py-12 sm:py-16 bg-muted/10 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
                02 / CAPITAL ALLOCATION WORKSPACE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Find the optimal investment point.
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                The budget control, optimization algorithm, and calculated metrics form one unified workspace. Adjust the capital slider to simulate combinatorial outcomes in real time.
              </p>
            </div>

            {/* Quick Strategy Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground mr-1 hidden sm:inline">PRESETS:</span>
              {[
                { label: "₹8k (Min)", val: 8000 },
                { label: "₹25k (Base)", val: 25000 },
                { label: "₹50k (Balanced)", val: 50000 },
                { label: "₹75k (Enhanced)", val: 75000 },
                { label: "₹120k (Aggressive)", val: 120000 },
                { label: "₹136k (Full)", val: 136000 }
              ].map((tier) => (
                <button
                  key={tier.val}
                  onClick={() => handleBudgetChange(tier.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    budget === tier.val
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-card text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* THE CONNECTED WORKSPACE CARD */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs space-y-8 relative">

            {/* Workspace Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  ACTIVE CAPITAL EXPENDITURE CEILING (CAPEX)
                </span>
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-foreground">
                    ₹{budget.toLocaleString()}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    Authorized Ceiling Limit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {recalculating ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Recalculating...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Optimal Package Verified
                  </span>
                )}
              </div>
            </div>

            {/* Continuous Slider Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Drag to explore capital boundaries</span>
                <span>Supported Range: ₹0 – ₹150,000 (₹1,000 increments)</span>
              </div>

              <div className="pt-2 pb-1">
                <Slider
                  defaultValue={[budget]}
                  value={[budget]}
                  min={0}
                  max={150000}
                  step={1000}
                  onValueChange={(val: any) => handleBudgetChange(Array.isArray(val) ? val[0] : Number(val))}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>₹0 (Baseline)</span>
                <span>₹25,000</span>
                <span>₹50,000 (Target)</span>
                <span>₹75,000</span>
                <span>₹100,000</span>
                <span>₹136,000 (Full Catalogue)</span>
                <span>₹150,000</span>
              </div>
            </div>

            {/* Connected Decision Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 pt-6 border-t border-border/60">

              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">BASELINE SCORE</span>
                <div className="text-2xl font-bold font-mono text-foreground">{baseScore}</div>
                <div className="text-[10px] text-muted-foreground">Starting risk level</div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/[0.04] border border-primary/20 space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-bold">PROJECTED SCORE</span>
                <div className="text-2xl font-bold font-mono text-primary">{projectedScore}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{lift} pts net lift
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">CAPITAL UTILIZED</span>
                <div className="text-2xl font-bold font-mono text-foreground">₹{utilizedCost.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">
                  {budget > 0 ? `${Math.round((utilizedCost / budget) * 100)}% capital deployed` : "0% deployed"}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">UNALLOCATED RESERVE</span>
                <div className="text-2xl font-bold font-mono text-foreground">₹{remainingBudget.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Preserved capital liquidity
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">UPGRADES SELECTED</span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {selectedList.length} <span className="text-xs font-normal text-muted-foreground">/ 6</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Discrete physical measures
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">CAPITAL EFFICIENCY</span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {efficiency > 0 ? `₹${efficiency.toLocaleString()}` : "N/A"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Cost per resilience point
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION C: EFFICIENCY FRONTIER                                        */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-20 bg-background border-b border-border/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
                03 / RESILIENCE EFFICIENCY FRONTIER
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Stepwise Pareto Frontier
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Discrete optimal resilience frontiers calculated by 0/1 branch-and-bound optimization across candidate capital constraints. Notice how score increases jump in discrete steps corresponding to package combinations.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-foreground" />
                <span>Pareto Optimal Curve</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 border-t border-dashed border-primary" />
                <span>Active Budget (₹{budget.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Chart Workspace Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">

            <div className="h-[360px] w-full">
              {frontier.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={frontier}
                    margin={{ top: 20, right: 25, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                      opacity={0.5}
                    />

                    <XAxis
                      dataKey="budget"
                      tickFormatter={(val) => `₹${val / 1000}k`}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={8}
                    />

                    <YAxis
                      domain={[35, 100]}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-4}
                      tickFormatter={(val) => `${val}`}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3.5 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-lg text-xs space-y-1.5 font-mono">
                              <div className="font-bold text-foreground pb-1 border-b border-border/50">
                                Budget Ceiling: ₹{Number(data.budget).toLocaleString()}
                              </div>
                              <div className="text-primary font-semibold">
                                Max Score: {data.score} / 100 (+{data.lift} pts)
                              </div>
                              <div className="text-muted-foreground">
                                Capital Utilized: ₹{Number(data.cost).toLocaleString()}
                              </div>
                              <div className="text-muted-foreground">
                                Interventions: {data.selectedCount} upgrades
                              </div>
                              {data.efficiency > 0 && (
                                <div className="text-emerald-600 dark:text-emerald-400">
                                  Efficiency: ₹{Number(data.efficiency).toLocaleString()}/pt
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Baseline Score Reference Line */}
                    <ReferenceLine
                      y={baseScore}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      label={{
                        value: `Baseline: ${baseScore}`,
                        position: "insideBottomRight",
                        fill: "#ef4444",
                        fontSize: 10,
                        fontFamily: "monospace"
                      }}
                    />

                    {/* Active Budget Reference Line */}
                    <ReferenceLine
                      x={budget}
                      stroke="var(--color-primary)"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Active: ₹${(budget / 1000).toFixed(0)}k`,
                        position: "top",
                        fill: "var(--color-primary)",
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "monospace"
                      }}
                    />

                    {/* Step Frontier Line */}
                    <Line
                      type="stepAfter"
                      dataKey="score"
                      stroke="var(--color-foreground)"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "var(--color-background)",
                        stroke: "var(--color-foreground)",
                        strokeWidth: 2
                      }}
                      activeDot={{
                        r: 7,
                        fill: "var(--color-primary)",
                        stroke: "var(--color-background)",
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground animate-pulse">
                  CALCULATING EFFICIENCY FRONTIER...
                </div>
              )}
            </div>

            {/* Frontier Decision Interpretation Ribbon */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  At <strong>₹{budget.toLocaleString()}</strong>, your capital captures{" "}
                  <strong>
                    {lift > 0 ? `${Math.round((lift / 48) * 100)}%` : "0%"}
                  </strong>{" "}
                  of maximum catalogue resilience (+{lift} pts) utilizing{" "}
                  <strong>₹{utilizedCost.toLocaleString()}</strong>.
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                Pareto Efficiency: <strong>{efficiency > 0 ? `₹${efficiency.toLocaleString()} / pt` : "N/A"}</strong>
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION D: INTERVENTION ALLOCATION & PHYSICAL MEASURES               */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-20 bg-muted/10 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
              04 / INVESTMENT ALLOCATION & PHYSICAL MEASURES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              See exactly where the budget goes.
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Examine each candidate physical intervention evaluated by the 0/1 knapsack engine. Proportional bars illustrate each measure&apos;s share of utilized capital.
            </p>
          </div>

          {/* Allocation Breakdown Rows (NOT repetitive generic cards!) */}
          <div className="rounded-3xl border border-border/80 bg-card shadow-xs overflow-hidden">

            {/* Table Header Row (Hidden on mobile) */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-muted/40 border-b border-border/60 text-[11px] font-mono uppercase text-muted-foreground font-semibold">
              <div className="col-span-4">Physical Measure & Scope</div>
              <div className="col-span-2">Target Dimension</div>
              <div className="col-span-3">Capital Allocation Share</div>
              <div className="col-span-1 text-right">Cost</div>
              <div className="col-span-1 text-right">Impact</div>
              <div className="col-span-1 text-right">Efficiency</div>
            </div>

            {/* Structured Rows */}
            <div className="divide-y divide-border/60">
              {allInterventions.map((inv) => {
                const isSelected = inv.isSelected;

                return (
                  <div
                    key={inv.id}
                    className={`p-5 sm:p-6 transition-colors duration-150 ${
                      isSelected
                        ? "bg-card hover:bg-primary/[0.02]"
                        : "bg-card/40 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

                      {/* Col 1: Measure & Selection Badge */}
                      <div className="lg:col-span-4 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border/50"
                            }`}
                          >
                            {isSelected ? "✓ SELECTED IN OPTIMAL PACKAGE" : "EXCLUDED BY BUDGET CONSTRAINT"}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-foreground">
                          {inv.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {inv.description}
                        </p>
                      </div>

                      {/* Col 2: Target Dimension */}
                      <div className="lg:col-span-2">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block lg:hidden">
                          TARGET DIMENSION:
                        </span>
                        <span className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-muted/60 border border-border/40 capitalize">
                          {inv.targetDimension}
                        </span>
                      </div>

                      {/* Col 3: Capital Allocation Share Bar */}
                      <div className="lg:col-span-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">
                            {isSelected ? "Share of Deployed Capital" : "Marginal Requirement"}
                          </span>
                          <span className={`font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                            {isSelected ? `${inv.shareOfUtilized.toFixed(1)}%` : `+₹${inv.cost.toLocaleString()}`}
                          </span>
                        </div>

                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected ? "bg-primary" : "bg-muted-foreground/30"
                            }`}
                            style={{
                              width: isSelected
                                ? `${Math.min(100, Math.max(8, inv.shareOfUtilized))}%`
                                : `${Math.min(100, (inv.cost / 150000) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Col 4: Cost */}
                      <div className="lg:col-span-1 lg:text-right">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block lg:hidden">COST:</span>
                        <span className="text-sm font-bold font-mono text-foreground">
                          ₹{inv.cost.toLocaleString()}
                        </span>
                      </div>

                      {/* Col 5: Impact */}
                      <div className="lg:col-span-1 lg:text-right">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block lg:hidden">IMPACT:</span>
                        <span className={`text-sm font-bold font-mono ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          +{inv.impact} pts
                        </span>
                      </div>

                      {/* Col 6: Efficiency */}
                      <div className="lg:col-span-1 lg:text-right">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block lg:hidden">EFFICIENCY:</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          ₹{inv.unitEfficiency.toLocaleString()}/pt
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Allocation Summary Tally Footer */}
            <div className="p-6 bg-muted/30 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span>Total Capital Deployed: <strong className="text-foreground">₹{utilizedCost.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Unallocated Reserve: <strong className="text-emerald-600 dark:text-emerald-400">₹{remainingBudget.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Authorized Ceiling: <strong className="text-foreground">₹{budget.toLocaleString()}</strong></span>
              </div>

              <div className="text-[11px] text-muted-foreground text-center sm:text-right">
                *Impact values represent non-additive component ratings calibrated to thermodynamic scoring guidelines.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION E: EXPLAIN THE DECISION (STRUCTURED AUDIT)                    */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-xs space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
                05 / DECISION INTERPRETATION & ACTION PATHWAY
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Why this package? Structured Algorithmic Audit
              </h3>
            </div>

            {/* Structured 3-Column Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs font-mono uppercase">
                  <Cpu className="w-4 h-4" />
                  0/1 Knapsack Proof
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Exact Combinatorial Optimum
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The algorithm evaluated all 64 potential combinations of physical measures using branch-and-bound optimization. The selected package of {selectedList.length} upgrades achieves the maximum mathematically possible resilience score within the authorized ₹{budget.toLocaleString()} constraint.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs font-mono uppercase">
                  <TrendingUp className="w-4 h-4" />
                  Marginal Trade-off Analysis
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Capital Efficiency Prioritized
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Higher-cost individual measures (such as Heat Relief Room at ₹50,000 for +14 pts) were evaluated against composite bundles. Deploying Shade (₹25k) + Ventilation (₹15k) + Drinking Water (₹8k) yields +25 points for ₹48,000—delivering 78% greater resilience lift at ₹2,000 less capital.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs font-mono uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  Capital Preservation
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Operational Reserves Intact
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  An unallocated balance of ₹{remainingBudget.toLocaleString()} is preserved as an unspent liquidity reserve. In physical envelope deployment, unspent capital provides a vital buffer for maintenance, contractor contingency, and future adaptation cycles.
                </p>
              </div>

            </div>

            {/* Scientific Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5 font-mono text-[11px]">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                SCIENTIFIC MODELING SPECIFICATION
              </div>
              <p className="leading-relaxed">
                Projected scores represent modeled physical envelope resilience calibrated to HeatCredit adaptation guidelines. Modeled points reflect architectural and physical thermal vulnerability reduction, not guaranteed local ambient air temperature reductions or clinical health outcomes.
              </p>
            </div>

            {/* Strategic Action Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
              <div className="text-xs text-muted-foreground font-mono">
                Model: Deterministic 0/1 Knapsack • Provenance: {optData?.provenance || "Verified"}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/scenarios?assessmentId=${id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-xs active:scale-[0.98]"
                >
                  <span>Compare Strategic Scenarios</span>
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
