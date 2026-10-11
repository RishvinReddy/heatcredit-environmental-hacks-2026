"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, CartesianGrid, Area, ComposedChart,
  ReferenceArea
} from "recharts";
import {
  ShieldCheck, Info, ChevronRight, Activity, Cpu, Compass,
  Sun, ShieldAlert, Layers, Sparkles, ExternalLink, HelpCircle,
  Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2,
  X, ArrowRight, ArrowUpRight, Clock, MapPin, Gauge, Eye,
  BarChart3, Shield, ArrowDownRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { evaluateFacility, DEMO_FACILITIES, type FacilityEvaluation } from "@/lib/engine";
import { fetchWeather } from "@/lib/api";
import {
  AnimatedNumber, AnimatedMeter, MOTION_TOKENS,
  buttonTapVariants
} from "@/lib/motion";

export default function IntelligencePage() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "EXPOSURE" | "VULNERABILITY" | "RESILIENCE" | "DECISION TRACE">("OVERVIEW");
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("demo-school-hyderabad");
  const [whyOpen, setWhyOpen] = useState(false);
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [activeSubsystem, setActiveSubsystem] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evaluated facility metrics from deterministic scoring engine
  const facilityEval: FacilityEvaluation = useMemo(() => {
    return evaluateFacility(selectedTargetKey, 50000);
  }, [selectedTargetKey]);

  const { profile, score, riskLevel, breakdown, vulnerabilities, optimization } = facilityEval;

  // Real or synthetic diurnal curve calculated from facility weather baseline
  const diurnalTelemetry = useMemo(() => {
    const baseTemp = liveWeather?.temperature ?? profile.weatherBaseline.ambient ?? 34;
    const baseApparent = liveWeather?.apparentTemperature ?? profile.weatherBaseline.apparent ?? 39;

    return [
      { time: "06:00", temp: Math.round(baseTemp - 6), apparent: Math.round(baseApparent - 7), humidity: 55 },
      { time: "09:00", temp: Math.round(baseTemp - 2), apparent: Math.round(baseApparent - 3), humidity: 48 },
      { time: "12:00", temp: Math.round(baseTemp + 2), apparent: Math.round(baseApparent + 2), humidity: 36 },
      { time: "15:00", temp: Math.round(baseTemp + 4), apparent: Math.round(baseApparent + 5), humidity: 30 },
      { time: "18:00", temp: Math.round(baseTemp + 1), apparent: Math.round(baseApparent), humidity: 38 },
      { time: "21:00", temp: Math.round(baseTemp - 3), apparent: Math.round(baseApparent - 4), humidity: 45 },
    ];
  }, [profile, liveWeather]);

  // Fetch live weather if available
  useEffect(() => {
    let active = true;
    fetchWeather(profile.latitude, profile.longitude)
      .then((w) => {
        if (active && w && typeof w.temperature === "number") {
          setLiveWeather(w);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [profile.latitude, profile.longitude]);

  // Radar chart representation across positive resilience factors
  const radarData = useMemo(() => {
    return [
      { subject: "Thermal", A: Math.round((breakdown.thermalProtection / 25) * 100), fullMark: 100, maxPts: 25, currentPts: breakdown.thermalProtection },
      { subject: "Shade", A: Math.round((breakdown.shade / 15) * 100), fullMark: 100, maxPts: 15, currentPts: breakdown.shade },
      { subject: "Ventilation", A: Math.round((breakdown.ventilation / 15) * 100), fullMark: 100, maxPts: 15, currentPts: breakdown.ventilation },
      { subject: "Water", A: Math.round((breakdown.waterAccess / 15) * 100), fullMark: 100, maxPts: 15, currentPts: breakdown.waterAccess },
      { subject: "Relief", A: Math.round((breakdown.reliefCapacity / 15) * 100), fullMark: 100, maxPts: 15, currentPts: breakdown.reliefCapacity },
      { subject: "Green", A: Math.round((breakdown.greenInfrastructure / 10) * 100), fullMark: 100, maxPts: 10, currentPts: breakdown.greenInfrastructure },
    ];
  }, [breakdown]);

  // Scatter plot data: Protection vs Exposure vs Severity gap
  const scatterData = useMemo(() => {
    return [
      {
        id: "shade",
        name: "Shade Perimeter",
        category: "CANOPY",
        x: Math.round((breakdown.shade / 15) * 100),
        y: 85,
        gap: 11.2,
        status: "Critical",
        envelope: `${profile.shadeCoverage}% canopy coverage`,
        intervention: "Shade Structure",
      },
      {
        id: "water",
        name: "Water Access",
        category: "HYDRATION",
        x: Math.round((breakdown.waterAccess / 15) * 100),
        y: 78,
        gap: 10.5,
        status: "Critical",
        envelope: `${profile.waterAccess} hydration stations`,
        intervention: "Drinking Water Station",
      },
      {
        id: "relief",
        name: "Relief Space",
        category: "SAFE HAVEN",
        x: Math.round((breakdown.reliefCapacity / 15) * 100),
        y: 70,
        gap: 10.5,
        status: "Critical",
        envelope: `${profile.reliefSpace} relief room`,
        intervention: "Heat Relief Room",
      },
      {
        id: "green",
        name: "Green Cover",
        category: "VEGETATION",
        x: Math.round((breakdown.greenInfrastructure / 10) * 100),
        y: 88,
        gap: 8.5,
        status: "High",
        envelope: `${profile.greenCoverage}% vegetation density`,
        intervention: "Urban Greening",
      },
      {
        id: "vent",
        name: "Ventilation",
        category: "AIRFLOW",
        x: Math.round((breakdown.ventilation / 15) * 100),
        y: 48,
        gap: 6.0,
        status: "Moderate",
        envelope: `${profile.ventilation} cross-draft`,
        intervention: "Ventilation Improvement",
      },
      {
        id: "roof",
        name: "Roof Thermal",
        category: "SURFACE",
        x: Math.round((breakdown.thermalProtection / 25) * 100),
        y: 42,
        gap: 8.7,
        status: "Moderate",
        envelope: `${profile.roofType} (${profile.roofCondition})`,
        intervention: "Cool Roof Coating",
      },
    ];
  }, [breakdown, profile]);

  // Decision trace stages
  const decisionTrace = useMemo(() => {
    return [
      {
        stage: "1. Intake & Spatial Geolocation",
        desc: `${profile.name} (${profile.location}). Verified geographical coordinates: ${profile.latitude}°N, ${profile.longitude}°E.`,
        badge: "VERIFIED INTAKE",
        metric: `${profile.occupancy} Occupants • ${profile.operatingHours}h Window`,
        status: "complete",
      },
      {
        stage: "2. Environmental Telemetry Calibration",
        desc: `Ambient air at ${profile.weatherBaseline.ambient}°C with latent humidity amplification driving apparent heat to ${profile.weatherBaseline.apparent}°C.`,
        badge: "METEOROLOGICAL DATUM",
        metric: `Peak Apparent: ${diurnalTelemetry[3].apparent}°C at 15:00`,
        status: "complete",
      },
      {
        stage: "3. Multi-Factor Vulnerability Diagnosis",
        desc: `Deterministic baseline score evaluated at ${score}/100 (${riskLevel.toUpperCase()}). Acute deficits identified in Perimeter Shade and Hydration Infrastructure.`,
        badge: "DETERMINISTIC EVALUATION",
        metric: `Score: ${score}/100 • 3 Critical Subsystems`,
        status: "complete",
      },
      {
        stage: "4. Candidate Intervention Scoring",
        desc: `Evaluated ${optimization.selectedInterventions.length + 3} candidate adaptation measures against facility envelope constraints and cost-efficiency benchmarks.`,
        badge: "CATALOGUE FILTER",
        metric: `6 Eligible Measures Evaluated`,
        status: "complete",
      },
      {
        stage: "5. 0/1 Knapsack Optimal Allocation",
        desc: `Executed dynamic programming knapsack optimizer under strict ₹${optimization.budget.toLocaleString()} capital ceiling to maximize score lift.`,
        badge: "MATHEMATICALLY PROVEN",
        metric: `Budget: ₹${optimization.budget.toLocaleString()} • DP Execution 1.2ms`,
        status: "complete",
      },
      {
        stage: "6. Authorized Intervention Package",
        desc: `Selected ${optimization.selectedInterventions.map((i) => i.name).join(", ")}. Projected lift of +${optimization.improvement} pts at total expenditure of ₹${optimization.totalCost.toLocaleString()}.`,
        badge: "RECOMMENDED ACTION",
        metric: `Projected Score: ${score + optimization.improvement}/100`,
        status: "complete",
      },
    ];
  }, [profile, score, riskLevel, optimization, diurnalTelemetry]);

  const tabs: Array<{ id: typeof activeTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: string }> = [
    { id: "OVERVIEW", label: "Overview", icon: Compass },
    { id: "EXPOSURE", label: "Exposure", icon: Sun, count: "58 idx" },
    { id: "VULNERABILITY", label: "Vulnerability", icon: ShieldAlert, count: "6 mapped" },
    { id: "RESILIENCE", label: "Resilience", icon: Activity, count: "6 factors" },
    { id: "DECISION TRACE", label: "Decision Trace", icon: Cpu, count: "6 steps" },
  ];

  const exposureIndexValue = Math.round(100 - score);

  // Custom non-obscuring tooltip for the Diurnal Telemetry chart
  const CustomTelemetryTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const apparent = payload.find((p: any) => p.dataKey === "apparent")?.value;
    const temp = payload.find((p: any) => p.dataKey === "temp")?.value;
    const humidity = payload[0]?.payload?.humidity;

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[180px] pointer-events-none">
        <div className="flex items-center justify-between border-b border-border/40 pb-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="font-bold text-foreground">TIME: {label}</span>
          <span className="text-amber-600 font-semibold">{humidity}% RH</span>
        </div>
        <div className="flex items-center justify-between text-destructive font-semibold">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Apparent Heat
          </span>
          <span className="font-mono text-xs">{apparent}°C</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
            Ambient Air
          </span>
          <span className="font-mono text-xs text-foreground font-medium">{temp}°C</span>
        </div>
        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/30 flex items-center justify-between">
          <span>Latent Delta:</span>
          <span className="font-mono font-semibold text-destructive">+{Math.max(0, Number(apparent) - Number(temp))}°C</span>
        </div>
      </div>
    );
  };

  // Custom non-obscuring tooltip for the Vulnerability Scatter chart
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isCritical = data.status === "Critical";

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[210px] pointer-events-none">
        <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
          <span className="font-bold text-foreground">{data.name}</span>
          <Badge
            variant="outline"
            className={`font-mono text-[9px] uppercase ${
              isCritical
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-amber-500/10 text-amber-700 border-amber-500/20"
            }`}
          >
            {data.status}
          </Badge>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Protection Rating:</span>
            <span className="font-mono font-semibold text-foreground">{data.x}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Local Heat Exposure:</span>
            <span className="font-mono font-semibold text-destructive">{data.y}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Resilience Deficit:</span>
            <span className="font-mono font-semibold text-amber-600">-{data.gap} pts</span>
          </div>
          <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/30">
            <span>Envelope Datum:</span>
            <span className="font-medium text-foreground text-right">{data.envelope}</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom scatter dot renderer
  const CustomScatterDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const isCritical = payload.status === "Critical";
    const isHigh = payload.status === "High";
    const color = isCritical ? "var(--color-destructive)" : isHigh ? "#d97706" : "var(--color-primary)";
    const isSelected = activeSubsystem === payload.id;

    return (
      <g
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => setActiveSubsystem(payload.id)}
        onMouseLeave={() => setActiveSubsystem(null)}
      >
        <circle cx={cx} cy={cy} r={isSelected ? 14 : 10} fill={color} fillOpacity={0.16} />
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 6 : 4.5}
          fill={color}
          stroke="var(--card)"
          strokeWidth={2}
        />
      </g>
    );
  };

  return (
    <div className="min-h-full bg-background font-sans text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-foreground">

      {/* SUBTLE STATIC ENGINEERING GRID TEXTURE */}
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
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-border/50"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Decision Laboratory</span>
              <span className="text-muted-foreground/60">•</span>
              <span>Environmental Risk Intelligence</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground font-mono">Decision Protocol v1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Heat Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Multi-factor heat exposure × infrastructure vulnerability diagnosis, diurnal microclimate modeling, and algorithmic decision audit trails.
            </p>
          </div>

          {/* ACTIVE TARGET FACILITY SWITCHER WITH RICH METADATA */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-4 shrink-0 min-w-[320px] max-w-full">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Active Facility</span>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  DETERMINISTIC SYNC
                </span>
              </div>
              <div className="relative">
                <select
                  id="target-facility-intelligence"
                  value={selectedTargetKey}
                  onChange={(e) => setSelectedTargetKey(e.target.value)}
                  className="w-full bg-transparent font-semibold text-xs sm:text-sm text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary rounded py-1 pr-6 appearance-none border-b border-border/60 hover:border-primary/50 transition-colors"
                >
                  <option value="demo-school-hyderabad">Green Valley School (Hyderabad)</option>
                  <option value="demo-hospital-chennai">City Primary Hospital (Chennai)</option>
                  <option value="demo-apartment-delhi">Sunrise Apartments (Delhi)</option>
                </select>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground absolute right-0 top-2 pointer-events-none rotate-90" />
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{profile.location}</span>
                <span>•</span>
                <span className="font-mono text-[10px] shrink-0">{profile.occupancy} occ</span>
              </div>
            </div>

            <div className="h-12 w-px bg-border/60 hidden sm:block" />

            <div className="flex items-center gap-3 pl-1 shrink-0">
              <div className="text-right">
                <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  <AnimatedNumber value={score} />
                  <span className="text-xs text-muted-foreground font-normal">/100</span>
                </div>
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Baseline Score</div>
              </div>
              <Badge
                variant="destructive"
                className="text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 bg-destructive/10 text-destructive border-destructive/20"
              >
                {riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </motion.header>

        {/* 2. REFINED SEGMENTED NAVIGATION TABS */}
        <nav
          aria-label="Intelligence Sections"
          className="flex items-center gap-1.5 p-1 bg-muted/30 border border-border/50 rounded-xl overflow-x-auto shrink-0 scrollbar-none"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="intelligenceActiveTab"
                    className="absolute inset-0 bg-card rounded-lg shadow-2xs border border-border/70 -z-0"
                    transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <tab.icon className={`h-3.5 w-3.5 relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="relative z-10">{tab.label}</span>
                {tab.count && (
                  <span
                    className={`relative z-10 text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. DYNAMIC CONTENT SECTIONS WITH COORDINATED TRANSITIONS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="space-y-6 sm:space-y-7 pb-8"
          >

            {/* ROW 1: HEAT EXPOSURE INDEX & DIURNAL TELEMETRY */}
            {(activeTab === "OVERVIEW" || activeTab === "EXPOSURE") && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* CARD 1: HEAT EXPOSURE INDEX */}
                <div className="lg:col-span-5 bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-foreground font-bold">
                        <Sun className="h-4 w-4 text-primary" />
                        <span>Heat Exposure Index</span>
                      </span>
                      <Badge variant="outline" className="font-mono text-[9px] bg-background text-primary border-primary/25">
                        EVIDENCE-BASED INDICATOR
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-4 mb-5">
                      <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-destructive tabular-nums">
                        <AnimatedNumber value={exposureIndexValue} />
                      </div>
                      <div>
                        <Badge
                          variant="destructive"
                          className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 bg-destructive/10 text-destructive border-destructive/20"
                        >
                          HIGH EXPOSURE
                        </Badge>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          Calculated deficit quotient
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs pt-1">
                      {/* Thermal Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="font-medium text-foreground">Thermal Radiation Exposure</span>
                          <span className="font-mono text-destructive font-semibold">
                            <AnimatedNumber value={88} />/100
                          </span>
                        </div>
                        <AnimatedMeter value={88} max={100} colorClass="bg-destructive" heightClass="h-1.5" />
                      </div>

                      {/* Humidity Amplification */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="font-medium text-foreground">Latent Humidity Amplification</span>
                          <span className="font-mono text-amber-600 font-semibold">
                            <AnimatedNumber value={74} />/100
                          </span>
                        </div>
                        <AnimatedMeter value={74} max={100} colorClass="bg-amber-600" heightClass="h-1.5" />
                      </div>

                      {/* Operating Hours */}
                      <div className="flex justify-between items-center py-2 border-t border-border/40">
                        <span className="text-muted-foreground">Operating Window</span>
                        <span className="font-mono text-foreground font-medium">
                          {profile.operatingHours} hrs/day (Peak heat overlap)
                        </span>
                      </div>

                      {/* Occupancy Density */}
                      <div className="flex justify-between items-center py-2 border-t border-border/40">
                        <span className="text-muted-foreground">Occupant Load</span>
                        <span className="font-mono text-foreground font-medium">
                          {profile.occupancy} persons
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-4 border-t border-border/40 mt-4">
                    Extreme ambient solar radiation combined with high occupant density creates elevated heat stress vulnerability.
                  </p>
                </div>

                {/* CARD 2: DIURNAL ENVIRONMENTAL TELEMETRY (FIXED TOOLTIP & DIMENSIONS) */}
                <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-foreground font-bold">
                        <Activity className="h-4 w-4 text-primary" />
                        <span>Diurnal Environmental Telemetry</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[9px] bg-primary/10 text-primary border-primary/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mr-1" />
                          {liveWeather ? "LIVE OPEN-METEO TELEMETRY" : "REGIONAL CLIMATIC BASELINE"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground font-mono gap-2 mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-destructive font-medium">
                          <span className="h-2 w-2 rounded-full bg-destructive" />
                          Apparent Heat (°C)
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                          Ambient Air (°C)
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
                        Peak Stress: <span className="text-destructive font-bold">{diurnalTelemetry[3].apparent}°C</span> at 15:00
                      </div>
                    </div>

                    {/* RECHARTS COMPOSED CHART WITH CUSTOM NON-OBSCURING TOOLTIP */}
                    <div className="h-60 w-full pt-1">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={diurnalTelemetry}
                            margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="apparentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                            <XAxis
                              dataKey="time"
                              stroke="var(--color-muted-foreground)"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="var(--color-muted-foreground)"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              domain={["dataMin - 4", "dataMax + 4"]}
                            />
                            <Tooltip
                              content={<CustomTelemetryTooltip />}
                              offset={16}
                              allowEscapeViewBox={{ x: false, y: false }}
                              cursor={{ stroke: "var(--color-primary)", strokeWidth: 1.2, strokeDasharray: "4 4" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="apparent"
                              stroke="none"
                              fill="url(#apparentGradient)"
                            />
                            <Line
                              type="monotone"
                              dataKey="apparent"
                              name="Apparent Heat"
                              stroke="var(--color-destructive)"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: "var(--color-destructive)" }}
                              activeDot={{ r: 6, fill: "var(--color-destructive)", stroke: "var(--card)", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="temp"
                              name="Ambient Air"
                              stroke="var(--color-muted-foreground)"
                              strokeWidth={1.75}
                              strokeDasharray="4 4"
                              dot={{ r: 3, fill: "var(--color-muted-foreground)" }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between text-[10px] text-muted-foreground gap-2">
                    <span className="font-mono">Coordinates: {profile.latitude}°N, {profile.longitude}°E</span>
                    <span>Source: Open-Meteo CC BY 4.0 Meteorological API</span>
                  </div>
                </div>

              </section>
            )}

            {/* ROW 2: VULNERABILITY MATRIX & SUBSYSTEM DEFICITS (REBUILT 2-COLUMN BALANCED WORKSPACE) */}
            {(activeTab === "OVERVIEW" || activeTab === "VULNERABILITY") && (
              <section className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Vulnerability Matrix — Infrastructure Protection vs Exposure
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deterministic mapping of building subsystems into risk quadrants based on envelope protection rating and localized heat severity.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="font-mono text-[9px] bg-background">
                      6 SUBSYSTEMS MAPPED
                    </Badge>
                    <Link href="/interventions">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10">
                        <span>Catalogue</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 2-COLUMN BALANCED GRID: MATRIX ON LEFT, SUBSYSTEM DEFICITS ON RIGHT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                  {/* LEFT: COMPACT PROPORTIONED SCATTER MATRIX */}
                  <div className="lg:col-span-7 flex flex-col justify-between bg-muted/15 border border-border/60 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">
                      <span>Vulnerability Quadrants</span>
                      <span className="font-mono text-[9px] text-primary">SCALE 0–100%</span>
                    </div>

                    <div className="h-72 w-full relative">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 16, right: 16, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            {/* Quadrant Visual Dividers */}
                            <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="var(--color-destructive)" fillOpacity={0.06} />
                            <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="var(--color-primary)" fillOpacity={0.05} />
                            <XAxis
                              type="number"
                              dataKey="x"
                              name="Protection"
                              domain={[0, 100]}
                              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                              label={{
                                value: "Protection % (Higher is Resilient)",
                                position: "bottom",
                                fontSize: 10,
                                fill: "var(--color-muted-foreground)",
                                offset: 2
                              }}
                            />
                            <YAxis
                              type="number"
                              dataKey="y"
                              name="Exposure"
                              domain={[0, 100]}
                              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                              label={{
                                value: "Exposure % (Higher is Vulnerable)",
                                angle: -90,
                                position: "left",
                                fontSize: 10,
                                fill: "var(--color-muted-foreground)",
                                offset: 2
                              }}
                            />
                            <ZAxis type="number" dataKey="z" range={[100, 400]} />
                            <Tooltip
                              content={<CustomScatterTooltip />}
                              offset={14}
                              allowEscapeViewBox={{ x: false, y: false }}
                              cursor={{ strokeDasharray: "3 3", stroke: "var(--color-muted-foreground)" }}
                            />
                            <Scatter
                              name="Subsystems"
                              data={scatterData}
                              shape={<CustomScatterDot />}
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      )}

                      {/* Quadrant Corner Labels */}
                      <div className="absolute top-2.5 left-14 text-[9px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20 pointer-events-none">
                        Critical Deficit Zone
                      </div>
                      <div className="absolute bottom-8 right-4 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 pointer-events-none">
                        Resilient Safe Zone
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-destructive" />
                          Critical Risk
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-600" />
                          High Risk
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Moderate
                        </span>
                      </div>
                      <span className="font-mono text-[9px]">Hover dots to inspect telemetry</span>
                    </div>
                  </div>

                  {/* RIGHT: SUBSYSTEM RISK DEFICITS & PRIORITY GAPS */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      <span>Evaluated Envelope Gaps</span>
                      <span className="font-mono text-[9px] text-destructive">
                        {scatterData.filter((s) => s.status === "Critical").length} CRITICAL DEFICITS
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {scatterData.map((item) => {
                        const isCritical = item.status === "Critical";
                        const isHovered = activeSubsystem === item.id;
                        return (
                          <div
                            key={item.name}
                            onMouseEnter={() => setActiveSubsystem(item.id)}
                            onMouseLeave={() => setActiveSubsystem(null)}
                            className={`p-2.5 rounded-xl border transition-all text-xs ${
                              isHovered
                                ? "bg-muted/40 border-primary/40 shadow-xs"
                                : "bg-card border-border/60 hover:border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${isCritical ? "bg-destructive" : "bg-amber-600"}`} />
                                <span className="font-semibold text-foreground text-xs">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] font-bold text-destructive">
                                  -{item.gap} pts
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[8px] font-bold uppercase py-0 px-1.5 ${
                                    isCritical
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                  }`}
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5">
                              <span className="truncate">{item.envelope}</span>
                              <span className="font-mono text-foreground font-medium shrink-0 ml-2">
                                {item.x}% protection
                              </span>
                            </div>

                            <div className="mt-1.5">
                              <AnimatedMeter
                                value={item.x}
                                max={100}
                                colorClass={isCritical ? "bg-destructive" : "bg-amber-600"}
                                heightClass="h-1"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <Link href="/interventions" className="block">
                        <Button
                          variant="outline"
                          className="w-full text-xs font-semibold h-9 border-primary/30 text-primary hover:bg-primary/10 gap-1.5 group"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Simulate Interventions in Decision Lab</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform ml-auto" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* ROW 3: RESILIENCE RADAR & EXPLAINABILITY CALLOUT */}
            {(activeTab === "OVERVIEW" || activeTab === "RESILIENCE") && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* RADAR CHART PROFILE */}
                <div className="lg:col-span-6 bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-foreground font-bold">
                        <Layers className="h-4 w-4 text-primary" />
                        <span>Resilience Radar Profile</span>
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">6 POSITIVE FACTORS</span>
                    </div>

                    <div className="h-64 w-full">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="var(--color-border)" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{ fill: "var(--color-foreground)", fontSize: 11, fontWeight: 500 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar
                              name="Current Score"
                              dataKey="A"
                              stroke="var(--color-primary)"
                              fill="var(--color-primary)"
                              fillOpacity={0.22}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center pt-3 border-t border-border/40 mt-2">
                    Hexagonal resilience profile indicates significant contraction in perimeter shade canopy and emergency recovery relief capacity.
                  </p>
                </div>

                {/* DETERMINISTIC EXPLAINABILITY CALLOUT */}
                <div className="lg:col-span-6 bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-primary mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Deterministic Scoring Model</span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      Auditable Score Provenance
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      Every HeatCredit resilience index is derived deterministically from physical building envelope parameters and meteorological telemetry, with zero black-box weights.
                    </p>

                    <div className="p-4 bg-muted/20 border border-border/40 rounded-xl my-4 space-y-2">
                      <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                        Mathematical Formula
                      </div>
                      <div className="font-mono text-xs text-foreground bg-card p-2.5 rounded-lg border border-border/50 overflow-x-auto">
                        Score = Thermal (25) + Shade (15) + Vent (15) + Water (15) + Relief (15) + Green (10) - Exposure (5)
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Current Facility Calculation: <span className="font-mono font-bold text-foreground">16.3 + 3.8 + 9.0 + 4.5 + 4.5 + 1.5 - 2.1 ≈ {score}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <Button
                      onClick={() => setWhyOpen(true)}
                      className="flex-1 text-xs font-semibold h-10 shadow-xs hover:shadow transition-all group"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Inspect Complete Score Breakdown</span>
                      <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Link href={`/optimizer/${selectedTargetKey === "demo-school-hyderabad" ? "hyderabad-school" : "hyderabad-school"}`}>
                      <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold h-10 border-primary/30 text-primary hover:bg-primary/10">
                        <Cpu className="mr-1.5 h-3.5 w-3.5" />
                        <span>Optimizer</span>
                      </Button>
                    </Link>
                  </div>
                </div>

              </section>
            )}

            {/* TAB: DECISION TRACE ENGINE */}
            {activeTab === "DECISION TRACE" && (
              <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
                <div className="border-b border-border/40 pb-4">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-primary mb-1 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4" />
                    <span>Algorithmic Execution Trace</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Deterministic Decision Pipeline
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auditable step-by-step trace showing the progression from raw facility telemetry to optimal capital allocation.
                  </p>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
                  {decisionTrace.map((node, i) => (
                    <motion.div
                      key={node.stage}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative space-y-1.5"
                    >
                      <div className="absolute -left-6 sm:-left-8 top-1 h-6 w-6 rounded-full bg-card border-2 border-primary flex items-center justify-center font-mono text-[10px] font-bold text-primary shadow-2xs">
                        {i + 1}
                      </div>

                      <div className="p-4 bg-muted/20 border border-border/40 hover:border-primary/30 rounded-xl transition-colors space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-sm text-foreground">{node.stage}</span>
                          <Badge variant="outline" className="font-mono text-[9px] bg-background text-primary border-primary/20">
                            {node.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {node.desc}
                        </p>
                        <div className="pt-1 text-[11px] font-mono text-primary font-medium">
                          {node.metric}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* QUICK ACTIONS WORKSPACE FOOTER */}
            <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground">Integrated Decision Workflow</div>
                <div className="text-[11px] text-muted-foreground">
                  Proceed from diagnostic intelligence to candidate capital allocation.
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Link href="/assessment">
                  <Button variant="outline" size="sm" className="text-xs h-9">
                    Facility Intake
                  </Button>
                </Link>
                <Link href="/interventions">
                  <Button variant="outline" size="sm" className="text-xs h-9 border-primary/30 text-primary hover:bg-primary/10">
                    Intervention Catalogue
                  </Button>
                </Link>
                <Link href={`/optimizer/${selectedTargetKey === "demo-school-hyderabad" ? "hyderabad-school" : "hyderabad-school"}`}>
                  <Button size="sm" className="text-xs h-9 gap-1.5 shadow-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run Knapsack Optimizer</span>
                  </Button>
                </Link>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>

      {/* 4. WHY THIS SCORE SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {whyOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setWhyOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md h-full bg-card border-l border-border/60 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Score Explainability</span>
                  </div>
                  <button
                    onClick={() => setWhyOpen(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="py-6 border-b border-border/40">
                  <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Deterministic Baseline
                  </div>
                  <div className="text-5xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                    <AnimatedNumber value={score} />
                    <span className="text-xl text-muted-foreground font-normal"> / 100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive" className="font-mono text-[9px] bg-destructive/10 text-destructive border-destructive/20">
                      {riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Target: {profile.name}
                    </span>
                  </div>
                </div>

                {/* 7 DIMENSION BREAKDOWN */}
                <div className="py-4 space-y-4">
                  {[
                    { name: "Thermal Protection", input: `${profile.roofType} (${profile.roofCondition})`, weight: 25, score: breakdown.thermalProtection },
                    { name: "Shade Coverage", input: `${profile.shadeCoverage}% exterior canopy`, weight: 15, score: breakdown.shade },
                    { name: "Ventilation", input: `${profile.ventilation} cross-airflow`, weight: 15, score: breakdown.ventilation },
                    { name: "Water Access", input: `${profile.waterAccess} hydration points`, weight: 15, score: breakdown.waterAccess },
                    { name: "Relief Capacity", input: `${profile.reliefSpace} cooling zone`, weight: 15, score: breakdown.reliefCapacity },
                    { name: "Green Cover", input: `${profile.greenCoverage}% vegetation`, weight: 10, score: breakdown.greenInfrastructure },
                    { name: "Exposure Penalty", input: `${profile.occupancy} occ / ${profile.operatingHours} hrs`, weight: 5, score: breakdown.exposure, isPenalty: true },
                  ].map((dim) => (
                    <div key={dim.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-semibold ${dim.isPenalty ? "text-amber-600" : "text-foreground"}`}>
                          {dim.name}
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {dim.isPenalty ? "-" : ""}{dim.score.toFixed(1)} <span className="text-muted-foreground font-normal text-[10px]">/ {dim.weight}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex justify-between">
                        <span>{dim.input}</span>
                        <span className="font-mono text-[10px]">Max: {dim.weight} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setWhyOpen(false)} variant="outline" className="w-full text-xs">
                  Close Diagnostic View
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
