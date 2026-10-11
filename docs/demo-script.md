# HeatCredit — Demo Script

> ℹ️ **Notice:** For the official 2m 45s timed hackathon demonstration walkthrough tailored strictly to the 3-minute video limit, see [**`DEMO_SCRIPT.md`**](DEMO_SCRIPT.md).

**Scenario:** Green Valley School, Hyderabad — ₹50,000 budget

---

## 0:00 – 0:20 — Hook (20 seconds)

> "Extreme heat isn't only a weather problem. The real challenge is deciding what a building should do about it — when time is short and resources are limited."

> "A school, a hospital, a community centre can each face very different heat risks. HeatCredit measures that risk — and tells decision-makers exactly where their budget will have the greatest impact."

---

## 0:20 – 0:45 — Building input (25 seconds)

*Open the assessment form.*

> "We're assessing Green Valley School in Hyderabad. 350 students, open 9 hours a day. Concrete roof in fair condition. Limited shade — about 15%. Minimal green coverage. Medium ventilation. Poor water access. No relief space."

*Submit the form.*

---

## 0:45 – 1:05 — Weather context (20 seconds)

*Show the weather widget.*

> "HeatCredit pulls live weather context through Open-Meteo — 37°C right now in Hyderabad, feels like 41°C, 55% humidity. This is real environmental context, not a static number."

---

## 1:05 – 1:25 — Score reveal (20 seconds)

*Show the assessment result.*

> "The system returns a Heat Resilience Score of **42 out of 100** — High Risk. You can see exactly how each dimension contributes to that score: thermal protection, shade, ventilation, water access, relief capacity, green cover, and occupancy exposure."

---

## 1:25 – 1:45 — Vulnerability breakdown (20 seconds)

*Show the vulnerability profile.*

> "The biggest gaps are shade coverage, relief capacity, and water access. HeatCredit doesn't just tell you the score — it tells you *why*, and ranks what matters most."

---

## 1:45 – 2:20 — Budget optimizer (35 seconds)

*Navigate to Budget Optimizer. Enter ₹50,000.*

> "The school has ₹50,000. We enter that budget — and the optimizer evaluates every feasible combination of interventions."

*Pause while optimizer runs.*

> "The result: shade structure, water station, ventilation improvement. Total cost: ₹48,000. Total improvement: plus 25 points. The school's score moves from **42 to 67** — from High Risk to Moderate — with ₹2,000 still in budget."

> "That's not a guess. That's a deterministic 0/1 knapsack optimization evaluated across 64 possible intervention combinations."


---

## 2:20 – 2:45 — Architecture (25 seconds)

*Show the architecture diagram or AWS console.*

> "Under the hood: the assessment is submitted through API Gateway to a Lambda function, which runs the scoring engine and persists the result to DynamoDB. A second Lambda runs the optimizer when the budget is entered. Everything is serverless, CloudWatch-monitored, and deployed on AWS Amplify."

---

## 2:45 – 3:00 — Close (15 seconds)

> "HeatCredit doesn't just measure heat vulnerability. It tells decision-makers what they can do next — and where their limited budget will have the greatest impact."

> "That's HeatCredit."

*Stop.*

---

## Preparation checklist

- [ ] Demo building (Hyderabad school) pre-filled or easily available
- [ ] App deployed and accessible at public URL
- [ ] Weather API responding (or fallback confirmed working)
- [ ] Budget optimizer tested end-to-end
- [ ] Architecture slide or AWS console tab open and ready
- [ ] Full walkthrough rehearsed at least twice
- [ ] Timer running during rehearsal
