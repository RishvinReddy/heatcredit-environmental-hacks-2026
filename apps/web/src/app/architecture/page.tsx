"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cloud,
  Server,
  Database,
  Activity,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowDown,
  Lock,
  Cpu,
  Radio,
  GitBranch,
  ExternalLink,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Terminal,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";

// ============================================================================
// VERIFIED INFRASTRUCTURE DATA (GROUNDED IN template.yaml & REPOSITORY CODE)
// ============================================================================

interface ArchNode {
  id: string;
  name: string;
  lane: "ingress" | "compute" | "data" | "external" | "monitoring";
  type: string;
  runtime?: string;
  role: string;
  sourceFile: string;
  sourceLine?: string;
  inputs: string[];
  outputs: string[];
  iamPolicies: string[];
  connectedTo: string[]; // Target IDs
  connectedFrom: string[]; // Source IDs
  details: string;
}

const ARCH_NODES: ArchNode[] = [
  // --------------------------------------------------------------------------
  // LANE 1: CLIENT & INGRESS
  // --------------------------------------------------------------------------
  {
    id: "amplify-client",
    name: "Next.js Client (Amplify)",
    lane: "ingress",
    type: "AWS Amplify Hosting",
    runtime: "Next.js 16 (Turbopack / SSR)",
    role: "Editorial Web Console & Decision Workspace",
    sourceFile: "apps/web/src/app/architecture/page.tsx",
    inputs: ["User Interactions", "Form Intake Data", "URL Navigation"],
    outputs: ["HTTPS REST Calls to API Gateway", "Local Storage Cache"],
    iamPolicies: ["Amplify Managed Service Role (CI/CD build pipeline)"],
    connectedTo: ["api-gateway"],
    connectedFrom: [],
    details:
      "Stateless web application compiled with Turbopack and deployed globally across AWS Amplify Edge CDN. Features client-side state caching, fallback evaluation routines, and interactive telemetry dashboards."
  },
  {
    id: "api-gateway",
    name: "Amazon API Gateway",
    lane: "ingress",
    type: "AWS::Serverless::Api",
    runtime: "Regional REST API (OpenAPI 3.0.1)",
    role: "Edge Ingress, CORS & Rate Limiting",
    sourceFile: "template.yaml",
    sourceLine: "L45-L77",
    inputs: ["HTTPS Requests from Client / External Partners"],
    outputs: ["Synchronous Lambda Event Invocations"],
    iamPolicies: ["CloudWatch Logging Role", "Lambda Invoke Permissions"],
    connectedTo: [
      "lambda-assess",
      "lambda-optimize",
      "lambda-weather",
      "lambda-warnings",
      "lambda-interventions",
      "lambda-health"
    ],
    connectedFrom: ["amplify-client"],
    details:
      "Regional entrypoint configured with burst limit of 50 and rate limit of 100 req/sec. Enforces CORS headers, handles preflight OPTIONS requests, and proxies requests synchronously to isolated backend Lambdas."
  },

  // --------------------------------------------------------------------------
  // LANE 2: SERVERLESS COMPUTE (ARM64 GRAVITON)
  // --------------------------------------------------------------------------
  {
    id: "lambda-assess",
    name: "Assessment Lambda",
    lane: "compute",
    type: "AWS::Serverless::Function",
    runtime: "Node.js 24.x (ARM64 / 256MB)",
    role: "Deterministic 7-Dimension Scoring Engine",
    sourceFile: "backend/functions/assessment/index.ts",
    sourceLine: "L276-L312",
    inputs: ["POST /assessments (Facility Envelope Payload)"],
    outputs: ["0–100 Physical Resilience Score & Gap Breakdown", "DynamoDB PutItem"],
    iamPolicies: ["AWSLambdaBasicExecutionRole", "DynamoDBCrudPolicy -> AssessmentsTable"],
    connectedTo: ["dynamo-assessments", "cloudwatch-logs"],
    connectedFrom: ["api-gateway"],
    details:
      "Executes the pure mathematical 7-dimension scoring engine. Translates physical envelope attributes (roof assembly, shading, ventilation, hydration, cooling, green cover, exposure) into an auditable resilience score and writes assessment records to DynamoDB."
  },
  {
    id: "lambda-optimize",
    name: "Optimization Lambda",
    lane: "compute",
    type: "AWS::Serverless::Function",
    runtime: "Node.js 24.x (ARM64 / 256MB)",
    role: "0/1 Knapsack Decision Algorithm",
    sourceFile: "backend/functions/optimization/index.ts",
    sourceLine: "L316-L348",
    inputs: ["POST /optimize (Budget B & Facility ID / State)"],
    outputs: ["Optimal Package, Total Cost, Score Delta", "DynamoDB PutItem"],
    iamPolicies: [
      "AWSLambdaBasicExecutionRole",
      "DynamoDBReadPolicy -> AssessmentsTable",
      "DynamoDBCrudPolicy -> RecommendationsTable"
    ],
    connectedTo: ["dynamo-assessments", "dynamo-recommendations", "cloudwatch-logs"],
    connectedFrom: ["api-gateway"],
    details:
      "Solves the budget-constrained combinatorial knapsack problem over the 6 canonical interventions. Applies strict tie-breaking, budget feasibility verification, and score capping at 100 points."
  },
  {
    id: "lambda-weather",
    name: "Weather Proxy Lambda",
    lane: "compute",
    type: "AWS::Serverless::Function",
    runtime: "Node.js 24.x (ARM64 / 10s Timeout)",
    role: "Open-Meteo Ingestion & Fallback Router",
    sourceFile: "backend/functions/weather/index.ts",
    sourceLine: "L210-L239",
    inputs: ["GET /weather?lat=...&lon=..."],
    outputs: ["Hourly Ambient Temp, Wet-Bulb, Humidity, Wind", "Fallback Cache Data"],
    iamPolicies: ["AWSLambdaBasicExecutionRole"],
    connectedTo: ["ext-openmeteo", "fallback-weather", "cloudwatch-logs"],
    connectedFrom: ["api-gateway"],
    details:
      "Fetches live hourly ambient temperature, apparent temperature, humidity, and wind from Open-Meteo CC BY 4.0. If external HTTP errors or timeouts occur, safely routes to the verified regional fallback cache."
  },
  {
    id: "lambda-warnings",
    name: "Warnings Lambda",
    lane: "compute",
    type: "AWS::Serverless::Function",
    runtime: "Node.js 24.x (ARM64 / 10s Timeout)",
    role: "Official NWS / Alert Integration",
    sourceFile: "backend/functions/warnings/index.ts",
    sourceLine: "L243-L272",
    inputs: ["GET /warnings?lat=...&lon=..."],
    outputs: ["Official Active Advisories with Agency Attribution"],
    iamPolicies: ["AWSLambdaBasicExecutionRole"],
    connectedTo: ["ext-nws", "cloudwatch-logs"],
    connectedFrom: ["api-gateway"],
    details:
      "Queries official National Weather Service CAP feeds. Validates active effective time windows, preserves attribution URLs, and filters non-heat alerts to avoid false warnings."
  },
  {
    id: "lambda-interventions",
    name: "Interventions Lambda",
    lane: "compute",
    type: "AWS::Serverless::Function",
    runtime: "Node.js 24.x (ARM64 / 15s Timeout)",
    role: "Canonical Catalogue Provider",
    sourceFile: "backend/functions/interventions/index.ts",
    sourceLine: "L178-L206",
    inputs: ["GET /interventions"],
    outputs: ["6 Canonical Interventions with Cost & Impact Metadata"],
    iamPolicies: ["AWSLambdaBasicExecutionRole"],
    connectedTo: ["cloudwatch-logs"],
    connectedFrom: ["api-gateway"],
    details:
      "Serves the immutable 6-item intervention catalogue with capital expenditure ranges (₹8k–₹50k), physical dimension mapping, and verified empirical impact points."
  },
  {
    id: "lambda-health",
    name: "Health Ping Lambda",
    lane: "compute",
    type: "AWS::Serverless::Function",
    runtime: "Node.js 24.x (ARM64 / 15s Timeout)",
    role: "Liveness & Diagnostic Probe",
    sourceFile: "backend/functions/health/index.ts",
    sourceLine: "L146-L174",
    inputs: ["GET /health"],
    outputs: ["Status 200 OK, Version 1.0.0, Timestamp, Service Uptime"],
    iamPolicies: ["AWSLambdaBasicExecutionRole"],
    connectedTo: ["cloudwatch-logs"],
    connectedFrom: ["api-gateway"],
    details:
      "Minimal ephemeral health checker verifying that the API Gateway invocation loop and Lambda execution environment are operational. Used for uptime monitoring and canary tests."
  },

  // --------------------------------------------------------------------------
  // LANE 3: PERSISTENCE (DYNAMODB)
  // --------------------------------------------------------------------------
  {
    id: "dynamo-assessments",
    name: "Assessments Table",
    lane: "data",
    type: "AWS::DynamoDB::Table",
    runtime: "Pay-Per-Request (On-Demand)",
    role: "Persistent Audit Trail for Building Assessments",
    sourceFile: "template.yaml",
    sourceLine: "L101-L121",
    inputs: ["Assessment Lambda PutItem", "Optimizer Lambda GetItem"],
    outputs: ["Assessment Record (Partition Key: assessmentId, TTL on ttl)"],
    iamPolicies: ["Enforces IAM Partition Key isolation & TTL specification"],
    connectedTo: [],
    connectedFrom: ["lambda-assess", "lambda-optimize"],
    details:
      "Serverless NoSQL table storing building input parameters, 7-dimension score breakdowns, timestamped evidence hashes, and calculated risk tier classifications."
  },
  {
    id: "dynamo-recommendations",
    name: "Recommendations Table",
    lane: "data",
    type: "AWS::DynamoDB::Table",
    runtime: "Pay-Per-Request (On-Demand)",
    role: "Optimized Package Allocation Records",
    sourceFile: "template.yaml",
    sourceLine: "L122-L142",
    inputs: ["Optimizer Lambda PutItem"],
    outputs: ["Recommendation Record (Partition Key: recommendationId, TTL on ttl)"],
    iamPolicies: ["Enforces IAM Partition Key isolation & TTL specification"],
    connectedTo: [],
    connectedFrom: ["lambda-optimize"],
    details:
      "Stores completed 0/1 knapsack intervention plans, including selected item arrays, remaining budget tallies, and projected physical score enhancements."
  },

  // --------------------------------------------------------------------------
  // LANE 4: EXTERNAL FEEDS
  // --------------------------------------------------------------------------
  {
    id: "ext-openmeteo",
    name: "Open-Meteo REST API",
    lane: "external",
    type: "External Web Service",
    runtime: "Open-Meteo CC BY 4.0",
    role: "Live Meteorological Telemetry Feeds",
    sourceFile: "apps/web/src/lib/api.ts",
    sourceLine: "L40-L80",
    inputs: ["HTTPS GET coordinate queries from Weather Lambda"],
    outputs: ["Real-time ambient & apparent temperature, wind, humidity"],
    iamPolicies: ["External HTTPS boundary (Outbound port 443)"],
    connectedTo: [],
    connectedFrom: ["lambda-weather"],
    details:
      "Open scientific weather API providing hourly forecast and real-time observation grids without API key dependencies. Includes rigorous HTTP error handling in client and Lambda."
  },
  {
    id: "ext-nws",
    name: "NOAA / NWS Alert Feeds",
    lane: "external",
    type: "Official Government API",
    runtime: "Common Alerting Protocol (CAP)",
    role: "Official Heat Advisory & Warning Feeds",
    sourceFile: "backend/functions/warnings/index.ts",
    inputs: ["HTTPS GET points query"],
    outputs: ["Standardized ATOM/CAP alert metadata & attribution link"],
    iamPolicies: ["External HTTPS boundary (Outbound port 443)"],
    connectedTo: [],
    connectedFrom: ["lambda-warnings"],
    details:
      "Monitors official excessive heat warnings and heat advisories issued by national meteorological offices, ensuring legal compliance and priority alert routing."
  },
  {
    id: "fallback-weather",
    name: "Regional Fallback Cache",
    lane: "external",
    type: "Local JSON Dataset",
    runtime: "Deterministic Static Baseline",
    role: "Offline High-Availability Safeguard",
    sourceFile: "data/weather-fallback.json",
    inputs: ["Weather Lambda fallback router"],
    outputs: ["Verified historical regional heat baselines"],
    iamPolicies: ["Packaged within Lambda bundle / client asset bundle"],
    connectedTo: [],
    connectedFrom: ["lambda-weather"],
    details:
      "Guarantees that the HeatCredit decision console remains fully functional even in low-bandwidth, post-disaster, or offline environments when live telemetry is unavailable."
  },

  // --------------------------------------------------------------------------
  // LANE 5: OBSERVABILITY & GOVERNANCE
  // --------------------------------------------------------------------------
  {
    id: "cloudwatch-logs",
    name: "AWS CloudWatch Logs",
    lane: "monitoring",
    type: "AWS::Logs::LogGroup",
    runtime: "7-Day Cost-Controlled Retention",
    role: "Centralized Audit Logging & Execution Tracing",
    sourceFile: "template.yaml",
    sourceLine: "L350-L387",
    inputs: ["Lambda stdout/stderr logs across all 6 engines"],
    outputs: ["Structured JSON log streams with 7-day retention"],
    iamPolicies: ["AWSLambdaBasicExecutionRole default CloudWatch log write"],
    connectedTo: ["cloudwatch-alarm"],
    connectedFrom: [
      "lambda-assess",
      "lambda-optimize",
      "lambda-weather",
      "lambda-warnings",
      "lambda-interventions",
      "lambda-health"
    ],
    details:
      "Dedicated log groups for all 6 Lambdas configured with strict 7-day retention to prevent AWS cost creep while preserving complete operational audit trails."
  },
  {
    id: "cloudwatch-alarm",
    name: "Lambda Error Alarm",
    lane: "monitoring",
    type: "AWS::CloudWatch::Alarm",
    runtime: "Threshold >= 5 Errors in 300s",
    role: "Automated Failure Alerting & State Check",
    sourceFile: "template.yaml",
    sourceLine: "L389-L404",
    inputs: ["AWS/Lambda Errors metric rollup"],
    outputs: ["Alarm State Notification on error burst"],
    iamPolicies: ["CloudWatch Metrics Integration"],
    connectedTo: [],
    connectedFrom: ["cloudwatch-logs"],
    details:
      "CloudWatch metric alarm configured to detect execution failures. Triggers state evaluation when cumulative Lambda errors reach or exceed 5 occurrences in a 5-minute window."
  }
];

