# HeatCredit — Official Hackathon Demo Script (2m 45s)

> **Event:** Environmental Hacks 2026 — Event 02 of Bharat Builds Tour
> **Target Video Runtime:** **2 minutes 45 seconds** (Strictly under the 3-minute hackathon limit)
> **Published Video URL (YouTube):** [https://youtu.be/YSq04cWQ8as](https://youtu.be/YSq04cWQ8as)
> **Live Application (AWS Amplify):** [https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/](https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/)
> **Scenario:** Green Valley School, Hyderabad — ₹50,000 Budget Optimization
> **Presenter Checklist:** High-resolution browser window (1080p), preloaded facility profile, terminal or AWS Console ready for architecture evidence.

---

## Timed Walkthrough

### 0:00 – 0:15 | Scene 1: The Problem & Product Statement (15s)
- **Screen:** HeatCredit Landing Page (`/`) with Hero Tagline visible.
- **Action:** Cursor highlights the tagline: *"Measure heat risk. Optimize resilience. Act within budget."*
- **Narration:**
  > *"Extreme heat is not just a meteorological statistic—it is a facility crisis. When ambient temperatures hit 42°C, two schools in the same city experience completely different heat risks based on their roof, shade, and ventilation. Most facilities have tight budgets and no clear way to prioritize repairs. That is why we built HeatCredit: an AWS-powered heat-resilience decision engine that measures facility vulnerability and optimizes capital interventions under strict budgets."*
- **Technical Claim:** Purpose-built environmental decision-support platform for public facilities.

---

### 0:15 – 0:40 | Scene 2: Live Facility Intake & Telemetry (25s)
- **Screen:** Facility Assessment Page (`/assessment`).
- **Action:** Select preloaded profile: *Green Valley School, Hyderabad* (350 occupants, concrete roof, 25% shade). Click *"Calculate Resilience Score"*.
- **Narration:**
  > *"Here we evaluate Green Valley School in Hyderabad—350 students, concrete roof in fair condition, minimal shade, and poor water access. HeatCredit ingests these 11 physical attributes along with data provenance tracking to verify whether each data point is measured or estimated. Simultaneously, the backend queries live meteorological telemetry via Open-Meteo."*
- **Expected Result:** Form validates instantly and transitions smoothly to the Assessment Intelligence view.
- **Technical Claim:** Deterministic input validation with data provenance and live telemetry ingestion.

---

### 0:40 – 1:05 | Scene 3: Seven Scoring Dimensions & Baseline Score (25s)
- **Screen:** Resilience Intelligence & Methodology Breakdown (`/intelligence` or `/results/[id]`).
- **Action:** Hover over the seven breakdown bars: Thermal Protection (16.3), Shade (3.8), Ventilation (9.0), Water (4.5), Relief (4.5), Green (1.5), Exposure (2.1).
- **Narration:**
  > *"The engine computes a Heat Resilience Score of exactly 42 out of 100—classifying the school in the High Risk tier. Notice that this is not an opaque AI estimate. It is a deterministic, explainable sum across seven physical dimensions totaling 100 points. The top vulnerabilities are immediately isolated: severe shade deficit and inadequate drinking water."*
- **Expected Result:** Score badge shows `42 / 100 (High Risk)`, top vulnerabilities highlighted in red and amber.
- **Technical Claim:** Explainable 7-dimension scoring without machine-learning hallucinations.

---

### 1:05 – 1:40 | Scene 4: Capital Allocation & 0/1 Knapsack Optimizer (35s)
- **Screen:** Capital Allocation Lab (`/optimizer`).
- **Action:** Set the budget slider to **₹50,000**. Click *"Run Capital Optimizer"*.
- **Narration:**
  > *"Now the critical question: how does a school board spend a limited ₹50,000 grant? We enter ₹50,000 into the Capital Allocation Lab. Behind the scenes, the optimizer executes an exact 0/1 knapsack algorithm, evaluating all 64 possible combinations across our physical intervention catalogue."*
- **Expected Result:** Optimizer highlights selected interventions: Shade Structure (₹25,000), Ventilation Improvement (₹15,000), and Drinking Water Station (₹8,000).
- **Technical Claim:** Algorithmic combinatorial optimization under budget constraints.

---

### 1:40 – 2:05 | Scene 5: Projected Score Lift & Capital Reserves (25s)
- **Screen:** Optimization Result Cards & Scenario Comparison (`/optimizer` & `/scenarios`).
- **Action:** Point cursor to total deployed capital (₹48,000), remaining reserve (₹2,000), and projected score (67).
- **Narration:**
  > *"The optimal package deploys ₹48,000, reserving ₹2,000 for emergency contingencies. The result is a massive +25 point resilience improvement, lifting Green Valley School from 42 to 67 out of 100—moving the school out of High Risk into Moderate Resilience."*
- **Expected Result:** Lift delta shows `+25 pts`, score moves to `67`, remaining budget `₹2,000`.
- **Technical Claim:** Verifiable mathematical optimization reproducing exact benchmark calculations.

---

### 2:05 – 2:25 | Scene 6: Executive Decision Report (20s)
- **Screen:** Facility Decision Report (`/report`).
- **Action:** Click *"Print / Export Decision Sheet"*, showing the clean printable layout with provenance stamps.
- **Narration:**
  > *"Facility managers can immediately generate or print an executive decision report, complete with itemized intervention cost breakdowns, data provenance audit stamps, and official warning advisory status for municipal boards and funding bodies."*
- **Expected Result:** Formatted executive decision report ready for municipal review.
- **Technical Claim:** Complete end-to-end decision-support reporting.

---

### 2:25 – 2:45 | Scene 7: AWS Architecture Evidence & Closing (20s)
- **Screen:** Architecture Interactive Canvas (`/architecture`) or Terminal showing SAM build & tests.
- **Action:** Show the interactive topology canvas highlighting API Gateway → Lambda (Node.js 24.x) → DynamoDB.
- **Narration:**
  > *"Under the hood, HeatCredit is entirely serverless on AWS: built with AWS SAM, routed through Amazon API Gateway, executed on Graviton ARM64 Lambda functions in Node.js 24.x, and backed by DynamoDB on-demand tables. 141 automated tests verify every formula. Measure heat risk. Optimize resilience. Act within budget. Thank you."*
- **Expected Result:** Clear visual presentation of serverless AWS architecture and test evidence.
- **Technical Claim:** Cloud-native AWS serverless implementation running within Free Tier limits.

---

## Rehearsal Timing Verification

| Segment | Target Duration | Cumulative Time |
|---|:---:|:---:|
| 1. Problem & Product Statement | 15s | 0:15 |
| 2. Facility Intake & Telemetry | 25s | 0:40 |
| 3. Seven Dimensions & 42 Baseline | 25s | 1:05 |
| 4. Budget Slider & 0/1 Knapsack | 35s | 1:40 |
| 5. Resulting 67 Score & Reserves | 25s | 2:05 |
| 6. Decision Report Generation | 20s | 2:25 |
| 7. AWS Architecture & Closing | 20s | **2:45** |
| *Safety Buffer* | *15s* | **3:00 (Max Limit)** |
