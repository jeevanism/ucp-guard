# Application Workflow: UCP Guardian

### 1. User Input & Form Submission

**File:** `features/scanner/components/UrlForm.tsx`

* **Inputs:**
* `url`
* `apiKey`
* `modelId` (defaults to `gemini-3-flash-preview`)


* **Action:** On submit, it triggers the callback `onScanStart(url, modelId, apiKey)`.

### 2. Scan Initialization

**File:** `features/scanner/ScannerPage.tsx`

* **Logic:** `handleScanStart` manages the application state:
* Sets `loading` state to `true`.
* Initiates the animated log sequence for UX.


* **Routing:** * **Mock Path:** If URL contains "demo", calls the mock client.
* **Production Path:** Calls `performAudit(url, modelId, apiKey)`.



### 3. Gemini Audit Request

**File:** `lib/gemini-client.ts` → `performAudit`

* **Process:** * Constructs a detailed prompt including the target URL.
* **Configuration:**
* **Model:** `modelId`
* **Tools:** Includes `googleSearch` (for grounding/live data).
* **Safety:** Permissive settings to ensure full site analysis.




* **Constraint:** Instructs the model to return strictly formatted **JSON**.

### 4. Response Parsing & Fallbacks

**File:** `lib/gemini-client.ts`

* **Success:** Extracts and validates JSON. Returns an `AuditResult` object containing:
* Scores (Performance, SEO, etc.)
* Identified Issues
* Generated Artifacts


* **Error Handling:** If JSON is invalid or empty, the system falls back to `gemini-3-pro-preview` (without tools) for a secondary attempt.

### 5. UI State Transition

**File:** `features/scanner/ScannerPage.tsx`

* **Timing:** Logs are set to animate for approximately **4 seconds** to ensure a smooth transition.
* **Completion:** Once the audit returns, `onAuditComplete(result)` is executed.

### 6. Dashboard Rendering

**Files:** `app/App.tsx` & `features/dashboard/DashboardPage.tsx`

* **Transition:** `App.tsx` detects the completed state and switches the view from Scanner to Dashboard.
* **Display:** Visualizes the scores, categorized issues, and code artifacts.

### 7. Optional Patch Generation (Auto-Fix)

**File:** `features/dashboard/components/IssueList.tsx`

* **Trigger:** User clicks the **"APPLY_AUTO_FIX"** button.
* **Logic:** Calls `generatePatch(url, title, description, apiKey)`.
* **File:** `lib/gemini-client.ts` → `generatePatch`
* Uses `gemini-3-flash-preview` to generate a specific code snippet to resolve the issue.



### 8. Error Transparency & Debugging

* **Fail-safe:** If any Gemini API call fails, `ScannerPage` catches the error.
* **UI:** Full request/response details are displayed in a dedicated **Debug Panel** for troubleshooting.

---

