"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssessment, optimizeBudget } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, ArrowRight, Activity, Cpu, HelpCircle, Layers } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function OptimizerPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
      <OptimizerContent />
    </Suspense>
  );
}

function OptimizerContent() {
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [budget, setBudget] = useState(50000);
  const [optData, setOptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [frontier, setFrontier] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssessment(id);
        setAssessment(data);

        const opt = await optimizeBudget(id, budget);
        setOptData(opt);

        // Pre-calculate frontier for demo
        const budgets = [0, 10000, 20000, 30000, 40000, 50000, 75000, 100000];
        const points = await Promise.all(budgets.map(async b => {
          const res = await optimizeBudget(id, b);
          return { budget: b, score: res.projectedScore };
        }));
        setFrontier(points);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, budget]); // Re-run optimization when budget changes

  if (loading && !assessment) return <div className="flex h-screen items-center justify-center font-mono text-sm animate-pulse">INITIALIZING OPTIMIZER ENGINE...</div>;
  if (!assessment) return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="bg-background border border-destructive/40 rounded-xl p-8 max-w-md text-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight mb-2 text-destructive">Assessment Context Lost</h1>
        <p className="text-muted-foreground text-sm mb-6">
          The requested assessment could not be found. It may have expired or the ID is invalid.
        </p>
        <button
          onClick={() => window.location.href = "/assessment"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );

  const improvement = optData ? optData.projectedScore - assessment.score : 0;
  const efficiency = optData && improvement > 0 ? (optData.totalCost / improvement).toFixed(0) : "N/A";

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto w-full h-full overflow-y-auto">

        <header className="mb-10">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase mb-2">
            <Cpu className="h-3 w-3" /> 0/1 Knapsack Algorithm
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Allocation Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Find the highest-value resilience package under a strict capital constraint.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 mb-8">

          {/* LEFT: BUDGET CONTROL & KPI */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-background border border-border/40 rounded-xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Layers className="h-24 w-24" /></div>

              <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6">Simulation Constraint</div>

              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Authorized Budget</span>
                <span className="text-4xl font-bold font-mono tracking-tighter">₹{budget.toLocaleString()}</span>
              </div>
              <Slider defaultValue={[50000]} max={100000} step={1000} value={[budget]} onValueChange={(val) => setBudget((val as number[])[0])} className="py-6" />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                <span>₹0</span>
                <span>₹100k</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/10 border border-border/40 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Current Score</div>
                <div className="text-3xl font-bold font-mono">{assessment.score}</div>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-primary mb-1">Projected</div>
                <div className="text-3xl font-bold font-mono text-primary">{optData?.projectedScore || assessment.score}</div>
                <div className="text-xs text-primary font-bold mt-1">+{improvement} pts</div>
              </div>
              <div className="bg-background border border-border/40 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Capital Used</div>
                <div className="text-lg font-bold font-mono">₹{optData?.totalCost?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-background border border-border/40 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Efficiency</div>
                <div className="text-lg font-bold font-mono">₹{efficiency}<span className="text-[10px] font-sans text-muted-foreground">/pt</span></div>
              </div>
            </div>
          </div>

          {/* RIGHT: BUDGET FRONTIER */}
          <div className="lg:col-span-7 bg-background border border-border/40 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6 flex justify-between items-center">
              <span>Budget Efficiency Frontier</span>
              <span className="bg-muted/50 px-2 py-0.5 rounded">Budget vs Max Score</span>
            </div>
            <div className="flex-1 min-h-[250px]">
              {frontier.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={frontier} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="budget"
                      tickFormatter={(val) => `₹${val/1000}k`}
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={['dataMin - 10', 100]}
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} pts`, "Max Score"]}
                      labelFormatter={(label: any) => `Budget: ₹${Number(label || 0).toLocaleString()}`}
                      contentStyle={{ backgroundColor: "var(--color-background)", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                    />
                    <ReferenceLine x={budget} stroke="var(--color-primary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: 'var(--color-primary)', fontSize: 10 }} />
                    <Line type="stepAfter" dataKey="score" stroke="var(--color-foreground)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-background)", strokeWidth: 2 }} activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "none" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground animate-pulse">CALCULATING FRONTIER...</div>
              )}
            </div>
          </div>
        </div>

        {/* PACKAGE BREAKDOWN */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-muted/10 p-6 rounded-xl border border-border/40">
            <div className="flex items-center gap-2 text-sm font-bold mb-3"><HelpCircle className="h-4 w-4 text-primary" /> Why this package?</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This specific combination of interventions was selected because it mathematically maximizes resilience improvement (+{improvement} pts) while strictly remaining within the ₹{budget.toLocaleString()} capital constraint. Any other combination would either exceed the budget or yield a lower total score.
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">Authorized Interventions</div>
            {loading && !optData ? (
              <div className="font-mono text-sm animate-pulse text-muted-foreground">OPTIMIZING...</div>
            ) : (
              <div className="space-y-3">
                {optData?.interventions.map((inv: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-border/40 rounded-xl shadow-sm gap-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-sm">{inv.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{inv.dimensionTarget.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:text-right">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">CAPEX</div>
                        <div className="font-mono font-medium">₹{inv.cost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-primary font-bold">IMPACT</div>
                        <div className="font-bold text-primary">+{inv.resilienceImpact}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {optData?.interventions.length === 0 && (
                  <div className="p-8 text-center bg-background border border-border/40 rounded-xl font-mono text-sm text-muted-foreground">
                    No viable interventions found under this constraint.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
