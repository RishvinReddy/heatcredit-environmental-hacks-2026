"use client";

import { useEffect, useState } from "react";
import { getAssessment, optimizeBudget } from "@/lib/api";
import { ShieldCheck, Activity, BarChart2, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function ScenariosPage() {
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Scenarios state
  const [budgets, setBudgets] = useState({
    baseline: 0,
    balanced: 50000,
    aggressive: 150000
  });

  const [results, setResults] = useState({
    baseline: null as any,
    balanced: null as any,
    aggressive: null as any
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssessment("demo-id"); // Hardcoded for demo/scenarios
        setAssessment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function runScenarios() {
      if (!assessment) return;
      try {
        const [base, bal, agg] = await Promise.all([
          optimizeBudget("demo-id", budgets.baseline),
          optimizeBudget("demo-id", budgets.balanced),
          optimizeBudget("demo-id", budgets.aggressive)
        ]);
        setResults({ baseline: base, balanced: bal, aggressive: agg });
      } catch (err) {
        console.error(err);
      }
    }
    runScenarios();
  }, [assessment, budgets]);

  if (loading || !assessment) return <div className="flex h-full items-center justify-center font-mono text-sm animate-pulse text-muted-foreground">INITIALIZING SCENARIO STUDIO...</div>;

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto w-full h-full overflow-y-auto">
      
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenario Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore how different capital decisions change resilience outcomes.</p>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border/40 px-4 py-2 rounded-xl shadow-sm text-sm font-semibold">
          Current Risk: <span className="text-destructive font-bold">{assessment.score}/100</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {/* BASELINE SCENARIO */}
        <ScenarioCard 
          title="Baseline (Do Nothing)" 
          budget={budgets.baseline} 
          setBudget={(val: number) => setBudgets(b => ({ ...b, baseline: val }))} 
          data={results.baseline} 
          baseScore={assessment.score}
          isBaseline
        />
        
        {/* BALANCED SCENARIO */}
        <ScenarioCard 
          title="Balanced Investment" 
          budget={budgets.balanced} 
          setBudget={(val: number) => setBudgets(b => ({ ...b, balanced: val }))} 
          data={results.balanced} 
          baseScore={assessment.score}
        />

        {/* AGGRESSIVE SCENARIO */}
        <ScenarioCard 
          title="Aggressive Resilience" 
          budget={budgets.aggressive} 
          setBudget={(val: number) => setBudgets(b => ({ ...b, aggressive: val }))} 
          data={results.aggressive} 
          baseScore={assessment.score}
          isAggressive
        />
      </div>

      {/* COMPARISON TABLE */}
      <div className="bg-background border border-border/40 rounded-xl p-6 shadow-sm overflow-x-auto">
        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-2">
          <BarChart2 className="h-4 w-4" /> Scenario Comparison Matrix
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/10 border-b border-border/40 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4 font-semibold">Metric</th>
              <th className="p-4 font-semibold text-center">Baseline</th>
              <th className="p-4 font-semibold text-center">Balanced</th>
              <th className="p-4 font-semibold text-center">Aggressive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            <tr>
              <td className="p-4 font-semibold text-muted-foreground">Authorized Budget</td>
              <td className="p-4 font-mono text-center">₹{budgets.baseline.toLocaleString()}</td>
              <td className="p-4 font-mono text-center font-bold">₹{budgets.balanced.toLocaleString()}</td>
              <td className="p-4 font-mono text-center font-bold text-primary">₹{budgets.aggressive.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-muted-foreground">Projected Score</td>
              <td className="p-4 font-mono text-center">{results.baseline?.projectedScore || assessment.score}</td>
              <td className="p-4 font-mono text-center font-bold">{results.balanced?.projectedScore || '-'}</td>
              <td className="p-4 font-mono text-center font-bold text-primary">{results.aggressive?.projectedScore || '-'}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-muted-foreground">Resilience Improvement</td>
              <td className="p-4 font-mono text-center text-muted-foreground">+0</td>
              <td className="p-4 font-mono text-center font-bold text-primary">+{results.balanced ? results.balanced.projectedScore - assessment.score : '-'}</td>
              <td className="p-4 font-mono text-center font-bold text-primary">+{results.aggressive ? results.aggressive.projectedScore - assessment.score : '-'}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-muted-foreground">Capital Utilized</td>
              <td className="p-4 font-mono text-center">₹0</td>
              <td className="p-4 font-mono text-center">₹{results.balanced?.totalCost?.toLocaleString() || 0}</td>
              <td className="p-4 font-mono text-center">₹{results.aggressive?.totalCost?.toLocaleString() || 0}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-muted-foreground">Interventions Count</td>
              <td className="p-4 font-mono text-center">0</td>
              <td className="p-4 font-mono text-center">{results.balanced?.interventions.length || 0}</td>
              <td className="p-4 font-mono text-center">{results.aggressive?.interventions.length || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScenarioCard({ title, budget, setBudget, data, baseScore, isBaseline, isAggressive }: any) {
  const improvement = data ? data.projectedScore - baseScore : 0;
  const utilized = data ? data.totalCost : 0;
  
  return (
    <div className={`bg-background border rounded-xl p-6 shadow-sm flex flex-col ${isAggressive ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/40'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{title}</div>
        {isAggressive && <Zap className="h-4 w-4 text-primary" />}
      </div>
      
      {!isBaseline && (
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Budget</span>
            <span className="text-lg font-bold font-mono">₹{budget.toLocaleString()}</span>
          </div>
          <Slider defaultValue={[budget]} max={200000} step={5000} value={[budget]} onValueChange={(val) => setBudget((val as number[])[0])} />
        </div>
      )}

      {isBaseline && (
        <div className="mb-6 opacity-50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Budget</span>
            <span className="text-lg font-bold font-mono">₹0</span>
          </div>
          <div className="h-4 bg-muted rounded-full" />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-end space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/10 p-3 rounded-lg text-center border border-border/40">
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Score</div>
            <div className={`text-2xl font-bold font-mono ${improvement > 0 ? 'text-primary' : 'text-foreground'}`}>{data ? data.projectedScore : baseScore}</div>
          </div>
          <div className="bg-muted/10 p-3 rounded-lg text-center border border-border/40">
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Impact</div>
            <div className={`text-xl font-bold font-mono ${improvement > 0 ? 'text-primary' : 'text-muted-foreground'}`}>+{improvement}</div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/5 rounded-lg border border-border/20">
          <div className="flex justify-between mb-1">
            <span>Capital Utilized:</span>
            <span className="font-mono text-foreground font-medium">₹{utilized.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Interventions:</span>
            <span className="font-mono text-foreground font-medium">{data?.interventions.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
