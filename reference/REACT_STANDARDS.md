# ⚛️ React 19+ Development Standards (2026)

> **Purpose:** Ensures the frontend codebase aligns with modern React/Vite/TanStack best practices.
> **Source:** Reddit/HN Consensus (r/reactjs, r/webdev).

---

## 1. Core Stack
*   **Build Tool:** **Vite** (Strict preference over CRA).
*   **Framework:** **React 19** (SPA).
*   **Language:** **TypeScript 5.5+** (Strict mode).
*   **Server State:** **TanStack Query v5**. (Mandatory for API data).
*   **Client State:** **Zustand** (Only for UI state like sidebars/modals).
*   **Styling:** **Tailwind CSS v4** + **shadcn/ui** (Radix Primitives).
*   **Forms:** **React Hook Form** + **Zod**.
*   **Testing:** **Vitest** + **Playwright**.

---

## 2. Architecture & Mental Models

### A. The "React Compiler" Era
*   **No Manual Memoization:** Avoid `useMemo` / `useCallback` unless specifically profiling a bottleneck.
*   **Why:** React 19's Compiler handles this automatically. Manual hooks are now considered legacy/noise.

### B. State Management Separation
*   **Server State (API Data):** Must use **TanStack Query**.
    *   *Banned:* `useEffect` for data fetching.
    *   *Banned:* Redux for API caching.
*   **URL State:** Store filters, tabs, and pagination in the **URL Search Params**.
    *   *Why:* Makes the dashboard shareable and restores state on refresh.
*   **Global Client State:** Use **Zustand** sparingly.
    *   *Example:* User session token, dark mode toggle.

### C. Folder Structure (Feature-Based)
Organize by **Domain/Feature**, not by file type.

```text
src/
├── app/                  # App-wide providers (QueryClient, Router)
├── components/           # Shared generic UI (Buttons, Inputs - shadcn/ui)
├── features/             # Business Logic
│   ├── auth/
│   │   ├── components/   # LoginForm.tsx
│   │   ├── api/          # useLogin.ts (TanStack Query hook)
│   │   └── types/        # Auth specific types
│   ├── scanner/
│   │   ├── components/   # ScannerInput.tsx, ResultsChart.tsx
│   │   └── api/          # useScan.ts
├── lib/                  # Static utils (axios instance, cn helper)
└── types/                # Shared global types
```

---

## 3. Go + React Synergy
Since the backend is Go (Scout) + Python (Brain), the Frontend is a **Standalone SPA**.
*   **Communication:** REST API via `axios` or `fetch`.
*   **Contract:** Types shared via OpenAPIs (Swagger) or manually synced interfaces.
*   **Deployment:** The frontend build (`dist/`) is served by Nginx or the Go binary (embedded).

---

## 4. Coding Style
*   **Functional Components:** Standard.
*   **Props:** Interface definitions co-located with components.
*   **Hooks:** Custom hooks for logic, Components for UI. Separation of concerns.
*   **Styling:** Utility-first (Tailwind). Use `cn()` for conditional classes.
