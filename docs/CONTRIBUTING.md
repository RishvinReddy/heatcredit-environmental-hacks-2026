# Contributing to HeatCredit

Thank you for your interest in contributing to **HeatCredit**! This project is an open-source, serverless environmental decision engine built to help facilities evaluate and adapt to extreme heat within budget constraints.

---

## 1. Repository Structure

```
heatcredit/
├── apps/
│   └── web/                   # Next.js 16 (App Router) frontend application
│       ├── app/               # Routes: /assessment, /optimizer, /scenarios, /overview...
│       ├── components/        # UI components, layout, charts, forms
│       ├── lib/               # Client-side scoring adapter, telemetry clients
│       └── package.json
├── backend/
│   ├── functions/             # Lambda handlers: health, interventions, weather,
│   │                          # warnings, assessment, optimization
│   └── lib/                   # Canonical kernels: scoring, optimizer, validation,
│                              # warnings adapter, weather proxy, data-quality
├── data/                      # Reference data: interventions.json, demo-buildings.json
├── docs/                      # Architectural, scoring, API, and deployment documentation
├── events/                    # Mock event payloads for SAM local testing
├── tests/                     # 141 automated unit and integration tests
├── template.yaml              # AWS SAM Infrastructure as Code template
├── samconfig.toml             # AWS SAM deployment configuration
├── buildspec.yml              # AWS Amplify CI/CD monorepo build specification
└── package.json               # Root scripts and workspace dependencies
```

---

## 2. Local Development Setup

### Prerequisites
- **Node.js:** `v20.x` or `v24.x` (LTS)
- **npm:** `v10.x` or higher
- **AWS SAM CLI:** (Optional, for running local Lambdas via Docker)

### Installation
```bash
# Clone the repository
git clone https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026.git
cd heatcredit-environmental-hacks-2026

# Install dependencies at root and frontend
npm ci
cd apps/web && npm ci && cd ../..

# Run tests to confirm clean environment
npm test
```

### Running Locally
```bash
# Run the frontend dev server (runs at http://localhost:3000)
npm run dev:web

# Or from apps/web:
cd apps/web && npm run dev
```

---

## 3. Branching & Contribution Workflow

1. **Fork and Branch:** Create a feature branch off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Coding Standards:**
   - Write clean, type-safe TypeScript (strict mode enabled).
   - Keep computational scoring and optimization kernels **deterministic**—no non-deterministic external calls or random seeds inside scoring calculations.
   - Never commit API keys, AWS credentials, or personal secrets.
3. **Run Verification:** Before opening a pull request, run all checks:
   ```bash
   npm test                          # Must pass 141/141 tests
   npm run build --prefix apps/web   # Next.js production build check
   ```
4. **Submit a Pull Request:** Open a PR against `main` with a clear description of changes, motivation, and test evidence.

---

## 4. How-To Guides for Common Extensions

### 4.1 How to Add a New Intervention
1. Open [`data/interventions.json`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/data/interventions.json).
2. Append your intervention object:
   ```json
   {
     "id": "cool-pavement",
     "name": "High-Albedo Cool Pavement",
     "category": "thermal",
     "description": "Apply solar-reflective coating to outdoor asphalt parking and walkways.",
     "estimatedCost": 22000,
     "impact": 8,
     "targetDimension": "thermalProtection",
     "constraints": [],
     "notes": "Cost estimate for 200 sq.m surface."
   }
   ```
3. Update [`tests/optimizer/optimizer.test.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/tests/optimizer/optimizer.test.ts) if your intervention modifies the catalogue length ($n$) or changes the canonical ₹50,000 solution.

---

### 4.2 How to Safely Modify the Scoring Engine
1. Open [`backend/lib/scoring/scoring.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/scoring/scoring.ts).
2. **Dimension Weights Rule:** The constant `DIMENSION_WEIGHTS` **MUST sum to exactly 100 points**:
   $$\sum \text{DIMENSION\_WEIGHTS} = 100$$
3. Ensure categorical factors remain normalized between $0.0$ and $1.0$.
4. Re-run `npm run test:scoring` to verify dimension boundary assertions pass.

---

### 4.3 How to Add a New Meteorological Warning Provider
1. Open [`backend/lib/warnings/warnings.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/warnings/warnings.ts).
2. Create your provider adapter implementing the strict 4-state contract:
   - `"active"` — verified active heat alert.
   - `"none"` — query succeeded, zero active heat alerts.
   - `"unsupported"` — coordinates fall outside provider jurisdiction.
   - `"unavailable"` — network timeout, HTTP error, or malformed JSON.
3. Add unit test fixtures in [`tests/warnings/warnings.test.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/tests/warnings/warnings.test.ts).
4. Update [`docs/DATA_PROVENANCE.md`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/docs/DATA_PROVENANCE.md) to document provider attribution and geographic coverage.

---

## 5. Reporting Issues

If you find a bug, inconsistency, or calculation error, please open a [GitHub Issue](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026/issues) with:
- Facility inputs and coordinates used.
- Expected score or optimizer package vs. actual result.
- Node.js version and operating system.
