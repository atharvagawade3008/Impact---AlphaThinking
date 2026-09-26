# IMPACT — Architecture Document

## Overview

IMPACT is a single-page React application that presents an IBM Bob static code analysis artifact
through a structured, navigable analysis pipeline. It has no backend and requires no runtime API
calls — all analysis data is bundled at build time from the IBM Bob JSON output.

---

## System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                                  │
│                                                                        │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │ Sidebar  │  │   Topbar     │  │  Page Router (App.jsx)         │  │
│  │ (nav)    │  │ (repo badge) │  │                                │  │
│  └──────────┘  └──────────────┘  └───────────┬────────────────────┘  │
│                                               │                        │
│        ┌──────────────────────────────────────▼────────────────────┐  │
│        │               Pages                                        │  │
│        │  DashboardPage  AnalyzePage  AnalysisResultsPage           │  │
│        │  ImpactMapPage  RiskAnalysisPage  TestRecommendationsPage  │  │
│        │  ReleaseReadinessPage  HistoryPage  SettingsPage           │  │
│        └──────────────────────────────────────┬────────────────────┘  │
│                                               │                        │
│        ┌─────────────────────────────────────▼────────────────────┐   │
│        │               Analysis Service Layer                       │   │
│        │                                                            │   │
│        │  analysisService.js (provider-agnostic interface)          │   │
│        │       ├── bobAnalysisProvider.js  (primary)               │   │
│        │       │        └── docs/bob-change-impact-analysis.json   │   │
│        │       │              ↓                                     │   │
│        │       │        releaseReadinessEvaluator.js                │   │
│        │       └── mockAnalysisProvider.js (fallback)              │   │
│        └────────────────────────────────────────────────────────────┘  │
│                                                                         │
│        ┌─────────────────────────────────────────────────────────────┐  │
│        │               Data Layer                                     │  │
│        │  repositories.js  changeScenarios.js  mockData.js           │  │
│        └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Analysis Trigger

```
User fills AnalyzePage form
    → onAnalyze({ repository, branch, changeDescription, scenarioId, ... })
    → App.jsx handleAnalyze()
    → analysisService.analyzeChange(input)
    → bobAnalysisProvider.generateBobAnalysis(input)   [500ms simulated latency]
    → transformBobAnalysis(input)
         - reads docs/bob-change-impact-analysis.json (static import)
         - maps to canonical result structure
         - calls evaluateReleaseReadiness(canonicalResult)
    → canonical result stored in App.jsx analysis state
    → App navigates to 'results' page
```

### Canonical Result Object

The canonical result is the single data contract between the service layer and all UI pages.
Every page receives `analysis` (the canonical result) and `onNavigate`.

Key fields:

| Field | Type | Source |
|---|---|---|
| `impact.directlyAffectedFiles` | array | Bob JSON `impact.directlyAffectedFiles` |
| `impact.indirectlyAffectedFiles` | array | Bob JSON `impact.indirectlyAffectedFiles` |
| `impact.affectedModules` | array | Bob JSON `impact.affectedModules` |
| `impact.affectedAPIs` | array | Bob JSON `impact.affectedAPIs` |
| `impact.dependencyLayers` | array | Constructed from above in bobAnalysisProvider |
| `risks` | array | Bob JSON `risks` (RISK-001 to RISK-007) |
| `tests` | array | Bob JSON `recommendedTests` (13 items) |
| `releaseReadiness` | object | Produced by `releaseReadinessEvaluator.js` |

---

## Service Layer Details

### analysisService.js

Provider-agnostic interface. Validates input, calls the primary provider (Bob), falls back to mock
on error.

```js
export async function analyzeChange(input) { ... }
export async function getAnalysis(id) { ... }
```

### bobAnalysisProvider.js

Reads `docs/bob-change-impact-analysis.json` (static import bundled at build time).
Transforms it into the canonical result structure.
Calls `evaluateReleaseReadiness()` to produce the structured readiness block.

