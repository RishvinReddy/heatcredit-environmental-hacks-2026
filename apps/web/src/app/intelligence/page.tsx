"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis } from "recharts";
import { ShieldCheck, Info, ChevronRight, Activity, Cpu } from "lucide-react";

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [whyOpen, setWhyOpen] = useState(false);

  // Mock data for Recharts that matches demo output
  const telemetryData = [
    { time: "06:00", temp: 28, apparent: 30 },
    { time: "09:00", temp: 32, apparent: 36 },
    { time: "12:00", temp: 37, apparent: 41 },
    { time: "15:00", temp: 39, apparent: 44 },
    { time: "18:00", temp: 35, apparent: 39 },
    { time: "21:00", temp: 31, apparent: 34 },
  ];

  const radarData = [
    { subject: 'Thermal', A: 65, fullMark: 100 },
    { subject: 'Shade', A: 25, fullMark: 100 },
    { subject: 'Ventilation', A: 60, fullMark: 100 },
    { subject: 'Water', A: 30, fullMark: 100 },
    { subject: 'Relief', A: 30, fullMark: 100 },
    { subject: 'Green', A: 15, fullMark: 100 },
  ];

  // X: Protection, Y: Exposure, Z: Severity
  const scatterData = [
    { name: 'Shade', x: 25, y: 80, z: 200 },
    { name: 'Water', x: 30, y: 70, z: 150 },
    { name: 'Relief', x: 30, y: 70, z: 150 },
    { name: 'Ventilation', x: 60, y: 50, z: 80 },
    { name: 'Thermal', x: 65, y: 40, z: 50 },
    { name: 'Green', x: 15, y: 90, z: 250 },
  ];

  const decisionTrace = [
    { stage: "Assessment", desc: "Green Valley School, Hyderabad. Input telemetry loaded." },
    { stage: "Risk Calculation", desc: "42/100 (High Risk). Driven by 44°C apparent peak." },
    { stage: "Vulnerability Detection", desc: "Critical deficit in Shade (11.2 pt gap) and Water (10.5 pt gap)." },
    { stage: "Intervention Candidates", desc: "6 interventions flagged as technically feasible." },
    { stage: "Optimization Engine", desc: "0/1 Knapsack executed for ₹50,000 constraint." },
    { stage: "Recommendation", desc: "Shade + Water + Ventilation (₹48,000). Score +25." },
  ];

  return (
    <div className="flex h-full w-full">
      
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto w-full h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Heat Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Environmental exposure × infrastructure vulnerability.</p>
        </header>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-border/40 mb-8 overflow-x-auto pb-2 shrink-0">
          {["OVERVIEW", "EXPOSURE", "VULNERABILITY", "RESILIENCE", "DECISION TRACE"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary pb-2 -mb-[10px]' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-8 pb-12">
          
          {(activeTab === "OVERVIEW" || activeTab === "EXPOSURE") && (
            <section className="grid lg:grid-cols-2 gap-8">
              {/* EXPOSURE INDEX */}
              <div className="bg-background border border-border/40 rounded-xl p-6 shadow-sm">
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6 flex justify-between">
                  <span>Heat Exposure Index</span>
                  <span className="text-primary">ILLUSTRATIVE INDICATOR</span>
                </div>
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-5xl font-bold tracking-tighter text-destructive">82</div>
                  <div className="text-sm font-bold uppercase text-destructive bg-destructive/10 px-2 py-0.5 rounded mb-1">HIGH EXPOSURE</div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Thermal Exposure</span><span className="font-mono">88/100</span></div>
                  <div className="text-sm flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Humidity Contribution</span><span className="font-mono">74/100</span></div>
                  <div className="text-sm flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Operating-Hour Exposure</span><span className="font-mono">High (Peak overlap)</span></div>
                  <div className="text-sm flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Occupancy Density</span><span className="font-mono">800 persons</span></div>
                </div>
              </div>

              {/* TELEMETRY */}
              <div className="bg-background border border-border/40 rounded-xl p-6 shadow-sm">
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6 flex justify-between">
                  <span>Environmental Telemetry</span>
                  <span className="text-primary flex items-center gap-1"><Activity className="h-3 w-3" /> DEMO DATA</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--color-background)", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                      <Line type="monotone" dataKey="apparent" name="Apparent °C" stroke="var(--color-destructive)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="temp" name="Ambient °C" stroke="var(--color-muted-foreground)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {(activeTab === "OVERVIEW" || activeTab === "VULNERABILITY") && (
            <section className="bg-background border border-border/40 rounded-xl p-6 shadow-sm">
              <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6">Vulnerability Matrix</div>
              <div className="h-80 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey="x" name="Infrastructure Protection" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} label={{ value: "Protection %", position: "bottom", fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <YAxis type="number" dataKey="y" name="Exposure" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} label={{ value: "Exposure %", angle: -90, position: "left", fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)", fontSize: "12px" }} />
                    <Scatter name="Dimensions" data={scatterData} fill="var(--color-destructive)" />
                  </ScatterChart>
                </ResponsiveContainer>
                
                {/* Quadrant Overlays */}
                <div className="absolute top-[10%] left-[10%] text-[10px] font-bold tracking-widest uppercase text-destructive/50">Critical Risk Zone</div>
                <div className="absolute bottom-[10%] right-[10%] text-[10px] font-bold tracking-widest uppercase text-primary/50">Safe Zone</div>
              </div>
            </section>
          )}

          {(activeTab === "OVERVIEW" || activeTab === "RESILIENCE") && (
            <section className="grid lg:grid-cols-2 gap-8">
              <div className="bg-background border border-border/40 rounded-xl p-6 shadow-sm">
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6">Resilience Radar</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="var(--color-border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-foreground)', fontSize: 10 }} />
                      <Radar name="Current" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-muted/10 border border-border/40 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-bold mb-2">Deterministic Scoring Engine</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">See exactly how the 42/100 score was derived from the 7 infrastructure dimension inputs and exposure penalties.</p>
                <button onClick={() => setWhyOpen(true)} className="px-4 py-2 bg-background border border-border/40 rounded-md text-sm font-semibold shadow-sm hover:bg-muted/50 transition-colors">
                  Why 42?
                </button>
              </div>
            </section>
          )}

          {activeTab === "DECISION TRACE" && (
            <section className="bg-background border border-border/40 rounded-xl p-6 shadow-sm max-w-3xl">
              <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-8 flex items-center gap-2"><Cpu className="h-3 w-3" /> Decision Trace Engine</div>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/60">
                {decisionTrace.map((node, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 text-[10px] font-bold">{i+1}</div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-muted/5 border border-border/40 p-4 rounded-xl shadow-sm">
                      <div className="font-bold text-sm mb-1">{node.stage}</div>
                      <div className="text-xs text-muted-foreground">{node.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* WHY THIS SCORE DRAWER */}
      {whyOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={() => setWhyOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-background border-l border-border/40 shadow-2xl p-6 overflow-y-auto">
            <button onClick={() => setWhyOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">Close</button>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-8">Score Explainability</div>
            
            <div className="text-6xl font-bold tracking-tighter mb-8">42<span className="text-2xl text-muted-foreground font-normal">/100</span></div>

            <div className="space-y-6">
              {[
                { name: "Thermal Protection", input: "Poor insulation", weight: 25, score: 16.3 },
                { name: "Shade Coverage", input: "Low (10%)", weight: 15, score: 3.8 },
                { name: "Ventilation", input: "Moderate cross", weight: 15, score: 9.0 },
                { name: "Water Access", input: "High stress", weight: 15, score: 4.5 },
                { name: "Relief Capacity", input: "No AC", weight: 15, score: 4.5 },
                { name: "Green Infrastructure", input: "Minimal", weight: 10, score: 1.5 },
                { name: "Exposure Penalty", input: "Peak sun", weight: 5, score: 2.1 },
              ].map((dim, i) => (
                <div key={i} className="border-b border-border/40 pb-4">
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span>{dim.name}</span>
                    <span className="font-mono">{dim.score} pt</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-mono mt-2 bg-muted/30 p-2 rounded">
                    <span>Input: {dim.input}</span>
                    <span>Max: {dim.weight}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold text-lg">
                <span>Final Output</span>
                <span className="font-mono">41.7 ≈ 42</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
