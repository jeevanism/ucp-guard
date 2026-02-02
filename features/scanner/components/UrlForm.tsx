import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ShieldAlert, Terminal, AlertTriangle } from "lucide-react";

interface UrlFormProps {
  onScanStart: (url: string) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export function UrlForm({ onScanStart, isLoading, serverError }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid URL.");
      return;
    }
    
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      setError(null);
      onScanStart(url);
    } catch (e) {
      setError("Invalid URL format. Please include http:// or https://");
    }
  };

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
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono mt-2 animate-in slide-in-from-top-1">
                <ShieldAlert className="h-3 w-3" />
                {error}
              </div>
            )}
            
            {serverError && (
              <div className="flex items-start gap-2 text-amber-400 bg-amber-950/20 border border-amber-900/50 p-3 rounded-md text-xs font-mono mt-2 animate-in slide-in-from-top-1">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold">SYSTEM ERROR</p>
                    <p>{serverError}</p>
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