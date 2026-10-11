"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, ArrowRight, ArrowUpRight, ChevronDown, CheckCircle2,
  AlertTriangle, Sun, Droplets, Wind, Layers, Activity, Cpu,
  Database, HelpCircle, Info, ExternalLink, Sparkles, Filter,
  Compass, Thermometer, ShieldAlert, BarChart3, Sliders, Check,
  X, Clock, MapPin, Gauge, Lock, Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DIMENSION_WEIGHTS,
  type RoofType,
  type RoofCondition,
  type VentilationLevel,
  type WaterAccessLevel,
  type ReliefSpaceLevel,
  type RiskLevel,
} from "@/lib/engine";

// Canonical Interventions Dataset for the interactive optimization lab
const CANONICAL_INTERVENTIONS = [
  {
    id: "shade",
    name: "Shade Structure",
    category: "Perimeter Canopy",
    estimatedCost: 25000,
    impact: 11,
    targetDimension: "shade",
    description: "Pergolas, tensile canopies, or shade sails over key exterior pedestrian areas.",
    efficiency: "4.4 pt/₹10k",
  },
  {
    id: "water",
    name: "Drinking Water Station",
    category: "Hydration Asset",
    estimatedCost: 8000,
    impact: 6,
    targetDimension: "waterAccess",
    description: "Chilled or ambient hydration station supporting thermal recovery during midday heat.",
    efficiency: "7.5 pt/₹10k",
  },
  {
    id: "ventilation",
    name: "Ventilation Upgrade",
    category: "Airflow Dynamics",
    estimatedCost: 15000,
    impact: 8,
    targetDimension: "ventilation",
    description: "Ceiling fans, louvers, and cross-ventilation openings to evacuate trapped heat.",
    efficiency: "5.3 pt/₹10k",
  },
  {
    id: "green",
    name: "Green Coverage",
    category: "Vegetative Buffer",
    estimatedCost: 20000,
    impact: 7,
    targetDimension: "greenInfrastructure",
    description: "Native tree planting and vertical vegetative shading for microclimate cooling.",
    efficiency: "3.5 pt/₹10k",
  },
  {
    id: "roof",
    name: "Reflective Roof Treatment",
    category: "Solar Barrier",
    estimatedCost: 18000,
    impact: 9,
    targetDimension: "thermalProtection",
    description: "High-albedo solar reflective coating (SRI > 80) to reject radiant rooftop energy.",
    efficiency: "5.0 pt/₹10k",
  },
  {
    id: "relief",
    name: "Heat Relief Room",
    category: "Safe Haven",
    estimatedCost: 50000,
    impact: 14,
    targetDimension: "reliefCapacity",
    description: "Dedicated air-conditioned or passive recovery room for emergency heat stress shelter.",
    efficiency: "2.8 pt/₹10k",
  },
];

// Roof factors from canonical scoring engine
const ROOF_TYPE_FACTORS: Record<RoofType, { label: string; factor: number }> = {
  metal: { label: "Corrugated Metal", factor: 0.35 },
  thatched: { label: "Thatched / Biomass", factor: 0.50 },
  concrete: { label: "RCC Flat Concrete", factor: 0.65 },
  tile: { label: "Clay / Mangalore Tile", factor: 0.80 },
  green: { label: "Vegetated Green Roof", factor: 1.00 },
};

const ROOF_CONDITION_FACTORS: Record<RoofCondition, { label: string; factor: number }> = {
  poor: { label: "Poor / Degraded", factor: 0.30 },
  fair: { label: "Fair / Weathered", factor: 0.65 },
  good: { label: "Good / Intact", factor: 0.85 },
  excellent: { label: "Excellent / Insulated", factor: 1.00 },
};

