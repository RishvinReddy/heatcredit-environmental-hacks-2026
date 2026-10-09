"use client";

import { ShieldCheck, ArrowRight, LayoutDashboard, Database, Server, Settings, Zap } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-4xl mx-auto w-full h-full overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">System Methodology</h1>
        <p className="text-sm text-muted-foreground mt-1">Technical specifications of the deterministic scoring and optimization engines.</p>
      </header>

      <div className="space-y-12">
        {/* SCORING MODEL */}
        <section>
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 border-b border-border/40 pb-2">01. Scoring Model</div>
          <h2 className="text-xl font-bold mb-4">Seven-Dimension Matrix</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            The HeatCredit scoring engine uses a deterministic multi-vector analysis. It evaluates facility infrastructure across seven critical dimensions. Each dimension is strictly weighted and capped to ensure mathematical consistency.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: "Thermal Protection", weight: 25 },
              { name: "Shade Coverage", weight: 15 },
              { name: "Ventilation", weight: 15 },
              { name: "Water Access", weight: 15 },
              { name: "Relief Capacity", weight: 15 },
              { name: "Green Infrastructure", weight: 10 },
              { name: "Exposure Penalty", weight: 5 },
            ].map((d, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-background border border-border/40 rounded-lg shadow-sm">
                <span className="text-sm font-semibold">{d.name}</span>
                <span className="text-xs font-mono font-bold bg-muted/50 px-2 py-1 rounded">{d.weight} points</span>
              </div>
            ))}
          </div>
        </section>

        {/* RISK BANDS */}
        <section>
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 border-b border-border/40 pb-2">02. Risk Classification</div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            The cumulative score (0-100) mathematically maps to five distinct risk thresholds.
          </p>
          <div className="space-y-3">
            {[
              { range: "0–39", label: "Critical", color: "text-destructive" },
              { range: "40–59", label: "High Risk", color: "text-destructive" },
              { range: "60–74", label: "Moderate", color: "text-amber-500" },
              { range: "75–89", label: "Resilient", color: "text-primary" },
              { range: "90–100", label: "Highly Resilient", color: "text-primary" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-background border border-border/40 rounded-lg shadow-sm">
                <span className="font-mono font-bold text-sm w-24">{r.range}</span>
                <span className={`text-sm font-bold uppercase tracking-wider ${r.color}`}>{r.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* OPTIMIZATION */}
        <section>
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 border-b border-border/40 pb-2">03. Capital Allocation Engine</div>
          <h2 className="text-xl font-bold mb-4">0/1 Knapsack Algorithm</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Optimization is solved as a variant of the classical 0/1 Knapsack problem. 
            The objective function maximizes total resilience improvement (+ΔScore) subject to the strict constraint that the total cost of selected interventions must be less than or equal to the authorized budget.
          </p>
          <div className="bg-muted/10 border border-border/40 p-6 rounded-xl font-mono text-xs text-muted-foreground leading-loose overflow-x-auto shadow-sm">
            Maximize: Σ (impact_i * x_i)<br/>
            Subject to: Σ (cost_i * x_i) ≤ Budget<br/>
            Where x_i ∈ {'{0, 1}'} (Intervention is selected or not)
          </div>
        </section>
      </div>
    </div>
  );
}
