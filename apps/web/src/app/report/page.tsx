"use client";

import Link from "next/link";
import { Map, FileText } from "lucide-react";

export default function ReportLandingPage() {
  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto w-full h-full items-center justify-center">
      <div className="bg-background border border-border/40 rounded-xl p-8 max-w-md text-center shadow-sm">
        <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Compliance Reports</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Reports are generated for specific facility assessments. Please select an existing assessment to view or generate its report.
        </p>
        <Link 
          href="/assessment" 
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <FileText className="h-4 w-4" /> Go to Assessments
        </Link>
      </div>
    </div>
  );
}
