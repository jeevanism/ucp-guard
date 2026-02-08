import { useState } from "react";
import { ScannerPage } from "../features/scanner/ScannerPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { Shield } from "lucide-react";
import { AuditResult } from "../types";

type ViewState = 'scanner' | 'dashboard';

export function App() {
  const [currentView, setCurrentView] = useState<ViewState>('scanner');
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [apiKey, setApiKey] = useState<string>("");

  const handleAuditComplete = (result: AuditResult) => {
    setAuditData(result);
    setCurrentView('dashboard');
  };

  const handleBackToScanner = () => {
    setAuditData(null);
    setCurrentView('scanner');
    setApiKey("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono font-bold text-lg tracking-tighter cursor-pointer" onClick={handleBackToScanner}>
            <Shield className="h-5 w-5 text-indigo-500" />
            <span>UCP_GUARDIAN_V1</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <span>SYSTEM_ID: G-882</span>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-500 font-semibold tracking-wide">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto pt-24 pb-12 px-4">
        {currentView === 'scanner' && (
          <ScannerPage
            onAuditComplete={handleAuditComplete}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
        )}
        {currentView === 'dashboard' && auditData && (
          <DashboardPage data={auditData} apiKey={apiKey} onBack={handleBackToScanner} />
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
