"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Thermometer, Wind, Cloud,
  Droplets, Sun, AlertTriangle, CheckCircle2, ShieldAlert,
  ShieldCheck, Coins, Compass, FileText, Building2,
  RefreshCw, Info, ExternalLink, HelpCircle, Activity,
  Sliders, ChevronRight, Layers, Sparkles, CloudRain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchWeather } from "@/lib/api";
import { evaluateFacility, DEMO_FACILITIES } from "@/lib/engine";

export interface DimensionItem {
  val: number;
  max: number;
  label: string;
  desc: string;
  alert?: boolean;
  isPenalty?: boolean;
}

export interface FacilityViewModel {
  id: string;
  name: string;
  type: string;
  location: string;
  coordinates: { lat: number; lon: number };
  occupancy: string;
  operatingHours: string;
  envelope: string;
  score: number;
  riskLevel: "HIGH RISK" | "CRITICAL RISK" | "MODERATE RISK" | "RESILIENT";
  riskColor: "high" | "critical" | "moderate" | "resilient";
  breakdown: {
    thermalProtection: DimensionItem;
    shade: DimensionItem;
    ventilation: DimensionItem;
    waterAccess: DimensionItem;
    reliefCapacity: DimensionItem;
    greenInfrastructure: DimensionItem;
    exposure: DimensionItem;
  };
  vulnerabilities: Array<{
    rank: string;
    name: string;
    gap: number;
    severity: "High" | "Critical";
    desc: string;
    dimension: string;
  }>;
  capitalPosition: {
    recommendedBudget: number;
    authorizedBudget: number;
    projectedScore: number;
    improvement: number;
    costPerPoint: number;
    interventions: Array<{ name: string; cost: number; impact: number; target: string }>;
  };
  weatherFallback: {
    ambient: number;
    apparent: number;
    humidity: number;
    wind: number;
    cloud: number;
    precipitation: number;
    isDemo: boolean;
    source: string;
  };
}