### releaseReadinessEvaluator.js

Pure function: canonical result in, structured readiness object out.
Applies the methodology defined in `docs/bob-release-readiness-assessment.md`.
Outputs:
- `BLOCKING` findings: 5 blockers grounded in Bob evidence
- `REVIEW_NEEDED` findings: 5 items requiring human/architectural decisions
- `INFORMATIONAL` findings: 9 scope/cleanup observations
- `testReadiness`: 13 scenarios, 12 of which are broken or missing
- `requiredActions`: phased pre-release checklist

### mockAnalysisProvider.js

Fallback for non-Bob inputs. Produces a synthetic canonical result. Used only when the Bob
provider throws (e.g., malformed input, future API integration failure).

---

## Page Architecture

| Page | Route key | Props consumed |
|---|---|---|
| DashboardPage | `dashboard` | `onNavigate`, `onViewAnalysis` |
| AnalyzePage | `analyze` | `selectedRepository`, `onAnalyze`, `isAnalyzing` |
| AnalysisResultsPage | `results` | `analysis`, `onBack`, `onNavigate` |
| ImpactMapPage | `impact` | `analysis`, `onNavigate` |
| RiskAnalysisPage | `risk` | `analysis`, `onNavigate` |
| TestRecommendationsPage | `tests` | `analysis`, `onNavigate` |
| ReleaseReadinessPage | `readiness` | `analysis`, `onNavigate` |
| HistoryPage | `history` | `onNavigate`, `onViewAnalysis` |
| SettingsPage | `settings` | — |

All result pages (`results`, `impact`, `risk`, `tests`, `readiness`) render an `EmptyState` if
`analysis` is null, with a call-to-action to start a new analysis.

---

## Component Inventory

Shared components in `src/components/`:

| Component | Purpose |
|---|---|
| `AnalysisResultHeader` | Tab bar across all result pages (Results / Impact / Risk / Tests / Readiness) |
| `EmptyState` | Placeholder when no analysis is active |
| `ImpactNode` | Single node in the impact chain visualization |
| `MetricCard` | Dashboard summary metric tile |
| `PageHeader` | Eyebrow + title + description + optional action |
| `RiskBadge` | Colored severity badge |
| `SectionHeading` | Eyebrow + title + optional right-side action |
| `SelectField` | Styled select input |
| `Sidebar` | Left navigation |
| `StatusBadge` | Tone-colored badge (red / amber / green / neutral / cyan) |
| `Topbar` | Repository selector + mobile menu button |

---

## State Management

App state is minimal and lives in `App.jsx`:
- `page` — current route string
- `sidebarOpen` — mobile drawer state
- `selectedRepository` — active `repositories.js` entry
- `analysis` — canonical result object (null until first analysis run)

`useAnalysis()` hook (`src/hooks/useAnalysis.js`) encapsulates `analysis`, `isLoading`, and
`analyze(input)`.

---

## Build & Deployment

```bash
npm run build   # outputs to dist/
npm run preview # serve dist/ locally
```

No environment variables or secrets required. Everything is static.

Build output (production):
- `dist/index.html` — ~0.45 kB
- `dist/assets/index-*.css` — ~37.7 kB (gzip: ~8.6 kB)
- `dist/assets/index-*.js` — ~364 kB (gzip: ~104 kB)

---

## Repository Substitution Guide

ShopFlow is the current demo target. To substitute a new repository:

1. **Update `src/data/repositories.js`** — add or replace the repository entry
2. **Replace `docs/bob-change-impact-analysis.json`** — with the new Bob artifact
3. **Update `src/data/changeScenarios.js`** — if new scenarios are needed
4. **Update `src/services/bobAnalysisProvider.js`** — if the new JSON has a different schema,
   adjust the field mappings in `transformBobAnalysis()`

UI components receive only the canonical result — they have no awareness of which repository
was analysed.
