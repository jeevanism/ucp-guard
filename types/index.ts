export interface AuditResult {
  scanId: string;
  url: string;
  status: 'processing' | 'completed' | 'failed';
  scores: {
    total: number; // 0-100
    discovery: number; // SEO, Schema, Manifest
    offerClarity: number; // Can an agent read the price?
    transaction: number; // Can an agent checkout?
  };
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    remediationId?: string; // Links to code patch
  }>;
  artifacts: {
    manifestContent: object; // Actual JSON object for ucp.json
    migrationGuide: string; // Markdown content
  };
}