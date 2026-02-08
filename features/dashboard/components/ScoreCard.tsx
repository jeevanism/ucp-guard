import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

interface ScoreCardProps {
  title: string;
  score: number;
  modelUsed?: string;
  description?: string;
  details?: string[];
}

export function ScoreCard({ title, score, modelUsed, description, details }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate from 0 to actual score on mount
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  let colorClass = "bg-emerald-500";
  if (score < 50) colorClass = "bg-red-500";
  else if (score < 80) colorClass = "bg-amber-500";

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400 font-mono uppercase tracking-wider flex items-center gap-2">
          <span>{title}</span>
          {modelUsed && (
            <span className="text-[10px] text-indigo-400 border border-indigo-500/40 px-1.5 py-0.5 rounded bg-indigo-950/40">
              {modelUsed}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-zinc-500 mb-1">/100</span>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out", colorClass)} 
            style={{ width: `${animatedScore}%` }}
          />
        </div>
        {description && (
          <p className="mt-2 text-xs text-zinc-500">{description}</p>
        )}
        {details && details.length > 0 && (
          <div className="mt-2 text-[11px] text-zinc-400 space-y-1">
            {details.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
