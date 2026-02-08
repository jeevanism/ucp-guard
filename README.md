# UCP Guardian

UCP Guardian is a Vite + React app that audits ecommerce storefronts for Universal Commerce Protocol (UCP) readiness. It runs a Gemini-powered scan, scores key compliance areas, highlights issues, and generates artifacts like `ucp.json` and a migration guide. It also offers one-click, AI-generated patch snippets per issue.

## What Problem It Solves
Ecommerce sites are hard for AI agents to reliably understand, search, and transact with. Missing manifests, inconsistent metadata, unclear pricing, and brittle checkout flows make AI-driven commerce unreliable.

UCP Guardian solves this by:
- Analyzing storefronts for AI-readability and protocol compliance signals.
- Generating a UCP manifest (`ucp.json`) and a migration guide.
- Highlighting issues with severity and suggested fixes.
- Providing auto-generated patch snippets to speed up remediation.

## What It Audits
The audit focuses on AI-agent readiness across three areas:
- Discovery: manifest presence, metadata, and discoverability.
- Offer Clarity: pricing, availability, and product structure clarity.
- Transaction: checkout flow clarity and policy/transport signals.

## Audit Results (What You Get)
Every scan generates:
- Scores (0–100) for Overall, Discovery, Offer Clarity, and Transaction.
- A list of issues with severity, description, and remediation context.
- `ucp.json` manifest content.
- `migration_guide.md` (step-by-step guidance).
- Optional patch snippets (per issue) using Gemini.

## End-to-End Workflow
1. User enters a storefront URL in the scanner.
2. User selects a Gemini model and optionally provides an API key.
3. The app runs a Gemini-backed audit (or mock audit in demo mode).
4. The app shows a dashboard with scores, issues, and generated artifacts.
5. The user downloads `ucp.json` and `migration_guide.md`.
6. The user can generate patch snippets for each issue.
7. The app automatically saves `migration_guide.md` to Firebase Storage for future reference.

## Demo vs Real Scan

### Demo Mode
- Use any URL containing `demo` (example: `https://demo-store.example.com`).
- No API key required.
- Uses built-in mock data for a fast, deterministic demo.

### Real Scan
- Use a real storefront URL.
- Provide a valid Gemini API key.
- The app queries Gemini and generates real audit results.

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini API via `@google/genai`
- Firebase Storage

## Getting Started

### Prerequisites
- Node.js (LTS recommended)

### Install
```bash
npm install
```

### Run (Local Dev)
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Usage

### Live Scan
1. Enter a storefront URL.
2. Provide a Gemini API key.
3. Choose a model (default: `gemini-3-flash-preview`).
4. Start the scan.

### Demo Mode
Use any URL containing the substring `demo` (for example: `https://demo-store.example.com`). This triggers a local mock audit and skips API calls.

### Model Listing
The UI includes a “List Available Models” button that calls the Gemini models endpoint using your API key.

### Artifacts and Exports
- Download `ucp.json` and `migration_guide.md` from the dashboard sidebar.
- Export an audit report JSON file from the dashboard header.

### Auto-Fix Patches
Click **APPLY_AUTO_FIX** on an issue to generate a code snippet. If no API key is provided, the app returns a safe mock patch.

## Firebase Storage (Save Markdown Per Scan)
This project uploads `migration_guide.md` for every completed scan to Firebase Storage at:
`audits/<sanitized-url>/<scanId>/migration_guide.md`.

### Setup
1. Enable Firebase Storage in your Firebase project.
2. Add your Firebase web app config in `lib/firebase.ts` (already wired in this repo).
3. Install dependencies:
```bash
npm install
```

### Storage Rules
If you want public, unauthenticated uploads for a demo, configure Storage rules accordingly. For production, require auth.

## Project Structure
```
app/
  App.tsx
  globals.css
components/
  ui/
features/
  scanner/
  dashboard/
lib/
  gemini-client.ts
  mock-client.ts
  utils.ts
  firebase.ts
  audit-storage.ts
types/
  index.ts
index.tsx
```

## Scripts
- `npm run dev` Start the dev server
- `npm run build` Build for production
- `npm run preview` Preview the production build

## Deployment (Firebase Hosting)
Typical deploy flow:
```bash
npm install
npm run build
firebase deploy
```

## Reference
Additional notes are in `reference/`.
