import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

interface ScoreCardProps {
  title: string;
  score: number;
  description?: string;
}

export function ScoreCard({ title, score, description }: ScoreCardProps) {
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
        <CardTitle className="text-sm font-medium text-zinc-400 font-mono uppercase tracking-wider">
          {title}
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
      </CardContent>
    </Card>
  );
}