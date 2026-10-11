"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Beaker, Coins, Activity, ShieldCheck, CheckCircle2, ChevronRight,
  Info, Search, SlidersHorizontal, ArrowUpDown, Sparkles, ArrowRight,
  ExternalLink, Layers, Compass, Tag, Filter, Check, ShieldAlert,
  HelpCircle, RefreshCw, X, TrendingUp, Zap
} from "lucide-react";

import { fetchInterventions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AnimatedNumber, MOTION_TOKENS, pageContainerVariants,
  staggerListVariants, fadeUpItemVariants, buttonTapVariants
} from "@/lib/motion";

export interface InterventionItem {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedCost: number;
  cost?: number;
  impact: number;
  resilienceImpact?: number;
  targetDimension?: string;
  dimensionTarget?: string;
  constraints?: string[];
  notes?: string;
}

export default function InterventionLabPage() {
  const shouldReduceMotion = useReducedMotion();
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [selected, setSelected] = useState<InterventionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [provenance, setProvenance] = useState<string>("");
  const [activeSessionAssessmentId, setActiveSessionAssessmentId] = useState<string | null>(null);

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"default" | "cost-asc" | "cost-desc" | "impact-desc" | "efficiency-desc">("default");

  // Retrieve last assessment session ID if available
  useEffect(() => {
    try {
      const stored = window.localStorage?.getItem("heatcredit_last_assessment_id");
      if (stored) setActiveSessionAssessmentId(stored);
    } catch {
      // Storage access restrictions
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInterventions();
        const interventionsList: InterventionItem[] =
          data?.interventions || (Array.isArray(data) ? data : []);
        setInterventions(interventionsList);
        if (data?.provenance) setProvenance(data.provenance);
        if (interventionsList.length > 0) setSelected(interventionsList[0]);
      } catch (err) {
        console.error("Failed to load interventions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute dynamic summary metrics strictly from canonical dataset
  const summaryMetrics = useMemo(() => {
    if (interventions.length === 0) {
      return { totalCount: 0, minCost: 0, maxCost: 0, costRangeStr: "—", avgImpact: 0 };
    }
    const costs = interventions.map((i) => i.estimatedCost ?? i.cost ?? 0);
    const impacts = interventions.map((i) => i.impact ?? i.resilienceImpact ?? 0);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgImpact = Math.round(impacts.reduce((a, b) => a + b, 0) / impacts.length);
    const costRangeStr = `₹${Math.round(minCost / 1000)}k–${Math.round(maxCost / 1000)}k`;

    return {
      totalCount: interventions.length,
      minCost,
      maxCost,
      costRangeStr,
      avgImpact,
    };
  }, [interventions]);

  // Extract unique category tags
  const categories = useMemo(() => {
    const set = new Set<string>();
    interventions.forEach((inv) => {
      const cat = inv.category || inv.targetDimension || "General";
      set.add(cat.toLowerCase());
    });
    return ["ALL", ...Array.from(set)];
  }, [interventions]);

  // Filter and sort items
  const filteredInterventions = useMemo(() => {
    return interventions
      .filter((inv) => {
        const cat = (inv.category || inv.targetDimension || "").toLowerCase();
        const matchesCategory = selectedCategory === "ALL" || cat === selectedCategory.toLowerCase();
        const matchesSearch =
          searchQuery.trim() === "" ||
          inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inv.targetDimension && inv.targetDimension.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const costA = a.estimatedCost ?? a.cost ?? 0;
        const costB = b.estimatedCost ?? b.cost ?? 0;
        const impactA = a.impact ?? a.resilienceImpact ?? 0;
        const impactB = b.impact ?? b.resilienceImpact ?? 0;
        const effA = costA > 0 ? (impactA / costA) * 10000 : 0;
        const effB = costB > 0 ? (impactB / costB) * 10000 : 0;

        switch (sortBy) {
          case "cost-asc":
            return costA - costB;
          case "cost-desc":
            return costB - costA;
          case "impact-desc":
            return impactB - impactA;
          case "efficiency-desc":
            return effB - effA;
          default:
            return 0;
        }
      });
  }, [interventions, selectedCategory, searchQuery, sortBy]);

  // Helper for formatting target dimension label
  const formatDimension = (dim?: string) => {
    if (!dim) return "General Subsystem";
    return dim.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="min-h-full bg-background font-sans text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-foreground">

      {/* ENGINEERING GRID BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#19734f0d_1px,transparent_1px),linear-gradient(to_bottom,#19734f0d_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-9 space-y-6 sm:space-y-7 relative z-10">

        {/* 1. EDITORIAL PAGE HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-4 border-b border-border/40"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>DECISION LABORATORY</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground font-mono">
                {summaryMetrics.totalCount} Interventions
              </span>
              {provenance && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground font-mono">{provenance}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Intervention Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Compare resilience investments before committing capital.
            </p>
          </div>

          {/* ACTIVE OPTIMIZER QUICK LINK */}
          <div className="shrink-0 flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-card hover:bg-muted/50 border-border/60"
              asChild
            >
              <Link href="/methodology">
                <Info className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span>Model Methodology</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="text-xs font-semibold shadow-xs"
              asChild
            >
              <Link href={activeSessionAssessmentId ? `/optimizer/${activeSessionAssessmentId}` : `/optimizer/demo-school-hyderabad`}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                <span>Launch Optimizer</span>
              </Link>
            </Button>
          </div>
        </motion.header>

        {/* 2. SUMMARY STRIP (DYNAMIC CATALOGUE METRICS) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* Metric 1: Total Catalogue Options */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Catalogue
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums">
              0{summaryMetrics.totalCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Available options</div>
          </div>

          {/* Metric 2: Cost Range */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Cost Range
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
              {summaryMetrics.costRangeStr}
            </div>
            <div className="text-[11px] text-muted-foreground">Catalogue range</div>
          </div>

          {/* Metric 3: Selected Item Preview */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Selected
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-primary tabular-nums">
              {selected ? "01" : "00"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
              {selected ? selected.name : "None selected"}
            </div>
          </div>

          {/* Metric 4: Average Lift */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Avg Impact Lift
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-primary tabular-nums">
              +{summaryMetrics.avgImpact}
              <span className="text-xs font-normal text-muted-foreground font-sans"> pts</span>
            </div>
            <div className="text-[11px] text-muted-foreground">Per measure</div>
          </div>
        </motion.div>

        {/* 3. SEARCH, FILTER & SORT BAR */}
        <div className="p-3 bg-card border border-border/60 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Search Field & Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search interventions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background/80 border-border/60 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat.toUpperCase())}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Sort Control */}
          <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border/40">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-foreground cursor-pointer focus:outline-hidden border-b border-border/60 py-0.5 pr-4"
            >
              <option value="default">Default Order</option>
              <option value="impact-desc">Highest Impact (+pts)</option>
              <option value="cost-asc">Lowest Cost (INR)</option>
              <option value="cost-desc">Highest Cost (INR)</option>
              <option value="efficiency-desc">Best Capital Efficiency</option>
            </select>
          </div>
        </div>

        {/* 4. MAIN WORKSPACE (2 COLUMNS: CATALOGUE ~62% + INSPECTOR ~38%) */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 font-mono text-sm text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span>INITIALIZING CANONICAL CATALOGUE...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] gap-6 lg:gap-8 items-start">

            {/* LEFT COLUMN: INTERVENTION CATALOGUE */}
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                <span className="font-semibold text-foreground">
                  Intervention Catalogue ({filteredInterventions.length})
                </span>
                <span className="text-[11px] font-mono">
                  Select a measure to inspect details
                </span>
              </div>

              {filteredInterventions.length === 0 ? (
                <div className="p-12 text-center bg-card border border-border/60 rounded-xl space-y-2">
                  <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                  <div className="font-semibold text-sm text-foreground">No matching interventions</div>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try clearing the search input or resetting category filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                    className="mt-2 text-xs"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <motion.div
                  variants={staggerListVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2.5"
                >
                  {filteredInterventions.map((inv) => {
                    const isSelected = selected?.id === inv.id;
                    const cost = inv.estimatedCost ?? inv.cost ?? 0;
                    const impact = inv.impact ?? inv.resilienceImpact ?? 0;
                    const efficiency = cost > 0 ? ((impact / cost) * 10000).toFixed(1) : "0.0";
                    const categoryLabel = inv.category || inv.targetDimension || "General";

                    return (
                      <motion.div
                        key={inv.id}
                        variants={fadeUpItemVariants}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => setSelected(inv)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(inv);
                          }
                        }}
                        className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-xs border-l-4 border-l-primary"
                            : "bg-card border-border/60 hover:border-primary/40 hover:bg-muted/15 hover:shadow-2xs"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                          {/* Left Details */}
                          <div className="space-y-1.5 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {inv.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono capitalize py-0 px-1.5 h-4 bg-background border-border/60"
                              >
                                {categoryLabel}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                              {inv.description}
                            </p>
                            <div className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1.5 pt-0.5">
                              <span>Target:</span>
                              <span className="font-semibold text-foreground">
                                {formatDimension(inv.targetDimension)}
                              </span>
                            </div>
                          </div>

                          {/* Right Numerical Figures */}
                          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                            {/* Cost */}
                            <div className="text-left sm:text-right">
                              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                                Cost
                              </div>
                              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums">
                                ₹{cost.toLocaleString()}
                              </div>
                            </div>

                            {/* Impact */}
                            <div className="text-center sm:text-right min-w-[50px]">
                              <div className="text-[10px] uppercase font-bold text-primary">
                                Impact
                              </div>
                              <div className="font-mono text-sm sm:text-base font-bold text-primary tabular-nums">
                                +{impact} pts
                              </div>
                            </div>

                            {/* Efficiency Pill */}
                            <div className="text-right hidden sm:block min-w-[70px]">
                              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                                Efficiency
                              </div>
                              <Badge
                                variant="outline"
                                className="font-mono text-[9px] py-0 px-1.5 h-4 bg-background border-border/60 tabular-nums"
                              >
                                {efficiency} pt/₹10k
                              </Badge>
                            </div>

                            {/* Selected Indicator */}
                            <div className="pl-1">
                              {isSelected ? (
                                <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* RIGHT COLUMN: SELECTED-INTERVENTION INSPECTOR (STICKY ON DESKTOP) */}
            <div className="lg:sticky lg:top-6 space-y-4 min-w-0">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
                  >
                    {/* Inspector Eyebrow & Title */}
                    <div className="space-y-1.5 border-b border-border/40 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Selected Intervention</span>
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono capitalize bg-muted"
                        >
                          {selected.category || selected.targetDimension || "General"}
                        </Badge>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {selected.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Investment details, physical mechanism, expected benefits, and allocation model.
                      </p>
                    </div>

                    {/* Metric Cards (CAPEX, Impact, Efficiency) */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Capital Cost */}
                      <div className="p-3.5 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          <span>Capital Cost</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
                          <AnimatedNumber
                            value={selected.estimatedCost ?? selected.cost ?? 0}
                            prefix="₹"
                            formatLocale
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Fixed expenditure
                        </div>
                      </div>

                      {/* Model Impact */}
                      <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                        <div className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>Model Impact</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold font-mono text-primary tabular-nums">
                          <AnimatedNumber
                            value={selected.impact ?? selected.resilienceImpact ?? 0}
                            prefix="+"
                            suffix=" pts"
                          />
                        </div>
                        <div className="text-[10px] text-primary/80 font-mono">
                          Score improvement
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 text-xs">
                      <h3 className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5" />
                        <span>Description</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed bg-muted/10 p-3 rounded-xl border border-border/30">
                        {selected.description}
                      </p>
                    </div>

                    {/* Expected Benefits */}
                    <div className="space-y-2 text-xs pt-1">
                      <h3 className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Expected Benefits & Mechanism</span>
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 bg-card p-2.5 rounded-lg border border-border/40">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground text-[11px] leading-relaxed">
                            Directly remediates deficit in the{" "}
                            <strong className="text-foreground font-semibold">
                              {formatDimension(selected.targetDimension)}
                            </strong>{" "}
                            dimension of the resilience scoring engine.
                          </span>
                        </li>
                        {selected.notes && (
                          <li className="flex items-start gap-2 bg-card p-2.5 rounded-lg border border-border/40">
                            <Zap className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-[11px] leading-relaxed">
                              {selected.notes}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Target Dimension & Model Provenance */}
                    <div className="pt-2 border-t border-border/40 flex flex-col gap-1 text-[11px] text-muted-foreground font-mono">
                      <div className="flex justify-between items-center">
                        <span>Target Subsystem:</span>
                        <span className="text-foreground font-semibold">
                          {formatDimension(selected.targetDimension)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Capital Efficiency:</span>
                        <span className="text-foreground font-semibold">
                          {selected.estimatedCost
                            ? ((selected.impact / selected.estimatedCost) * 10000).toFixed(1)
                            : "0.0"}{" "}
                          pt / ₹10k
                        </span>
                      </div>
                    </div>

                    {/* Action Button: Optimizer Handoff */}
                    <div className="pt-2">
                      <Button
                        className="w-full text-xs font-semibold h-10 shadow-xs hover:shadow transition-all group"
                        asChild
                      >
                        <Link
                          href={
                            activeSessionAssessmentId
                              ? `/optimizer/${activeSessionAssessmentId}`
                              : `/optimizer/demo-school-hyderabad`
                          }
                        >
                          <span>Simulate in Knapsack Optimizer</span>
                          <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-card border border-border/60 rounded-2xl p-8 text-center space-y-3">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                    <div className="font-semibold text-sm">No Intervention Selected</div>
                    <p className="text-xs text-muted-foreground">
                      Click any measure in the catalogue to inspect its capital requirements, model lift, and physical benefits.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
