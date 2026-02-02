import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

export async function performAudit(url: string, modelId: string): Promise<AuditResult> {
  // 1. Check for API Key existence before initializing SDK
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.includes("your_actual_api_key") || apiKey === "") {
    throw new Error("MISSING_API_KEY");
  }

  // Initialize Gemini inside the function ensures fresh config/key usage
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // detailed prompt to enforce JSON structure since we cannot use responseSchema with tools
  const prompt = `
    You are UCP Guardian, an elite AI Auditor for Universal Commerce Protocol compliance.
    Target URL: ${url}

    MISSION:
    1. Use Google Search to investigate this specific URL. Look for technology stack, robots.txt, and product structure.
    2. Based on findings, generate a real audit report.
    
    ARTIFACT GENERATION:
    - 'manifestContent': Generate a valid 'ucp.json' structure that explicitly exposes this site's search and product endpoints to AI agents. Include 'capabilities' (search, cart, etc) and 'endpoints' (list of API paths).
    - 'migrationGuide': A detailed Markdown guide on how to fix the specific issues found on this site. Use H1, H2, and code blocks for remediation steps.

    SCORING CRITERIA:
    - Discovery: Can an agent find the site? (Searchable, Manifest present?)
    - Offer Clarity: Is pricing/inventory visible in search snippets?
    - Transaction: Is the checkout flow standard?

    OUTPUT FORMAT:
    You must return a VALID JSON object. 
    Do not include any explanation text outside the JSON.
    
    The JSON object must match this structure:
    {
      "scanId": "string",
      "status": "completed",
      "scores": {
        "total": number (0-100),
        "discovery": number (0-100),
        "offerClarity": number (0-100),
        "transaction": number (0-100)
      },
      "issues": [
        {
          "severity": "critical" | "warning" | "info",
          "title": "string",
          "description": "string",
          "remediationId": "string (optional)"
        }
      ],
      "artifacts": {
        "manifestContent": { ...valid ucp.json object... },
        "migrationGuide": "markdown string"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId, 
      contents: prompt,
      config: {
        // REMOVED: responseMimeType: "application/json" and responseSchema
        // These are incompatible with tools: [{ googleSearch: {} }] in the current API version.
        // We rely on the prompt to enforce JSON structure.
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    // Bulletproof JSON extraction:
    // Finds the first '{' and the last '}' to ignore any preamble text or markdown blocks.
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    let cleanJson = text;
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = text.substring(firstBrace, lastBrace + 1);
    }
    
    const data = JSON.parse(cleanJson);
    
    return {
      ...data,
      // Safety fallback if scanId is missing/null from AI
      scanId: data.scanId || `gen-${Math.random().toString(36).substring(2, 9)}`,
      url,
    };

  } catch (error) {
    console.error("Gemini Audit Failed:", error);
    throw error; // Re-throw to be handled by the UI
  }
}