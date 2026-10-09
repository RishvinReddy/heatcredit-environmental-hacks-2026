"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssessment, optimizeBudget, fetchWeather } from "@/lib/api";
import { ShieldCheck, MapPin, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center font-mono text-sm">GENERATING DOCUMENT...</div>}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [optData, setOptData] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const assessment = await getAssessment(id);
        setData(assessment);
        
        // Use 50k default budget for the report snapshot
        const opt = await optimizeBudget(id, 50000);
        setOptData(opt);

        // Prefer the snapshot captured at assessment creation time
        if (assessment.weatherSnapshot) {
          setWeather(assessment.weatherSnapshot);
        } else if (assessment.latitude && assessment.longitude) {
          const w = await fetchWeather(assessment.latitude, assessment.longitude);
          setWeather(w);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="flex h-[50vh] items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">GENERATING DECISION DOCUMENT...</div>;
  if (!data) return <div className="p-12 text-center text-destructive font-mono">ERROR: Assessment context lost.</div>;

  return (
    <div className="bg-muted/10 min-h-screen py-12 px-4 print:py-0 print:px-0 print:bg-white">
      
      {/* Web Only Action Bar */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="outline" className="gap-2 bg-background shadow-sm">
          <Printer className="h-4 w-4" /> Print Document
        </Button>
      </div>

      {/* DOCUMENT PAGE */}
      <div className="max-w-4xl mx-auto bg-background p-12 md:p-16 border border-border/40 shadow-sm rounded-sm print:border-none print:shadow-none print:p-0 print:w-full">
        
        {/* HEADER */}
        <header className="border-b-2 border-foreground pb-8 mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xl font-bold tracking-tighter uppercase">HeatCredit Decision Report</div>
              <div className="text-sm font-mono text-muted-foreground mt-1 tracking-widest">Document ID: {id}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold uppercase">{data.buildingType} Infrastructure</div>
              <div className="text-sm font-mono text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-2">Climate Resilience Strategy</h1>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <MapPin className="h-4 w-4" /> {data.location} [{data.latitude}, {data.longitude}]
          </div>
        </header>

        {/* EXECUTIVE SUMMARY */}
        <section className="mb-12">
          <SectionTitle title="01. Executive Summary" />
          <p className="text-foreground leading-relaxed">
            This document outlines the deterministic heat vulnerability assessment for the target infrastructure located in {data.location}. 
            Based on the HeatCredit engine's evaluation of the building envelope, operational parameters, and current resilience capabilities, 
            the facility requires strategic capital allocation to mitigate occupant heat stress. The authorized intervention package mathematically maximizes 
            resilience gain within a hypothetical ₹50,000 budget constraint.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* CURRENT RISK */}
          <section>
            <SectionTitle title="02. Current Risk Profile" />
            <div className="border border-border/60 p-6 bg-muted/5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Baseline Resilience Score</div>
              <div className="text-5xl font-bold tracking-tighter mb-2">{data.score} <span className="text-xl text-muted-foreground font-normal">/ 100</span></div>
              <div className="text-sm font-bold text-destructive uppercase">{data.score < 40 ? "Critical" : data.score < 60 ? "High" : "Moderate"} Risk Classification</div>
            </div>
          </section>

          {/* ENVIRONMENTAL CONDITIONS */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <SectionTitle title="03. Environmental Context" />
              {weather && (
                <div className="text-right">
                  <Badge variant="outline" className={weather.isDemo ? "text-amber-500 border-amber-500/30 bg-amber-500/5 mb-1 text-[10px]" : "text-emerald-500 border-emerald-500/30 bg-emerald-500/5 mb-1 text-[10px]"}>
                    {weather.isDemo ? "DEMO FALLBACK" : "LIVE ENVIRONMENTAL DATA"}
                  </Badge>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">
                    Updated {new Date(weather.fetchedAt).toLocaleTimeString()} • {data.location}
                  </div>
                </div>
              )}
            </div>
            <div className="border border-border/60 p-6 bg-muted/5">
              {weather ? (
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Ambient Temp</div>
                    <div className="font-mono text-xl">{weather.temperature.toFixed(1)}°C</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Apparent Temp</div>
                    <div className="font-mono text-xl text-destructive font-bold">{weather.apparentTemperature.toFixed(1)}°C</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Humidity</div>
                    <div className="font-mono text-xl">{weather.humidity}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Wind Speed</div>
                    <div className="font-mono text-xl">{weather.windSpeed} km/h</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-mono text-muted-foreground">Telemetry unavailable at report generation.</div>
              )}
            </div>
          </section>
        </div>

        {/* KEY VULNERABILITIES */}
        <section className="mb-12">
          <SectionTitle title="04. Key Vulnerabilities" />
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="py-3 font-semibold">Dimension</th>
                <th className="py-3 font-semibold">Identified Gap</th>
                <th className="py-3 font-semibold text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.vulnerabilities.map((v: any, i: number) => (
                <tr key={i}>
                  <td className="py-3 capitalize font-medium">{v.dimension.replace(/([A-Z])/g, ' $1').trim()}</td>
                  <td className="py-3 text-muted-foreground">{v.gap.toFixed(1)} point deficit</td>
                  <td className="py-3 text-right">
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${v.severity === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>{v.severity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {optData && (
          <>
            {/* RECOMMENDED INVESTMENT & PROJECTED RESILIENCE */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <section>
                <SectionTitle title="05. Recommended Investment" />
                <div className="border border-border/60 p-6 bg-background">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Total Capital Deployed</div>
                  <div className="text-4xl font-mono font-bold tracking-tighter">₹{optData.totalCost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-2">Constraint: ₹50,000</div>
                </div>
              </section>
              <section>
                <SectionTitle title="06. Projected Resilience" />
                <div className="border border-border/60 p-6 bg-primary/5">
                  <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Optimized Score</div>
                  <div className="text-4xl font-bold tracking-tighter text-primary">{optData.projectedScore} <span className="text-xl font-normal opacity-50">/ 100</span></div>
                  <div className="text-sm font-bold text-primary mt-2">+{optData.projectedScore - data.score} point improvement</div>
                </div>
              </section>
            </div>

            {/* INTERVENTION PACKAGE */}
            <section className="mb-12">
              <SectionTitle title="07. Authorized Intervention Package" />
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 font-semibold">Intervention</th>
                    <th className="py-3 font-semibold text-right">Cost (INR)</th>
                    <th className="py-3 font-semibold text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {optData.interventions.map((inv: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> {inv.name}</td>
                      <td className="py-3 text-right font-mono">₹{inv.cost.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-primary">+{inv.resilienceImpact}</td>
                    </tr>
                  ))}
                  {optData.interventions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground font-mono">No interventions authorized.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}

        <hr className="border-border/60 my-12" />

        {/* METHODOLOGY & AWS */}
        <section className="grid grid-cols-2 gap-12 text-xs text-muted-foreground mb-12">
          <div>
            <div className="font-bold uppercase tracking-widest text-foreground mb-2">Methodology</div>
            <p className="leading-relaxed">Scoring is generated via a deterministic multi-vector analysis evaluating thermal protection, shade, ventilation, water access, and green infrastructure against environmental exposure parameters. Optimization utilizes a 0/1 knapsack algorithm ensuring exact maximum impact within budget.</p>
          </div>
          <div>
            <div className="font-bold uppercase tracking-widest text-foreground mb-2">AWS Infrastructure</div>
            <p className="leading-relaxed">This report is generated serverlessly via AWS API Gateway and AWS Lambda execution environments, interfacing with Amazon DynamoDB. Generated for Track 02 (Heat & Water) of the Environmental Hacks 2026 event.</p>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="text-[9px] text-center text-muted-foreground/60 uppercase tracking-widest pb-8 print:pb-0">
          Generated by HeatCredit Engine — Internal Confidential Document — Do not distribute unoptimized strategies.
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-sm font-bold uppercase tracking-widest border-b border-border/40 pb-2 mb-6 text-foreground">{title}</h2>;
}
