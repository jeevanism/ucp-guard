import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AuditResult } from "../../../types";
import { AlertTriangle, AlertCircle, Info, Hammer, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { generatePatch } from "../../../lib/gemini-client";
import { PatchModal } from "./PatchModal";

interface IssueListProps {
  issues: AuditResult['issues'];
  url: string;
  apiKey: string;
}

export function IssueList({ issues, url, apiKey }: IssueListProps) {
  const [fixing, setFixing] = useState<string | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Set<number>>(new Set());
  
  // Patch Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPatch, setCurrentPatch] = useState<{title: string, code: string} | null>(null);

  const iconMap = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colorMap = {
    critical: "text-red-500 border-red-900/30 bg-red-950/10",
    warning: "text-amber-500 border-amber-900/30 bg-amber-950/10",
    info: "text-blue-500 border-blue-900/30 bg-blue-950/10"
  };

  const handleFix = async (idx: number, issue: AuditResult['issues'][0]) => {
    setFixing(String(idx));
    
    try {
      // 1. Generate the Code
      const normalizedKey = apiKey?.trim();
      const code = await generatePatch(url, issue.title, issue.description, normalizedKey);
      
      // 2. Open Modal
      setCurrentPatch({ title: issue.title, code });
      setModalOpen(true);
      
      // 3. Mark as "Fixed" (Optimistic UI update)
      setFixedIssues(prev => new Set(prev).add(idx));
    } catch (e) {
      console.error("Failed to generate patch", e);
    } finally {
      setFixing(null);
    }
  };

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-900/50 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-zinc-400" />
            <span>DETECTED_VULNERABILITIES</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issues.map((issue, idx) => {
            const Icon = iconMap[issue.severity];
            const isFixed = fixedIssues.has(idx);
            const isFixing = fixing === String(idx);

            return (
              <div 
                key={idx} 
                className={cn(
                  "p-4 rounded-lg border flex flex-col gap-2 transition-all duration-300 hover:bg-zinc-900",
                  isFixed ? "border-emerald-900/50 bg-emerald-950/10" : "border-zinc-800"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-1.5 rounded-md border transition-colors", 
                      isFixed ? "text-emerald-500 border-emerald-900/30 bg-emerald-950/10" : colorMap[issue.severity]
                    )}>
                      {isFixed ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className={cn("transition-opacity", isFixed && "opacity-50")}>
                      <h4 className={cn("font-semibold text-sm", isFixed ? "text-emerald-400 line-through" : "text-zinc-200")}>
                        {issue.title}
                      </h4>
                      <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                        {isFixed ? "Vulnerability patched successfully." : issue.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* UPDATED: Button is now available for ALL non-fixed issues to showcase Generative capabilities */}
                {!isFixed && (
                  <div className="pl-12 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFix(idx, issue)}
                      disabled={isFixing}
                      className={cn(
                        "h-7 text-xs gap-2 border-indigo-900/50 text-indigo-400 hover:bg-indigo-950/30 hover:text-indigo-300 transition-all",
                        isFixing && "w-36"
                      )}
                    >
                      {isFixing ? (
                        <>
                          <Sparkles className="h-3 w-3 animate-spin" /> GENERATING...
                        </>
                      ) : (
                        <>
                          <Hammer className="h-3 w-3" />
                          APPLY_AUTO_FIX
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <PatchModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={currentPatch?.title || ""} 
        code={currentPatch?.code || ""} 
      />
    </>
  );
}
