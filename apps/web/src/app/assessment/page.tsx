"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import {
  Loader2, ArrowRight, ArrowLeft, Building2, Sun, Droplets,
  MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Thermometer,
  Wind, Cloud, Sparkles, Layers, Info, Check, HelpCircle,
  Compass, Gauge, RefreshCw, ChevronRight, FileCheck, Sliders,
  ShieldAlert, Zap, Activity, HeartPulse, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createAssessment, fetchWeather } from "@/lib/api";

const DEMO_PREFILL = {
  buildingType: "school",
  location: "Hyderabad",
  latitude: "17.3850",
  longitude: "78.4867",
  occupancy: "350",
  operatingHours: "9",
  roofType: "concrete",
  roofCondition: "fair",
  shadeCoverage: "25",
  greenCoverage: "15",
  ventilation: "medium",
  waterAccess: "poor",
  reliefSpace: "limited",
};

const CITY_PRESETS = [
  { name: "Hyderabad", lat: "17.3850", lon: "78.4867", state: "Telangana" },
  { name: "Chennai", lat: "13.0827", lon: "80.2707", state: "Tamil Nadu" },
  { name: "Delhi", lat: "28.6139", lon: "77.2090", state: "NCR" },
  { name: "Mumbai", lat: "19.0760", lon: "72.8777", state: "Maharashtra" },
  { name: "Bengaluru", lat: "12.9716", lon: "77.5946", state: "Karnataka" },
];

