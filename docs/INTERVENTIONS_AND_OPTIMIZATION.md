# HeatCredit — Interventions Catalogue & Budget Optimization Engine

> **Optimization Algorithm:** Exact 0/1 Knapsack via Bitmask Enumeration ($2^n$, $n=6 \implies 64$ states)
> **Source Implementation:** [`backend/lib/optimizer/optimizer.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/optimizer/optimizer.ts)
> **Intervention Catalogue Data:** [`data/interventions.json`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/data/interventions.json)
> **Test Suite:** [`tests/optimizer/optimizer.test.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/tests/optimizer/optimizer.test.ts) (24/24 tests passing)
>
> ⚠️ **DISCLAIMER:** Intervention costs and modeled score improvements represent prototype planning estimates in Indian Rupees (INR ₹) tailored to urban South Asian community facilities. They do not constitute contractor bids, guaranteed construction quotes, or scientifically validated guarantees of ambient room temperature reductions.

---

## 1. The Intervention Catalogue

The catalogue defines six modular, low-carbon physical interventions designed to be implemented within tight municipal or institutional budget ceilings:

| Intervention ID | Canonical Name | Category | Target Dimension | Estimated Cost (INR ₹) | Modeled Impact (+pts) | Capital Efficiency (pts / ₹10,000) | Description |
|:---:|---|---|---|:---:|:---:|:---:|---|
| `water` | **Drinking Water Station** | Hydration | `waterAccess` | **₹8,000** | **+6** | 7.50 | Dedicated filtered drinking water station with ambient/cool dispensers to prevent occupant dehydration. |
| `ventilation` | **Ventilation Improvement** | Airflow | `ventilation` | **₹15,000** | **+8** | 5.33 | High-volume low-speed ceiling fans, roof vents, or louvers to increase convective air exchange. |
| `roof` | **Reflective Roof Treatment** | Envelope | `roofCondition` | **₹18,000** | **+9** | 5.00 | High-albedo elastomeric cool-roof coating applied across the roof deck to reflect direct solar radiation. |
| `green` | **Green Coverage** | Nature | `greenCoverage` | **₹20,000** | **+7** | 3.50 | Shading trees, planter boxes, or vertical wall trellises providing localized microclimate evapotranspiration. |
| `shade` | **Shade Structure** | Shading | `shade` | **₹25,000** | **+11** | 4.40 | Tensioned shade sails or pergolas over outdoor gathering areas, courtyards, and school entranceways. |
| `relief` | **Heat Relief Room** | Safe Haven | `reliefSpace` | **₹50,000** | **+14** | 2.80 | Dedicated enclosed, high-efficiency fan- or evaporative-cooled refuge space for acute thermal recovery. |
| **Total** | *Full Catalogue Deployment* | — | — | **₹136,000** | **+65 (Max)** | 4.78 | Complete multi-layered facility heat adaptation package. |

---

## 2. Optimization Problem Formulation

The budget optimizer solves the classical **0/1 Knapsack Problem**:

### Objective Function
Given $n$ available interventions, each characterized by cost $c_i > 0$ and resilience benefit $b_i > 0$, find binary selection variables $x_i \in \{0, 1\}$ that maximize total resilience improvement:

$$\max \sum_{i=1}^{n} b_i \cdot x_i$$

### Subject to:
1. **Budget Constraint:**
   $$\sum_{i=1}^{n} c_i \cdot x_i \le B$$
   where $B$ is the user-configured capital budget limit.

2. **Feasibility Rule:**
   If no combination satisfies $c_i \le B$ (e.g., $B < \min(c_i) = ₹8,000$), the problem is deemed **infeasible**:
   - `feasible: false`
   - `selectedInterventions: []`
   - `totalCost: 0`, `totalImpact: 0`
   - `projectedScore: currentScore`
   - `remainingBudget: B`

3. **Tie-Breaking Rule:**
   When two distinct intervention combinations yield the identical total resilience improvement ($\sum b_i$), the algorithm selects the combination with the **strictly lower total cost**, preserving capital reserves for future facility maintenance:
   $$\text{Select } P_1 \text{ over } P_2 \iff (b_{P_1} > b_{P_2}) \lor (b_{P_1} = b_{P_2} \land c_{P_1} < c_{P_2})$$

