# UCP Guardian

UCP Guardian is a Vite + React app that audits ecommerce storefronts for Universal Commerce Protocol (UCP) readiness. It runs a Gemini-powered scan, scores key compliance areas, highlights issues, and generates artifacts like `ucp.json` and a migration guide. It also offers one-click, AI-generated patch snippets per issue.

## Features
- Scan a storefront URL and generate a structured UCP audit report.
- Scores for Overall Readiness, Discovery, Offer Clarity, and Transaction.
- Issues list with severity, descriptions, and remediation context.
- Generated artifacts: `ucp.json` manifest and `migration_guide.md`.
- Export audit report JSON.
- Auto-fix patch generation per issue using Gemini.
- Demo mode with mock data (no API key required).

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini API via `@google/genai`

## Getting Started

### Prerequisites
- Node.js (LTS recommended)

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```

Open the dev server URL printed in the terminal.

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
types/
  index.ts
index.tsx
```

## Notes
- API keys are used in-memory for the current session only and are cleared when returning to a new scan.
- The audit flow and fallback behavior are implemented in `lib/gemini-client.ts`.

## Scripts
- `npm run dev` Start the dev server
- `npm run build` Build for production
- `npm run preview` Preview the production build

## Reference
https://ucp.dev/latest/
