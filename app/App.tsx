import { useEffect, useState } from "react";
import { ScannerPage } from "../features/scanner/ScannerPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { Shield, Github, BookOpen } from "lucide-react";
import { AuditResult } from "../types";
import { uploadMigrationGuide } from "../lib/audit-storage";
import readmeContent from "../README.md?raw";

type ViewState = "scanner" | "dashboard" | "docs";

const MarkdownRenderer = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-sm text-zinc-300 font-sans">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h2 key={i} className="text-2xl font-bold text-white mt-4 mb-2">
              {line.replace("# ", "")}
            </h2>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="text-xl font-semibold text-indigo-400 mt-3 mb-1"
            >
              {line.replace("## ", "")}
            </h3>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="text-lg font-semibold text-zinc-200 mt-2">
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.trim().startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-indigo-500">•</span>
              <span>{line.replace("- ", "")}</span>
            </div>
          );
        }
        if (line.includes("`")) {
          const parts = line.split("`");
          return (
            <p key={i} className="leading-relaxed">
              {parts.map((part, idx) =>
                idx % 2 === 1 ? (
                  <span
                    key={idx}
                    className="bg-zinc-800 text-indigo-300 px-1 rounded font-mono text-xs"
                  >
                    {part}
                  </span>
                ) : (
                  part
                ),
              )}
            </p>
          );
        }
        if (!line.trim()) return <div key={i} className="h-2" />;
        return (
          <p key={i} className="leading-relaxed opacity-90">
            {line}
          </p>
        );
      })}
    </div>
  );
};

export function App() {
  const [currentView, setCurrentView] = useState<ViewState>("scanner");
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleAuditComplete = (result: AuditResult) => {
    setAuditData(result);
    setCurrentView("dashboard");
  };

  const handleBackToScanner = () => {
    setAuditData(null);
    setCurrentView("scanner");
    setApiKey("");
    setUploadStatus("idle");
    setUploadError(null);
  };

  useEffect(() => {
    if (!auditData) return;
    if (uploadStatus !== "idle") return;
    let cancelled = false;

    const run = async () => {
      setUploadStatus("uploading");
      setUploadError(null);
      try {
        await uploadMigrationGuide(auditData);
        if (!cancelled) setUploadStatus("success");
      } catch (err: any) {
        if (!cancelled) {
          setUploadStatus("error");
          setUploadError(err?.message || "Failed to upload markdown");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [auditData, uploadStatus]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 font-mono font-bold text-lg tracking-tighter cursor-pointer"
            onClick={handleBackToScanner}
          >
            <Shield className="h-5 w-5 text-indigo-500" />
            <span>UCP_GUARDIAN_DEMO</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <span>
              <a href="https://github.com/jeevanism/ucp-guard">
                <Github size={14} className="text-zinc-400" />
              </a>
            </span>
            <span className="text-zinc-700">|</span>
            <button
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
              onClick={() => setCurrentView("docs")}
            >
              <BookOpen size={14} />
              <span className="text-[11px]">Documentation</span>
            </button>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-500 font-semibold tracking-wide">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto pt-24 pb-12 px-4">
        {currentView === "scanner" && (
          <ScannerPage
            onAuditComplete={handleAuditComplete}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
        )}
        {currentView === "docs" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 text-amber-200 text-sm">
              <p className="font-semibold">Demo Notice</p>
              <p className="mt-1">
                This project is for hackathon demonstration only. For
                production, use a FastAPI Python backend with the Google GenAI
                Python SDK, a Go-based crawler/scout, and a React frontend.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
              <MarkdownRenderer content={readmeContent} />
            </div>
          </div>
        )}
        {currentView === "dashboard" && auditData && (
          <DashboardPage
            data={auditData}
            apiKey={apiKey}
            onBack={handleBackToScanner}
            uploadStatus={uploadStatus}
            uploadError={uploadError}
          />
        )}
      </main>

      <footer className="border-t border-zinc-800 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-zinc-600 font-mono">
          <p>© 2026 UCP GUARDIAN SYSTEM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
