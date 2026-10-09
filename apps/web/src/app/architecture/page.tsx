"use client";

import { Cloud, Server, Database, Activity, ShieldCheck, Zap } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-5xl mx-auto w-full h-full overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">AWS Architecture</h1>
        <p className="text-sm text-muted-foreground mt-1">Serverless cloud infrastructure powering the HeatCredit engine.</p>
      </header>

      <div className="bg-background border border-border/40 rounded-xl p-8 shadow-sm relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          
          {/* CLIENT */}
          <div className="bg-muted border border-border/60 px-6 py-4 rounded-xl text-center shadow-sm w-64">
            <Cloud className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="font-bold text-sm">Next.js Client (Turbopack)</div>
            <div className="text-[10px] uppercase text-muted-foreground mt-1 tracking-widest">AWS Amplify Hosting</div>
          </div>
          
          <div className="h-8 w-px bg-border/60" />

          {/* API GATEWAY */}
          <div className="bg-muted border border-border/60 px-6 py-4 rounded-xl text-center shadow-sm w-64">
            <Server className="h-6 w-6 mx-auto mb-2 text-foreground" />
            <div className="font-bold text-sm">Amazon API Gateway</div>
            <div className="text-[10px] uppercase text-muted-foreground mt-1 tracking-widest">REST APIs</div>
          </div>

          <div className="h-8 w-px bg-border/60" />

          {/* COMPUTE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-primary/5 border border-primary/20 px-4 py-4 rounded-xl text-center shadow-sm">
              <Activity className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="font-bold text-sm text-primary">Assessments</div>
              <div className="text-[9px] uppercase text-primary/70 mt-1 tracking-widest">AWS Lambda</div>
            </div>
            <div className="bg-primary/5 border border-primary/20 px-4 py-4 rounded-xl text-center shadow-sm">
              <Zap className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="font-bold text-sm text-primary">Optimizer</div>
              <div className="text-[9px] uppercase text-primary/70 mt-1 tracking-widest">AWS Lambda</div>
            </div>
            <div className="bg-primary/5 border border-primary/20 px-4 py-4 rounded-xl text-center shadow-sm">
              <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="font-bold text-sm text-primary">Interventions</div>
              <div className="text-[9px] uppercase text-primary/70 mt-1 tracking-widest">AWS Lambda</div>
            </div>
            <div className="bg-muted border border-border/60 px-4 py-4 rounded-xl text-center shadow-sm">
              <Cloud className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-bold text-sm text-foreground">Weather Data</div>
              <div className="text-[9px] uppercase text-muted-foreground mt-1 tracking-widest">External API</div>
            </div>
          </div>

          <div className="h-8 w-px bg-border/60" />

          {/* DATA */}
          <div className="bg-muted border border-border/60 px-6 py-4 rounded-xl text-center shadow-sm w-64">
            <Database className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="font-bold text-sm">Amazon DynamoDB</div>
            <div className="text-[10px] uppercase text-muted-foreground mt-1 tracking-widest">NoSQL Persistence</div>
          </div>

        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-background p-6 rounded-xl border border-border/40 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 border-b border-border/40 pb-2">Security & IAM</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All Lambda functions operate with strict least-privilege IAM roles. Execution environments are fully ephemeral and isolated. Environment variables are managed securely via AWS Systems Manager Parameter Store.
          </p>
        </section>
        <section className="bg-background p-6 rounded-xl border border-border/40 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 border-b border-border/40 pb-2">Observability</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AWS CloudWatch handles centralized logging for API requests and engine execution times, enabling rapid debug and tracing for the 0/1 knapsack allocations.
          </p>
        </section>
      </div>
    </div>
  );
}