export default function MethodologyPage() {
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState<string>("scoring-model");

  // State for interactive Thermal Protection calculator
  const [selectedRoofType, setSelectedRoofType] = useState<RoofType>("concrete");
  const [selectedRoofCondition, setSelectedRoofCondition] = useState<RoofCondition>("fair");

  // State for interactive Dimension Explorer
  const [activeDimension, setActiveDimension] = useState<string>("shade");

  // State for interactive Risk Threshold scale
  const [simulatedScore, setSimulatedScore] = useState<number>(42);

  // State for interactive Knapsack Optimizer Lab
  const [simulatedBudget, setSimulatedBudget] = useState<number>(50000);

  // Calculate thermal protection score
  const calculatedThermalScore = useMemo(() => {
    const typeF = ROOF_TYPE_FACTORS[selectedRoofType].factor;
    const condF = ROOF_CONDITION_FACTORS[selectedRoofCondition].factor;
    const combined = typeF * 0.6 + condF * 0.4;
    return Math.round(combined * 25 * 10) / 10;
  }, [selectedRoofType, selectedRoofCondition]);

  // Exact 0/1 Knapsack resolution over canonical interventions
  const knapsackResult = useMemo(() => {
    const n = CANONICAL_INTERVENTIONS.length;
    let bestPackage: typeof CANONICAL_INTERVENTIONS = [];
    let bestImpact = 0;
    let bestCost = Infinity;

    // Evaluate all 2^n combinations (exact combinatorial knapsack)
    for (let mask = 1; mask < (1 << n); mask++) {
      let cost = 0;
      let impact = 0;
      const currentSelected: typeof CANONICAL_INTERVENTIONS = [];

      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          cost += CANONICAL_INTERVENTIONS[i].estimatedCost;
          impact += CANONICAL_INTERVENTIONS[i].impact;
          currentSelected.push(CANONICAL_INTERVENTIONS[i]);
        }
      }

      if (cost <= simulatedBudget) {
        if (
          impact > bestImpact ||
          (impact === bestImpact && cost < bestCost) // Tie-breaking: strictly prefer lower cost
        ) {
          bestImpact = impact;
          bestCost = cost;
          bestPackage = currentSelected;
        }
      }
    }

    const baselineScore = 42;
    const projectedScore = Math.min(100, baselineScore + bestImpact);
    const totalCost = bestCost === Infinity ? 0 : bestCost;
    const remainingBudget = Math.max(0, simulatedBudget - totalCost);

    return {
      selected: bestPackage,
      selectedIds: new Set(bestPackage.map((p) => p.id)),
      totalCost,
      totalImpact: bestImpact,
      projectedScore,
      remainingBudget,
    };
  }, [simulatedBudget]);

  // Smooth scroll handler
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: shouldReduceMotion ? "auto" : "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-full bg-background font-sans text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-foreground">

      {/* STATIC ENGINEERING GRID TEXTURE */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#19734f0a_1px,transparent_1px),linear-gradient(to_bottom,#19734f0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-16 md:space-y-24 relative z-10">

        {/* =================================================================== */}
        {/* 1. IMMERSIVE EDITORIAL HERO (ASYMMETRICAL 2-PART COMPOSITION)       */}
        {/* =================================================================== */}
        <section className="pt-2 md:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* LEFT SIDE: EDITORIAL NARRATIVE */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Technical Methodology</span>
                <span className="text-muted-foreground/60">•</span>
                <span>Model Transparency</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground font-mono">Algorithm v1.0</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
                The science behind every{" "}
                <span className="text-primary italic font-serif">heat-resilience</span>{" "}
                decision.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                HeatCredit synthesizes physical building envelope parameters, localized meteorological telemetry, and a deterministic 0/1 knapsack optimization algorithm. Every resilience dollar is allocated through verifiable physical science, eliminating arbitrary intuition.
              </p>

              {/* HANDWRITTEN EDITORIAL ANNOTATION */}
              <div className="flex items-center gap-2 pt-1 text-amber-700">
                <span className="font-[family-name:var(--font-handwriting)] text-xl sm:text-2xl rotate-[-2deg] tracking-wide">
                  Every point should have a reason.
                </span>
                <svg
                  className="w-8 h-4 text-amber-700/80 -rotate-12"
                  viewBox="0 0 40 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M 4,4 C 15,14 26,16 36,12" />
                  <path d="M 30,7 L 36,12 L 31,17" />
                </svg>
              </div>

              {/* HERO ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button
                  onClick={() => scrollTo("scoring-model")}
                  className="text-xs font-semibold h-11 px-5 shadow-xs group"
                >
                  <span>Explore the scoring model</span>
                  <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                </Button>

                <Link href="/optimizer/hyderabad-school">
                  <Button
                    variant="outline"
                    className="text-xs font-semibold h-11 px-5 border-border/80 text-foreground hover:bg-muted/40 gap-1.5"
                  >
                    <span>Open the optimizer</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT SIDE: BESPOKE TECHNICAL ENGINE ILLUSTRATION (SVG CALIPER DIAL) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
                {/* Background blueprint grid within illustration container */}
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#19734f0f_1px,transparent_1px),linear-gradient(to_bottom,#19734f0f_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Engine Telemetry Schematic</span>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    100-PT CALIBRATION
                  </span>
                </div>

                {/* SVG Bespoke Radial Diagram */}
                <div className="relative aspect-square w-full max-w-[340px] mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
                    {/* Concentric Calibration Ticks & Rings */}
                    <circle cx="200" cy="200" r="160" fill="none" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <circle cx="200" cy="200" r="120" fill="none" stroke="var(--color-border)" strokeWidth="1.2" opacity="0.8" />
                    <circle cx="200" cy="200" r="75" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2.5" />

                    {/* Radial Ray Connectors to the 7 Dimensions */}
                    {/* 1. Thermal 25 pts (Top - 90 deg) */}
                    <line x1="200" y1="125" x2="200" y2="45" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="2 2" />
                    <circle cx="200" cy="45" r="16" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" />
                    <text x="200" y="49" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--color-primary)" fontFamily="monospace">25</text>
                    <text x="200" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-foreground)">Thermal</text>

                    {/* 2. Shade 15 pts (Top Right - 40 deg) */}
                    <line x1="253" y1="147" x2="310" y2="90" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <circle cx="310" cy="90" r="14" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="310" y="94" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-primary)" fontFamily="monospace">15</text>
                    <text x="330" y="75" textAnchor="start" fontSize="9" fontWeight="600" fill="var(--color-foreground)">Shade</text>

                    {/* 3. Ventilation 15 pts (Right - 0 deg) */}
                    <line x1="275" y1="200" x2="350" y2="200" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <circle cx="350" cy="200" r="14" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="350" y="204" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-primary)" fontFamily="monospace">15</text>
                    <text x="350" y="226" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-foreground)">Vent</text>

                    {/* 4. Water 15 pts (Bottom Right - 320 deg) */}
                    <line x1="253" y1="253" x2="305" y2="305" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <circle cx="305" cy="305" r="14" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="305" y="309" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-primary)" fontFamily="monospace">15</text>
                    <text x="325" y="325" textAnchor="start" fontSize="9" fontWeight="600" fill="var(--color-foreground)">Water</text>

                    {/* 5. Relief 15 pts (Bottom - 270 deg) */}
                    <line x1="200" y1="275" x2="200" y2="350" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <circle cx="200" cy="350" r="14" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="200" y="354" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-primary)" fontFamily="monospace">15</text>
                    <text x="200" y="378" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-foreground)">Relief</text>

                    {/* 6. Green 10 pts (Bottom Left - 220 deg) */}
                    <line x1="147" y1="253" x2="95" y2="305" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <circle cx="95" cy="305" r="14" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="95" y="309" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-primary)" fontFamily="monospace">10</text>
                    <text x="75" y="325" textAnchor="end" fontSize="9" fontWeight="600" fill="var(--color-foreground)">Green</text>

                    {/* 7. Exposure Penalty -5 pts (Top Left - 140 deg) */}
                    <line x1="147" y1="147" x2="90" y2="90" stroke="var(--color-destructive)" strokeWidth="1.8" />
                    <circle cx="90" cy="90" r="14" fill="var(--color-card)" stroke="var(--color-destructive)" strokeWidth="1.8" />
                    <text x="90" y="94" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-destructive)" fontFamily="monospace">-5</text>
                    <text x="70" y="75" textAnchor="end" fontSize="9" fontWeight="600" fill="var(--color-destructive)">Exposure</text>

                    {/* Central Core Score Display */}
                    <circle cx="200" cy="200" r="55" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="200" y="195" textAnchor="middle" fontSize="24" fontWeight="bold" fill="var(--color-foreground)" fontFamily="monospace">67</text>
                    <text x="200" y="215" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)" fontFamily="sans-serif">/ 100 PTS</text>
                    <text x="200" y="230" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--color-primary)" letterSpacing="0.08em">OPTIMAL</text>
                  </svg>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Objective: Max Σ(impact_i · x_i)</span>
                  <span className="text-primary font-semibold">Σ Weights = 100</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* 2. EDITORIAL SECTION INDEX (STICKY NAVIGATION VISUAL SPINE)         */}
        {/* =================================================================== */}
        <nav
          aria-label="Methodology Index"
          className="sticky top-0 z-30 bg-background/90 backdrop-blur-md py-3 border-y border-border/60 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 px-4 sm:px-6 md:px-8 lg:px-10 transition-shadow"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground shrink-0 hidden md:block">
              Index /
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[
                { id: "scoring-model", label: "01. Scoring Model" },
                { id: "risk-classification", label: "02. Risk Classification" },
                { id: "environmental-data", label: "03. Environmental Telemetry" },
                { id: "optimization-logic", label: "04. Knapsack Allocation" },
                { id: "evidence-limitations", label: "05. Audit & Boundaries" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border border-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Link href="/assessment" className="hidden lg:block shrink-0">
              <Button size="sm" variant="ghost" className="text-xs h-8 gap-1 text-primary hover:text-primary">
                <span>Start Intake</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* =================================================================== */}
        {/* 3. SECTION 1: SCORING MODEL — ASYMMETRICAL WEIGHTED COMPOSITION     */}
        {/* =================================================================== */}
        <section id="scoring-model" className="scroll-mt-24 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Section 01 • Deterministic Physical Formulation
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Seven-Dimension Infrastructure Matrix
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              No machine learning approximations. HeatCredit scores every building deterministically across seven physical dimensions calibrated to thermodynamic radiant heat load and biological survival thresholds.
            </p>
          </div>

          {/* ASYMMETRICAL COMPOSITION: DOMINANT ROOF THERMAL VS ALIGNED REMAINING 6 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

            {/* DOMINANT WEIGHT SHOWCASE: THERMAL PROTECTION (25 PTS / 25%) */}
            <div className="lg:col-span-5 bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <Badge variant="outline" className="font-mono text-[9px] bg-primary/10 text-primary border-primary/25">
                    DOMINANT FACTOR • 25% WEIGHT
                  </Badge>
                  <span className="font-mono text-xs font-bold text-primary">MAX 25 PTS</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">Thermal Protection</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    The rooftop envelope is the primary barrier against incoming solar irradiance. Unshaded or uninsulated roofs transmit 60–80% of heat downward into occupant workspaces.
                  </p>
                </div>

                {/* FORMULA CALLOUT */}
                <div className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-1">
                  <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
                    Deterministic Calibration Formula
                  </div>
                  <div className="font-mono text-[11px] text-foreground">
                    Score = (0.60 × RoofType + 0.40 × Condition) × 25
                  </div>
                </div>

                {/* INTERACTIVE ROOF CALCULATOR */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Interactive Roof Assembly Simulator:</span>
                    <span className="font-mono text-sm font-bold text-primary">{calculatedThermalScore} / 25 pts</span>
                  </div>

                  {/* Roof Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-muted-foreground font-medium">1. Roof Assembly Material (60% weight)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {(Object.keys(ROOF_TYPE_FACTORS) as RoofType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedRoofType(type)}
                          className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                            selectedRoofType === type
                              ? "bg-primary/10 border-primary text-primary font-semibold"
                              : "bg-muted/15 border-border/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="truncate">{ROOF_TYPE_FACTORS[type].label}</div>
                          <div className="font-mono text-[9px] opacity-80">Factor: {ROOF_TYPE_FACTORS[type].factor}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Roof Condition Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-muted-foreground font-medium">2. Structural Condition (40% weight)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(Object.keys(ROOF_CONDITION_FACTORS) as RoofCondition[]).map((cond) => (
                        <button
                          key={cond}
                          onClick={() => setSelectedRoofCondition(cond)}
                          className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                            selectedRoofCondition === cond
                              ? "bg-primary/10 border-primary text-primary font-semibold"
                              : "bg-muted/15 border-border/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="capitalize">{cond}</div>
                          <div className="font-mono text-[9px] opacity-80">Factor: {ROOF_CONDITION_FACTORS[cond].factor}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                Green Valley School benchmark: <span className="font-semibold text-foreground">Concrete (0.65) + Fair (0.65) = 16.3 pts</span>
              </div>
            </div>

            {/* ALIGNED REMAINING 6 DIMENSIONS */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground pb-1">
                <span>Complementary Protection & Exposure Vectors</span>
                <span className="font-mono">75 TOTAL POINTS</span>
              </div>

              <div className="space-y-2.5 flex-1">
                {[
                  {
                    id: "shade",
                    name: "Shade Coverage",
                    weight: 15,
                    max: 15,
                    pct: 15,
                    barPct: 60,
                    icon: Sun,
                    unit: "0% to 100% canopy coverage",
                    detail: "Linear scaling (0% = 0 pts, 100% = 15 pts). Exterior shade sails, pergolas, and structural overhangs intercept direct beam solar radiation prior to contact with exterior walls and pedestrian ground.",
                  },
                  {
                    id: "ventilation",
                    name: "Ventilation Dynamics",
                    weight: 15,
                    max: 15,
                    pct: 15,
                    barPct: 60,
                    icon: Wind,
                    unit: "Airflow Level: poor (0.2), med (0.6), good (0.85), exc (1.0)",
                    detail: "Evacuates indoor thermal plumes via passive cross-draft or mechanical ceiling assist, lowering effective radiant skin temperature through convective body heat dissipation.",
                  },
                  {
                    id: "water",
                    name: "Water Access & Hydration",
                    weight: 15,
                    max: 15,
                    pct: 15,
                    barPct: 60,
                    icon: Droplets,
                    unit: "Station Level: none (0.0), poor (0.3), adeq (0.6), exc (1.0)",
                    detail: "Crucial biological survival asset. Drinking water points prevent progressive dehydration and maintain worker or student thermoregulatory sweating efficiency during heatwaves.",
                  },
                  {
                    id: "relief",
                    name: "Relief Capacity (Cool Room)",
                    weight: 15,
                    max: 15,
                    pct: 15,
                    barPct: 60,
                    icon: ShieldCheck,
                    unit: "Space Level: none (0.0), limited (0.3), adeq (0.6), exc (1.0)",
                    detail: "Dedicated safe-haven cooling zone (chilled or fan-assisted) offering rapid physiological recovery for occupants experiencing early acute symptoms of heat stroke or exhaustion.",
                  },
                  {
                    id: "green",
                    name: "Green Infrastructure",
                    weight: 10,
                    max: 10,
                    pct: 10,
                    barPct: 40,
                    icon: Layers,
                    unit: "0% to 100% site vegetation density",
                    detail: "Linear scaling (0% = 0 pts, 100% = 10 pts). Vegetation cools surrounding ambient microclimates by converting solar irradiance into moisture vapor through botanical evapotranspiration.",
                  },
                  {
                    id: "exposure",
                    name: "Occupancy Exposure Penalty",
                    weight: 5,
                    max: 5,
                    pct: 5,
                    barPct: 20,
                    icon: AlertTriangle,
                    unit: "Occupancy (up to 500) × Operating Hours (up to 24h)",
                    detail: "Subtractive penalty: Risk factor = 0.6·(occ/500) + 0.4·(hrs/24). Score = (1 - Risk)·5. Facilities with dense populations operating throughout peak daytime heat carry heightened exposure deficits.",
                  },
                ].map((dim) => {
                  const isSelected = activeDimension === dim.id;
                  const Icon = dim.icon;
                  return (
                    <div
                      key={dim.id}
                      onClick={() => setActiveDimension(dim.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-card border-primary/50 shadow-xs"
                          : "bg-muted/10 border-border/50 hover:border-border hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-xs sm:text-sm text-foreground">{dim.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {dim.weight} pts <span className="text-[10px] text-muted-foreground font-normal">({dim.pct}%)</span>
                        </span>
                      </div>

                      {/* Visual Proportional Bar */}
                      <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-2.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${dim.id === "exposure" ? "bg-amber-600" : "bg-primary"}`}
                          style={{ width: `${(dim.weight / 25) * 100}%` }}
                        />
                      </div>

                      {/* Grounded Explanation on Selection */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="pt-2.5 mt-2 border-t border-border/40 text-xs text-muted-foreground leading-relaxed"
                        >
                          <div className="font-mono text-[10px] text-primary font-semibold mb-0.5">{dim.unit}</div>
                          {dim.detail}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MATHEMATICAL TOTAL FORMULA STRIP */}
              <div className="p-3.5 bg-card border border-border/70 rounded-2xl text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Audited Canonical Summation Function
                </div>
                <div className="font-mono text-xs text-foreground overflow-x-auto whitespace-nowrap">
                  Score = min(100, max(0, Thermal[25] + Shade[15] + Vent[15] + Water[15] + Relief[15] + Green[10] + Exposure[5]))
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* 4. SECTION 2: RISK CLASSIFICATION — DESIGNED SCALE, NOT CARDS       */}
        {/* =================================================================== */}
        <section id="risk-classification" className="scroll-mt-24 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Section 02 • Clinical Severity Boundaries
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Five-Tier Resilience Threshold Scale
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Calculated cumulative scores (0–100) map strictly to five verified resilience bands. This scale defines institutional action priorities and heatwave triage urgency.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">

            {/* CONTINUOUS DESIGNED SCALE VISUALIZATION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Continuous Resilience Spectrum</span>
                <span className="font-mono text-xs text-muted-foreground">Score: {simulatedScore} / 100</span>
              </div>

              {/* Horizontal Segmented Bar */}
              <div className="relative h-6 w-full rounded-xl overflow-hidden flex shadow-inner border border-border/60">
                <div className="h-full bg-destructive flex items-center justify-center text-[10px] font-bold text-white" style={{ width: "40%" }}>
                  CRITICAL (0–39)
                </div>
                <div className="h-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: "20%" }}>
                  HIGH (40–59)
                </div>
                <div className="h-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-stone-900" style={{ width: "15%" }}>
                  MODERATE (60–74)
                </div>
                <div className="h-full bg-primary/80 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: "15%" }}>
                  RESILIENT (75–89)
                </div>
                <div className="h-full bg-primary flex items-center justify-center text-[10px] font-bold text-white" style={{ width: "10%" }}>
                  HIGHLY (90–100)
                </div>

                {/* Score Marker Pin */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-foreground shadow-lg transition-all duration-150"
                  style={{ left: `${simulatedScore}%` }}
                >
                  <div className="absolute -top-6 -left-3 bg-foreground text-background font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {simulatedScore}
                  </div>
                </div>
              </div>

              {/* Interactive Score Slider Control */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-muted-foreground shrink-0">Simulate Score:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulatedScore}
                  onChange={(e) => setSimulatedScore(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="font-mono text-sm font-bold text-foreground w-12 text-right">{simulatedScore}</span>
              </div>
            </div>

            {/* BAND INTERPRETATION GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {[
                {
                  range: "0–39",
                  tier: "Critical",
                  color: "text-destructive",
                  badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
                  summary: "Acute envelope failure",
                  action: "Immediate structural shading, emergency drinking points, or operational shutdown during red alerts.",
                },
                {
                  range: "40–59",
                  tier: "High Risk",
                  color: "text-amber-600",
                  badgeClass: "bg-amber-600/10 text-amber-600 border-amber-600/20",
                  summary: "Elevated thermal deficits",
                  action: "High vulnerability to sustained heat; candidate for cool roof and ventilation interventions.",
                },
                {
                  range: "60–74",
                  tier: "Moderate",
                  color: "text-amber-500",
                  badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                  summary: "Acceptable baseline",
                  action: "Adequate protection during ordinary summer heat; vulnerability surges if temperatures breach 42°C.",
                },
                {
                  range: "75–89",
                  tier: "Resilient",
                  color: "text-primary",
                  badgeClass: "bg-primary/10 text-primary border-primary/20",
                  summary: "Robust bioclimatic shield",
                  action: "Significant passive protection; capable of buffering internal temperatures without emergency assistance.",
                },
                {
                  range: "90–100",
                  tier: "Highly Resilient",
                  color: "text-primary",
                  badgeClass: "bg-primary/20 text-primary border-primary/30",
                  summary: "Exemplary shelter standard",
                  action: "Optimized thermal envelope, shaded grounds, and dedicated cooling safe-haven suitable for disaster refuge.",
                },
              ].map((b) => {
                const isCurrent =
                  (b.range === "0–39" && simulatedScore < 40) ||
                  (b.range === "40–59" && simulatedScore >= 40 && simulatedScore < 60) ||
                  (b.range === "60–74" && simulatedScore >= 60 && simulatedScore < 75) ||
                  (b.range === "75–89" && simulatedScore >= 75 && simulatedScore < 90) ||
                  (b.range === "90–100" && simulatedScore >= 90);

                return (
                  <div
                    key={b.range}
                    className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      isCurrent
                        ? "bg-muted/30 border-primary/60 shadow-xs ring-1 ring-primary/30"
                        : "bg-muted/10 border-border/50 opacity-80"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">{b.range}</span>
                        <Badge variant="outline" className={`font-mono text-[9px] uppercase ${b.badgeClass}`}>
                          {b.tier}
                        </Badge>
                      </div>
                      <div className="font-semibold text-foreground text-xs">{b.summary}</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                        {b.action}
                      </p>
                    </div>

                    {isCurrent && (
                      <div className="pt-2 text-[10px] font-bold text-primary flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Active Tier Simulation</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-4 leading-relaxed">
              Institutional notice: HeatCredit risk classifications represent physical building vulnerability assessments. They provide decision-support prioritization, not localized meteorological forecasting or medical safety guarantees.
            </p>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 5. SECTION 3: ENVIRONMENTAL DATA — SOURCE-TO-MODEL DIAGRAM          */}
        {/* =================================================================== */}
        <section id="environmental-data" className="scroll-mt-24 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Section 03 • Meteorological Pipeline & Provenance
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Source-to-Model Telemetry Architecture
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Trace how raw physical coordinates, live meteorological APIs, and deterministic offline fallbacks integrate into the decision pipeline.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

            {/* FLOW DIAGRAM: 4 CONNECTED STAGES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {[
                {
                  step: "01",
                  title: "Spatial Geolocation",
                  source: "Facility Input",
                  badge: "USER-VERIFIED",
                  badgeStyle: "bg-amber-600/10 text-amber-600 border-amber-600/20",
                  items: [
                    "Coordinates: Latitude & Longitude",
                    "Facility Type & Classification",
                    "Building Footprint & Roof Type",
                    "Peak Occupancy & Operating Hours",
                  ],
                  note: "Determines regional climate zone and exposure vulnerability weighting.",
                },
                {
                  step: "02",
                  title: "Meteorological Intake",
                  source: "Open-Meteo CC BY 4.0",
                  badge: "LIVE TELEMETRY",
                  badgeStyle: "bg-sky-500/10 text-sky-600 border-sky-500/20",
                  items: [
                    "Ambient Temperature (°C)",
                    "Apparent Heat Index (°C)",
                    "Relative Humidity (%)",
                    "Direct Solar Irradiance (W/m²)",
                  ],
                  note: "Hourly diurnal weather models refreshed dynamically via serverless Lambda.",
                },
                {
                  step: "03",
                  title: "Climatic Normal Fallback",
                  source: "Offline Deterministic DB",
                  badge: "CANONICAL BASELINE",
                  badgeStyle: "bg-muted text-muted-foreground border-border",
                  items: [
                    "Hyderabad: 37°C ambient / 41°C app",
                    "Chennai: 36°C ambient / 42°C app",
                    "Delhi: 40°C ambient / 43°C app",
                    "Triggered if API latency > 3000ms",
                  ],
                  note: "Guarantees mathematical determinism during network degradation.",
                },
                {
                  step: "04",
                  title: "Microclimate Synthesis",
                  source: "Scoring & Knapsack Engine",
                  badge: "DERIVED METRIC",
                  badgeStyle: "bg-primary/10 text-primary border-primary/20",
                  items: [
                    "Latent Heat Delta: +Δ°C Index",
                    "Peak Heat Window: 12:00–16:00",
                    "Exposure Penalty Calculation",
                    "ROI Prioritization for Interventions",
                  ],
                  note: "Direct input into 0/1 Knapsack optimization algorithm.",
                },
              ].map((stage, idx) => (
                <div
                  key={stage.step}
                  className="bg-muted/15 border border-border/70 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{stage.step}</span>
                      <Badge variant="outline" className={`font-mono text-[8px] uppercase ${stage.badgeStyle}`}>
                        {stage.badge}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm text-foreground">{stage.title}</h3>
                    <div className="text-[10px] text-muted-foreground font-mono">{stage.source}</div>

                    <ul className="space-y-1 text-xs text-foreground/80 pt-1">
                      {stage.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px]">
                          <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/40 italic">
                    {stage.note}
                  </p>
                </div>
              ))}
            </div>

            {/* VISUAL PROVENANCE LEGEND */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  Facility-Provided Envelope
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Live Meteorological API
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Climatic Normal Fallback
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Derived Decision Metrics
                </span>
              </div>
              <span className="font-mono text-[10px]">Open-Meteo CC BY 4.0 License Compliance</span>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* 6. SECTION 4: OPTIMIZATION LOGIC — TECHNICAL CENTERPIECE            */}
        {/* =================================================================== */}
        <section id="optimization-logic" className="scroll-mt-24 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Section 04 • Algorithmic Capital Allocation
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              0/1 Knapsack Decision Algorithm
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Resilience funding is scarce. HeatCredit executes an exact 0/1 knapsack combinatorial algorithm to maximize total resilience score lift (+ΔScore) under an inviolable capital constraint.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">

            {/* MATHEMATICAL FORMULATION STRIP */}
            <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Objective Function & Constraints</span>
                <span className="font-mono text-primary text-[9px]">EXACT EVALUATION • 2ⁿ COMBINATIONS</span>
              </div>
              <div className="font-mono text-xs sm:text-sm text-foreground space-y-1">
                <div>Maximize: <span className="font-bold text-primary">Z = Σ (impact_i · x_i)</span></div>
                <div>Subject to: <span className="font-bold text-foreground">Σ (cost_i · x_i) ≤ Budget</span></div>
                <div className="text-muted-foreground text-xs">Where x_i ∈ {'{0, 1}'} (Binary decision: intervention is committed or excluded)</div>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                Tie-breaking discipline: If two candidate packages achieve identical total impact score, the engine strictly selects the package with the lowest total expenditure, preserving remaining liquidity.
              </p>
            </div>

            {/* INTERACTIVE OPTIMIZATION LABORATORY */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" />
                    <span>Interactive Capital Allocation Laboratory</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Adjust the budget ceiling to observe real-time dynamic programming selection across the six canonical measures.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
                  <span className="text-xs text-muted-foreground">Authorized Budget:</span>
                  <span className="font-mono text-sm font-bold text-primary">₹{simulatedBudget.toLocaleString()}</span>
                </div>
              </div>

              {/* Budget Range Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="2000"
                  value={simulatedBudget}
                  onChange={(e) => setSimulatedBudget(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>₹10,000 (Micro grant)</span>
                  <span>₹50,000 (Canonical demo)</span>
                  <span>₹100,000 (Comprehensive envelope)</span>
                </div>
              </div>

              {/* CANDIDATE INTERVENTIONS SELECTION MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {CANONICAL_INTERVENTIONS.map((item) => {
                  const isSelected = knapsackResult.selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
                          : "bg-muted/10 border-border/50 opacity-60"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs">{item.name}</span>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[9px] uppercase ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {isSelected ? "SELECTED" : "EXCLUDED"}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">{item.category}</div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground text-[10px]">Cost: </span>
                          <span className="font-bold text-foreground">₹{item.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px]">Impact: </span>
                          <span className="font-bold text-primary">+{item.impact} pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RESULT SUMMARY STRIP */}
              <div className="p-4 bg-card border border-border/70 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Committed Cost</div>
                  <div className="font-mono text-lg font-bold text-foreground mt-0.5">
                    ₹{knapsackResult.totalCost.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Remaining Budget</div>
                  <div className="font-mono text-lg font-bold text-primary mt-0.5">
                    ₹{knapsackResult.remainingBudget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Impact Lift</div>
                  <div className="font-mono text-lg font-bold text-primary mt-0.5">
                    +{knapsackResult.totalImpact} pts
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Projected Score</div>
                  <div className="font-mono text-lg font-bold text-foreground mt-0.5">
                    42 → {knapsackResult.projectedScore} <span className="text-xs font-normal text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link href="/optimizer/hyderabad-school">
                  <Button className="text-xs font-semibold h-10 px-5 gap-1.5 shadow-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run live optimizer in Decision Console</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* 7. SECTION 5: EVIDENCE, AUDITABILITY & LIMITATIONS                 */}
        {/* =================================================================== */}
        <section id="evidence-limitations" className="scroll-mt-24 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Section 05 • Governance & Scientific Boundaries
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Auditability, Assumptions & Limitations
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ethical climate technology demands absolute transparency. HeatCredit operates under declared boundaries and verifiable assumptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* COLUMN 1: PROVENANCE TIERS */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Data Provenance Tiers</span>
                </div>
                <h3 className="text-base font-bold text-foreground">Verification Hierarchy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Building inputs are classified into three evidentiary tiers to account for reporting variance:
                </p>
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <span className="font-semibold text-foreground">Tier 1: Self-Reported</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Owner or administrator survey estimate without photographic verification.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <span className="font-semibold text-foreground">Tier 2: Document-Verified</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Architectural drawings, construction invoices, and verifier audit stamps.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <span className="font-semibold text-foreground">Tier 3: Sensor-Calibrated</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">On-site IoT thermocouple readings and Open-Meteo station telemetry.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: AUDITABLE ASSUMPTIONS */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Info className="h-4 w-4" />
                  <span>Model Assumptions</span>
                </div>
                <h3 className="text-base font-bold text-foreground">Mathematical Simplifications</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The model maintains mathematical tractability through explicit scientific assumptions:
                </p>
                <div className="space-y-2 pt-1 text-xs text-muted-foreground leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                    <span className="font-semibold text-foreground">Static Weights: </span>
                    Dimension coefficients are invariant and not dynamically adjusted for complex building micro-zones.
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                    <span className="font-semibold text-foreground">Linear Superposition: </span>
                    Intervention score lifts are assumed additive within budget constraints without cross-coupling interference.
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                    <span className="font-semibold text-foreground">Uniform Exposure: </span>
                    Occupancy exposure assumes equal heat distribution across active work hours.
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: KNOWN LIMITATIONS */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Model Boundaries</span>
                </div>
                <h3 className="text-base font-bold text-foreground">Known Disclaimers</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  How institutional decision-makers should contextualize model outputs:
                </p>
                <div className="space-y-2 pt-1 text-xs text-muted-foreground leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-destructive/5 border border-destructive/20 text-foreground">
                    <span className="font-semibold text-destructive">Prototype Decision Metric: </span>
                    Outputs do not constitute a municipal building safety certificate or medical standard.
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                    <span className="font-semibold text-foreground">Modeled vs Measured: </span>
                    Score improvements represent modeled physical resilience, not guaranteed indoor air temperature drops.
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                    <span className="font-semibold text-foreground">No Dynamic CFD: </span>
                    Lacks dynamic 3D computational fluid dynamics or solar ray-tracing simulation.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* INTEGRATED PLATFORM NAVIGATION FOOTER */}
          <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-bold text-foreground">Ready to evaluate a physical facility?</div>
              <p className="text-xs text-muted-foreground">
                Apply this transparent methodology to your educational, healthcare, or residential building.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/assessment">
                <Button variant="outline" className="text-xs h-10 px-4">
                  <span>Facility Intake</span>
                </Button>
              </Link>
              <Link href="/interventions">
                <Button variant="outline" className="text-xs h-10 px-4 border-primary/30 text-primary hover:bg-primary/10">
                  <span>Intervention Catalogue</span>
                </Button>
              </Link>
              <Link href="/optimizer/hyderabad-school">
                <Button className="text-xs font-semibold h-10 px-5 gap-1.5 shadow-xs">
                  <span>Decision Laboratory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
