"use client";

import { motion } from "framer-motion";
import { ArrowRight, Thermometer, Wind, Cloud, Droplets, Sun, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Heat Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Understand exposure, diagnose vulnerability, and allocate resilience capital.</p>
        </div>
        <div className="flex items-center gap-4 bg-background border border-border/40 p-3 rounded-xl shadow-sm">
          <div className="text-right mr-2">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Target</div>
            <div className="text-sm font-semibold">Green Valley School</div>
          </div>
          <div className="h-10 w-px bg-border/40" />
          <div className="flex items-center gap-3 pl-2">
            <div className="text-3xl font-bold tracking-tighter text-destructive">42<span className="text-xs text-muted-foreground font-normal">/100</span></div>
            <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/10 text-destructive uppercase">High Risk</div>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-6">
        
        {/* ENVIRONMENTAL SNAPSHOT */}
        <section className="md:col-span-8 bg-background border border-border/40 rounded-xl p-6 shadow-sm">
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6 flex items-center justify-between">
            <span>Environmental Snapshot</span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">LIVE DATA</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Thermometer className="h-3 w-3" /> Ambient</div>
              <div className="text-2xl font-bold font-mono">38.0°</div>
            </div>
            <div>
              <div className="text-xs text-destructive flex items-center gap-1 mb-1"><Sun className="h-3 w-3" /> Apparent</div>
              <div className="text-2xl font-bold font-mono text-destructive">42.1°</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Droplets className="h-3 w-3" /> Humidity</div>
              <div className="text-xl font-medium font-mono">45%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Wind className="h-3 w-3" /> Wind</div>
              <div className="text-xl font-medium font-mono">12 km/h</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Cloud className="h-3 w-3" /> Cloud</div>
              <div className="text-xl font-medium font-mono">10%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">Precipitation</div>
              <div className="text-xl font-medium font-mono">0 mm</div>
            </div>
          </div>
        </section>

        {/* CAPITAL POSITION */}
        <section className="md:col-span-4 bg-muted/10 border border-border/40 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">Capital Position</div>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-border/40 pb-2">
              <span className="text-sm font-medium">Recommended Budget</span>
              <span className="text-2xl font-bold font-mono">₹48,000</span>
            </div>
            <div className="flex justify-between items-end border-b border-border/40 pb-2">
              <span className="text-sm font-medium">Projected Score</span>
              <span className="text-2xl font-bold font-mono text-primary">67</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium">Improvement</span>
              <span className="text-lg font-bold font-mono text-primary">+25 pts</span>
            </div>
          </div>
        </section>

        {/* RESILIENCE SNAPSHOT */}
        <section className="md:col-span-8 bg-background border border-border/40 rounded-xl p-6 shadow-sm">
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6">Resilience Snapshot</div>
          <div className="space-y-4">
            <DimensionRow name="Thermal Protection" val={16.3} max={25} />
            <DimensionRow name="Shade Coverage" val={3.8} max={15} alert />
            <DimensionRow name="Ventilation" val={9.0} max={15} />
            <DimensionRow name="Water Access" val={4.5} max={15} alert />
            <DimensionRow name="Relief Capacity" val={4.5} max={15} alert />
            <DimensionRow name="Green Infrastructure" val={1.5} max={10} />
            <DimensionRow name="Exposure Penalty" val={2.1} max={5} alert />
          </div>
        </section>

        {/* TOP VULNERABILITIES & ACTION */}
        <section className="md:col-span-4 space-y-6">
          <div className="bg-background border border-border/40 rounded-xl p-6 shadow-sm">
            <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">Top Vulnerabilities</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">01</span>
                <span className="text-sm font-semibold">Shade Coverage</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">02</span>
                <span className="text-sm font-semibold">Water Access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">03</span>
                <span className="text-sm font-semibold">Relief Capacity</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="text-[10px] font-bold tracking-widest uppercase text-primary mb-2">Next Best Action</div>
            <p className="text-xs text-muted-foreground mb-4">Execute capital allocation knapsack optimizer to resolve primary vulnerabilities.</p>
            <Button className="w-full shadow-sm text-xs font-semibold" asChild>
              <Link href="/optimizer/demo-id">Run Capital Engine <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function DimensionRow({ name, val, max, alert }: { name: string, val: number, max: number, alert?: boolean }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className={`w-32 truncate font-medium ${alert ? 'text-destructive' : 'text-muted-foreground'}`}>{name}</div>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${alert ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${(val/max)*100}%` }} />
      </div>
      <div className="w-12 text-right font-mono text-xs text-muted-foreground">{val.toFixed(1)}</div>
    </div>
  );
}
