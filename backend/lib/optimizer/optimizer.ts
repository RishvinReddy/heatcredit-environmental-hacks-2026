/**
 * HeatCredit — Budget Optimization Engine
 *
 * Deterministic 0/1 knapsack optimizer.
 * Evaluates all 2^n combinations of n interventions and selects
 * the feasible package that maximises total resilience improvement.
 *
 * For n ≤ 10 (our current catalogue has 6), this is trivially fast.
 * No ML, no AI, no external libraries.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Intervention {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  impact: number;
  targetDimension: string;
  description: string;
  notes?: string;
}

export interface OptimizationInput {
  assessmentId: string;
  currentScore: number;
  budget: number;
  interventions: Intervention[];
}

export interface OptimizationResult {
  assessmentId: string;
  currentScore: number;
  budget: number;
  feasible: boolean;
  selectedInterventions: Intervention[];
  totalCost: number;
  totalImpact: number;
  projectedScore: number;
  improvement: number;
  remainingBudget: number;
  alternativePackages: AlternativePackage[];
}

export interface AlternativePackage {
  label: string;
  interventions: Intervention[];
  totalCost: number;
  totalImpact: number;
  projectedScore: number;
}

// ---------------------------------------------------------------------------
// Core 0/1 knapsack — brute force over 2^n combinations
// ---------------------------------------------------------------------------

interface Package {
  interventions: Intervention[];
  totalCost: number;
  totalImpact: number;
}

function enumeratePackages(
  interventions: Intervention[],
  budget: number
): Package[] {
  const n = interventions.length;
  const feasible: Package[] = [];

  // Iterate over every subset using bitmask
  for (let mask = 1; mask < (1 << n); mask++) {
    let totalCost = 0;
    let totalImpact = 0;
    const selected: Intervention[] = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        totalCost += interventions[i].estimatedCost;
        totalImpact += interventions[i].impact;
        selected.push(interventions[i]);
      }
    }

    if (totalCost <= budget) {
      feasible.push({ interventions: selected, totalCost, totalImpact });
    }
  }

  return feasible;
}

/**
 * Select the optimal package from all feasible ones.
 * Tie-breaking: prefer lower cost (saves budget for future work).
 */
function selectOptimal(packages: Package[]): Package | null {
  if (packages.length === 0) return null;

  return packages.reduce((best, current) => {
    if (current.totalImpact > best.totalImpact) return current;
    if (
      current.totalImpact === best.totalImpact &&
      current.totalCost < best.totalCost
    )
      return current;
    return best;
  });
}

// ---------------------------------------------------------------------------
// Alternative packages (for the "Combination A / B / C" UI)
// ---------------------------------------------------------------------------

function buildAlternativePackages(
  packages: Package[],
  optimal: Package,
  currentScore: number,
  count: number = 3
): AlternativePackage[] {
  // Exclude the optimal, sort by impact desc then cost asc, take top N
  const alternatives = packages
    .filter(
      (p) =>
        !(
          p.interventions
            .map((i) => i.id)
            .sort()
            .join(",") ===
          optimal.interventions
            .map((i) => i.id)
            .sort()
            .join(",")
        )
    )
    .sort((a, b) => {
      if (b.totalImpact !== a.totalImpact) return b.totalImpact - a.totalImpact;
      return a.totalCost - b.totalCost;
    })
    .slice(0, count);

  return alternatives.map((pkg, idx) => ({
    label: `Option ${idx + 1}`,
    interventions: pkg.interventions,
    totalCost: pkg.totalCost,
    totalImpact: pkg.totalImpact,
    projectedScore: Math.min(currentScore + pkg.totalImpact, 100),
  }));
}

// ---------------------------------------------------------------------------
// Main optimizer function
// ---------------------------------------------------------------------------

export function optimize(input: OptimizationInput): OptimizationResult {
  const { assessmentId, currentScore, budget, interventions } = input;

  if (budget <= 0 || interventions.length === 0) {
    return {
      assessmentId,
      currentScore,
      budget,
      feasible: false,
      selectedInterventions: [],
      totalCost: 0,
      totalImpact: 0,
      projectedScore: currentScore,
      improvement: 0,
      remainingBudget: budget,
      alternativePackages: [],
    };
  }

  const allPackages = enumeratePackages(interventions, budget);

  if (allPackages.length === 0) {
    return {
      assessmentId,
      currentScore,
      budget,
      feasible: false,
      selectedInterventions: [],
      totalCost: 0,
      totalImpact: 0,
      projectedScore: currentScore,
      improvement: 0,
      remainingBudget: budget,
      alternativePackages: [],
    };
  }

  const optimal = selectOptimal(allPackages)!;
  const projectedScore = Math.min(currentScore + optimal.totalImpact, 100);
  const improvement = projectedScore - currentScore;
  const alternativePackages = buildAlternativePackages(
    allPackages,
    optimal,
    currentScore
  );

  return {
    assessmentId,
    currentScore,
    budget,
    feasible: true,
    selectedInterventions: optimal.interventions,
    totalCost: optimal.totalCost,
    totalImpact: optimal.totalImpact,
    projectedScore,
    improvement,
    remainingBudget: budget - optimal.totalCost,
    alternativePackages,
  };
}
