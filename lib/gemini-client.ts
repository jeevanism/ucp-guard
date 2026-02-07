import { GoogleGenAI, HarmBlockThreshold, HarmCategory, Type } from "@google/genai";
import { AuditResult } from "../types";

export async function performAudit(url: string, modelId: string, apiKey: string): Promise<AuditResult> {
  if (!apiKey || apiKey.includes("your_actual_api_key") || apiKey === "") {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const requestMeta = {
    url,
    model: modelId,
    tools: ["googleSearch"],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  // 1. Define Prompt
  // We explicitly tell the model it is a security researcher to contextualize the "audit" request
  // and prevent it from being flagged as malicious.
  const prompt = `
    You are UCP Guardian, a helpful and harmless AI Auditor for Universal Commerce Protocol compliance.
    Target URL: ${url}

    MISSION:
    1. Analyze this domain structure and purpose using public data.
    2. Generate a UCP Audit Report.
    
    ARTIFACT GENERATION:
    - 'manifestContent': Generate a valid 'ucp.json' structure.
    - 'migrationGuide': A detailed Markdown guide on how to fix issues.

    OUTPUT FORMAT:
    Return ONLY valid JSON matching this structure:
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
  `;

  // 2. Define Safety Settings (Permissive)
  // Security terminology can sometimes trigger false positive safety blocks.
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  // 3. Helper to extract JSON
  const extractJson = (text: string | undefined) => {
    if (!text) return null;
    try {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            return JSON.parse(text.substring(firstBrace, lastBrace + 1));
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
    }
    return null;
  };

  let primaryError: unknown = null;
  let fallbackError: unknown = null;
  let primaryFinishReason: string | null = null;

  try {
    // ATTEMPT 1: With Google Search (Preferred)
    console.log(`[Audit] Starting with model: ${modelId}`);
    let response: any = null;
    try {
      response = await ai.models.generateContent({
        model: modelId, 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          safetySettings: safetySettings,
        },
      });
    } catch (err) {
      primaryError = err;
      console.warn(`[Audit] Primary scan failed with model ${modelId}:`, err);
    }

    // Check if response exists and has content
    let text = response?.text;
    
    // If text is empty, check candidates for safety finish reason
    if (!text && response?.candidates?.[0]?.finishReason) {
        primaryFinishReason = String(response.candidates[0].finishReason);
        console.warn(`[Audit] Blocked by finishReason: ${response.candidates[0].finishReason}`);
    }

    const data = extractJson(text);
    if (data) {
      return { 
        ...data, 
        scanId: data.scanId || `gen-${Math.random().toString(36).substring(2, 9)}`, 
        url,
        modelUsed: modelId,
      };
    }
    
    throw new Error("Primary scan failed (empty response or tool error)");

  } catch (error) {
    // ATTEMPT 2: Fallback (Pure Reasoning with Safe Model)
    // CRITICAL FIX: We switch to 'gemini-2.5-flash' which is listed as available in your environment.
    // We also remove tools to reduce complexity and avoid tool-related errors.
    const fallbackModel = "gemini-3-pro-preview";
    
    try {
      console.log(`[Audit] Fallback: Switching to ${fallbackModel} (Reasoning Mode)`);
      
      const fallbackResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents: prompt + "\n\n(IMPORTANT: Perform this audit based on the URL pattern and standard ecommerce knowledge. Do not use tools.)",
        config: {
          safetySettings: safetySettings,
          // Explicitly NO tools to avoid tool-related empty responses
        }
      });

      const fallbackData = extractJson(fallbackResponse.text);
      if (fallbackData) {
        return { 
          ...fallbackData, 
          scanId: fallbackData.scanId || `fallback-${Math.random().toString(36).substring(2, 9)}`, 
          url,
          modelUsed: fallbackModel,
        };
      }
    } catch (err) {
      console.error("Fallback scan also failed:", err);
      fallbackError = err;
    }
    
    // If we get here, both failed. 
    // Return a structured error that the UI can display nicely.
    const finalError = new Error(`Audit Failed: The AI model (${modelId}) is currently unavailable. Please try selecting 'Gemini 2.5 Flash' manually.`);
    (finalError as any).debug = {
      request: {
        ...requestMeta,
        prompt,
      },
      primary: {
        error: primaryError,
        finishReason: primaryFinishReason,
      },
      fallback: {
        model: fallbackModel,
        error: fallbackError,
      },
      note: "API key redacted by design; request and prompt shown for transparency.",
    };
    throw finalError;
  }
}

/**
 * Generates a specific code patch for a given vulnerability.
 */
export async function generatePatch(
  url: string,
  title: string,
  description: string,
  apiKey?: string | null,
): Promise<string> {
  // If no API key, return a mock response to prevent crashing in demo mode
  if (!apiKey || apiKey === "" || apiKey.includes("your_actual_api_key")) {
     return `<!-- DEMO MODE: REAL API KEY REQUIRED FOR LIVE GENERATION -->\n<!-- Mock Patch for: ${title} -->\n\n<meta name="ucp-compliance" content="true" />\n<link rel="manifest" href="/ucp.json" />`;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
  You are an expert Web Security & SEO Engineer (Google Gemini 2.5).
  
  Context:
  Target Website: ${url}
  Vulnerability: "${title}"
  Description: "${description}"

  Task: 
  Generate the EXACT code snippet required to patch this issue. 
  - If it's a missing manifest, provide the JSON.
  - If it's a meta tag, provide the HTML.
  - If it's a server config, provide the Nginx/Apache rules.
  
  Constraints:
  - Output ONLY the code.
  - Do NOT wrap in markdown backticks (no \`\`\`).
  - Do NOT add explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use Gemini 3 Flash for fast code generation
      contents: prompt
    });

    let text = response.text || "";
    // Clean up if the model adds markdown despite instructions
    text = text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
    return text;
  } catch (e) {
    console.error("Patch generation failed", e);
    return "// Error generating patch. Please check API Key or try again.";
  }
}
