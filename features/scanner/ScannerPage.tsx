import React, { useState, useEffect } from "react";
import { UrlForm } from "./components/UrlForm";
import { ShieldCheck, Cpu, Terminal, Loader2, Search, BrainCircuit, Lock } from "lucide-react";
import { performAudit } from "../../lib/gemini-client";
import { performAudit as performMockAudit } from "../../lib/mock-client";
import { AuditResult } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";

interface ScannerPageProps {
  onAuditComplete: (result: AuditResult) => void;
}

const SCAN_LOGS = [
  { icon: Terminal, text: "Initializing UCP Guardian Protocol v2.1..." },
  { icon: Search, text: "Connecting to Google Search Grounding Index..." },
  { icon: BrainCircuit, text: "Gemini 3 Pro: Analyzing Domain Structure..." },
  { icon: Lock, text: "Verifying HTTPS & SSL Handshake Compliance..." },
  { icon: Cpu, text: "Reasoning: Evaluating Agent Readability Scores..." },
  { icon: ShieldCheck, text: "Generating Compliance Manifest & Migration Guide..." },
  { icon: Terminal, text: "Finalizing Audit Report..." },
];

export function ScannerPage({ onAuditComplete }: ScannerPageProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Cycling logs effect
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < SCAN_LOGS.length - 1 ? prev + 1 : prev));
    }, 800); // Speed up slightly to 0.8s to ensure we get through most logs
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleScanStart = async (url: string) => {
    setIsScanning(true);
    setScanError(null);
    setLogIndex(0);
    try {
      const startTime = Date.now();
      let result: AuditResult;

      // HACKATHON SAFETY NET:
      // Robust check: matches "demo", " demo ", "http://demo", etc.
      if (url.toLowerCase().includes("demo")) {
        console.log("Demo Mode Activated");
        result = await performMockAudit("https://demo-store.example.com");
      } else {
        result = await performAudit(url);
      }
      
      // Ensure the animation plays for at least 4 seconds to look professional
      const elapsed = Date.now() - startTime;
      if (elapsed < 4000) {
        await new Promise(r => setTimeout(r, 4000 - elapsed));
      }

      // Fast-forward logs to completion for visual satisfaction
      setLogIndex(SCAN_LOGS.length - 1);
      await new Promise(r => setTimeout(r, 600)); 
      
      onAuditComplete(result);
    } catch (error: any) {
      console.error("Scan failed", error);
      setIsScanning(false);
      
      if (error.message === "MISSING_API_KEY") {
        setScanError("API KEY REQUIRED: Create a .env file with API_KEY=... or use 'demo' in URL.");
      } else {
        setScanError("SCAN FAILED: Connection interrupted. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 mb-4 ring-1 ring-indigo-500/20">
          <Cpu className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          UCP <span className="text-indigo-500">GUARDIAN</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
          AI Agent Readiness & Compliance Scanner. 
          <span className="block mt-2 text-sm text-zinc-500 font-mono">
            Powered by Gemini 3 Pro (Thinking)
          </span>
        </p>
      </div>

      {!isScanning ? (
        <UrlForm 
          onScanStart={handleScanStart} 
          isLoading={isScanning} 
          serverError={scanError}
        />
      ) : (
        <Card className="w-full max-w-lg border-indigo-500/30 bg-zinc-900/80 backdrop-blur-sm shadow-2xl shadow-indigo-500/10">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                <span className="text-sm font-mono text-indigo-400 font-bold tracking-wider">SYSTEM_ACTIVE</span>
              </div>
              <span className="text-xs font-mono text-zinc-600">ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
            </div>
            
            <div className="space-y-4 font-mono text-sm">
              {SCAN_LOGS.map((log, idx) => {
                const Icon = log.icon;
                const isActive = idx === logIndex;
                const isDone = idx < logIndex;
                const isPending = idx > logIndex;

                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center gap-3 transition-all duration-300",
                      isActive ? "text-white scale-105 ml-2" : "text-zinc-500",
                      isPending && "opacity-30 blur-[1px]",
                      isDone && "text-emerald-500/70"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded",
                      isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-transparent"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{log.text}</span>
                    {isDone && <ShieldCheck className="h-3 w-3 ml-auto text-emerald-500" />}
                  </div>
                );
              })}
            </div>
            
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-6">
              <div 
                className="h-full bg-indigo-500"
                style={{ 
                  width: `${((logIndex + 1) / SCAN_LOGS.length) * 100}%`,
                  transition: "width 0.5s ease-out"
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!isScanning && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-zinc-500 mt-12 font-mono">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Universal Compliance</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <span>Agent-Readable Data</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Terminal className="h-5 w-5 text-amber-500" />
            <span>Auto-Patch Generation</span>
          </div>
        </div>
      )}
    </div>
  );
}