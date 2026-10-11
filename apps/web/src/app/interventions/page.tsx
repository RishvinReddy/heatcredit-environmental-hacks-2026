"use client";

import { useEffect, useState } from "react";
import { fetchInterventions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Beaker, CheckCircle2, ChevronRight, Coins, Info, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InterventionLabPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInterventions();
        const interventionsList = data?.interventions || (Array.isArray(data) ? data : []);
        setInterventions(interventionsList);
        if (interventionsList.length > 0) setSelected(interventionsList[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-background h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* HEADER */}
      <header className="border-b border-border/40 bg-background py-6 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase mb-2">
              <Beaker className="h-3 w-3" /> Decision Laboratory
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Intervention Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">Compare resilience investments before committing capital.</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">
          LOADING CATALOGUE...
        </div>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full">
          
          {/* MAIN TABLE */}
          <div className="flex-1 overflow-y-auto p-6 md:pr-4 border-r border-border/40">
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/10 border-b border-border/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Intervention</th>
                    <th className="px-6 py-4 font-semibold text-right">Cost (INR)</th>
                    <th className="px-6 py-4 font-semibold text-right">Impact</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold text-right">Cap Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {interventions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-mono text-sm">
                        No interventions available.
                      </td>
                    </tr>
                  ) : (
                    interventions.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => setSelected(inv)}
                        className={`cursor-pointer transition-colors ${selected?.id === inv.id ? 'bg-primary/5' : 'hover:bg-muted/5'}`}
                      >
                        <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                          {selected?.id === inv.id && <ChevronRight className="h-4 w-4 text-primary" />}
                          {inv.name}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-right">₹{(inv.estimatedCost ?? inv.cost ?? 0).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-primary text-right">+{(inv.impact ?? inv.resilienceImpact ?? 0)}</td>
                        <td className="px-6 py-4 capitalize text-xs">{(inv.targetDimension || inv.dimensionTarget || inv.category || 'General').replace(/([A-Z])/g, ' $1').trim()}</td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant="outline" className="font-mono text-[9px] bg-background">
                            {(((inv.impact ?? inv.resilienceImpact ?? 0) / (inv.estimatedCost ?? inv.cost ?? 1)) * 10000).toFixed(1)} pt/₹10k
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDE PANEL */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div 
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full md:w-[400px] lg:w-[450px] bg-muted/5 p-6 overflow-y-auto shrink-0"
              >
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Inspection Panel</div>
                
                <h3 className="text-xl font-bold mb-2">{selected.name}</h3>
                <Badge className="capitalize mb-6" variant="secondary">{(selected.targetDimension || selected.dimensionTarget || selected.category || 'General').replace(/([A-Z])/g, ' $1').trim()}</Badge>

                <Card className="border-border/40 shadow-none bg-background mb-6">
                  <CardContent className="p-0 flex divide-x divide-border/20">
                    <div className="flex-1 p-4 text-center">
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 flex items-center justify-center gap-1"><Coins className="h-3 w-3" /> CAPEX</div>
                      <div className="font-mono text-xl font-bold">₹{(selected.estimatedCost ?? selected.cost ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="flex-1 p-4 text-center bg-primary/5">
                      <div className="text-[10px] uppercase text-primary font-semibold mb-1 flex items-center justify-center gap-1"><Activity className="h-3 w-3" /> IMPACT</div>
                      <div className="text-xl font-bold text-primary">+{(selected.impact ?? selected.resilienceImpact ?? 0)} pts</div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Info className="h-4 w-4" /> Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{selected.description}</p>
                  </div>

                  <div className="pt-6 border-t border-border/20">
                    <h4 className="font-semibold flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4" /> Expected Benefits</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Significantly improves the {(selected.targetDimension || selected.dimensionTarget || selected.category || 'resilience').replace(/([A-Z])/g, ' $1').trim().toLowerCase()} sub-score in the resilience engine.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Highly scalable deployment model across similar facility topologies.</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </main>
      )}
    </div>
  );
}