interface StepConfig {
  id: string;
  stepNum: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepConfig[] = [
  { id: "facility", stepNum: "01", title: "Facility Profile", shortDesc: "Geographic & typology", icon: Building2 },
  { id: "exposure", stepNum: "02", title: "Environmental Exposure", shortDesc: "Solar shade & vegetation", icon: Sun },
  { id: "building", stepNum: "03", title: "Building Envelope", shortDesc: "Roof barrier & occupancy", icon: Layers },
  { id: "infrastructure", stepNum: "04", title: "Resilience Infrastructure", shortDesc: "Airflow, water & relief", icon: Droplets },
  { id: "review", stepNum: "05", title: "Engine Review", shortDesc: "Deterministic verification", icon: ShieldCheck },
];

export default function AssessmentPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoNotice, setDemoNotice] = useState(false);

  const [formData, setFormData] = useState({
    buildingType: "",
    location: "",
    latitude: "",
    longitude: "",
    occupancy: "",
    operatingHours: "",
    roofType: "",
    roofCondition: "",
    shadeCoverage: "",
    greenCoverage: "",
    ventilation: "",
    waterAccess: "",
    reliefSpace: "",
  });

  const [telemetry, setTelemetry] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  const handlePrefill = () => {
    setFormData(DEMO_PREFILL);
    setDemoNotice(true);
    setTimeout(() => setDemoNotice(false), 3500);
  };

  const applyCityPreset = (city: typeof CITY_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      location: city.name,
      latitude: city.lat,
      longitude: city.lon,
    }));
  };

  const updateField = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
    setError("");
  };

  // Real-time completeness metrics
  const { readiness, completedCount, totalFields } = useMemo(() => {
    const fields = Object.values(formData);
    const filled = fields.filter((v) => v !== "").length;
    return {
      readiness: Math.round((filled / fields.length) * 100),
      completedCount: filled,
      totalFields: fields.length,
    };
  }, [formData]);

  // Step validity checking
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!(formData.buildingType && formData.location && formData.latitude && formData.longitude);
      case 1:
        return formData.shadeCoverage !== "" && formData.greenCoverage !== "";
      case 2:
        return !!(formData.occupancy !== "" && formData.operatingHours !== "" && formData.roofType && formData.roofCondition);
      case 3:
        return !!(formData.ventilation && formData.waterAccess && formData.reliefSpace);
      case 4:
        return readiness === 100;
      default:
        return true;
    }
  }, [currentStep, formData, readiness]);

  const isStepCompleted = (stepIdx: number) => {
    switch (stepIdx) {
      case 0:
        return !!(formData.buildingType && formData.location && formData.latitude && formData.longitude);
      case 1:
        return formData.shadeCoverage !== "" && formData.greenCoverage !== "";
      case 2:
        return !!(formData.occupancy !== "" && formData.operatingHours !== "" && formData.roofType && formData.roofCondition);
      case 3:
        return !!(formData.ventilation && formData.waterAccess && formData.reliefSpace);
      case 4:
        return readiness === 100;
      default:
        return false;
    }
  };

  // Real-time telemetry query
  useEffect(() => {
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      let active = true;
      setTelemetryLoading(true);
      fetchWeather(lat, lon)
        .then((w) => {
          if (active) {
            setTelemetry(w);
            setTelemetryLoading(false);
          }
        })
        .catch(() => {
          if (active) setTelemetryLoading(false);
        });
      return () => {
        active = false;
      };
    } else {
      setTelemetry(null);
    }
  }, [formData.latitude, formData.longitude]);

  const handleNext = () => {
    if (isStepValid && currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((p) => p + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((p) => p - 1);
    }
  };

  const jumpToStep = (idx: number) => {
    if (idx <= currentStep || isStepCompleted(idx)) {
      setDirection(idx > currentStep ? 1 : -1);
      setCurrentStep(idx);
    }
  };

  const handleSubmit = async () => {
    if (readiness < 100) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        occupancy: parseInt(formData.occupancy, 10),
        operatingHours: parseInt(formData.operatingHours, 10),
        shadeCoverage: parseInt(formData.shadeCoverage, 10),
        greenCoverage: parseInt(formData.greenCoverage, 10),
      };

      const result = await createAssessment(payload);
      if (result.error) throw new Error(result.error);
      router.push(`/results/${result.assessmentId}`);
    } catch (err: any) {
      setError(err.message || "Engine evaluation failed. Please verify inputs.");
      setLoading(false);
    }
  };

  // Directional step transition variants
  const stepVariants: Variants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.28,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -20 : 20,
      opacity: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.18,
        ease: "easeIn",
      },
    }),
  };

  return (
    <div className="min-h-full bg-background font-sans text-foreground p-4 sm:p-6 md:p-8 lg:p-9 relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW (SUBTLE INSTITUTIONAL LIGHTING) */}
      <div className="pointer-events-none absolute -top-40 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-1/2 -left-32 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-7 relative z-10">

        {/* 1. WORKSPACE HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/40"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span>Facility Assessment</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground font-mono">Evidence-Based Protocol v1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Build a facility heat-risk profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Configure geographic parameters, environmental exposure, and envelope resilience to diagnose vulnerabilities with the deterministic engine.
            </p>
          </div>

          {/* COMPACT WORKFLOW STATUS WITH PROGRESS RING */}
          <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border/70 rounded-xl px-4 py-2.5 shadow-2xs shrink-0 self-start sm:self-auto hover:border-primary/40 transition-colors">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Step {currentStep + 1} of 5
              </div>
              <div className="text-xs font-bold text-foreground truncate max-w-[140px]">
                {STEPS[currentStep].title}
              </div>
            </div>
            <div className="h-8 w-px bg-border/40" />
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 flex items-center justify-center">
                <svg className="h-7 w-7 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/40 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-primary stroke-current"
                    strokeWidth="3.5"
                    strokeDasharray={`${readiness}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${readiness}, 100` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute font-mono text-[9px] font-bold text-primary">
                  {readiness}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase leading-none">
                <div>%</div>
                <div>Ready</div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* 2. REFINED STEP NAVIGATOR WITH CONNECTING TRACK & GLOW */}
        <nav aria-label="Assessment Steps" className="bg-card/90 backdrop-blur-sm border border-border/70 rounded-2xl p-3 shadow-2xs relative">
          
          {/* Desktop/Tablet Horizontal Stepper with Connecting Progress Track */}
          <div className="hidden md:block relative">
            {/* Animated Background Progress Track */}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-muted/60 -z-0">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeInOut" }}
              />
            </div>

            <div className="grid grid-cols-5 gap-3 relative z-10">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isPast = isStepCompleted(idx);
                const canClick = idx <= currentStep || isPast;

                return (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(idx)}
                    disabled={!canClick}
                    className={`text-left p-3 rounded-xl transition-all relative flex flex-col justify-between group ${
                      isActive
                        ? "bg-primary/10 border border-primary/40 shadow-xs ring-1 ring-primary/20"
                        : isPast
                          ? "bg-card hover:bg-muted/40 border border-border/50 hover:border-primary/30 cursor-pointer hover:-translate-y-0.5 transition-transform"
                          : "opacity-60 cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`font-mono text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {step.stepNum}
                      </span>
                      {isPast ? (
                        <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      ) : isActive ? (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                        </span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold truncate transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                        {step.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate font-normal mt-0.5">
                        {step.shortDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Compact Progress Bar */}
          <div className="md:hidden space-y-2 p-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-primary font-bold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Step {currentStep + 1} of 5: {STEPS[currentStep].title}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{readiness}% Ready</span>
            </div>
            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / 5) * 100}%` }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              />
            </div>
          </div>
        </nav>

        {/* DEMO NOTICE BANNER (when prefilled) */}
        <AnimatePresence>
          {demoNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-primary shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                <span>Canonical profile prefilled: <strong>Green Valley School (Hyderabad)</strong>. All parameters calibrated for deterministic audit.</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background font-mono border-primary/30">100% POPULATED</Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR BANNER */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-destructive/10 text-destructive text-xs sm:text-sm rounded-xl border border-destructive/20 font-medium flex items-center gap-2.5 shadow-2xs"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* 3. MAIN WORKSPACE (FORM + CONTEXTUAL INTELLIGENCE PANEL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT / MAIN FORM CANVAS (7 COLS ON DESKTOP) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs relative transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >

                  {/* STEP 01: FACILITY PROFILE */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                          <Building2 className="h-4 w-4" />
                          <span>Step 01 • Typology & Location</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Facility Profile</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Specify primary building usage and geographic coordinates for localized weather integration.
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* Primary Use Case */}
                        <div className="space-y-2">
                          <Label htmlFor="building-type" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center justify-between">
                            <span>Primary Use Case <span className="text-destructive">*</span></span>
                            {formData.buildingType && (
                              <span className="text-[10px] font-mono text-primary flex items-center gap-1 font-semibold">
                                <Check className="h-3 w-3" /> Selected
                              </span>
                            )}
                          </Label>
                          <Select
                            value={formData.buildingType}
                            onValueChange={(v) => updateField("buildingType", v)}
                          >
                            <SelectTrigger id="building-type" className="h-11 text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors">
                              <SelectValue placeholder="Select building classification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="school">Educational Facility (High priority child occupancy)</SelectItem>
                              <SelectItem value="hospital">Healthcare Clinic (Critical patient care & continuous load)</SelectItem>
                              <SelectItem value="office">Commercial Office (Daytime occupational exposure)</SelectItem>
                              <SelectItem value="residential">Residential Block (Continuous 24-hr exposure)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground">
                            Classification calibrates occupant vulnerability weighting and peak heat sensitivity.
                          </p>
                        </div>

                        {/* Location (City) with Preset Chips */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="facility-city" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                              City / Urban Center <span className="text-destructive">*</span>
                            </Label>
                            <span className="text-[10px] text-muted-foreground font-mono">Quick City Pick</span>
                          </div>

                          {/* Quick City Pick Pills */}
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            {CITY_PRESETS.map((city) => (
                              <button
                                key={city.name}
                                type="button"
                                onClick={() => applyCityPreset(city)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                                  formData.location.toLowerCase() === city.name.toLowerCase()
                                    ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                                    : "bg-muted/20 hover:bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {city.name}
                              </button>
                            ))}
                          </div>

                          <div className="relative">
                            <Input
                              id="facility-city"
                              className="h-11 text-xs sm:text-sm bg-background pl-9 border-border/70 focus:border-primary transition-colors"
                              placeholder="e.g. Hyderabad, Chennai, Delhi, Mumbai"
                              value={formData.location}
                              onChange={(e) => updateField("location", e.target.value)}
                            />
                            <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                          </div>
                        </div>

                        {/* Latitude & Longitude in 2 cols */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="facility-lat" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                              Latitude (°N) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="facility-lat"
                              className="h-11 font-mono text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors"
                              type="number"
                              step="any"
                              placeholder="17.3850"
                              value={formData.latitude}
                              onChange={(e) => updateField("latitude", e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground font-mono">Range: -90.0 to 90.0</p>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="facility-lon" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                              Longitude (°E) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="facility-lon"
                              className="h-11 font-mono text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors"
                              type="number"
                              step="any"
                              placeholder="78.4867"
                              value={formData.longitude}
                              onChange={(e) => updateField("longitude", e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground font-mono">Range: -180.0 to 180.0</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 02: ENVIRONMENTAL EXPOSURE */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                          <Sun className="h-4 w-4" />
                          <span>Step 02 • Solar & Vegetative Factors</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Environmental Exposure</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Quantify exterior perimeter shade and surrounding green vegetative cover.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Shade Coverage with Slider & Presets */}
                        <div className="p-4 bg-muted/15 border border-border/40 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="shade-coverage" className="text-xs uppercase tracking-wider text-foreground font-bold">
                                Shade Coverage (%) <span className="text-destructive">*</span>
                              </Label>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Site perimeter shielded from direct 11:00 AM – 3:00 PM irradiance.
                              </p>
                            </div>
                            <span className="font-mono text-lg font-bold text-primary tabular-nums">
                              {formData.shadeCoverage ? `${formData.shadeCoverage}%` : "0%"}
                            </span>
                          </div>

                          {/* Range Slider for immediate tactile interaction */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.shadeCoverage || "0"}
                            onChange={(e) => updateField("shadeCoverage", e.target.value)}
                            className="w-full h-2 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                          />

                          {/* Quick Preset Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <span className="text-muted-foreground">Presets:</span>
                            <div className="flex gap-1.5">
                              {["10", "25", "50", "75"].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => updateField("shadeCoverage", val)}
                                  className={`px-2 py-0.5 rounded border font-mono transition-colors ${
                                    formData.shadeCoverage === val
                                      ? "bg-primary text-primary-foreground border-primary font-bold"
                                      : "bg-background hover:bg-muted text-muted-foreground border-border/50"
                                  }`}
                                >
                                  {val}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Green Area Coverage with Slider & Presets */}
                        <div className="p-4 bg-muted/15 border border-border/40 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="green-coverage" className="text-xs uppercase tracking-wider text-foreground font-bold">
                                Green Area Coverage (%) <span className="text-destructive">*</span>
                              </Label>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Vegetative density capable of mitigating urban heat island amplification.
                              </p>
                            </div>
                            <span className="font-mono text-lg font-bold text-primary tabular-nums">
                              {formData.greenCoverage ? `${formData.greenCoverage}%` : "0%"}
                            </span>
                          </div>

                          {/* Range Slider */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.greenCoverage || "0"}
                            onChange={(e) => updateField("greenCoverage", e.target.value)}
                            className="w-full h-2 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                          />

                          {/* Quick Preset Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <span className="text-muted-foreground">Presets:</span>
                            <div className="flex gap-1.5">
                              {["5", "15", "30", "50"].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => updateField("greenCoverage", val)}
                                  className={`px-2 py-0.5 rounded border font-mono transition-colors ${
                                    formData.greenCoverage === val
                                      ? "bg-primary text-primary-foreground border-primary font-bold"
                                      : "bg-background hover:bg-muted text-muted-foreground border-border/50"
                                  }`}
                                >
                                  {val}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 03: BUILDING ENVELOPE */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                          <Layers className="h-4 w-4" />
                          <span>Step 03 • Envelope & Occupancy</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Building Envelope</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Define physical roof characteristics and human occupancy load.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Occupancy and Operating Hours */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="occupancy-count" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                              Peak Occupancy <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="occupancy-count"
                                className="h-11 font-mono text-xs sm:text-sm bg-background pr-16 border-border/70 focus:border-primary transition-colors"
                                type="number"
                                min="1"
                                placeholder="e.g. 350"
                                value={formData.occupancy}
                                onChange={(e) => updateField("occupancy", e.target.value)}
                              />
                              <span className="absolute right-3 top-3 text-[11px] text-muted-foreground">people</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Total occupants present during peak hours.</p>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="operating-hours" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                              Operating Window <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="operating-hours"
                                className="h-11 font-mono text-xs sm:text-sm bg-background pr-16 border-border/70 focus:border-primary transition-colors"
                                type="number"
                                min="1"
                                max="24"
                                placeholder="8"
                                value={formData.operatingHours}
                                onChange={(e) => updateField("operatingHours", e.target.value)}
                              />
                              <span className="absolute right-3 top-3 text-[11px] text-muted-foreground">hrs/day</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Daily facility operating duration.</p>
                          </div>
                        </div>

                        {/* Roof Material */}
                        <div className="space-y-1.5">
                          <Label htmlFor="roof-material" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                            Primary Roof Material <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.roofType}
                            onValueChange={(v) => updateField("roofType", v)}
                          >
                            <SelectTrigger id="roof-material" className="h-11 text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors">
                              <SelectValue placeholder="Select roof composition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="concrete">Concrete Slab (High thermal mass, absorbs & retains heat)</SelectItem>
                              <SelectItem value="metal">Metal / Tin Sheet (Extreme radiant thermal conduction)</SelectItem>
                              <SelectItem value="tile">Clay / Ceramic Tile (Moderate thermal resistance)</SelectItem>
                              <SelectItem value="thatched">Thatched (Low thermal mass, moderate resistance)</SelectItem>
                              <SelectItem value="green">Cool / Green Roof (High albedo reflective barrier)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Roof Condition */}
                        <div className="space-y-1.5">
                          <Label htmlFor="roof-condition" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                            Roof Condition <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.roofCondition}
                            onValueChange={(v) => updateField("roofCondition", v)}
                          >
                            <SelectTrigger id="roof-condition" className="h-11 text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors">
                              <SelectValue placeholder="Select structural integrity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="poor">Poor (Visible cracks, structural degradation, leaks)</SelectItem>
                              <SelectItem value="fair">Fair (Aging surface, minor weathering)</SelectItem>
                              <SelectItem value="good">Good (Standard weatherproof integrity)</SelectItem>
                              <SelectItem value="excellent">Excellent (Recently coated, optimal reflective surface)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 04: RESILIENCE INFRASTRUCTURE */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                          <Droplets className="h-4 w-4" />
                          <span>Step 04 • Adaptive Mitigation</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Resilience Infrastructure</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Assess existing airflow dynamics, hydration supply, and designated emergency respite space.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Ventilation Architecture */}
                        <div className="space-y-1.5">
                          <Label htmlFor="ventilation-arch" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                            Ventilation Architecture <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.ventilation}
                            onValueChange={(v) => updateField("ventilation", v)}
                          >
                            <SelectTrigger id="ventilation-arch" className="h-11 text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors">
                              <SelectValue placeholder="Select ventilation configuration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="poor">Poor (Minimal airflow, sealed openings, no fans)</SelectItem>
                              <SelectItem value="medium">Medium (Standard operable windows, ceiling fans)</SelectItem>
                              <SelectItem value="good">Good (Engineered cross-ventilation, stack draft design)</SelectItem>
                              <SelectItem value="excellent">Excellent (Active mechanical HVAC with thermal recovery)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground">
                            Cross-ventilation convective drafts reduce indoor air stagnation and perceived heat index.
                          </p>
                        </div>

                        {/* Drinking Water Accessibility */}
                        <div className="space-y-1.5">
                          <Label htmlFor="water-access" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                            Drinking Water Accessibility <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.waterAccess}
                            onValueChange={(v) => updateField("waterAccess", v)}
                          >
                            <SelectTrigger id="water-access" className="h-11 text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors">
                              <SelectValue placeholder="Select hydration infrastructure" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None available on premise (Severe dehydration hazard)</SelectItem>
                              <SelectItem value="poor">Poor (Unreliable or single distant source)</SelectItem>
                              <SelectItem value="adequate">Adequate (Standard potable distribution)</SelectItem>
                              <SelectItem value="good">Good (Multiple stations, chilled, high reliability)</SelectItem>
                              <SelectItem value="excellent">Excellent (Abundant chilled hydration stations across facility)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Dedicated Heat Relief Space */}
                        <div className="space-y-1.5">
                          <Label htmlFor="relief-space" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                            Dedicated Heat Relief Space <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.reliefSpace}
                            onValueChange={(v) => updateField("reliefSpace", v)}
                          >
                            <SelectTrigger id="relief-space" className="h-11 text-xs sm:text-sm bg-background border-border/70 focus:border-primary transition-colors">
                              <SelectValue placeholder="Select relief sanctuary capacity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None (Zero designated cool retreat zone)</SelectItem>
                              <SelectItem value="limited">Limited (Passive shaded canopy or hallway)</SelectItem>
                              <SelectItem value="adequate">Adequate (Dedicated room with active fans)</SelectItem>
                              <SelectItem value="good">Good (Air-cooled refuge room with medical supplies)</SelectItem>
                              <SelectItem value="excellent">Excellent (Climate-controlled sanctuary with continuous backup)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 05: ENGINE REVIEW */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Step 05 • Deterministic Verification</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Engine Review & Execution</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verify telemetry parameters before executing the deterministic scoring engine.
                        </p>
                      </div>

                      {/* PARAMETER AUDIT GRID */}
                      <div className="bg-muted/20 border border-border/50 rounded-xl p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-primary" />
                            <span>Telemetry Parameter Package</span>
                          </span>
                          <Badge className="bg-primary/10 text-primary border-primary/25 font-mono text-[10px]">
                            {readiness}% VERIFIED
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Facility Class</span>
                            <span className="font-semibold capitalize text-foreground">{formData.buildingType || "—"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Location Node</span>
                            <span className="font-semibold text-foreground">{formData.location || "—"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Coordinates</span>
                            <span className="font-mono text-foreground">{formData.latitude}°N, {formData.longitude}°E</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Occupancy Load</span>
                            <span className="font-semibold text-foreground">{formData.occupancy} @ {formData.operatingHours}h/day</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Roof Envelope</span>
                            <span className="font-semibold capitalize text-foreground">{formData.roofType} ({formData.roofCondition})</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Shade / Greenery</span>
                            <span className="font-mono text-foreground">{formData.shadeCoverage}% shade, {formData.greenCoverage}% green</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Ventilation</span>
                            <span className="font-semibold capitalize text-foreground">{formData.ventilation}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Hydration Access</span>
                            <span className="font-semibold capitalize text-foreground">{formData.waterAccess}</span>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Evaluation executes purely deterministic mathematical scoring (0–100 resilience points). Zero generative hallucinations.</span>
                        </div>
                      </div>

                      {/* EXECUTION BUTTON */}
                      <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={loading || readiness < 100}
                        className="w-full h-12 text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all group"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>EXECUTING DETERMINISTIC SCORING ALGORITHM...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>AUTHORIZE ENGINE EXECUTION & VIEW REPORT</span>
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* INTEGRATED ACTION BAR */}
              <div className="mt-8 pt-5 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={currentStep === 0 || loading}
                    className="text-xs h-9 bg-background hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    <span>Back</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrefill}
                    disabled={loading}
                    className="text-xs font-mono text-muted-foreground hover:text-primary hover:bg-primary/5 h-9 transition-colors group"
                    title="Auto-fill with canonical Hyderabad School profile"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                    <span>&gt;_ Auto-fill Demo</span>
                  </Button>
                </div>

                {currentStep < STEPS.length - 1 && (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid || loading}
                    className="text-xs font-semibold h-9 shadow-2xs group"
                  >
                    <span>Continue</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT / CONTEXTUAL INTELLIGENCE PANEL (5 COLS ON DESKTOP) */}
          <div className="lg:col-span-5 space-y-5">

            {/* DYNAMIC GUIDANCE CARD ADAPTED TO CURRENT STEP */}
            <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Contextual Intelligence
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono uppercase bg-background border-border/60">
                  {STEPS[currentStep].title}
                </Badge>
              </div>

              {/* STEP 01 CONTEXT: LOCATION & GEOCODING READINESS */}
              {currentStep === 0 && (
                <div className="space-y-4 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    Precise geographic coordinates allow HeatCredit to query real-time Open-Meteo meteorological telemetry (ambient air, apparent heat index, humidity, wind).
                  </p>

                  {/* TELEMETRY READINESS CARD */}
                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        <span>Telemetry Stream</span>
                      </span>
                      {telemetryLoading ? (
                        <span className="text-[10px] font-mono text-primary flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Querying Open-Meteo...
                        </span>
                      ) : telemetry ? (
                        <span className="text-[10px] font-mono text-primary flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Live Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">Awaiting coordinates</span>
                      )}
                    </div>

                    {telemetry ? (
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2.5 bg-card rounded-lg border border-border/40 space-y-0.5">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            <span>Ambient Air</span>
                          </div>
                          <div className="font-bold text-foreground text-sm tabular-nums">
                            {telemetry.temperature.toFixed(1)}°C
                          </div>
                        </div>

                        <div className="p-2.5 bg-destructive/5 rounded-lg border border-destructive/20 text-destructive space-y-0.5">
                          <div className="text-[10px] flex items-center gap-1">
                            <Sun className="h-3 w-3" />
                            <span>Apparent Heat</span>
                          </div>
                          <div className="font-bold text-sm tabular-nums">
                            {telemetry.apparentTemperature.toFixed(1)}°C
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground leading-relaxed">
                        Enter latitude and longitude or click a quick city pick to establish a verified telemetry stream.
                      </div>
                    )}
                  </div>

                  <div className="pt-1 text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Next step:</strong> You will calibrate perimeter shade and vegetative canopy factors.</span>
                  </div>
                </div>
              )}

              {/* STEP 02 CONTEXT: SOLAR SHIELD & VEGETATION */}
              {currentStep === 1 && (
                <div className="space-y-4 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    Direct solar irradiance can exceed <strong>800 W/m²</strong> during midday peak hours. Unshaded ground surfaces act as thermal batteries that amplify ambient temperatures.
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                      <div className="font-bold text-foreground flex items-center justify-between">
                        <span>Shade Coverage Thresholds</span>
                        <span className="font-mono text-[10px] text-muted-foreground">Max 15 pts</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        &lt;30% is flagged as a <strong>High Vulnerability Gap</strong>. Facilities with &gt;50% canopy shade attenuate up to 4.5°C of radiant surface heating.
                      </p>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                      <div className="font-bold text-foreground flex items-center justify-between">
                        <span>Vegetative Density</span>
                        <span className="font-mono text-[10px] text-muted-foreground">Max 10 pts</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Evapotranspiration from permeable tree cover suppresses localized microclimate temperatures through natural convective cooling.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Next step:</strong> You will configure roof composition and occupant load.</span>
                  </div>
                </div>
              )}

              {/* STEP 03 CONTEXT: BUILDING ENVELOPE */}
              {currentStep === 2 && (
                <div className="space-y-4 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    The roof constitutes up to <strong>70% of total solar thermal gain</strong> in single- and double-story structures.
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                      <div className="font-bold text-foreground">Thermal Conduction Profiles</div>
                      <ul className="text-[11px] text-muted-foreground space-y-1 pt-1 list-disc list-inside">
                        <li><strong>Metal / Tin:</strong> Extreme thermal transfer; internal surface temps exceed 55°C.</li>
                        <li><strong>Concrete Slab:</strong> High thermal inertia; re-radiates heat inward late into evening.</li>
                        <li><strong>Cool / Green:</strong> High solar reflectance (&gt;0.80 SRI); blocks up to 80% solar absorption.</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                      <div className="font-bold text-foreground">Occupancy Exposure</div>
                      <p className="text-[11px] text-muted-foreground">
                        High occupant densities with extended operating windows during peak heat cycles increase acute dehydration and heat exhaustion risks.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Next step:</strong> You will diagnose ventilation, hydration, and emergency relief capacity.</span>
                  </div>
                </div>
              )}

              {/* STEP 04 CONTEXT: RESILIENCE INFRASTRUCTURE */}
              {currentStep === 3 && (
                <div className="space-y-4 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    Adaptive infrastructure represents immediate life-safety defenses for occupants when ambient heat indices reach critical levels (&gt;40°C).
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                      <div className="font-bold text-foreground">Hydration Availability (15 pts)</div>
                      <p className="text-[11px] text-muted-foreground">
                        Continuous access to chilled potable drinking water stations prevents heat-induced cognitive decline and clinical heatstroke.
                      </p>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                      <div className="font-bold text-foreground">Dedicated Relief Sanctuaries (15 pts)</div>
                      <p className="text-[11px] text-muted-foreground">
                        Designated climate-controlled or fan-cooled emergency respite spaces provide vital clinical recovery zones during extreme heat events.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Next step:</strong> Final system review and deterministic engine execution.</span>
                  </div>
                </div>
              )}

              {/* STEP 05 CONTEXT: ENGINE REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-4 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    Upon authorization, HeatCredit will calculate the <strong>7-dimension resilience score</strong>, identify ranked vulnerability deficits, and prepare the facility profile for <strong>0/1 Knapsack Budget Optimization</strong>.
                  </p>

                  <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                    <div className="font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Post-Evaluation Outputs</span>
                    </div>
                    <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Baseline Vulnerability Score (0–100 pts)</li>
                      <li>Risk Tier Classification (Critical, High, Moderate, Resilient)</li>
                      <li>Dimension-by-dimension deficit decomposition</li>
                      <li>Direct transfer to Knapsack Capital Optimizer</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* LIVE ASSESSMENT SUMMARY CHIPS */}
            <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-3 hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  <span>Configured Parameters</span>
                </span>
                <span className="font-mono text-primary font-bold">{completedCount} / {totalFields}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {formData.buildingType && (
                  <Badge variant="outline" className="bg-muted/30 font-normal hover:bg-muted/50 transition-colors">
                    Class: <span className="font-semibold capitalize ml-1">{formData.buildingType}</span>
                  </Badge>
                )}
                {formData.location && (
                  <Badge variant="outline" className="bg-muted/30 font-normal hover:bg-muted/50 transition-colors">
                    City: <span className="font-semibold ml-1">{formData.location}</span>
                  </Badge>
                )}
                {formData.shadeCoverage && (
                  <Badge variant="outline" className="bg-muted/30 font-normal font-mono hover:bg-muted/50 transition-colors">
                    Shade: {formData.shadeCoverage}%
                  </Badge>
                )}
                {formData.greenCoverage && (
                  <Badge variant="outline" className="bg-muted/30 font-normal font-mono hover:bg-muted/50 transition-colors">
                    Green: {formData.greenCoverage}%
                  </Badge>
                )}
                {formData.occupancy && (
                  <Badge variant="outline" className="bg-muted/30 font-normal font-mono hover:bg-muted/50 transition-colors">
                    Load: {formData.occupancy} ppl
                  </Badge>
                )}
                {formData.roofType && (
                  <Badge variant="outline" className="bg-muted/30 font-normal capitalize hover:bg-muted/50 transition-colors">
                    Roof: {formData.roofType}
                  </Badge>
                )}
                {formData.ventilation && (
                  <Badge variant="outline" className="bg-muted/30 font-normal capitalize hover:bg-muted/50 transition-colors">
                    Airflow: {formData.ventilation}
                  </Badge>
                )}
                {formData.waterAccess && (
                  <Badge variant="outline" className="bg-muted/30 font-normal capitalize hover:bg-muted/50 transition-colors">
                    Water: {formData.waterAccess}
                  </Badge>
                )}
                {formData.reliefSpace && (
                  <Badge variant="outline" className="bg-muted/30 font-normal capitalize hover:bg-muted/50 transition-colors">
                    Relief: {formData.reliefSpace}
                  </Badge>
                )}
                {!formData.buildingType && !formData.location && (
                  <span className="text-[11px] text-muted-foreground italic">No parameters entered yet. Select a classification or city above.</span>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
