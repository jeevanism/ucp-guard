import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

const AUDIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scanId: { type: Type.STRING },
    status: { type: Type.STRING, enum: ["completed", "failed"] },
    scores: {
      type: Type.OBJECT,
      properties: {
        total: { type: Type.INTEGER },
        discovery: { type: Type.INTEGER },
        offerClarity: { type: Type.INTEGER },
        transaction: { type: Type.INTEGER },
      },
      required: ["total", "discovery", "offerClarity", "transaction"],
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          remediationId: { type: Type.STRING },
        },
        required: ["severity", "title", "description"],
      },
    },
    artifacts: {
      type: Type.OBJECT,
      properties: {
        manifestContent: { 
          type: Type.OBJECT,
          description: "The actual JSON content for a ucp.json file. It must follow the Universal Commerce Protocol standard.",
          properties: {
            "ucp_version": { type: Type.STRING, enum: ["1.0", "2.0-alpha"] },
            "domain": { type: Type.STRING },
            "capabilities": {
                type: Type.ARRAY,
                items: { type: Type.STRING, enum: ["search", "cart", "checkout", "inventory"] }
            },
            "endpoints": { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        "id": { type: Type.STRING },
                        "path": { type: Type.STRING },
                        "method": { type: Type.STRING },
                        "description": { type: Type.STRING }
                    }
                } 
            }
          }
        },
        migrationGuide: { type: Type.STRING },
      },
      required: ["manifestContent", "migrationGuide"],
    },
  },
  required: ["scanId", "status", "scores", "issues", "artifacts"],
};

export async function performAudit(url: string): Promise<AuditResult> {
  // 1. Check for API Key existence before initializing SDK
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.includes("your_actual_api_key") || apiKey === "") {
    throw new Error("MISSING_API_KEY");
  }

  // Initialize Gemini inside the function ensures fresh config/key usage
  const ai = new GoogleGenAI({ apiKey: apiKey });

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

    OUTPUT:
    Return a valid JSON object matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: AUDIT_SCHEMA,
        thinkingConfig: { thinkingBudget: 2048 },
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