export default function OverviewPage() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("demo-school-hyderabad");
  const [weatherState, setWeatherState] = useState<{
    data: any;
    isLive: boolean;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    isLive: false,
    loading: true,
    error: null,
  });

  const [activeSessionAssessmentId, setActiveSessionAssessmentId] = useState<string | null>(null);

  // Retrieve any session assessment created recently
  useEffect(() => {
    try {
      const storedId = window.localStorage?.getItem("heatcredit_last_assessment_id");
      if (storedId) setActiveSessionAssessmentId(storedId);
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  // Dynamically evaluated facility metrics from deterministic scoring & optimizer engine
  const currentFacility: FacilityViewModel = useMemo(() => {
    const evaluation = evaluateFacility(selectedTargetKey, 50000);
    const { profile, score, riskLevel, breakdown, vulnerabilities, optimization } = evaluation;

    const formattedRisk: "CRITICAL RISK" | "HIGH RISK" | "MODERATE RISK" | "RESILIENT" =
      riskLevel === "critical"
        ? "CRITICAL RISK"
        : riskLevel === "high"
          ? "HIGH RISK"
          : riskLevel === "moderate"
            ? "MODERATE RISK"
            : "RESILIENT";

    const riskColor =
      riskLevel === "critical"
        ? "critical"
        : riskLevel === "high"
          ? "high"
          : riskLevel === "moderate"
            ? "moderate"
            : "resilient";

    const breakdownItems = {
      thermalProtection: {
        val: breakdown.thermalProtection,
        max: 25,
        label: "Thermal Protection",
        desc: `${profile.roofType} roof in '${profile.roofCondition}' condition.`,
        alert: breakdown.thermalProtection / 25 < 0.6,
      },
      shade: {
        val: breakdown.shade,
        max: 15,
        label: "Shade Coverage",
        desc: `${profile.shadeCoverage}% ground shade coverage across perimeter.`,
        alert: breakdown.shade / 15 < 0.4,
      },
      ventilation: {
        val: breakdown.ventilation,
        max: 15,
        label: "Ventilation",
        desc: `${profile.ventilation} natural draft and internal airflow.`,
        alert: breakdown.ventilation / 15 < 0.4,
      },
      waterAccess: {
        val: breakdown.waterAccess,
        max: 15,
        label: "Water Access",
        desc: `${profile.waterAccess} hydration infrastructure for ${profile.occupancy} occupants.`,
        alert: breakdown.waterAccess / 15 < 0.4,
      },
      reliefCapacity: {
        val: breakdown.reliefCapacity,
        max: 15,
        label: "Relief Capacity",
        desc: `${profile.reliefSpace} designated climate-controlled recovery space.`,
        alert: breakdown.reliefCapacity / 15 < 0.4,
      },
      greenInfrastructure: {
        val: breakdown.greenInfrastructure,
        max: 10,
        label: "Green Cover",
        desc: `${profile.greenCoverage}% vegetative cover with evapotranspiration cooling.`,
        alert: breakdown.greenInfrastructure / 10 < 0.3,
      },
      exposure: {
        val: breakdown.exposure,
        max: 5,
        label: "Exposure Penalty",
        desc: `${profile.occupancy} occupants over ${profile.operatingHours} hrs/day daily exposure penalty.`,
        isPenalty: true,
      },
    };

    const costPerPoint =
      optimization.improvement > 0
        ? Math.round(optimization.totalCost / optimization.improvement)
        : 0;

    return {
      id: profile.buildingId,
      name: profile.name,
      type: profile.facilityClass,
      location: profile.location,
      coordinates: { lat: profile.latitude, lon: profile.longitude },
      occupancy: `${profile.occupancy} Occupants & Staff`,
      operatingHours: `${profile.operatingHours} hrs/day Operating Window`,
      envelope: profile.envelopeDescription,
      score,
      riskLevel: formattedRisk,
      riskColor,
      breakdown: breakdownItems,
      vulnerabilities: vulnerabilities.slice(0, 3).map((v, i) => ({
        rank: `0${i + 1}`,
        name: v.label,
        gap: v.gap,
        severity: v.severity === "high" ? ("High" as const) : ("Critical" as const),
        desc: v.description,
        dimension: v.dimension,
      })),
      capitalPosition: {
        recommendedBudget: optimization.totalCost,
        authorizedBudget: optimization.budget,
        projectedScore: optimization.projectedScore,
        improvement: optimization.improvement,
        costPerPoint,
        interventions: optimization.selectedInterventions.map((inv) => ({
          name: inv.name,
          cost: inv.estimatedCost,
          impact: inv.impact,
          target: inv.category,
        })),
      },
      weatherFallback: {
        ambient: profile.weatherBaseline.ambient,
        apparent: profile.weatherBaseline.apparent,
        humidity: profile.weatherBaseline.humidity,
        wind: profile.weatherBaseline.wind,
        cloud: profile.weatherBaseline.cloud,
        precipitation: profile.weatherBaseline.precipitation,
        isDemo: true,
        source: profile.weatherBaseline.source,
      },
    };
  }, [selectedTargetKey]);

  // Fetch live weather data for target coordinates
  useEffect(() => {
    let active = true;
    async function loadWeather() {
      setWeatherState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const liveWeather = await fetchWeather(
          currentFacility.coordinates.lat,
          currentFacility.coordinates.lon
        );

        if (!active) return;

        if (liveWeather && typeof liveWeather.temperature === "number") {
          setWeatherState({
            data: {
              ambient: liveWeather.temperature,
              apparent: liveWeather.apparentTemperature ?? liveWeather.temperature + 4.1,
              humidity: liveWeather.humidity ?? 50,
              wind: liveWeather.windSpeed ?? 12,
              cloud: liveWeather.cloudCover ?? 15,
              precipitation: liveWeather.precipitation ?? 0.0,
              isDemo: liveWeather.isDemo ?? false,
              source: liveWeather.source || "Open-Meteo CC BY 4.0 (Live Telemetry)",
            },
            isLive: !liveWeather.isDemo,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Invalid telemetry payload");
        }
      } catch {
        if (!active) return;
        // Fall back gracefully to verified location snapshot
        setWeatherState({
          data: currentFacility.weatherFallback,
          isLive: false,
          loading: false,
          error: "Using verified meteorological snapshot",
        });
      }
    }

    loadWeather();
    return () => {
      active = false;
    };
  }, [currentFacility]);

  const weather = weatherState.data || currentFacility.weatherFallback;

  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.06, delayChildren: 0.02 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" },
    },
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">

      {/* RECENT USER ASSESSMENT BANNER (If exists) */}
      {activeSessionAssessmentId && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Recent Assessment Loaded:</span>{" "}
              <span className="font-mono text-muted-foreground">{activeSessionAssessmentId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs bg-background" asChild>
              <Link href={`/results/${activeSessionAssessmentId}`}>View Assessment Analytics</Link>
            </Button>
            <Button size="sm" className="h-7 text-xs" asChild>
              <Link href={`/optimizer/${activeSessionAssessmentId}`}>Open Optimizer</Link>
            </Button>
          </div>
        </div>
      )}

      {/* HEADER: WORKSPACE TITLE & TARGET SELECTOR */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-border/40"
      >
        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Environmental Risk Intelligence</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground font-mono">Decision Protocol v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Heat Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Deterministic exposure modeling, infrastructure vulnerability diagnosis, and capital allocation engine.
          </p>
        </motion.div>

        {/* ACTIVE TARGET CONTROL */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border/70 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 sm:gap-4 shrink-0 min-w-[280px]"
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Active Target</span>
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">PROTOTYPE</span>
            </div>

            <div className="relative">
              <label htmlFor="target-facility-select" className="sr-only">Select target facility profile</label>
              <select
                id="target-facility-select"
                value={selectedTargetKey}
                onChange={(e) => setSelectedTargetKey(e.target.value)}
                className="w-full bg-transparent font-semibold text-xs sm:text-sm text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary rounded py-0.5 pr-6 appearance-none border-b border-border/60 hover:border-primary/50 transition-colors"
              >
                <option value="demo-school-hyderabad">Green Valley School (Hyderabad)</option>
                <option value="demo-hospital-chennai">City Primary Hospital (Chennai)</option>
                <option value="demo-apartment-delhi">Sunrise Apartments (Delhi)</option>
              </select>
              <ChevronRight className="h-3 w-3 text-muted-foreground absolute right-0 top-1.5 pointer-events-none rotate-90" />
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span>{currentFacility.location}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">{currentFacility.occupancy.split(" ")[0]} occupants</span>
            </div>
          </div>

          <div className="h-10 w-px bg-border/50 hidden sm:block" />

          {/* COMPACT KPI BADGE */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="text-right">
              <div className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {currentFacility.score}
                <span className="text-[11px] text-muted-foreground font-normal">/100</span>
              </div>
              <div className="text-[9px] font-mono uppercase text-muted-foreground">Baseline</div>
            </div>
            <Badge
              variant="destructive"
              className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 bg-destructive/10 text-destructive border-destructive/20"
            >
              {currentFacility.riskLevel}
            </Badge>
          </div>
        </motion.div>
      </motion.header>

      {/* EXECUTIVE RISK & CAPITAL SUMMARY (FEATURE TIER) */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        aria-label="Executive Risk & Capital Summary"
        className="bg-card border border-border/70 rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

          {/* LEFT: BASELINE RESILIENCE DIAGNOSTIC */}
          <div className="md:col-span-4 space-y-3 border-b md:border-b-0 md:border-r border-border/50 pb-5 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">1. Baseline Vulnerability</span>
              <Badge variant="outline" className="font-mono text-[10px] bg-background">UNMITIGATED</Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                {currentFacility.score}
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-mono">/ 100 PTS</span>
                <div className="text-xs font-semibold text-destructive mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{currentFacility.riskLevel}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Elevated ambient heat index exposes facility to severe thermal stress. Vulnerabilities concentrated in canopy shading and recovery relief space.
            </p>
          </div>

          {/* CENTER: PROJECTED POST-INTERVENTION OUTCOME */}
          <div className="md:col-span-4 space-y-3 border-b md:border-b-0 md:border-r border-border/50 pb-5 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-primary">2. Projected Resilience</span>
              <Badge className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">0/1 KNAPSACK OPTIMAL</Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-primary tabular-nums">
                {currentFacility.capitalPosition.projectedScore}
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-mono">/ 100 PTS</span>
                <div className="text-xs font-bold text-primary mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>+{currentFacility.capitalPosition.improvement} PTS LIFT</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Execution of authorized intervention package transitions target from {currentFacility.riskLevel} to Moderate Risk category within available budget.
            </p>
          </div>

          {/* RIGHT: CAPITAL ALLOCATION & PRIMARY CTA */}
          <div className="md:col-span-4 space-y-3 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">3. Capital Requirement</span>
              <span className="text-[10px] font-mono text-muted-foreground">CAPEX BUDGET: ₹{currentFacility.capitalPosition.authorizedBudget.toLocaleString()}</span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums">
                ₹{currentFacility.capitalPosition.recommendedBudget.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Capital Efficiency:</span>
                <span className="font-mono font-medium text-foreground">₹{currentFacility.capitalPosition.costPerPoint.toLocaleString()} / pt gain</span>
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full text-xs font-semibold h-9 shadow-xs" asChild>
                <Link href={activeSessionAssessmentId ? `/optimizer/${activeSessionAssessmentId}` : `/optimizer/${currentFacility.id}`}>
                  <span>Optimize Resilience Budget</span>
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </motion.section>

      {/* CORE DASHBOARD GRID (2 COLUMNS: METRICS + DIAGNOSTICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: ENVIRONMENTAL CONDITIONS + RESILIENCE DIMENSION BREAKDOWN (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">

          {/* SECTION: ENVIRONMENTAL CONDITIONS SNAPSHOT */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            aria-label="Environmental Conditions Snapshot"
            className="bg-card border border-border/70 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Environmental Exposure Snapshot
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono uppercase tracking-wider py-0.5 ${
                    weatherState.isLive ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${weatherState.isLive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                  {weatherState.isLive ? "LIVE OPEN-METEO TELEMETRY" : "VERIFIED REGIONAL BASELINE"}
                </Badge>
              </div>
            </div>

            {/* METRICS 6-GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">

              {/* 1. AMBIENT TEMP */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg space-y-1">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Ambient Air</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums">
                  {weather.ambient.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-muted-foreground">Standard 2m measurement</div>
              </div>

              {/* 2. APPARENT TEMP (PRIMARY HEAT STRESS INDICATOR) */}
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg space-y-1 relative">
                <div className="text-[11px] text-destructive flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-destructive" />
                    <span>Apparent Heat</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-mono bg-destructive/10 px-1 py-0.2 rounded">PEAK STRESS</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-destructive tabular-nums">
                  {weather.apparent.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-destructive/80">Heat index with humidity impact</div>
              </div>

              {/* 3. RELATIVE HUMIDITY */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg space-y-1">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Relative Humidity</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums">
                  {Math.round(weather.humidity)}%
                </div>
                <div className="text-[10px] text-muted-foreground">Latent heat amplification</div>
              </div>

              {/* 4. WIND SPEED */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg space-y-1">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Wind className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Surface Wind</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
                  {weather.wind.toFixed(0)} km/h
                </div>
                <div className="text-[10px] text-muted-foreground">Convective boundary cooling</div>
              </div>

              {/* 5. CLOUD COVER */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg space-y-1">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Cloud Cover</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
                  {Math.round(weather.cloud)}%
                </div>
                <div className="text-[10px] text-muted-foreground">Direct solar attenuation</div>
              </div>

              {/* 6. PRECIPITATION */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg space-y-1">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <CloudRain className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Precipitation</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
                  {weather.precipitation.toFixed(1)} mm
                </div>
                <div className="text-[10px] text-muted-foreground">Zero evaporative relief</div>
              </div>

            </div>

            {/* DATA PROVENANCE FOOTNOTE */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-muted-foreground gap-2">
              <div className="flex items-center gap-1 font-mono">
                <span>Coordinates: {currentFacility.coordinates.lat.toFixed(4)}°N, {currentFacility.coordinates.lon.toFixed(4)}°E</span>
                <span>•</span>
                <span>Elevation datum: Regional grid</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Attribution:</span>
                <span className="font-medium text-foreground">{weather.source}</span>
              </div>
            </div>
          </motion.section>

          {/* SECTION: RESILIENCE DIMENSION ANALYSIS */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            aria-label="Resilience Dimension Breakdown"
            className="bg-card border border-border/70 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Resilience Dimension Analysis
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Seven-factor deterministic scoring breakdown calibrated against localized heat vulnerability thresholds.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] w-fit">
                SUM: {currentFacility.score} / 100 PTS
              </Badge>
            </div>

            {/* DIMENSION BARS LIST */}
            <div className="space-y-4 pt-1">
              {Object.entries(currentFacility.breakdown).map(([key, dim]) => {
                const percentage = Math.min(100, Math.round((dim.val / dim.max) * 100));
                const isCritical = dim.alert;

                return (
                  <div key={key} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isCritical ? "text-destructive" : "text-foreground"}`}>
                          {dim.label}
                        </span>
                        {isCritical && (
                          <Badge variant="destructive" className="text-[9px] font-mono uppercase tracking-wider py-0 px-1.5 h-4 bg-destructive/10 text-destructive border-destructive/20">
                            DEFICIT
                          </Badge>
                        )}
                        {dim.isPenalty && (
                          <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-wider py-0 px-1.5 h-4">
                            EXPOSURE DEDUCTION
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {percentage}% of potential
                        </span>
                        <span className="font-mono font-bold text-foreground text-xs tabular-nums w-16 text-right">
                          {dim.val.toFixed(1)} <span className="text-muted-foreground font-normal text-[10px]">/ {dim.max}</span>
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          isCritical
                            ? "bg-destructive"
                            : dim.isPenalty
                              ? "bg-amber-600"
                              : "bg-primary"
                        }`}
                      />
                    </div>

                    <div className="text-[11px] text-muted-foreground flex justify-between items-center">
                      <span>{dim.desc}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/70">Max weight: {dim.max} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SCORING METHODOLOGY DISCLOSURE */}
            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Weights derived from prototype heat adaptation standards.</span>
              <Link href="/methodology" className="text-primary hover:underline font-medium flex items-center gap-1">
                <span>View Full Scoring Methodology</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.section>

        </div>

        {/* RIGHT COLUMN: DECISION SUPPORT & VULNERABILITY MATRIX (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">

          {/* SECTION: TOP VULNERABILITIES */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            aria-label="Top Vulnerabilities Priority Matrix"
            className="bg-card border border-border/70 rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Primary Vulnerability Gaps
                </h2>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">RANKED</span>
            </div>

            <div className="space-y-3">
              {currentFacility.vulnerabilities.map((vuln) => (
                <div
                  key={vuln.rank}
                  className="p-3.5 bg-muted/20 border border-border/40 hover:border-destructive/30 rounded-lg space-y-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-destructive">{vuln.rank}</span>
                      <span className="font-bold text-xs text-foreground">{vuln.name}</span>
                    </div>
                    <Badge variant="destructive" className="text-[9px] font-mono py-0 px-1.5 h-4 bg-destructive/10 text-destructive border-destructive/20">
                      GAP: {vuln.gap.toFixed(1)} PTS
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {vuln.desc}
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1 pt-1">
                    <span>Target Dimension:</span>
                    <span className="text-foreground font-medium">{vuln.dimension}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs bg-background" asChild>
              <Link href="/interventions">
                <span>Explore Interventions Catalog</span>
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.section>

          {/* SECTION: NEXT BEST ACTION (DECISION-SUPPORT MODULE) */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            aria-label="Next Best Action Recommendation"
            className="bg-primary/5 border border-primary/25 rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next Best Action</span>
              </div>
              <Badge className="bg-primary text-primary-foreground font-mono text-[9px]">RECOMMENDED</Badge>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground">
                Deploy 3-Phase Capital Package
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Execute 0/1 knapsack optimal portfolio to resolve shade and hydration bottlenecks within the ₹50k capital ceiling.
              </p>
            </div>

            {/* INTERVENTIONS MINI-BREAKDOWN */}
            <div className="space-y-2 pt-1 border-t border-primary/10">
              {currentFacility.capitalPosition.interventions.map((inv, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/20 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="font-medium text-foreground">{inv.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-primary font-bold">+{inv.impact} pts</span>
                    <span className="text-muted-foreground">₹{inv.cost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-background border border-primary/20 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground">Total Capital Used:</span>
                <span className="font-bold text-foreground">₹{currentFacility.capitalPosition.recommendedBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground">Remaining Reserve:</span>
                <span className="font-medium text-foreground">₹{(currentFacility.capitalPosition.authorizedBudget - currentFacility.capitalPosition.recommendedBudget).toLocaleString()}</span>
              </div>
            </div>

            <Button className="w-full text-xs font-semibold h-9 shadow-xs" asChild>
              <Link href={`/optimizer/${currentFacility.id}`}>
                <span>Run Capital Optimizer</span>
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.section>

          {/* FACILITY PROFILE QUICK FACTS */}
          <div className="bg-card border border-border/70 rounded-xl p-5 shadow-xs text-xs space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Facility Profile Specifications</div>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Facility Class:</span>
                <span className="font-medium text-foreground">{currentFacility.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Occupant Density:</span>
                <span className="font-mono text-foreground">{currentFacility.occupancy}</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Profile:</span>
                <span className="font-medium text-foreground">{currentFacility.operatingHours}</span>
              </div>
              <div className="flex justify-between">
                <span>Roof Geometry:</span>
                <span className="font-medium text-foreground">{currentFacility.envelope}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Button variant="outline" size="sm" className="w-full text-xs bg-background" asChild>
                <Link href="/assessment">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  <span>Configure Custom Assessment</span>
                </Link>
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* INSTITUTIONAL EVIDENCE & PROVENANCE FOOTER STRIP */}
      <footer className="border-t border-border/50 pt-6 pb-2 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">HeatCredit Decision Protocol</span>
          <span>•</span>
          <span>Evaluation Model: Deterministic Scoring v1.0</span>
          <span>•</span>
          <span>Optimizer: Exact 0/1 Knapsack Dynamic Programming</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/methodology" className="hover:text-foreground transition-colors flex items-center gap-1">
            <span>Methodology</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link href="/architecture" className="hover:text-foreground transition-colors flex items-center gap-1">
            <span>Architecture</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </footer>

    </div>
  );
}
