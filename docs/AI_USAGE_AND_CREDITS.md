# HeatCredit — AI Usage Disclosure, Credits & Attributions

> **Transparency Statement:** This document details the role of AI-assisted development tooling in creating HeatCredit, alongside engineering verification protocols and third-party software attributions.

---

## 1. AI-Assisted Development Disclosure

In accordance with hackathon guidelines for **Environmental Hacks 2026 (Bharat Builds Tour)**, Team **Build Bros** declares the structured use of AI development assistants:

### 1.1 Tool Employed
- **Google Antigravity Agentic IDE (DeepMind Advanced Coding Assistant)**

### 1.2 Areas of AI Assistance
- **Boilerplate & Interface Scaffolding:** Generating initial TypeScript interface definitions for building attributes, scoring dimensions, and API DTO contracts.
- **Frontend Refactoring & Styling:** Crafting responsive Tailwind CSS utility layouts, accessible component hierarchies, and interactive Framer Motion animation configurations for the editorial web dashboard.
- **Test Generation & Edge-Case Coverage:** Drafting synthetic test fixtures (e.g., malformed ISO-8601 timestamps, out-of-range latitude/longitude coordinates, NaN inputs) for the validation and warnings suites.
- **Documentation Audit & Gap Analysis:** Synthesizing technical documentation, compiling API reference contracts, and auditing cross-document consistency against source code.

### 1.3 Human Review & Engineering Verification
All AI-generated code, algorithms, and documentation underwent strict human oversight:
1. **Algorithmic Correctness:** The 0/1 knapsack combinatorial engine and 7-dimension scoring formulas were designed, reviewed, and checked by team members to prevent hallucinated logic.
2. **Deterministic Verification:** Every computational function is subjected to 141 automated unit and integration tests.
3. **AWS Infrastructure Audit:** The AWS SAM `template.yaml` resource declarations, IAM least-privilege policies, and DynamoDB table billing modes were verified to ensure security and prevent unexpected cloud charges.
4. **Ultimate Responsibility:** The human engineering team (Build Bros) retains 100% responsibility for the design, functionality, accuracy, and deployment of HeatCredit.

---

## 2. Team Credits & Verified Contributions

**Team Name:** Build Bros
**Event:** Environmental Hacks 2026 — Event 02 of Bharat Builds Tour
**Organizer:** WeMakeDevs | **Partner:** AWS

| Team Member | Core Focus & Verified Contributions |
|---|---|
| **Rishvin Reddy** | Project Lead, System Architecture, AWS SAM Infrastructure, Scoring Engine & Optimizer Core, Frontend Integration. |
| **Pocharam Gayathri** | Environmental Modeling, Vulnerability Dimension Weighting, Evidence Provenance Architecture, Scenario Planning Logic. |
| **Guggilla Yogamruth Reddy** | Backend API Handlers, DynamoDB Persistence Schemas, Open-Meteo & NWS API Integration Adapters, Automated Testing. |
| **Navari Yashwanth Reddy** | Frontend Engineering, Editorial Climate-Tech UI Design, Data Visualization (Recharts / Topology Canvas), Documentation. |

---

## 3. Third-Party Libraries & Asset Attributions

HeatCredit stands on the shoulders of the open-source community:

| Library / Service | Purpose | License | Source / Attribution |
|---|---|:---:|---|
| **Open-Meteo API** | Meteorological temperature & humidity telemetry | CC BY 4.0 | [open-meteo.com](https://open-meteo.com) |
| **US National Weather Service API** | Official heat warning alerts | Public Domain | [api.weather.gov](https://api.weather.gov) |
| **Next.js** | React Web Framework (Turbopack) | MIT | [github.com/vercel/next.js](https://github.com/vercel/next.js) |
| **React & React DOM** | UI Component Architecture | MIT | [github.com/facebook/react](https://github.com/facebook/react) |
| **AWS SDK for JavaScript v3** | DynamoDB client & DocumentClient | Apache-2.0 | [github.com/aws/aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3) |
| **Tailwind CSS** | Design system styling engine | MIT | [tailwindcss.com](https://tailwindcss.com) |
| **Lucide Icons** | Technical UI iconography | ISC | [lucide.dev](https://lucide.dev) |
| **Recharts** | Vulnerability & budget allocation charts | MIT | [recharts.org](https://recharts.org) |
| **Framer Motion** | Micro-animations and page transitions | MIT | [motion.dev](https://motion.dev) |
| **Radix UI Primitives** | Accessible dialog and slot primitives | MIT | [radix-ui.com](https://radix-ui.com) |
