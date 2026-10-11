"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Hexagon,
  ArrowRight,
  Building2,
  ShieldCheck,
  Cpu,
  CloudSun,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Thermometer,
  Trees,
  Wind,
  Droplets,
  Home,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  Mail,
  Globe,
  Database,
  Server,
  Code2
} from "lucide-react";

import {
  DoodleSun,
  DoodleUnderline,
  DoodleArrow,
  DoodleHeatWave,
  GithubIcon,
  LinkedinIcon
} from "@/components/doodles";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close explore dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExploreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Esc key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // The 4 verified team builders (strictly professional links & emails, zero phone numbers)
  const teamMembers = [
    {
      name: "Rishvin Reddy",
      role: "Team Member",
      initials: "RR",
      linkedin: "https://www.linkedin.com/in/rishvinreddy/?isSelfProfile=false",
      portfolio: "https://rishvinreddy.vercel.app/",
      github: "https://github.com/RishvinReddy",
      email: "rishvinreddy@gmail.com",
    },
    {
      name: "Pocharam Gayathri",
      role: "Team Member",
      initials: "PG",
      linkedin: "https://www.linkedin.com/in/gayathripocharam/",
      portfolio: "https://gayathripocharam.github.io/",
      github: "https://github.com/Gayathripocharam",
      email: "pocharamgayathri@gmail.com",
    },
    {
      name: "Guggilla Yogamruth Reddy",
      role: "Team Member",
      initials: "YR",
      linkedin: "https://www.linkedin.com/in/yogamruthreddy/",
      portfolio: null,
      github: "https://github.com/YogamruthReddy",
      email: "guggilla.yogamruthreddy4422@gmail.com",
    },
    {
      name: "Navari Yashwanth Reddy",
      role: "Team Member",
      initials: "NY",
      linkedin: "https://www.linkedin.com/in/navari-yashwanth-reddy-4a7065357/?isSelfProfile=true",
      portfolio: "https://navariyashwanthreddy.vercel.app/",
      github: "https://github.com/YashwanthNavari",
      email: "navariyashwanthreddy@gmail.com",
    },
  ];

  // 7 Canonical scoring dimensions from backend scoring model (max = 100 points)
  const scoringDimensions = [
    {
      key: "thermalProtection",
      name: "Thermal Protection",
      weight: 25,
      icon: Home,
      metric: "Roof & Envelope",
      description: "Evaluates roof material emissivity, degradation condition, ceiling insulation, and reflective coatings to resist solar thermal transfer into occupied interiors.",
    },
    {
      key: "shade",
      name: "Shade Coverage",
      weight: 15,
      icon: CloudSun,
      metric: "Solar Interception",
      description: "Quantifies structural canopies, pergolas, and architectural overhangs that shield pedestrian entrances and exterior assembly zones from direct irradiance.",
    },
    {
      key: "ventilation",
      name: "Passive & Active Ventilation",
      weight: 15,
      icon: Wind,
      metric: "Airflow Exchange",
      description: "Scores natural cross-ventilation potential, operable window geometry, ceiling fans, and stack-effect drafts that dissipate trapped radiant heat.",
    },
    {
      key: "waterAccess",
      name: "Hydration Access",
      weight: 15,
      icon: Droplets,
      metric: "Continuous Potable Supply",
      description: "Measures availability, distribution, and chiller reliability of dedicated drinking water stations to avert acute occupant dehydration during heatwaves.",
    },
    {
      key: "reliefCapacity",
      name: "Respite & Relief Space",
      weight: 15,
      icon: ShieldCheck,
      metric: "Conditioned Refuge",
      description: "Assesses dedicated, climate-controlled or fan-cooled recovery rooms where vulnerable occupants can recover from acute heat stress.",
    },
    {
      key: "greenInfrastructure",
      name: "Green Infrastructure",
      weight: 10,
      icon: Trees,
      metric: "Microclimate Cooling",
      description: "Evaluates vegetative canopy, permeable grounds, and perimeter tree cover that suppress local urban heat island effects through evapotranspiration.",
    },
    {
      key: "exposure",
      name: "Occupational Exposure",
      weight: 5,
      icon: Clock,
      metric: "Midday Solar Window",
      description: "Calibrates operating hours, occupant density, and exposure intervals during peak daily solar radiation cycles (11:00 AM – 4:00 PM).",
    },
  ];

  // Canonical interventions from data/interventions.json
  const featuredInterventions = [
    {
      id: "shade",
      name: "Shade Structure",
      category: "Solar Interception",
      cost: "₹25,000",
      impact: "+11 pts",
      target: "Shade Coverage",
      description: "Pergolas, canopies, and tensile shade sails over exposed courtyards and entry thresholds to intercept direct solar irradiance.",
    },
    {
      id: "roof",
      name: "Reflective Roof Coating",
      category: "Thermal Envelope",
      cost: "₹18,000",
      impact: "+9 pts",
      target: "Thermal Protection",
      description: "High-albedo cool-roof elastomeric coating to reflect incident radiation and significantly reduce interior radiant accumulation.",
    },
    {
      id: "ventilation",
      name: "Ventilation Improvement",
      category: "Airflow Dynamics",
      cost: "₹15,000",
      impact: "+8 pts",
      target: "Ventilation",
      description: "High-efficiency ceiling fans, louvers, and cross-ventilation drafts to accelerate heat dissipation and convective cooling.",
    },
    {
      id: "water",
      name: "Drinking Water Station",
      category: "Hydration Logistics",
      cost: "₹8,000",
      impact: "+6 pts",
      target: "Water Access",
      description: "Dedicated filtered potable hydration points with active chilling to prevent dehydration and hyperthermia during heat spikes.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-foreground">
      {/* =========================================================================
          1. REFINED PUBLIC HEADER (CLEAN HIERARCHY, COMPACT EXPLORE MENU)
         ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 shrink-0"
          >
            <div className="h-8.5 w-8.5 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
              <Hexagon className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-foreground">HeatCredit</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  Decision Engine
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                Climate Risk &amp; Resilience Intelligence
              </p>
            </div>
          </Link>

          {/* Streamlined Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-medium text-muted-foreground">
            <Link href="/overview" className="hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
              Platform
            </Link>
            <a href="#workflow" className="hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
              Workflow
            </a>
            <a href="#builders" className="hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
              Builders
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
              Architecture
            </a>

            {/* Compact "Explore" Dropdown for secondary modules */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                className="flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded px-1.5 py-1"
                aria-expanded={exploreDropdownOpen}
                aria-haspopup="true"
              >
                <span>Explore</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {exploreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border/80 rounded-xl shadow-xl p-2 z-50 text-xs space-y-1">
                  <a
                    href="#challenge"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                  >
                    The Heat Challenge
                  </a>
                  <a
                    href="#engine"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                  >
                    7-Dimension Engine
                  </a>
                  <Link
                    href="/interventions"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                  >
                    Intervention Catalogue
                  </Link>
                  <Link
                    href="/optimizer"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                  >
                    Budget Optimizer
                  </Link>
                  <Link
                    href="/scenarios"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                  >
                    Scenario Studio
                  </Link>
                  <Link
                    href="/methodology"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                  >
                    Methodology Disclosures
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Actions with Clear Dominance */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/assessment"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              Assess Facility
            </Link>
            <Link
              href="/overview"
              className="inline-flex items-center gap-2 px-4 py-2.2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-card/95 backdrop-blur-md px-4 pt-4 pb-6 space-y-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold px-2">Navigation</span>
              <Link
                href="/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Platform Console
              </Link>
              <a
                href="#challenge"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                The Heat Challenge
              </a>
              <a
                href="#engine"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                7-Dimension Engine
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Workflow Walkthrough
              </a>
              <Link
                href="/interventions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Interventions
              </Link>
              <Link
                href="/optimizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Budget Optimizer
              </Link>
              <a
                href="#builders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Meet the Builders
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted/50"
              >
                System Architecture
              </a>
            </div>

            <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
              <Link
                href="/assessment"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted/50"
              >
                <Building2 className="h-4 w-4 text-primary" />
                <span>Assess a Facility</span>
              </Link>
              <Link
                href="/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO VIEWPORT (TIGHTENED RHYTHM, REDUCED CLUTTER, DOMINANT CTA)
         ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-22 border-b border-border/50">
        {/* Subtle decorative architectural grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:4rem_4rem]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Editorial Headline & Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 sm:space-y-7"
            >
              {/* Eyebrow with Live Telemetry Pulse and subtle Sun doodle accent */}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-mono tracking-widest uppercase shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span>HEAT RESILIENCE DECISION ENGINE</span>
                </div>
                <DoodleSun className="w-8 h-8 text-amber-700/80 hidden sm:block shrink-0" />
              </div>

              {/* Main Editorial Headline with hand-drawn imperfect underline */}
              <div className="space-y-1 relative">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                  Measure heat risk.
                  <span className="relative block text-primary mt-1 sm:mt-1.5">
                    Optimize resilience.
                    <DoodleUnderline className="absolute -bottom-2.5 sm:-bottom-3 left-0 w-56 sm:w-72 h-3.5 text-amber-700/70" />
                  </span>
                  <span className="block text-foreground/90 mt-1 sm:mt-2">Act within budget.</span>
                </h1>
              </div>

              {/* Single, Confident Handwritten Annotation with breathing room */}
              <div className="pt-0.5">
                <span className="font-handwriting text-2xl sm:text-3xl text-amber-800 dark:text-amber-500 font-semibold select-none -rotate-2 inline-block drop-shadow-xs">
                  “Built for a hotter world.”
                </span>
              </div>

              {/* Supporting Editorial Paragraph */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                HeatCredit evaluates facility-level thermal vulnerability using localized
                weather telemetry, diagnoses multidimensional resilience deficits, and
                algorithmically prioritizes physical interventions under strict capital constraints.
              </p>

              {/* CTA Action Buttons with Dominant Primary Visual Hierarchy */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  href="/overview"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary group"
                >
                  <span>Explore the Platform</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/assessment"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/60 text-foreground font-semibold text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Assess a Facility</span>
                </Link>
              </div>

              {/* Clean, Legible Credibility Strip */}
              <div className="pt-5 border-t border-border/60 grid grid-cols-3 gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>7 Dimensions</span>
                  </div>
                  <p className="text-foreground font-medium text-[11px] sm:text-xs">Deterministic Scoring</p>
                </div>

                <div className="space-y-0.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>0/1 Knapsack</span>
                  </div>
                  <p className="text-foreground font-medium text-[11px] sm:text-xs">Constrained Budget</p>
                </div>

                <div className="space-y-0.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                    <CloudSun className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Open-Meteo</span>
                  </div>
                  <p className="text-foreground font-medium text-[11px] sm:text-xs">Real-Time Telemetry</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Architectural Hero Image & Floating Card Cohesion */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              {/* Outer Editorial Frame with perfectly contained floating card */}
              <div className="relative rounded-2xl border border-border bg-card p-2.5 sm:p-3 shadow-xl overflow-hidden group">
                <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-muted">
                  <Image
                    src="/hero-architecture.jpg"
                    alt="Passive climate resilience architecture with terracotta jaali screening and shaded courtyard"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  {/* Subtle gradient vignette for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Floating Badge: Architectural Passive Strategy */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-lg px-2.5 py-1 shadow-sm flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-mono text-[10px] font-semibold text-foreground tracking-wide">
                        PASSIVE THERMAL GEOMETRY
                      </span>
                    </div>
                    <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                      RAJASTHAN PROTO
                    </span>
                  </div>

                  {/* Bottom Telemetry Card: Measured Environmental Impact */}
                  <div className="absolute bottom-3 left-3 right-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-3.5 shadow-lg space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                          Case Study (Illustrative)
                        </div>
                        <div className="font-bold text-foreground text-sm">
                          Terracotta Jaali &amp; Canopy
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded">
                          <TrendingDown className="h-3 w-3" />
                          -6.4°C Surface
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
                      <div>
                        <span className="text-muted-foreground text-[10px] block font-mono">Heat Index:</span>
                        <span className="font-semibold text-foreground font-mono">41.2°C Extreme</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block font-mono">Envelope Score:</span>
                        <span className="font-semibold text-primary font-mono">+28 Pts Projected</span>
                      </div>
                    </div>

                    <Link
                      href="/overview"
                      className="w-full flex items-center justify-between pt-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                    >
                      <span>Explore in Decision Engine</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Editorial Caption below frame */}
              <p className="mt-2.5 text-center text-[11px] font-mono text-muted-foreground">
                Architectural evidence: Porous screening and courtyard geometry attenuate peak heat without energy loads.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION A — THE HEAT CHALLENGE (STANDARDIZED MEASURE & SPACING)
         ========================================================================= */}
      <section id="challenge" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12 sm:mb-16">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
                01 / The Urban Heat Challenge
              </span>
              <DoodleHeatWave className="w-5 h-5 text-amber-600/70" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Heat is an environmental risk.
              <span className="block text-primary">Resilience is an investment decision.</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
              When ambient temperatures exceed 40°C, a simple weather forecast does not describe what happens inside a metal-roof schoolroom, a crowded clinic, or an unshaded community center. Without localized thermal analysis, resilience funding is spent blindly.
            </p>
          </div>

          {/* Triad of Thermal Vulnerability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative overflow-hidden shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                <Thermometer className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">1. Environmental Exposure</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Solar irradiance, ambient heat index, wet-bulb thresholds, and urban heat island microclimates that drive exterior thermal pressure.
              </p>
              <div className="pt-2 text-[10px] font-mono text-muted-foreground">
                Data: Open-Meteo &bull; Hourly Telemetry
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative overflow-hidden shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">2. Building Vulnerability</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Degraded roofing materials, zero ceiling insulation, low emissivity, and unshaded fenestration that transform structures into heat traps.
              </p>
              <div className="pt-2 text-[10px] font-mono text-muted-foreground">
                Analysis: Physical Envelope Assessment
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative overflow-hidden shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">3. Adaptive Capacity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The presence of continuous chilled hydration, passive ventilation drafts, and emergency cool rooms that protect human health during peaks.
              </p>
              <div className="pt-2 text-[10px] font-mono text-muted-foreground">
                Outcome: Actionable Interventions
              </div>
            </div>
          </div>

          {/* Qualitative Thermography Comparison Strip */}
          <div className="mt-10 p-5 sm:p-6 rounded-xl border border-border/80 bg-background shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Qualitative Thermal Accumulation Comparison
                </span>
                <h4 className="text-sm font-bold text-foreground">Roof Envelope &amp; Solar Attenuation</h4>
              </div>
              <span className="font-handwriting text-amber-800 text-sm">
                “A thermometer measures weather. HeatCredit measures vulnerability.”
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 space-y-1">
                <div className="flex items-center justify-between font-semibold text-red-900 dark:text-red-300">
                  <span>Unshaded Corrugated Metal</span>
                  <span className="font-mono text-xs">+12.8°C Internal Spike</span>
                </div>
                <p className="text-[11px] text-red-800/80 dark:text-red-400/80">
                  Zero insulation causes rapid indoor radiant heating. Severe health hazard during peak afternoon hours.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-300">
                  <span>Standard Concrete Slab</span>
                  <span className="font-mono text-xs">+6.2°C Thermal Mass Lag</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                  Absorbs solar heat during midday and re-radiates heat inward through late evening, extending exposure.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-300">
                  <span>Cool Coating + Jaali Screen</span>
                  <span className="font-mono text-xs">-6.4°C Attenuation</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">
                  High albedo reflects solar spectrum while perforated screening enables continuous convective airflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B — WHAT HEATCREDIT EVALUATES (CLEAR WEIGHT COMPARISONS)
         ========================================================================= */}
      <section id="engine" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
                02 / Canonical Scoring Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Look beyond the temperature.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                HeatCredit uses a strictly deterministic, explainable mathematical scoring engine. Every facility is diagnosed across seven distinct physical and operational dimensions that sum to a 0–100 resilience score.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-semibold">
                <span>Sum = 100 Points Max</span>
              </span>
            </div>
          </div>

          {/* 7 Dimension Matrix Grid with Visual Weight Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {scoringDimensions.map((dim, idx) => (
              <div
                key={dim.key}
                className="p-5.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors space-y-3.5 flex flex-col justify-between group shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-8.5 w-8.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <dim.icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {dim.weight} pts max
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground tracking-tight">{dim.name}</h3>
                    <p className="text-[11px] font-mono text-muted-foreground">{dim.metric}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {dim.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>DIMENSION 0{idx + 1}</span>
                    <span className="text-primary font-semibold">{dim.weight}% OF TOTAL</span>
                  </div>
                  <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(dim.weight / 25) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Explanatory Callout Card */}
            <div className="p-5.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold">
                  MODEL TRANSPARENCY
                </span>
                <h4 className="text-sm font-bold text-foreground">Zero Opaque Heuristics</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every weight, threshold, and classification is publicly auditable. No unverified machine learning outputs or non-deterministic hallucinations.
                </p>
              </div>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Read Full Scoring Methodology</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — THE HEATCREDIT WORKFLOW (NUMBERED STEPS)
         ========================================================================= */}
      <section id="workflow" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
              03 / End-to-End Decision Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              From environmental signals to practical decisions.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              HeatCredit connects every stage of facility resilience into an unbroken, auditable workflow. Move from intake to budget-constrained implementation in minutes.
            </p>
          </div>

          {/* 6-Step Workflow Chain */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative group hover:border-primary/50 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">STEP 01</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Assess Facility</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Input structural parameters: roof type, condition, shade coverage, ventilation, and geographic coordinates.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-1 group-hover:underline"
              >
                <span>Launch Assessment Wizard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative group hover:border-primary/50 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">STEP 02</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Analyze Vulnerability</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pull real-time Open-Meteo telemetry and compute 7-dimension resilience gaps and baseline risk classification.
              </p>
              <Link
                href="/overview"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-1 group-hover:underline"
              >
                <span>View Overview Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative group hover:border-primary/50 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">STEP 03</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Review Interventions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browse catalogue of physical mitigation measures with cost estimates, impact ratings, and dimension targets.
              </p>
              <Link
                href="/interventions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-1 group-hover:underline"
              >
                <span>Explore Intervention Library</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative group hover:border-primary/50 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">STEP 04</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Optimize Under Budget</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Solve a 0/1 knapsack dynamic program to select the highest-impact intervention subset for any budget ceiling.
              </p>
              <Link
                href="/optimizer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-1 group-hover:underline"
              >
                <span>Open Budget Optimizer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative group hover:border-primary/50 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">STEP 05</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Compare Scenarios</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Model multi-tiered spending scenarios to evaluate incremental score gains across conservative and aggressive budgets.
              </p>
              <Link
                href="/scenarios"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-1 group-hover:underline"
              >
                <span>Enter Scenario Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 relative group hover:border-primary/50 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">STEP 06</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Audit &amp; Decision Reports</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate executive-ready audit reports with complete evidence provenance, model disclosures, and implementation roadmaps.
              </p>
              <Link
                href="/report"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-1 group-hover:underline"
              >
                <span>View Decision Reports</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — INTERVENTION LIBRARY
         ========================================================================= */}
      <section id="interventions" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
                04 / Physical Mitigation Library
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Turn a risk score into a plan.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Every intervention in the HeatCredit catalogue is mapped directly to a scoring dimension deficit with verified cost parameters and projected resilience improvements.
              </p>
            </div>
            <div>
              <Link
                href="/interventions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 text-xs font-semibold text-foreground transition-colors"
              >
                <span>View Complete Catalogue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {featuredInterventions.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      {item.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded">
                      {item.impact}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">EST. COST:</span>
                    <span className="font-mono font-bold text-foreground">{item.cost}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block font-mono">TARGET:</span>
                    <span className="font-mono text-primary text-[11px] font-semibold">{item.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — BUDGET INTELLIGENCE (0/1 KNAPSACK OPTIMIZER)
         ========================================================================= */}
      <section id="optimizer" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
                05 / Constrained Budget Optimization
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Every rupee should have a reason.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Facility budgets are strictly constrained. HeatCredit applies the canonical 0/1 Knapsack dynamic programming algorithm to guarantee the mathematically optimal set of interventions that maximizes resilience points without exceeding capital limits.
              </p>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Dynamic Programming Formulation</span>
                  <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">
                    O(n &bull; W) Solver
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Given a discrete capital ceiling W and interventions with cost c[i] and impact v[i], the optimizer selects subset S &sube; I maximizing &sum; v[i] subject to &sum; c[i] &le; W.
                </p>
              </div>

              <div className="pt-1">
                <Link
                  href="/optimizer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <span>Explore the Optimizer Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Illustrative Canonical Knapsack Output Card */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground font-semibold">
                      Illustrative Canonical Case
                    </span>
                    <h3 className="text-base font-bold text-foreground">Hyderabad Government School</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                    Budget: ₹50,000
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">BASELINE SCORE</span>
                    <span className="text-xl font-bold text-destructive">42 / 100</span>
                    <span className="text-[10px] text-destructive block">High Heat Risk</span>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-[10px] text-primary block">PROJECTED SCORE</span>
                    <span className="text-xl font-bold text-primary">67 / 100</span>
                    <span className="text-[10px] text-primary block">+25 Pts (+60% Gain)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                    Mathematically Selected Package (Optimal Subset)
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                      <span className="font-medium text-foreground">Shade Structure</span>
                      <span className="font-mono text-muted-foreground">₹25,000 &bull; +11 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                      <span className="font-medium text-foreground">Ventilation Improvement</span>
                      <span className="font-mono text-muted-foreground">₹15,000 &bull; +8 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                      <span className="font-medium text-foreground">Drinking Water Station</span>
                      <span className="font-mono text-muted-foreground">₹8,000 &bull; +6 pts</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">TOTAL ALLOCATED:</span>
                    <span className="font-bold text-foreground">₹48,000</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">REMAINING CAPITAL:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹2,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F — SCENARIO STUDIO
         ========================================================================= */}
      <section id="scenarios" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
                06 / Parametric Simulation Studio
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Compare possibilities before committing capital.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Test alternative capital tiers and intervention combinations in real time. Compare incremental score yields to justify budget requests to stakeholders.
              </p>
            </div>
            <div>
              <Link
                href="/scenarios"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                <span>Launch Scenario Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Tier 1 / Minimum Triage
                </span>
                <span className="font-mono text-xs text-muted-foreground">₹10,000 Cap</span>
              </div>
              <h3 className="font-bold text-base text-foreground">Rapid Hydration Defense</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Focuses purely on drinking water station installation to address life-safety hydration during heat advisories.
              </p>
              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Score Gain:</span>
                <span className="font-bold text-foreground">42 → 48 (+6 pts)</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border-2 border-primary bg-primary/5 space-y-4 relative shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                  Tier 2 / Recommended Optimal
                </span>
                <span className="font-mono text-xs font-bold text-primary">₹50,000 Cap</span>
              </div>
              <h3 className="font-bold text-base text-foreground">Balanced Resilience Retrofit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Optimal combination of shade sails, cross-ventilation assist, and water access. Highest marginal resilience per rupee.
              </p>
              <div className="pt-3 border-t border-primary/20 flex items-center justify-between text-xs font-mono">
                <span className="text-primary font-bold">Score Gain:</span>
                <span className="font-bold text-primary">42 → 67 (+25 pts)</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Tier 3 / Comprehensive
                </span>
                <span className="font-mono text-xs text-muted-foreground">₹150,000 Cap</span>
              </div>
              <h3 className="font-bold text-base text-foreground">Full Envelope Transformation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adds dedicated conditioned respite relief room, full reflective roof coating, and expanded shade structures.
              </p>
              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Score Gain:</span>
                <span className="font-bold text-foreground">42 → 92 (+50 pts)</span>
              </div>
            </div>
          </div>
          <p className="mt-3.5 text-center text-[11px] font-mono text-muted-foreground">
            Note: Scenario simulations are illustrative planning models based on prototype building profiles.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION G — EVIDENCE, DATA & METHODOLOGY
         ========================================================================= */}
      <section id="methodology" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
              07 / Data Provenance &amp; Scientific Integrity
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Transparent decisions. Traceable evidence.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Resilience decisions carry physical and financial consequences. HeatCredit enforces strict provenance tracking and transparent methodology disclosures across all calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
              <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Deterministic Formula</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scores are computed through verified weighted arithmetic. Zero non-deterministic neural approximations or ungrounded generative estimates.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
              <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                <CloudSun className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Open-Meteo Integration</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct external weather telemetry fetching live dry-bulb temperature, relative humidity, wind velocity, and solar radiation by coordinates.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
              <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Official NWS Heat Alerts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Official National Weather Service advisory integration for US-based coordinates, surfacing active Excessive Heat Warnings and Watches.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
              <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Evidence Validation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Distinguishes between owner-reported values, verified engineering audits, sensor logs, and demo assumptions with timestamped provenance.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl border border-border/80 bg-background text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="max-w-3xl text-[11px] leading-relaxed">
              <strong>Model Limitation Disclosure:</strong> HeatCredit scores and optimization outputs represent prototype decision-support metrics. They do not constitute certified structural engineering evaluations, HVAC commissioning stamps, or medical diagnosis standards.
            </p>
            <Link
              href="/methodology"
              className="font-semibold text-primary hover:underline shrink-0 text-xs"
            >
              Methodology Page &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION H — MEET THE BUILDERS (BALANCED CARDS, PRIVACY HONORED)
         ========================================================================= */}
      <section id="builders" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-[#F7F4EE] dark:bg-card/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>THE ENGINEERING TEAM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Built by a team that wants to make resilience actionable.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Four builders. One mission: turn heat-risk intelligence into practical resilience decisions.
            </p>
            <div className="pt-1">
              <span className="font-handwriting text-2xl text-amber-800 dark:text-amber-500 font-semibold select-none -rotate-2 inline-block">
                “Good ideas are built together.”
              </span>
            </div>
          </div>

          {/* Four Builder Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-card border border-border/90 rounded-2xl p-5.5 shadow-sm hover:shadow-md transition-all space-y-4.5 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Abstract Editorial Monogram Avatar */}
                  <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-mono text-lg font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                    {member.initials}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                {/* Professional Links Strip (Strictly phone-free, comfortable touch targets, accessible labels) */}
                <div className="pt-3.5 border-t border-border/60 flex items-center gap-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`${member.name}'s LinkedIn Profile`}
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>

                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`${member.name}'s GitHub Profile`}
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>

                  {member.portfolio && (
                    <a
                      href={member.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 flex items-center justify-center rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`${member.name}'s Portfolio Website`}
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}

                  <a
                    href={`mailto:${member.email}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Send Email to ${member.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs font-mono text-muted-foreground">
            Contact the engineering team directly via verified professional links and email.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION I — ARCHITECTURE & TECHNOLOGY
         ========================================================================= */}
      <section id="architecture" className="py-16 sm:py-20 lg:py-24 border-b border-border/50 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-primary">
              08 / Engineering Stack
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Engineered for decisions, not just dashboards.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Built on production-grade AWS serverless infrastructure with strict separation between client presentation, deterministic calculations, and environmental data adapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Code2 className="h-5 w-5" />
                <h3 className="font-bold text-sm text-foreground">Frontend Workspace</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and Framer Motion. Zero bloat, responsive across all viewports.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Server className="h-5 w-5" />
                <h3 className="font-bold text-sm text-foreground">Serverless Compute</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AWS API Gateway and TypeScript Lambda functions managed via AWS SAM. Sub-100ms cold starts with zero persistent server costs.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Database className="h-5 w-5" />
                <h3 className="font-bold text-sm text-foreground">Persistence &amp; Telemetry</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Amazon DynamoDB for partitioned assessment and audit logging, paired with Open-Meteo REST APIs and NOAA NWS alerts.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>Explore Complete System Architecture Diagram</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION J — CLOSING CTA & SIGN-OFF
         ========================================================================= */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Subtle decorative background sketch rays */}
        <div className="absolute inset-0 pointer-events-none opacity-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:2rem_2rem]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          <div className="space-y-3.5">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              The next heatwave is not a planning strategy.
            </h2>
            <p className="text-base sm:text-xl text-primary-foreground/85 max-w-2xl mx-auto leading-relaxed">
              Understand the exposure. Prioritize the response. Make every resilience investment count.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/overview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-background text-foreground font-bold text-sm hover:bg-background/90 transition-all shadow-xl"
            >
              <span>Launch HeatCredit</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>

            <Link
              href="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground font-semibold text-sm transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Start a Facility Assessment</span>
            </Link>
          </div>

          <div className="pt-4">
            <span className="font-handwriting text-3xl text-amber-200 select-none -rotate-2 inline-block">
              “Built for a hotter world.”
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EDITORIAL FOOTER
         ========================================================================= */}
      <footer className="border-t border-border/40 bg-card/60 py-10 sm:py-12 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Hexagon className="h-5 w-5 text-primary" />
                <span className="font-bold text-base text-foreground">HeatCredit</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  ENV HACKS 2026
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                Decision-support intelligence for building heat vulnerability, resilience interventions, and capital allocation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
              <Link href="/overview" className="hover:text-foreground transition-colors">
                Overview
              </Link>
              <Link href="/assessment" className="hover:text-foreground transition-colors">
                Assessments
              </Link>
              <Link href="/interventions" className="hover:text-foreground transition-colors">
                Interventions
              </Link>
              <Link href="/optimizer" className="hover:text-foreground transition-colors">
                Optimizer
              </Link>
              <Link href="/scenarios" className="hover:text-foreground transition-colors">
                Scenarios
              </Link>
              <Link href="/report" className="hover:text-foreground transition-colors">
                Reports
              </Link>
              <Link href="/methodology" className="hover:text-foreground transition-colors">
                Methodology
              </Link>
              <Link href="/architecture" className="hover:text-foreground transition-colors">
                Architecture
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>
              &copy; 2026 HeatCredit. Open source environmental resilience engineering.
            </p>
            <div className="flex items-center gap-4">
              <span className="font-handwriting text-amber-800 text-sm">
                Built by Rishvin, Gayathri, Yogamruth &amp; Yashwanth
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
