import { GoogleGenAI, HarmBlockThreshold, HarmCategory, Type } from "@google/genai";
import { AuditResult } from "../types";

export async function performAudit(url: string, modelId: string): Promise<AuditResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.includes("your_actual_api_key") || apiKey === "") {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // 1. Define Prompt
  const prompt = `
    You are UCP Guardian, an elite AI Auditor for Universal Commerce Protocol compliance.
    Target URL: ${url}

    MISSION:
    1. Analyze this domain structure and purpose.
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
  // We disable blocking because security audits often use keywords that trigger safety filters.
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  // 3. Helper to extract JSON
  const extractJson = (text: string | undefined) => {
    if (!text) return null;
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    return null;
  };

  try {
    // ATTEMPT 1: With Google Search (Preferred)
    console.log(`Attempting audit with model: ${modelId} + Search Tool`);
    const response = await ai.models.generateContent({
      model: modelId, 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        safetySettings: safetySettings,
      },
    });

    const data = extractJson(response.text);
    if (data) {
      return { ...data, scanId: data.scanId || `gen-${Math.random().toString(36).substring(2, 9)}`, url };
    }
    
    throw new Error("Empty response or invalid JSON from Tool-enabled scan");

  } catch (error) {
    console.warn("Tool-based scan failed. Falling back to pure reasoning.", error);

    // ATTEMPT 2: Fallback (No Tools)
    // Sometimes 'lite' models fail with tools or timeouts. We retry without tools.
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: modelId,
        contents: prompt + "\n\n(Simulate the audit based on the URL pattern and standard ecommerce practices since live browsing failed.)",
        config: {
          safetySettings: safetySettings,
          // No tools here
        }
      });

      const fallbackData = extractJson(fallbackResponse.text);
      if (fallbackData) {
        return { 
          ...fallbackData, 
          scanId: fallbackData.scanId || `fallback-${Math.random().toString(36).substring(2, 9)}`, 
          url 
        };
      }

    } catch (fallbackError) {
      console.error("Fallback scan also failed:", fallbackError);
    }
    
    // If everything fails, throw the original error
    throw error;
  }
}