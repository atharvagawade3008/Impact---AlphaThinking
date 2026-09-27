# IMPACT — AI-powered Change Impact & Release Readiness

> **Know what your code change can break before you ship it.**

IMPACT is a developer tool that answers the question every engineering team asks before a release:
_"If I make this change, what else could break?"_

It uses IBM Bob static source-code analysis to trace change propagation through a repository's
dependency graph, surface concrete risks with file-level evidence, recommend targeted test suites,
and produce an evidence-grounded release readiness decision — all before a single line of code is
touched in production.

---

## Core Workflow

```
Proposed Change
   → Impact Map      (which files, modules, and APIs are affected?)
   → Risk Analysis   (what concrete failure modes exist?)
   → Test Recommendations (which tests must be written or updated?)
   → Release Readiness   (is it safe to ship?)
```

---

## Golden Demo

**Repository:** ShopFlow (`shopflow-demo/`) — a modular Express + SQLite e-commerce REST API  
**Change:** Replace the existing JWT-based authentication flow with OAuth 2.0 authentication  
**Analysis source:** `docs/bob-change-impact-analysis.json` — produced by IBM Bob static analysis

### What the demo shows

| Stage | What you see |
|---|---|
| Impact Map | 6 directly affected auth files + 9 indirect files (routes, models, schema, tests) |
| Risk Analysis | 7 real risk findings (RISK-001 through RISK-007) with file-level evidence |
| Test Recommendations | 13 recommended test scenarios across auth, orders, payments, integration |
| Release Readiness | **NOT READY — IMPLEMENTATION NOT STARTED** (5 blockers, grounded in evidence) |

---

## Technical Architecture

```
User Input (AnalyzePage)
     │
     ▼
analysisService.js          ← provider-agnostic interface
     │
     ├─ bobAnalysisProvider.js   ← transforms docs/bob-change-impact-analysis.json
     │       ↓
     │   transformBobAnalysis()  → canonical result object
     │       ↓
     │   evaluateReleaseReadiness()  ← releaseReadinessEvaluator.js
     │       ↓
     │   Canonical Result (with blockers, review items, test readiness)
     │
     └─ mockAnalysisProvider.js  ← fallback for non-ShopFlow inputs
```

### Canonical Result Structure

Every analysis provider must produce this structure:

```js
{
  repository, branch, technology,
  analysisSource,          // 'IBM Bob'
  changeDescription,
  summary,                 // [label, value, detail] tuples for metrics strip
  impact: {
    directlyAffectedFiles,
    indirectlyAffectedFiles,
    affectedModules,
    affectedAPIs,
    nodes,                 // for impact chain visualization
    dependencyLayers,      // Level 1-4 propagation layers
  },
  risks,                   // 7 findings: id, title, severity, description, mitigation
  tests,                   // 13 recommendations: name, priority, testFile, reason, status
  releaseReadiness: {      // produced by releaseReadinessEvaluator.js
    status, statusLabel, summary, classification,
    blockers,              // BLOCKER-1 through BLOCKER-5
    reviewItems,           // REVIEW_NEEDED findings
    informationalItems,
    testReadiness,
    requiredActions,
    limitations,
    counts,
  }
}
```

### Key Source Files

| File | Purpose |
|---|---|
| `src/services/analysisService.js` | Provider-agnostic entry point |
| `src/services/bobAnalysisProvider.js` | IBM Bob JSON to canonical result |
| `src/services/releaseReadinessEvaluator.js` | Produces release-readiness decision |
| `src/data/repositories.js` | Centralized repository registry |
| `src/data/changeScenarios.js` | Change scenarios from ShopFlow ground truth |
| `docs/bob-change-impact-analysis.json` | **Source of truth** — real IBM Bob output |
| `docs/bob-release-readiness-assessment.md` | Methodology document for evaluator |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Analysis | IBM Bob (static analysis artifact) |
| Demo Target | Node.js + Express + SQLite (`shopflow-demo/`) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

Open http://localhost:5173 — the app loads directly to the dashboard.

### Golden Demo Flow

1. Click **New analysis** or **Analyze a change** from the dashboard
2. Repository is pre-selected as **ShopFlow (main)**
3. Scenario **[SCN-001] Replace JWT authentication with OAuth 2.0** is pre-loaded
4. Click **Analyze change**
5. Navigate through: **Results → Impact Map → Risk Analysis → Test Recommendations → Release Readiness**

---

## IBM Bob Integration

IMPACT's analysis is grounded in real IBM Bob output. The workflow was:

1. **Bob repository analysis** — `docs/bob-repository-analysis.md`
2. **Bob dependency analysis** — `docs/bob-dependency-analysis.md`
3. **Bob change impact analysis** — `docs/bob-change-impact-analysis.json` + `.md`
4. **Bob release readiness assessment** — `docs/bob-release-readiness-assessment.md`

The `bob_sessions/` directory contains the raw multi-session Bob interaction logs.

The frontend reads the JSON artifact directly at build time (no runtime API call required):

```js
import bobData from '../../docs/bob-change-impact-analysis.json'
```

---

## Repository Substitution

The repository configuration is centralized in `src/data/repositories.js`. ShopFlow is the current
demo target. To substitute Manav's repository:

1. Add the new repository entry to `src/data/repositories.js`
2. Replace `docs/bob-change-impact-analysis.json` with the new Bob analysis artifact
3. Update `src/data/changeScenarios.js` if the new repo has different scenarios

No UI component hardcodes ShopFlow-specific data — all repository-specific information flows
through the provider and centralized data layer.

---

## Transparency & Accuracy

- All risk findings are sourced **verbatim** from the IBM Bob analysis artifact.
- Test recommendations show **"Not Executed"** — IMPACT never claims tests have been run.
- The release readiness verdict is **"NOT READY — IMPLEMENTATION NOT STARTED"** because Bob's
  analysis was performed on the pre-migration codebase. This is the factually accurate state.
- IMPACT does not invent findings, scores, or pass/fail results.

---

## Team

IMPACT project — AlphaThinking 
