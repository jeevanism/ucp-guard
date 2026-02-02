import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AuditResult } from "../../../types";
import { AlertTriangle, AlertCircle, Info, Hammer, CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

interface IssueListProps {
  issues: AuditResult['issues'];
}

export function IssueList({ issues }: IssueListProps) {
  const [fixing, setFixing] = useState<string | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Set<number>>(new Set());

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

  const handleFix = (idx: number) => {
    setFixing(String(idx));
    setTimeout(() => {
      setFixing(null);
      setFixedIssues(prev => new Set(prev).add(idx));
    }, 1500);
  };

  return (
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
              
              {!isFixed && issue.remediationId && (
                <div className="pl-12 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleFix(idx)}
                    disabled={isFixing}
                    className={cn(
                      "h-7 text-xs gap-2 border-indigo-900/50 text-indigo-400 hover:bg-indigo-950/30 hover:text-indigo-300 transition-all",
                      isFixing && "w-32"
                    )}
                  >
                    {isFixing ? (
                      <>
                        <span className="animate-spin">⟳</span> PATCHING...
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
  );
}