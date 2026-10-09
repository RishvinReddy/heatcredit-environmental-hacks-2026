"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Building2, Sun, Droplets, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssessment } from "@/lib/api";

const DEMO_PREFILL = {
  buildingType: "school",
  location: "Hyderabad",
  latitude: "17.385",
  longitude: "78.4867",
  occupancy: "350",
  operatingHours: "9",
  roofType: "concrete",
  roofCondition: "fair",
  shadeCoverage: "25",
  greenCoverage: "15",
  ventilation: "medium",
  waterAccess: "poor",
  reliefSpace: "limited",
};

const STEPS = [
  { id: "facility", label: "01 Facility Profile" },
  { id: "exposure", label: "02 Environmental Exposure" },
  { id: "building", label: "03 Building Envelope" },
  { id: "infrastructure", label: "04 Resilience Infrastructure" },
  { id: "review", label: "05 Engine Review" }
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<any>({
    buildingType: "", location: "", latitude: "", longitude: "",
    occupancy: "", operatingHours: "", roofType: "", roofCondition: "",
    shadeCoverage: "", greenCoverage: "", ventilation: "", waterAccess: "", reliefSpace: ""
  });

  const handlePrefill = () => setFormData(DEMO_PREFILL);

  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const readiness = useMemo(() => {
    const fields = Object.values(formData);
    const filled = fields.filter(v => v !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        occupancy: parseInt(formData.occupancy, 10),
        operatingHours: parseInt(formData.operatingHours, 10),
        shadeCoverage: parseInt(formData.shadeCoverage, 10),
        greenCoverage: parseInt(formData.greenCoverage, 10),
      };

      const result = await createAssessment(payload);
      if (result.error) throw new Error(result.error);
      router.push(`/results/${result.assessmentId}`);
    } catch (err: any) {
      setError(err.message || "Engine evaluation failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background h-[calc(100vh-3.5rem)] overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-64 lg:w-72 border-r border-border/40 bg-muted/10 p-6 flex flex-col overflow-y-auto">
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-widest uppercase text-foreground">Initialization</h2>
          <p className="text-xs text-muted-foreground mt-2">Configure target telemetry.</p>
        </div>
        
        <div className="space-y-1 flex-1">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isPast = idx < currentStep;
            return (
              <button 
                key={step.id} 
                onClick={() => isPast && setCurrentStep(idx)}
                disabled={!isPast && !isActive}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono tracking-wide transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-bold" : 
                  isPast ? "text-foreground hover:bg-muted/50 cursor-pointer" : 
                  "text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border/40">
          <Button variant="outline" className="w-full text-xs font-mono border-dashed hover:border-primary hover:text-primary transition-all" onClick={handlePrefill}>
            {'>_ '} Auto-fill Demo
          </Button>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        <div className="max-w-2xl mx-auto pb-24">
          
          {error && (
            <div className="p-4 mb-8 bg-destructive/10 text-destructive text-sm rounded-sm border border-destructive/20 font-mono flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div className="border-b border-border/40 pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">Facility Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">Geographic and usage parameters.</p>
                  </div>
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Primary Use Case</Label>
                      <Select value={formData.buildingType} onValueChange={(v) => updateField("buildingType", v)}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select classification" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">Educational Facility (High priority occupancy)</SelectItem>
                          <SelectItem value="hospital">Healthcare Clinic (Critical care)</SelectItem>
                          <SelectItem value="office">Commercial Office</SelectItem>
                          <SelectItem value="residential">Residential Block</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Location (City)</Label>
                      <Input className="h-12" placeholder="e.g. Hyderabad" value={formData.location} onChange={(e) => updateField("location", e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Latitude</Label>
                        <Input className="h-12 font-mono" type="number" step="any" placeholder="17.3850" value={formData.latitude} onChange={(e) => updateField("latitude", e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Longitude</Label>
                        <Input className="h-12 font-mono" type="number" step="any" placeholder="78.4867" value={formData.longitude} onChange={(e) => updateField("longitude", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="border-b border-border/40 pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">Environmental Exposure</h3>
                    <p className="text-sm text-muted-foreground mt-1">Site-level mitigation factors against solar radiation.</p>
                  </div>
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Shade Coverage (%)</Label>
                      <div className="relative">
                        <Input className="h-12 font-mono pr-12" type="number" min="0" max="100" placeholder="0" value={formData.shadeCoverage} onChange={(e) => updateField("shadeCoverage", e.target.value)} />
                        <span className="absolute right-4 top-3.5 text-muted-foreground font-mono">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Percentage of target site shielded from direct 12PM-3PM radiation.</p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Green Area Coverage (%)</Label>
                      <div className="relative">
                        <Input className="h-12 font-mono pr-12" type="number" min="0" max="100" placeholder="0" value={formData.greenCoverage} onChange={(e) => updateField("greenCoverage", e.target.value)} />
                        <span className="absolute right-4 top-3.5 text-muted-foreground font-mono">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Vegetative density capable of mitigating urban heat island effect.</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="border-b border-border/40 pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">Building Envelope</h3>
                    <p className="text-sm text-muted-foreground mt-1">Thermal barrier composition and physical occupancy.</p>
                  </div>
                  <div className="grid gap-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Peak Occupancy</Label>
                        <Input className="h-12 font-mono" type="number" placeholder="0" value={formData.occupancy} onChange={(e) => updateField("occupancy", e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Operating Hours / Day</Label>
                        <Input className="h-12 font-mono" type="number" placeholder="8" value={formData.operatingHours} onChange={(e) => updateField("operatingHours", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Primary Roof Material</Label>
                      <Select value={formData.roofType} onValueChange={(v) => updateField("roofType", v)}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select composition" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete Slab (High thermal mass)</SelectItem>
                          <SelectItem value="metal">Metal / Tin Sheet (Extreme heat transfer)</SelectItem>
                          <SelectItem value="tile">Clay / Ceramic Tile (Moderate)</SelectItem>
                          <SelectItem value="thatched">Thatched (Low transfer)</SelectItem>
                          <SelectItem value="green">Cool / Green Roof (Optimal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Roof Condition</Label>
                      <Select value={formData.roofCondition} onValueChange={(v) => updateField("roofCondition", v)}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select integrity" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">Poor (Structural degradation, leaks)</SelectItem>
                          <SelectItem value="fair">Fair (Visible aging)</SelectItem>
                          <SelectItem value="good">Good (Standard integrity)</SelectItem>
                          <SelectItem value="excellent">Excellent (Recently treated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="border-b border-border/40 pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">Resilience Infrastructure</h3>
                    <p className="text-sm text-muted-foreground mt-1">Existing capacity to mitigate heat stress for occupants.</p>
                  </div>
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ventilation Architecture</Label>
                      <Select value={formData.ventilation} onValueChange={(v) => updateField("ventilation", v)}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select system" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">Poor (Minimal airflow, no fans)</SelectItem>
                          <SelectItem value="medium">Medium (Standard windows, ceiling fans)</SelectItem>
                          <SelectItem value="good">Good (Designed cross-ventilation)</SelectItem>
                          <SelectItem value="excellent">Excellent (Active HVAC system)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Drinking Water Accessibility</Label>
                      <Select value={formData.waterAccess} onValueChange={(v) => updateField("waterAccess", v)}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select supply status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None available on site</SelectItem>
                          <SelectItem value="poor">Poor (Unreliable or distant)</SelectItem>
                          <SelectItem value="adequate">Adequate (Standard supply)</SelectItem>
                          <SelectItem value="good">Good (Multiple stations, reliable)</SelectItem>
                          <SelectItem value="excellent">Excellent (Chilled, abundant stations)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Dedicated Heat Relief Space</Label>
                      <Select value={formData.reliefSpace} onValueChange={(v) => updateField("reliefSpace", v)}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select relief capacity" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="limited">Limited (Shaded waiting area)</SelectItem>
                          <SelectItem value="adequate">Adequate (Dedicated room)</SelectItem>
                          <SelectItem value="good">Good (Cooled common area)</SelectItem>
                          <SelectItem value="excellent">Excellent (Full climate control center)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="border-b border-border/40 pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">System Review</h3>
                    <p className="text-sm text-muted-foreground mt-1">Verify telemetry before executing the deterministic scoring engine.</p>
                  </div>
                  
                  <div className="bg-muted/10 border border-border/50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-mono text-sm">Telemetry Package</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div className="text-muted-foreground">Location Node</div>
                      <div className="font-medium text-right">{formData.location || "—"} [{formData.latitude}, {formData.longitude}]</div>
                      
                      <div className="text-muted-foreground">Facility Class</div>
                      <div className="font-medium text-right capitalize">{formData.buildingType || "—"}</div>
                      
                      <div className="text-muted-foreground">Human Load</div>
                      <div className="font-medium text-right">{formData.occupancy} @ {formData.operatingHours}h</div>
                      
                      <div className="text-muted-foreground">Data Completeness</div>
                      <div className="font-mono text-right text-primary">{readiness}%</div>
                    </div>
                  </div>

                  <Button size="lg" onClick={handleSubmit} disabled={loading || readiness < 100} className="w-full h-14 text-base font-bold group">
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> EXECUTING SCORING ALGORITHM...</> : <><CheckCircle2 className="mr-2 h-5 w-5" /> AUTHORIZE ENGINE EXECUTION</>}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Floating Bottom Navigation for Mobile / Tablet */}
        <div className="fixed md:absolute bottom-0 left-0 md:left-auto right-0 p-4 bg-background/90 backdrop-blur border-t border-border/40 flex justify-between items-center z-10">
          <Button variant="ghost" onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0 || loading}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {currentStep < STEPS.length - 1 && (
            <Button onClick={() => setCurrentStep(p => Math.min(STEPS.length - 1, p + 1))}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR (Live Assessment Summary) */}
      <div className="hidden lg:flex w-80 border-l border-border/40 bg-muted/5 flex-col">
        <div className="p-6 border-b border-border/40">
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 flex items-center justify-between">
            Live Telemetry 
            <span className={`px-2 py-0.5 rounded text-[9px] ${readiness === 100 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {readiness}% READY
            </span>
          </div>
          
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${readiness}%` }} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <SummaryBlock label="Classification" value={formData.buildingType} />
          <SummaryBlock label="Location" value={formData.location} sub={`${formData.latitude}, ${formData.longitude}`} />
          <SummaryBlock label="Occupancy" value={formData.occupancy} sub={`${formData.operatingHours} hrs/day`} />
          <SummaryBlock label="Thermal Barrier" value={formData.roofType} sub={formData.roofCondition} />
          <SummaryBlock label="Solar Shield" value={formData.shadeCoverage} sub="% coverage" />
          <SummaryBlock label="Vegetation" value={formData.greenCoverage} sub="% coverage" />
          <SummaryBlock label="Airflow Arch." value={formData.ventilation} />
          <SummaryBlock label="Hydration" value={formData.waterAccess} />
          <SummaryBlock label="Sanctuary Space" value={formData.reliefSpace} />
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ label, value, sub }: { label: string, value: string, sub?: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1 pb-4 border-b border-border/20 last:border-0">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-medium text-sm capitalize">{value}</div>
      {sub && <div className="text-xs font-mono text-muted-foreground">{sub}</div>}
    </div>
  );
}
