import { ref, uploadString } from "firebase/storage";
import { storage } from "./firebase";
import { AuditResult } from "../types";

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "unknown";
}

export async function uploadMigrationGuide(
  result: AuditResult,
): Promise<string> {
  const urlSegment = sanitizePathSegment(result.url);
  const scanId = result.scanId || `scan-${Date.now()}`;
  const path = `audits/${urlSegment}/${scanId}/migration_guide.md`;
  const fileRef = ref(storage, path);

  const header = [
    "# UCP Guardian Audit",
    `Target URL: ${result.url}`,
    `Scan ID: ${scanId}`,
    `Model: ${result.modelUsed}`,
    "",
  ].join("\n");
  const content = `${header}${result.artifacts.migrationGuide || ""}`;

  await uploadString(fileRef, content, "raw", {
    contentType: "text/markdown",
  });

  return path;
}
