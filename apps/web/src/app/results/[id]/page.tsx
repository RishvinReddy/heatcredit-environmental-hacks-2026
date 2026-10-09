"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, MapPin, ShieldAlert, Sun, Thermometer, Wind, Target, Droplets, ArrowUpRight, Activity } from "lucide-react";
import { getAssessment, fetchWeather } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center font-mono text-sm">INITIALIZING ANALYTICS...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const assessment = await getAssessment(id);
        setData(assessment);
        // Use the snapshot captured at assessment creation time for reproducibility.
        // Only fall back to a live fetch if the backend didn't include a snapshot
        // (e.g. older assessments created before the snapshot feature).
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
    loadData();
  }, [id]);

  if (loading) return <div className="flex h-[50vh] items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">QUERYING ENGINE...</div>;
  if (!data) return <div className="p-12 text-center text-destructive font-mono">ERROR: Assessment context lost.</div>;

  const score = data.score;
  const riskClass = data.riskLevel || (score < 40 ? "Critical" : score < 60 ? "High" : score < 80 ? "Moderate" : "Resilient");
  
  const dimData = [
    { name: "Thermal", value: data.breakdown.thermalProtection, max: 25 },
    { name: "Shade", value: data.breakdown.shade, max: 15 },
    { name: "Ventilation", value: data.breakdown.ventilation, max: 15 },
    { name: "Water", value: data.breakdown.waterAccess, max: 15 },
    { name: "Relief", value: data.breakdown.reliefCapacity, max: 15 },
    { name: "Green", value: data.breakdown.greenInfrastructure, max: 10 },
  ];

  return (
    <div className="flex-1 bg-muted/5 min-h-screen pb-24">
      {/* HEADER */}
      <header className="bg-background border-b border-border/40 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-2">
              <span className="h-2 w-2 bg-primary rounded-full" />
              Assessment Profile
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight capitalize">{data.buildingType} Infrastructure</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2 text-sm font-mono">
              <MapPin className="h-4 w-4" /> {data.location} [{data.latitude}, {data.longitude}]
            </div>
          </div>
          <div className="flex gap-4">
            <Button size="lg" className="h-12 shadow-md rounded-full font-bold group" onClick={() => router.push(`/optimizer/${id}`)}>
              Run Budget Optimization <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* DASHBOARD */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* RESILIENCE SCORE */}
        <Card className="md:col-span-4 border-border/40 shadow-sm bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Resilience Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full bg-background shadow-sm border border-border/40">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" className="stroke-muted/30" strokeWidth="8" />
                <circle cx="96" cy="96" r="88" fill="none" className={score < 60 ? "stroke-destructive" : score < 80 ? "stroke-amber-500" : "stroke-primary"} strokeWidth="8" strokeLinecap="round" strokeDasharray="553" strokeDashoffset={553 - (553 * score) / 100} />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-6xl font-bold tracking-tighter text-foreground">{score}</span>
                <span className="text-xs font-mono text-muted-foreground mt-1">/ 100</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Badge variant="outline" className={`px-3 py-1 text-sm ${score < 60 ? "border-destructive text-destructive bg-destructive/5" : score < 80 ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-primary text-primary bg-primary/5"}`}>
                {riskClass.toUpperCase()} RISK
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* DIMENSION ANALYSIS */}
        <Card className="md:col-span-8 border-border/40 shadow-sm bg-background">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4" /> Dimension Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dimData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" domain={[0, 25]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: "var(--color-background)", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  formatter={(val: any, name: any, props: any) => [`${Number(val).toFixed(1)} / ${props.payload.max}`, "Score"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {dimData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry.value / entry.max) < 0.4 ? "var(--color-destructive)" : "var(--color-primary)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* VULNERABILITY PRIORITY */}
        <Card className="md:col-span-6 border-border/40 shadow-sm bg-background">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Vulnerability Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.vulnerabilities.map((v: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg border flex justify-between items-start ${i === 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/10 border-border/40'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] bg-background border px-1.5 py-0.5 rounded text-muted-foreground">0{i+1}</span>
                    <h4 className="font-semibold text-sm capitalize">{v.dimension.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{v.gap.toFixed(1)} point deficit against optimal baseline.</p>
                </div>
                <Badge variant="outline" className={v.severity === 'high' ? "text-destructive border-destructive/30" : "text-amber-500 border-amber-500/30"}>
                  {v.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ENVIRONMENTAL CONDITIONS */}
        <Card className="md:col-span-6 border-border/40 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4" /> Assessment Snapshot</CardTitle>
            {weather && (
              <Badge variant="outline" className={weather.isDemo ? "text-amber-500 border-amber-500/30 bg-amber-500/5 text-[10px]" : "text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[10px]"}>
                {weather.isDemo ? "DEMO FALLBACK" : "CAPTURED LIVE"}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {weather ? (
              <>
                <div className="flex justify-between items-center mb-4 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {data.location}</div>
                  <div>Captured {new Date(weather.fetchedAt).toLocaleTimeString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/10 border border-border/40 p-4 rounded-lg">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1 mb-2"><Thermometer className="h-3 w-3" /> Ambient</div>
                  <div className="text-3xl font-bold font-mono">{weather.temperature.toFixed(1)}°</div>
                </div>
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                  <div className="text-[10px] uppercase text-destructive font-semibold flex items-center gap-1 mb-2"><Sun className="h-3 w-3" /> Apparent</div>
                  <div className="text-3xl font-bold font-mono text-destructive">{weather.apparentTemperature.toFixed(1)}°</div>
                </div>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-lg">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1 mb-2"><Droplets className="h-3 w-3" /> Humidity</div>
                  <div className="text-xl font-bold font-mono">{weather.humidity}%</div>
                </div>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-lg">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1 mb-2"><Wind className="h-3 w-3" /> Wind</div>
                  <div className="text-xl font-bold font-mono">{weather.windSpeed} kph</div>
                </div>
              </div>
              </>
            ) : (
              <div className="text-sm font-mono text-muted-foreground p-8 text-center border border-dashed border-border/40 rounded-lg">
                <div className="text-amber-500 mb-2">Environmental data temporarily unavailable.</div>
                Telemetry unavailable
              </div>
            )}
            
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full"><ArrowUpRight className="h-5 w-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold text-sm">Capital Opportunity</h4>
                <p className="text-xs text-muted-foreground mt-1">Based on the {data.vulnerabilities[0]?.dimension || 'primary'} vulnerability, targeted investment can yield up to +25 points in resilience.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
