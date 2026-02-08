# UCP Guardian — Regeneration Blueprint (Feb 7, 2026)

This document is a build plan for reproducing the project exactly as it exists now. It is intended for an AI/LLM agent to recreate the codebase structure, behavior, and UI. Follow the steps in order and adhere to the technical details.

## 1. Project Purpose

UCP Guardian is a frontend demo that:
- Accepts a storefront URL and a Gemini API key.
- Runs a Gemini‑powered audit (with Google Search tool) to generate a structured compliance report.
- Displays scores, issues, and artifacts.
- Generates auto‑patch snippets for issues using Gemini.
- Provides transparent error/debug details when Gemini fails.

This is a hackathon demo; some outputs are AI‑generated estimates, not verified by a real crawler.

## 2. Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- `@google/genai` SDK (Google Gemini)

Key directories:
- `app/` — App shell and routing between scanner and dashboard
- `features/scanner/` — Scan UI and scan flow
- `features/dashboard/` — Results dashboard and patch flow
- `lib/` — Gemini client code, mock client, utilities

## 3. Core Workflow (High Level)

1. User enters URL + Gemini API key in Scanner UI.
2. If URL contains `demo`, run mock audit (no Gemini call).
3. Otherwise, call Gemini `generateContent` with:
   - Model: user‑selected (default `gemini-3-flash-preview`)
   - Tool: `googleSearch`
4. Parse JSON from Gemini response.
5. If primary fails or response is invalid:
   - Fallback to `gemini-3-pro-preview` without tools.
6. Render dashboard with scores, issues, artifacts.
7. For each issue, user can click “APPLY_AUTO_FIX”:
   - Calls Gemini with a patch prompt to generate code.

## 4. Important Models

Gemini models are user‑selectable in the UI. The default and Gemini 3 options are:
- `gemini-3-flash-preview` (default, primary for audits)
- `gemini-3-pro-preview` (fallback for audits)
- `gemini-2.5-flash` (stable fallback choice in UI)

Patch generation uses:
- `gemini-3-flash-preview`

## 5. Detailed File Responsibilities

### `app/App.tsx`
Controls app view:
- `ScannerPage` for scanning
- `DashboardPage` for results
Holds `apiKey` in app state so it is reused for patch generation.

### `features/scanner/ScannerPage.tsx`
Responsibilities:
- Orchestrates scan flow.
- Shows animated scan logs.
- Shows “Waiting for Gemini response…” message after logs finish.
- Handles errors; shows full debug payload in UI.

Key logic:
- `handleScanStart(url, modelId, apiKey)`
  - demo URLs => `performMockAudit`
  - otherwise `performAudit`

### `features/scanner/components/UrlForm.tsx`
Responsibilities:
- Inputs for URL + API key.
- Model selection UI.
- Validation (URL format + API key required unless demo).
- “List Available Models” debug panel (calls Gemini models list API).

Notes:
- Demo mode = URL contains `demo`.
- Shows transparency note about demo vs live usage.

### `lib/gemini-client.ts`
Core Gemini integration:
- `performAudit(url, modelId, apiKey)`
  - Uses `generateContent` with `googleSearch` tool.
  - Parses JSON from model output.
  - Fallback to `gemini-3-pro-preview` without tools.
  - On failure, throws error with `.debug` payload containing:
    - request meta
    - full prompt
    - primary error/finish reason
    - fallback error
- `generatePatch(url, title, description, apiKey)`
  - If no key: returns DEMO MODE mock patch.
  - If valid: calls Gemini 3 Flash to generate code snippet.

### `features/dashboard/DashboardPage.tsx`
Renders:
- Score cards
- Issues list
- Artifacts (manifest + migration guide)
Includes expanded “what we checked” details under each score card.

### `features/dashboard/components/IssueList.tsx`
Generates patches via `generatePatch` and shows modal.

## 6. UI/UX Features to Preserve

- Scanner animated logs with progress bar.
- “Waiting for Gemini response…” appears after logs finish.
- Transparent error panel with “Show Full Gemini Request + Error”.
- Model selection panel + “List Available Models” button.
- Demo mode hints under description.

## 7. Validation Rules

Frontend validation:
- URL must parse with `new URL(...)`.
- API key required unless demo URL contains `demo`.

No strict validation of domain existence.

## 8. Gemini Models List Debug Panel

In `UrlForm`:
- Button calls:
  - `GET https://generativelanguage.googleapis.com/v1beta/models?key=<API_KEY>`
- Filters returned list to only `gemini*` models.
- Displays `name` and `displayName`.

## 9. Data Structures

Gemini prompt expects JSON:
```
{
  "scanId": "string",
  "status": "completed",
  "scores": {
    "total": number,
    "discovery": number,
    "offerClarity": number,
    "transaction": number
  },
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "title": "string",
      "description": "string",
      "remediationId": "string"
    }
  ],
  "artifacts": {
    "manifestContent": object,
    "migrationGuide": "string"
  }
}
```

## 10. Build & Run

Install and run:
```
npm install
npm run dev
```

App runs at local Vite URL (typically `http://localhost:5173`).

## 11. Summary of Recent Changes

- Gemini 3 models wired in.
- API key is passed through to patch generation.
- Added score card details.
- Added debug model list panel.
- Added “Waiting for Gemini response…” message.
- Added full Gemini request/error details on failure.

---

This file is the authoritative blueprint for regeneration. Use it to recreate the current behavior and UI faithfully.