4. **Score Capping:**
   The projected resilience score cannot exceed the theoretical maximum of 100 points:
   $$\text{ProjectedScore} = \min(\text{CurrentScore} + \text{TotalImpact}, 100)$$

---

## 3. Algorithm Implementation Details

Because the catalogue contains $n = 6$ items, the solution space contains exactly $2^6 = 64$ possible combinations. Rather than using dynamic programming with floating-point budget approximations or heuristic approximations, HeatCredit uses **exhaustive bitmask enumeration**:

```typescript
function enumeratePackages(interventions: Intervention[], budget: number): Package[] {
  const n = interventions.length;
  const feasible: Package[] = [];

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
```

### Computational Complexity
- **Time Complexity:** $\mathcal{O}(n \cdot 2^n)$. For $n=6$, this requires $6 \times 64 = 384$ simple operations, executing in under **1 millisecond** in the Node.js runtime without external dependencies.
- **Space Complexity:** $\mathcal{O}(2^n)$ storing feasible candidate records in memory.

---

## 4. Alternative Scenario Generation

In addition to identifying the single mathematical optimum, the optimizer generates up to **3 alternative packages** for the Scenario Studio.

These alternatives:
1. Exclude the exact optimal combination.
2. Are sorted by **Impact descending**, then **Cost ascending**.
3. Allow facility managers to evaluate trade-offs (e.g., choosing a package that prioritizes vegetative green cover or roof treatment over physical shade sails).

---

## 5. Canonical Reproducible Scenario

### Facility: Green Valley School, Hyderabad
- **Baseline Resilience Score:** `42 / 100` (High Risk)
- **Available Capital Budget:** `₹50,000`

### Step 1: Enumerating Feasible Candidates within ₹50,000
Among the 64 possible subsets, key candidates include:
- Single item: Heat Relief Room alone (Cost: ₹50,000, Impact: +14 pts)
- Two items: Shade + Green Coverage (Cost: ₹25k + ₹20k = ₹45,000, Impact: 11 + 7 = +18 pts)
- Two items: Shade + Roof Treatment (Cost: ₹25k + ₹18k = ₹43,000, Impact: 11 + 9 = +20 pts)
- Three items: Roof + Ventilation + Water (Cost: ₹18k + ₹15k + ₹8k = ₹41,000, Impact: 9 + 8 + 6 = +23 pts)
- **Three items: Shade + Ventilation + Water** (Cost: ₹25k + ₹15k + ₹8k = **₹48,000**, Impact: 11 + 8 + 6 = **+25 pts**)

### Step 2: Optimal Package Selected
$$\text{Selected} = \{\text{Shade Structure}, \text{Ventilation Improvement}, \text{Drinking Water Station}\}$$
$$\text{Total Cost} = ₹25,000 + ₹15,000 + ₹8,000 = \mathbf{₹48,000}$$
$$\text{Remaining Budget} = ₹50,000 - ₹48,000 = \mathbf{₹2,000}$$
$$\text{Total Resilience Lift} = 11 + 8 + 6 = \mathbf{+25\text{ points}}$$
$$\text{Projected Score} = 42 + 25 = \mathbf{67 \text{ / } 100} \quad (\text{Transitions from High Risk to Moderate Risk})$$

---

## 6. Real-World Limitations

1. **Discrete Independence:** The knapsack model assumes intervention benefits are strictly additive. In physical reality, combining cool roofs with cross-ventilation creates compounding microclimate cooling effects that non-linear thermodynamic simulations would reflect.
2. **Maintenance & Operating Costs:** The optimizer evaluates upfront capital expenditure (CapEx). Ongoing operational expenditures (OpEx), such as water filters or electricity for relief rooms, are not modeled in the knapsack constraint.
3. **Local Market Discrepancies:** Costs reflect standardized estimates. Local construction quotes should be obtained before financial commitments.