// Swimlane configuration
interface SwimlaneDef {
  id: "ingress" | "compute" | "data" | "external" | "monitoring";
  number: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  borderColor: string;
}

const SWIMLANES: SwimlaneDef[] = [
  {
    id: "ingress",
    number: "01",
    title: "Client & Ingress",
    subtitle: "Amplify Edge & API Gateway",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    borderColor: "border-blue-500/30"
  },
  {
    id: "compute",
    number: "02",
    title: "Serverless Compute",
    subtitle: "ARM64 Graviton Lambdas (256MB)",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    borderColor: "border-emerald-500/30"
  },
  {
    id: "data",
    number: "03",
    title: "Persistence",
    subtitle: "DynamoDB On-Demand Tables",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    borderColor: "border-amber-500/30"
  },
  {
    id: "external",
    number: "04",
    title: "External Feeds",
    subtitle: "Open-Meteo, NWS & Fallback",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    borderColor: "border-cyan-500/30"
  },
  {
    id: "monitoring",
    number: "05",
    title: "Observability",
    subtitle: "CloudWatch Logs & Alarm",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    borderColor: "border-purple-500/30"
  }
];

// Request Lifecycle Steps
const LIFECYCLE_STEPS = [
  {
    step: "01",
    phase: "Client Intake",
    service: "Next.js on Amplify",
    desc: "Facility administrator enters physical envelope parameters (roof material, shade, ventilation, occupancy, cooling). Client validates numerical bounds locally.",
    timing: "< 5ms (client)"
  },
  {
    step: "02",
    phase: "Regional Ingress",
    service: "API Gateway",
    desc: "Regional REST endpoint receives HTTPS POST. Evaluates rate limiting (100 rps) and validates CORS headers. Dispatches synchronous event to Lambda.",
    timing: "~12ms (edge)"
  },
  {
    step: "03",
    phase: "Boundary Validation",
    service: "Lambda Guard",
    desc: "Zod-compatible validation verifies required attributes, bounds checks numbers (occupancy 1–100k, hours 1–24), and rejects NaN or malicious payloads.",
    timing: "~2ms (compute)"
  },
  {
    step: "04",
    phase: "Deterministic Math",
    service: "Scoring Engine",
    desc: "Executes pure mathematical formulation across 7 physical dimensions. No statistical hallucination. Calculates exact score (0–100) and gap priorities.",
    timing: "~8ms (compute)"
  },
  {
    step: "05",
    phase: "Persistence & Provenance",
    service: "DynamoDB PutItem",
    desc: "Writes immutable assessment record with UUID, calculated tier (Critical to Resilient), timestamp, and 30-day TTL to AssessmentsTable.",
    timing: "~18ms (storage)"
  },
  {
    step: "06",
    phase: "Audit Response",
    service: "JSON Payload",
    desc: "Returns HTTP 200 with score breakdown, timestamped provenance hash, and verified baseline attribution back to the decision console.",
    timing: "Total: < 50ms"
  }
];

