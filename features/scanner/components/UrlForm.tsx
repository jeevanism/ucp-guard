import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ShieldAlert,
  Terminal,
  AlertTriangle,
  Settings2,
  Check,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface UrlFormProps {
  onScanStart: (url: string, modelId: string) => void;
  isLoading: boolean;
  serverError?: string | null;
}

// UPDATED: Using valid Model IDs from your `list-gemini` output
const AVAILABLE_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Latest stable version. Balanced speed & intelligence.",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    description: "Lowest cost, fastest response. Good for quick scans.",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Maximum reasoning power for deep compliance analysis.",
  },
];

export function UrlForm({ onScanStart, isLoading, serverError }: UrlFormProps) {
  const [url, setUrl] = useState("");
  // Default to the newest stable Flash model
  const [modelId, setModelId] = useState("gemini-2.5-flash");
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      setError(null);
      onScanStart(url, modelId);
    } catch (e) {
      setError("Invalid URL format. Please include http:// or https://");
    }
  };

  const isRateLimitError =
    serverError?.includes("RATE LIMIT") || serverError?.includes("429");
  
  const isNotFoundError = serverError?.includes("NOT FOUND") || serverError?.includes("404");

  return (
    <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-mono flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-500" />
          <span>INITIALIZE_SCAN</span>
        </CardTitle>
        <CardDescription>
          Enter target storefront URL for AI readiness assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="e.g. https://store.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono bg-zinc-950 border-zinc-800 focus:ring-indigo-500/50"
              disabled={isLoading}
            />

            {/* Model Selection - shown explicitly if there is an error, or if toggled */}
            {(showSettings || isRateLimitError || isNotFoundError) && (
              <div
                className={cn(
                  "p-3 rounded-md border text-sm space-y-2 animate-in slide-in-from-top-2",
                  (isRateLimitError || isNotFoundError)
                    ? "bg-amber-950/20 border-amber-900/50"
                    : "bg-zinc-950/50 border-zinc-800",
                )}
              >
                <label className="text-xs text-zinc-400 font-mono uppercase font-semibold flex items-center gap-2">
                  <Settings2 className="h-3 w-3" />
                  Select AI Model
                </label>
                <div className="grid gap-2">
                  {AVAILABLE_MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setModelId(m.id)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded cursor-pointer border transition-all",
                        modelId === m.id
                          ? "bg-indigo-900/20 border-indigo-500/50 text-indigo-100"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700",
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs">{m.name}</span>
                        <span className="text-[10px] opacity-70">
                          {m.description}
                        </span>
                      </div>
                      {modelId === m.id && (
                        <Check className="h-3 w-3 text-indigo-400" />
                      )}
                    </div>
                  ))}
                </div>
                {(isRateLimitError || isNotFoundError) && (
                  <p className="text-xs text-amber-500 mt-2 font-mono">
                    * Recommendation: Switch to "Gemini 2.5 Flash" if others fail.
                  </p>
                )}
              </div>
            )}

            {!showSettings && !isRateLimitError && !isNotFoundError && (
              <div
                onClick={() => setShowSettings(true)}
                className="text-xs text-zinc-500 cursor-pointer hover:text-indigo-400 flex items-center gap-1 w-fit"
              >
                <Settings2 className="h-3 w-3" />
                <span>Configure Model</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono mt-2 animate-in slide-in-from-top-1">
                <ShieldAlert className="h-3 w-3" />
                {error}
              </div>
            )}

            {serverError && (
              <div
                className={cn(
                  "flex items-start gap-2 p-3 rounded-md text-xs font-mono mt-2 animate-in slide-in-from-top-1",
                  (isRateLimitError || isNotFoundError)
                    ? "text-amber-400 bg-amber-950/20 border border-amber-900/50"
                    : "text-red-400 bg-red-950/20 border border-red-900/50",
                )}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">SYSTEM ERROR</p>
                  <p>{serverError}</p>
                  {(isRateLimitError || isNotFoundError) && (
                    <p
                      className="font-bold underline cursor-pointer"
                      onClick={() => setShowSettings(true)}
                    >
                      Change Model above to fix this.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 font-mono tracking-wide"
            disabled={isLoading}
          >
            {isLoading ? "ANALYZING_TARGET..." : "EXECUTE_SCAN"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}