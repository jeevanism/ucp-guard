# UCP Guardian: Production Blueprint & Hackathon Strategy

**Project Name:** UCP Guardian (Universal Compliance & Performance Guardian)
**Hackathon Target:** Gemini 3 Competition
**Date:** Feb 2026

---

## 1. Executive Summary

**UCP Guardian** is a next-generation, AI-powered frontend auditor designed to democratize web compliance and performance optimization. Unlike traditional static analysis tools (like Lighthouse) that rely on rigid heuristics, UCP Guardian uses **Google Gemini 3** to "reason" about a website's user experience, legal compliance, and accessibility context.

It doesn't just tell you *what* is wrong; it explains *why* it matters to your specific business context and generates ready-to-deploy code fixes.

---

## 2. The Problem

Modern web development is a minefield of complexity:
1.  **Compliance Fatigue:** GDPR, CCPA, WCAG 2.1, and SEO standards are constantly evolving. Small teams cannot afford dedicated legal/audit teams.
2.  **Context Blindness:** Traditional tools flag "errors" that aren't actually problems (false positives) because they don't understand the *intent* of the website.
3.  **Action Gap:** Audit reports usually result in a PDF of problems. Developers are left to figure out the solution themselves, leading to a "fix it later" mentality that never happens.

---

## 3. The Solution

UCP Guardian bridges the gap between **Audit** and **Action**.

### Key Value Props:
*   **Semantic Understanding:** Uses Gemini 3's multimodal capabilities to "see" the site and read the code simultaneously, understanding the difference between a "Checkout" button and a "Learn More" link.
*   **Persona-Driven Audits:** Users can toggle the "Lens" of the auditor (e.g., "The Strict Lawyer", "The SEO Hustler", "The A11y Advocate") to get tailored feedback.
*   **Zero-Config Remediation:** The "Auto-Fix" engine generates specific code patches (React/HTML/CSS) to resolve identified issues instantly.
*   **Live Reasoning:** Provides transparency into the AI's decision-making process via a real-time terminal log.

---

## 4. User Workflow

### Step 1: The Setup (Input)
*   **User Action:** Enters a Target URL (e.g., `https://example.com`) and their Gemini API Key.
*   **Configuration:** Selects an **Auditor Persona**:
    *   🛡️ **Legal Eagle:** Focus on Privacy, Terms, Cookies.
    *   🎨 **UX Purist:** Focus on Layout Shift, Contrast, Clarity.
    *   🚀 **Growth Hacker:** Focus on SEO, Meta Tags, CTA placement.
    *   ♿ **A11y Advocate:** Focus on ARIA, Screen Readers, Keyboard Nav.

### Step 2: The Scan (Process)
*   **Visuals:** A cyberpunk-inspired "Terminal" view appears.
*   **System Action:**
    1.  Fetches site content (HTML/Text).
    2.  **Gemini 3 Flash** analyzes the structure with `googleSearch` grounding to verify business details (e.g., "Is this actually an e-commerce site?").
    3.  Streams "thoughts" to the UI (e.g., `> Analyzing contrast ratios...`, `> Detecting missing H1 tags...`).

### Step 3: The Dashboard (Results)
*   **Scorecard:** A weighted score (0-100) based on the selected Persona.
*   **Issue List:** Prioritized findings (Critical, Warning, Optimization).
    *   *Example:* "Missing Cookie Banner for EU visitors."

### Step 4: The Fix (Action)
*   **User Action:** Clicks "Fix This".
*   **System Action:** **Gemini 2.5 Flash** generates the exact code snippet to fix the issue.
*   **Visuals:** A **Diff View** (Before vs. After) allows the developer to copy the patch directly.

---

## 5. Technical Architecture

### Stack
*   **Frontend:** React 19, TypeScript 5.5+, Vite.
*   **Styling:** Tailwind CSS v4, shadcn/ui, Lucide Icons.
*   **State Management:** Zustand (Global UI State), TanStack Query (Async AI State).
*   **AI Engine:** `@google/genai` SDK.

### Model Strategy & Fallback Hierarchy

To ensure robustness and avoid demo-breaking "Quota Exceeded" errors, the application implements a **Tiered Fallback Mechanism**. The system attempts to use Tier 1 models first. If a `429` (Rate Limit) or `403` (Quota) error occurs, it automatically retries with Tier 2, then Tier 3.

**Tier 1: The Cutting Edge (Priority)**
*   **Auditor:** `gemini-3-flash-preview`
    *   *Use Case:* Primary audit logic, `googleSearch` grounding, high-speed analysis.
*   **Reasoner:** `gemini-3-pro-preview`
    *   *Use Case:* Deep legal reasoning, complex "Strict Lawyer" persona tasks.

**Tier 2: The Stable Workhorses (Fallback)**
*   **Auditor:** `gemini-2.5-flash`
    *   *Use Case:* Fast fallback for general auditing and patch generation.
*   **Reasoner:** `gemini-2.5-pro`
    *   *Use Case:* Fallback for complex reasoning tasks.

**Tier 3: The Safety Net (Emergency)**
*   **Auditor:** `gemini-2.0-flash`
    *   *Use Case:* Basic analysis if all newer models are overloaded.

**Explicit Exclusions:**
*   **NO** Gemini 1.5 series models.
*   **NO** Image Generation models (Imagen 4, Veo).
*   **NO** Audio/Video Generation models (Native Audio, TTS).
*   This is strictly a text/code analysis tool.

### Prompt Engineering Strategy
We will use **Structured JSON Output** with `responseSchema` to ensure the UI can render cards reliably.

**Schema Structure:**
```typescript
interface AuditResult {
  score: number;
  summary: string;
  issues: {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    category: 'compliance' | 'ux' | 'seo';
    title: string;
    description: string;
    suggestedFix: string; // High-level explanation
    codeSnippet?: string; // Actual code
  }[];
}
```

---

## 6. Implementation Plan (Hackathon Mode)

### Phase 1: Core Skeleton (Hours 0-2)
- [ ] Initialize React 19 + Vite project.
- [ ] Set up Tailwind v4 & Theme (Dark Mode/Cyberpunk).
- [ ] Create `GeminiClient` wrapper with API Key handling.

### Phase 2: The Scanner Logic (Hours 2-6)
- [ ] Implement URL Input & Persona Selector.
- [ ] Build the "Mock Scraper" (fetch HTML or use simple text extraction).
- [ ] Connect `gemini-3-flash-preview` with System Instructions for auditing.
- [ ] Implement Streaming Responses for the "Live Logs".

### Phase 3: The Dashboard & Visualization (Hours 6-12)
- [ ] Build Result Cards (Severity Badges, Accordions).
- [ ] Implement the "Fix It" Modal with Syntax Highlighting.
- [ ] Add `googleSearch` grounding to verify site identity.

### Phase 4: Polish & Demo (Hours 12-24)
- [ ] Add "Confetti" for 100% scores.
- [ ] Ensure Mobile Responsiveness.
- [ ] Create `README.md` and Video Demo script.

---

## 7. Success Metrics
1.  **Latency:** Audit completes in <10 seconds.
2.  **Accuracy:** Fixes generated are syntactically correct code.
3.  **UX:** "Wow" factor from the streaming logs and instant diff views.