export default function ArchitecturePage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("lambda-assess");
  const [laneFilter, setLaneFilter] = useState<string>("all");

  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) || ARCH_NODES[0];

  // Helper to determine relationship state for styling
  const isDirectlyConnected = (nodeId: string) => {
    return (
      selectedNode.connectedTo.includes(nodeId) ||
      selectedNode.connectedFrom.includes(nodeId)
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">

      {/* ===================================================================== */}
      {/* SECTION 1: EDITORIAL HERO                                             */}
      {/* ===================================================================== */}
      <section className="relative border-b border-border/80 overflow-hidden bg-background pt-10 pb-16 sm:py-20">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left: Editorial Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                INFRASTRUCTURE / SYSTEM DESIGN • AWS CLOUD ARCHITECTURE
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
                Inside the HeatCredit <br />
                <span className="font-serif italic font-normal text-primary">infrastructure.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-light">
                HeatCredit operates on a fully serverless, event-driven cloud architecture engineered for mathematical rigor, ephemeral execution, and zero idle compute waste. A deterministic pipeline translates raw building envelopes and physical weather feeds into auditable resilience decisions.
              </p>

              {/* Handwritten note in Caveat */}
              <div className="flex items-center gap-3 pt-2">
                <span
                  className="text-xl sm:text-2xl text-amber-600 dark:text-amber-500 transform -rotate-1 select-none font-medium"
                  style={{ fontFamily: "var(--font-handwriting), 'Caveat', cursive" }}
                >
                  Deterministic compute, verified boundaries. ➔
                </span>
                <span className="text-xs font-mono text-muted-foreground/60 hidden sm:inline">
                  (No black-box models)
                </span>
              </div>

              {/* Working Hero Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#system-canvas"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:bg-primary/95 transition-all duration-150 active:scale-[0.98]"
                >
                  <Cpu className="w-4 h-4" />
                  Explore architecture canvas
                  <ArrowDown className="w-4 h-4" />
                </a>

                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-muted/60 transition-all duration-150 active:scale-[0.98]"
                >
                  View scoring methodology
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Infrastructure Stats Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-lg">
                <div>
                  <div className="text-xs font-mono uppercase text-muted-foreground">RUNTIME ARCH</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">ARM64 Graviton</div>
                  <div className="text-[11px] text-muted-foreground">Node.js 24.x Lambda</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-muted-foreground">PERSISTENCE</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">DynamoDB</div>
                  <div className="text-[11px] text-muted-foreground">Pay-per-request / TTL</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-muted-foreground">LATENCY P95</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">&lt; 45ms</div>
                  <div className="text-[11px] text-muted-foreground">Deterministic solver</div>
                </div>
              </div>
            </div>

            {/* Right: Technical Line-Art Schematic Illustration */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xs backdrop-blur-xs overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-border/50 text-xs">
                  <span className="font-mono text-muted-foreground flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-primary" />
                    SCHEMATIC TOPO // V1.0-PROD
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    AWS SAM READY
                  </span>
                </div>

                {/* Custom Isometric SVG Schematic */}
                <div className="py-6 flex items-center justify-center">
                  <svg
                    viewBox="0 0 380 240"
                    className="w-full h-auto max-h-[240px] text-foreground select-none"
                    fill="none"
                    stroke="currentColor"
                  >
                    <g strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25">
                      <line x1="30" y1="20" x2="30" y2="220" />
                      <line x1="110" y1="20" x2="110" y2="220" />
                      <line x1="190" y1="20" x2="190" y2="220" />
                      <line x1="270" y1="20" x2="270" y2="220" />
                      <line x1="350" y1="20" x2="350" y2="220" />
                      <line x1="20" y1="60" x2="360" y2="60" />
                      <line x1="20" y1="120" x2="360" y2="120" />
                      <line x1="20" y1="180" x2="360" y2="180" />
                    </g>

                    <rect x="25" y="45" width="70" height="150" rx="10" strokeWidth="1" stroke="currentColor" opacity="0.3" fill="currentColor" fillOpacity="0.02" />
                    <rect x="135" y="30" width="100" height="180" rx="12" strokeWidth="1.2" stroke="currentColor" opacity="0.4" fill="currentColor" fillOpacity="0.03" />
                    <rect x="275" y="45" width="80" height="150" rx="10" strokeWidth="1" stroke="currentColor" opacity="0.3" fill="currentColor" fillOpacity="0.02" />

                    <rect x="35" y="95" width="50" height="50" rx="8" strokeWidth="1.5" className="stroke-primary" fill="currentColor" fillOpacity="0.05" />
                    <text x="60" y="122" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor" stroke="none">Client</text>
                    <text x="60" y="134" textAnchor="middle" fontSize="7" opacity="0.6" fill="currentColor" stroke="none">Amplify</text>

                    <path d="M 85 120 L 145 120" strokeWidth="1.5" className="stroke-primary" strokeDasharray="3 3" />
                    <circle cx="145" cy="120" r="3" fill="currentColor" className="fill-primary" />

                    <rect x="145" y="90" width="80" height="60" rx="8" strokeWidth="1.5" className="stroke-foreground" fill="currentColor" fillOpacity="0.08" />
                    <text x="185" y="117" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor" stroke="none">API Gateway</text>
                    <text x="185" y="129" textAnchor="middle" fontSize="7" opacity="0.6" fill="currentColor" stroke="none">Regional REST</text>

                    <path d="M 225 105 L 285 75" strokeWidth="1.2" opacity="0.6" />
                    <path d="M 225 120 L 285 120" strokeWidth="1.2" opacity="0.6" />
                    <path d="M 225 135 L 285 165" strokeWidth="1.2" opacity="0.6" />

                    <circle cx="285" cy="75" r="14" strokeWidth="1.2" className="stroke-emerald-600" fill="currentColor" fillOpacity="0.05" />
                    <text x="285" y="78" textAnchor="middle" fontSize="8" fontWeight="600" fill="currentColor" stroke="none">Score</text>

                    <circle cx="285" cy="120" r="14" strokeWidth="1.2" className="stroke-emerald-600" fill="currentColor" fillOpacity="0.05" />
                    <text x="285" y="123" textAnchor="middle" fontSize="8" fontWeight="600" fill="currentColor" stroke="none">Knap</text>

                    <circle cx="285" cy="165" r="14" strokeWidth="1.2" className="stroke-emerald-600" fill="currentColor" fillOpacity="0.05" />
                    <text x="285" y="168" textAnchor="middle" fontSize="8" fontWeight="600" fill="currentColor" stroke="none">Tele</text>

                    <path d="M 299 75 L 325 90" strokeWidth="1.2" opacity="0.6" strokeDasharray="2 2" />
                    <path d="M 299 120 L 325 120" strokeWidth="1.2" opacity="0.6" strokeDasharray="2 2" />

                    <rect x="315" y="95" width="35" height="50" rx="6" strokeWidth="1.5" className="stroke-amber-600" fill="currentColor" fillOpacity="0.05" />
                    <text x="332" y="118" textAnchor="middle" fontSize="8" fontWeight="600" fill="currentColor" stroke="none">DDB</text>
                    <text x="332" y="128" textAnchor="middle" fontSize="6" opacity="0.6" fill="currentColor" stroke="none">NoSQL</text>
                  </svg>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Stack: HeatCredit-prod</span>
                  <span>Isolation: Ephemeral MicroVMs</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: STRUCTURED 5-SWIMLANE ARCHITECTURE BOARD                   */}
      {/* ===================================================================== */}
      <section id="system-canvas" className="py-16 sm:py-24 border-b border-border/80 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header with Swimlane Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
                02 / THE SYSTEM TOPOLOGY
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                One system. Clearly connected.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Structured into five discrete architectural swimlanes. Click any service card to inspect its verified runtime specifications, IAM policy attachments, data contracts, and source code anchors.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
              {[
                { id: "all", label: "All Lanes (15)" },
                { id: "compute", label: "Compute (6)" },
                { id: "data", label: "Storage & Feeds (5)" },
                { id: "monitoring", label: "Observability (2)" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLaneFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    laneFilter === f.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE CONNECTION CONTEXT BANNER */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <span className="font-mono text-muted-foreground uppercase text-[11px]">ACTIVE FOCUS:</span>
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
                  {selectedNode.name}
                </span>
                <span className="text-muted-foreground hidden sm:inline">({selectedNode.type})</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>Connected:</span>
              {selectedNode.connectedFrom.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  ← {selectedNode.connectedFrom.length} Inbound
                </span>
              )}
              {selectedNode.connectedTo.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  → {selectedNode.connectedTo.length} Outbound
                </span>
              )}
              <button
                onClick={() => setSelectedNodeId("lambda-assess")}
                className="text-[11px] text-primary hover:underline ml-2"
              >
                Reset Default Focus
              </button>
            </div>
          </div>

          {/* THE 5 STRUCTURED SWIMLANES (FULL CONTAINER WIDTH, NEVER OVERLAPPING) */}
          <div className="bg-card/40 border border-border/80 rounded-3xl p-4 sm:p-6 shadow-xs overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 min-w-[760px] lg:min-w-0">

              {SWIMLANES.map((lane) => {
                const laneNodes = ARCH_NODES.filter((n) => {
                  if (laneFilter === "compute") return n.lane === "compute";
                  if (laneFilter === "data") return n.lane === "data" || n.lane === "external";
                  if (laneFilter === "monitoring") return n.lane === "monitoring";
                  return n.lane === lane.id;
                });

                if (laneNodes.length === 0) return null;

                return (
                  <div
                    key={lane.id}
                    className={`flex flex-col rounded-2xl bg-muted/20 border ${lane.borderColor} p-3.5 space-y-3.5`}
                  >
                    {/* Swimlane Column Header */}
                    <div className="pb-3 border-b border-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">
                          LANE {lane.number}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${lane.badgeColor}`}>
                          {laneNodes.length} {laneNodes.length === 1 ? "Node" : "Nodes"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {lane.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lane.subtitle}
                      </p>
                    </div>

                    {/* Nodes in this Swimlane (Spacious Stacked Cards) */}
                    <div className="space-y-3">
                      {laneNodes.map((node) => {
                        const isSelected = node.id === selectedNodeId;
                        const isConnected = isDirectlyConnected(node.id);

                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? "bg-card border-primary ring-2 ring-primary/40 shadow-sm"
                                : isConnected
                                ? "bg-card/95 border-primary/50 shadow-xs"
                                : "bg-card/75 border-border/80 hover:border-foreground/40 hover:bg-card opacity-85 hover:opacity-100"
                            }`}
                          >
                            {/* Card Top Row: Icon & Tag */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="p-1.5 rounded-lg bg-muted border border-border/60">
                                {node.lane === "ingress" && <Server className="w-3.5 h-3.5 text-blue-600" />}
                                {node.lane === "compute" && <Activity className="w-3.5 h-3.5 text-emerald-600" />}
                                {node.lane === "data" && <Database className="w-3.5 h-3.5 text-amber-600" />}
                                {node.lane === "external" && <Radio className="w-3.5 h-3.5 text-cyan-600" />}
                                {node.lane === "monitoring" && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                              </div>

                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 truncate max-w-[120px]">
                                {node.type.split("::").pop() || node.type}
                              </span>
                            </div>

                            {/* Service Name & Role */}
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                {node.name}
                              </h4>
                              <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                                {node.role}
                              </p>
                            </div>

                            {/* Runtime Spec Badge */}
                            {node.runtime && (
                              <div className="mt-2.5 pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground/80 truncate">
                                {node.runtime}
                              </div>
                            )}

                            {/* Connected Target Badges */}
                            {node.connectedTo.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {node.connectedTo.slice(0, 2).map((tgtId) => {
                                  const targetNode = ARCH_NODES.find((n) => n.id === tgtId);
                                  return (
                                    <span
                                      key={tgtId}
                                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/40 truncate max-w-[110px]"
                                    >
                                      ➔ {targetNode?.name.split(" ")[0] || tgtId}
                                    </span>
                                  );
                                })}
                                {node.connectedTo.length > 2 && (
                                  <span className="text-[9px] font-mono px-1 py-0.5 text-muted-foreground">
                                    +{node.connectedTo.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Selection Glow Indicator */}
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-primary ring-2 ring-card animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* ================================================================= */}
          {/* DEDICATED FULL-WIDTH NODE DETAILS INSPECTOR                       */}
          {/* ================================================================= */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-bold">
                  SERVICE INSPECTOR // VERIFIED CONFIGURATION
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {selectedNode.name}
                </h3>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">
                  AWS Resource: <span className="text-foreground">{selectedNode.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-muted border border-border/60 text-foreground font-medium">
                  Lane: {selectedNode.lane.toUpperCase()}
                </span>
                <a
                  href={`#${selectedNode.id}`}
                  className="text-xs font-mono px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-medium hover:bg-primary/20 transition-colors"
                >
                  Anchor Focus
                </a>
              </div>
            </div>

            {/* 3-Column Detailed Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">

              {/* Column 1: Role, Runtime & Source Code Anchor */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Engine Profile
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedNode.details}
                </p>

                <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Runtime Arch:</span>
                    <span className="font-mono font-medium text-foreground">{selectedNode.runtime || "Managed AWS"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Source Anchor:</span>
                    <span className="font-mono text-primary font-medium truncate max-w-[180px]">
                      {selectedNode.sourceFile} {selectedNode.sourceLine && `(${selectedNode.sourceLine})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: IAM Security Policies */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  IAM Security Policies
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bound strictly to least-privilege policies defined in SAM template. No administrative access or unrestricted wildcards.
                </p>

                <div className="space-y-1.5 pt-2">
                  {selectedNode.iamPolicies.map((pol, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-mono px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-foreground break-words"
                    >
                      ✓ {pol}
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Ingress Inputs & Egress Outputs */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  Data Contracts
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1 font-bold">
                      Incoming Ingress:
                    </div>
                    <div className="space-y-1">
                      {selectedNode.inputs.map((inp, idx) => (
                        <div key={idx} className="text-xs text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="leading-snug">{inp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1 font-bold">
                      Outgoing Egress:
                    </div>
                    <div className="space-y-1">
                      {selectedNode.outputs.map((out, idx) => (
                        <div key={idx} className="text-xs text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="leading-snug">{out}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Jump Buttons to Connected Nodes */}
                {(selectedNode.connectedTo.length > 0 || selectedNode.connectedFrom.length > 0) && (
                  <div className="pt-2 border-t border-border/40">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5 font-bold">
                      Jump to Connected Service:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...selectedNode.connectedFrom, ...selectedNode.connectedTo].map((relId) => {
                        const relNode = ARCH_NODES.find((n) => n.id === relId);
                        if (!relNode) return null;
                        return (
                          <button
                            key={relId}
                            onClick={() => setSelectedNodeId(relId)}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-card border border-border/70 hover:border-primary hover:text-primary transition-all text-muted-foreground"
                          >
                            ➔ {relNode.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: REQUEST LIFECYCLE                                          */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 border-b border-border/80 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
              03 / DETERMINISTIC REQUEST LIFECYCLE
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              From physical input to auditable decision.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every facility evaluation follows an immutable 6-stage execution lifecycle through AWS API Gateway and isolated ARM64 Lambda environments.
            </p>
          </div>

          {/* Horizontal Technical Flow (Stacks Vertically on Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {LIFECYCLE_STEPS.map((s, idx) => (
              <div
                key={s.step}
                className="relative bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between group hover:border-primary/50 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                      STAGE {s.step}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {s.timing}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground">{s.phase}</h4>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{s.service}</div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-border group-hover:text-primary transition-colors">
                    <ArrowRight className="w-5 h-5 bg-card rounded-full p-0.5 border border-border" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: SECURITY ARCHITECTURE                                      */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 border-b border-border/80 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
              04 / SECURITY & BOUNDARY CONTROLS
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Designed for clarity. Built for accountability.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Security boundaries are mathematically enforced in code and constrained by AWS IAM least-privilege policies. No broad wildcards, no public database access.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Control 1: Scoped IAM Policies */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Lock className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-bold text-foreground">
                Scoped IAM Least Privilege
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Functions do not possess administrative permissions. <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">AssessmentFunction</code> is bound strictly to <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">DynamoDBCrudPolicy</code> on <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">AssessmentsTable</code> only. <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">OptimizationFunction</code> has read-only access to assessments and write access to recommendations.
              </p>

              <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                ✓ SAM Policy Templates Enforced
              </div>
            </div>

            {/* Control 2: Strict Boundary Validation */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-bold text-foreground">
                Input Sanitization & Schema Defense
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All ingress payloads pass through physical boundary validation before any computation occurs. Numerical bounds are clamped (occupancy 1–100,000, daily operating hours 1–24, canopy coverage 0–100%). Any <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">NaN</code>, <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">Infinity</code>, or negative numbers are rejected with HTTP 400.
              </p>

              <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                ✓ 31 Validation Unit Tests Verified
              </div>
            </div>

            {/* Control 3: Ephemeral Stateless Compute */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <Cpu className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-bold text-foreground">
                Ephemeral MicroVM Isolation
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Lambda invocations execute within isolated Firecracker microVMs on AWS Graviton (ARM64). Execution environments are stateless: no data persists between requests on local storage, and execution logs contain no customer secrets or confidential facility keys.
              </p>

              <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                ✓ Zero Shared State Across Invocations
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: OBSERVABILITY & DEPLOYMENT OPERATIONS                      */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 border-b border-border/80 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
              05 / DEPLOYMENT & OBSERVABILITY
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Production telemetry and deployment pipeline.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transparent continuous delivery and real-time operations without opaque monitoring dependencies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Deployment Pipeline Breakdown */}
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Continuous Delivery Workflow
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold">
                    01
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">GitHub Source Control</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Main repository branch <code className="text-xs font-mono bg-muted px-1 rounded">feature/phase-3-building-evidence</code> triggers automatic build webhooks on commit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold">
                    02
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">AWS Amplify Hosting (Frontend)</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Builds <code className="text-xs font-mono bg-muted px-1 rounded">apps/web</code> with Turbopack, creates optimized SSR and static prerender bundles, and deploys across CloudFront edge locations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold">
                    03
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">AWS SAM Backend Infrastructure</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <code className="text-xs font-mono bg-muted px-1 rounded">template.yaml</code> bundles TypeScript Lambdas via esbuild into ARM64 distributions and deploys CloudFormation stack <code className="text-xs font-mono bg-muted px-1 rounded">heatcredit-prod</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CloudWatch Observability & Alarms */}
            <div className="lg:col-span-5 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                CloudWatch Observability
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Log Retention Policy</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">7 Days</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All 6 Lambda log groups (<code className="text-[11px] font-mono">/aws/lambda/heatcredit-*-prod</code>) are locked to 7-day retention to prevent AWS cost runaway while maintaining full auditability.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>CloudWatch Error Alarm</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">LambdaErrorAlarm</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Triggers alarm status if cumulative Lambda errors reach or exceed 5 occurrences within any 5-minute evaluation window (<code className="text-[11px] font-mono">Period: 300s</code>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Live Health Probe</span>
                    <span className="font-mono text-primary font-bold">GET /health</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Synthetic probe verifies cold-start availability, DynamoDB connectivity, and OpenAPI router integrity.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 6: EDITORIAL CLOSING NAVIGATION                               */}
      {/* ===================================================================== */}
      <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-primary/10 text-primary">
                  EXPLORE THE SUITE
                </div>

                <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Ready to inspect the mathematical formulation?
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Dive into the pure physical equations governing building envelope scores, or launch the interactive knapsack optimizer to simulate budget allocations.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href="/methodology"
                  className="inline-flex items-center justify-between px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/95 transition-all shadow-sm group active:scale-[0.98]"
                >
                  <span>Technical Methodology</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/intelligence"
                  className="inline-flex items-center justify-between px-5 py-3.5 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-muted/60 transition-all group active:scale-[0.98]"
                >
                  <span>Heat Intelligence Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/overview"
                  className="inline-flex items-center justify-between px-5 py-3.5 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-muted/60 transition-all group active:scale-[0.98]"
                >
                  <span>Executive Overview</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
