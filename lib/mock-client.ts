import { AuditResult } from "../types";

const MOCK_DATA: Omit<AuditResult, 'url'> = {
  scanId: "scan_x92a-881b",
  status: "completed",
  scores: {
    total: 68,
    discovery: 85,
    offerClarity: 45,
    transaction: 20
  },
  issues: [
    {
      severity: "critical",
      title: "Missing UCP Manifest",
      description: "The universal commerce protocol manifest (ucp.json) is missing from the root directory. Agents cannot discover policy data.",
      remediationId: "fix_manifest"
    },
    {
      severity: "critical",
      title: "Shadow DOM Pricing",
      description: "Product prices are encapsulated in Shadow DOM without accessibility labels. LLM scrapers cannot reliably extract pricing.",
    },
    {
      severity: "warning",
      title: "Incomplete Schema.org",
      description: "Product structured data is missing 'priceValidUntil' and 'sku' fields.",
    },
    {
      severity: "info",
      title: "Robots.txt Optimization",
      description: "Allow 'GPTBot' and 'Google-Extended' in robots.txt to ensure proper indexing by major LLMs.",
    }
  ],
  artifacts: {
    manifestContent: {
      "ucp_version": "1.0",
      "domain": "store.example.com",
      "capabilities": ["search", "cart"],
      "endpoints": [
        {
          "id": "prod_list",
          "path": "/api/v1/products",
          "method": "GET",
          "description": "List all active inventory"
        },
        {
          "id": "vector_search",
          "path": "/api/v1/search",
          "method": "POST",
          "description": "Semantic search endpoint for agents"
        }
      ]
    },
    migrationGuide: "# Migration Guide\n\n## Summary\nYour site is missing critical metadata required for AI Agent commerce.\n\n## Remediation Steps\n\n### 1. Create Manifest\nAdd a `ucp.json` file to your root directory. This acts as a passport for AI agents.\n\n### 2. Update Robots.txt\nEnsure you are not blocking `GPTBot` or `Google-Extended`.\n\n### 3. Expose API\nProvide a read-only endpoint for inventory checks to reduce hallucination rates."
  }
};

export async function performAudit(url: string): Promise<AuditResult> {
  // Simulate network latency and processing time
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...MOCK_DATA,
        url,
        // Use substring instead of deprecated substr
        scanId: `scan_${Math.random().toString(36).substring(2, 8)}`
      });
    }, 2500);
  });
}