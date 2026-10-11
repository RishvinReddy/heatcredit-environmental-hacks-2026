"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function OptimizerLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">
          CONNECTING TO CAPITAL ALLOCATION OBSERVATORY...
        </div>
      }
    >
      <OptimizerLandingContent />
    </Suspense>
  );
}

function OptimizerLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawId = searchParams.get("assessmentId") || searchParams.get("id");
    const budget = searchParams.get("budget");

    let targetId = rawId;
    if (!targetId && typeof window !== "undefined") {
      try {
        targetId = window.localStorage?.getItem("heatcredit_last_assessment_id") || "demo-school-hyderabad";
      } catch {
        targetId = "demo-school-hyderabad";
      }
    }

    if (!targetId) {
      targetId = "demo-school-hyderabad";
    }

    const query = budget ? `?budget=${budget}` : "";
    router.replace(`/optimizer/${targetId}${query}`);
  }, [router, searchParams]);

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto w-full min-h-[60vh] items-center justify-center text-center space-y-4">
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto animate-pulse">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Connecting to Capital Allocation Observatory...
      </h2>
      <p className="text-xs text-muted-foreground max-w-sm">
        Routing to active facility assessment optimization context.
      </p>
      <Link
        href="/optimizer/demo-school-hyderabad"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow-xs"
      >
        <span>Open Green Valley School Observatory</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
