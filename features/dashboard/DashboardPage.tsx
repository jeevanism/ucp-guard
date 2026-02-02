import React, { useState } from "react";
import { AuditResult } from "../../types";
import { ScoreCard } from "./components/ScoreCard";
import { IssueList } from "./components/IssueList";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Download, FileJson, CheckCircle2, Eye, X, Copy, Check } from "lucide-react";

interface DashboardPageProps {
  data: AuditResult;
  onBack: () => void;
}

// Simple Markdown Renderer for the Hackathon Demo
// Renders Headers, Lists, and Code blocks nicely without heavy dependencies
const MarkdownRenderer = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-sm text-zinc-300 font-sans">
      {lines.map((line, i) => {
        // H1
        if (line.startsWith('# ')) {
          return <h3 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h3>;
        }
        // H2
        if (line.startsWith('## ')) {
          return <h4 key={i} className="text-lg font-semibold text-indigo-400 mt-3 mb-1">{line.replace('## ', '')}</h4>;
        }
        // H3
        if (line.startsWith('### ')) {
          return <h5 key={i} className="text-base font-semibold text-zinc-200 mt-2">{line.replace('### ', '')}</h5>;
        }
        // List items
        if (line.trim().startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
               <span className="text-indigo-500">•</span>
               <span>{line.replace('- ', '')}</span>
            </div>
          );
        }
        // Code blocks (simple detection)
        if (line.includes('`')) {
           const parts = line.split('`');
           return (
             <p key={i} className="leading-relaxed">
               {parts.map((part, idx) => 
                 idx % 2 === 1 
                   ? <span key={idx} className="bg-zinc-800 text-indigo-300 px-1 rounded font-mono text-xs">{part}</span> 
                   : part
               )}
             </p>
           )
        }
        // Empty lines
        if (!line.trim()) return <div key={i} className="h-2" />;
        
        // Default Paragraph
        return <p key={i} className="leading-relaxed opacity-90">{line}</p>;
      })}
    </div>
  );
};

export function DashboardPage({ data, onBack }: DashboardPageProps) {
  const [previewArtifact, setPreviewArtifact] = useState<'none' | 'manifest' | 'guide'>('none');
  const [copied, setCopied] = useState(false);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadManifest = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const content = JSON.stringify(data.artifacts.manifestContent, null, 2);
    downloadFile('ucp.json', content, 'application/json');
  };

  const handleDownloadGuide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    downloadFile('migration_guide.md', data.artifacts.migrationGuide, 'text/markdown');
  };

  const handleDownloadReport = () => {
    const report = {
      target: data.url,
      scanId: data.scanId,
      timestamp: new Date().toISOString(),
      scores: data.scores,
      issues: data.issues
    };
    downloadFile(`audit_report_${data.scanId}.json`, JSON.stringify(report, null, 2), 'application/json');
  };

  const handleCopy = () => {
    const content = previewArtifact === 'manifest' 
      ? JSON.stringify(data.artifacts.manifestContent, null, 2)
      : data.artifacts.migrationGuide;
    
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="overflow-hidden">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-500 hover:text-white pl-0 mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            NEW_SCAN
          </Button>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            TARGET: <span className="text-indigo-400 font-mono bg-indigo-950/30 px-2 py-1 rounded text-lg truncate max-w-[250px] md:max-w-[400px]">{data.url}</span>
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-mono">
            ID: {data.scanId} • STATUS: <span className="text-emerald-500 uppercase">{data.status}</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800" onClick={handleDownloadReport}>
            <FileJson className="mr-2 h-4 w-4 text-zinc-400" />
            Export Audit JSON
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleDownloadGuide()}>
            <Download className="mr-2 h-4 w-4" />
            Download Migration Plan
          </Button>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard 
          title="Overall Readiness" 
          score={data.scores.total} 
          description="Weighted average of all agent-interaction metrics."
        />
        <ScoreCard 
          title="Discovery" 
          score={data.scores.discovery}
          description="Manifest availability and SEO meta-data."
        />
        <ScoreCard 
          title="Offer Clarity" 
          score={data.scores.offerClarity}
          description="Price/Inventory readability by LLMs."
        />
        <ScoreCard 
          title="Transaction" 
          score={data.scores.transaction}
          description="API endpoint security and checkout flow."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Issues Column */}
        <div className="lg:col-span-2 space-y-6">
           {previewArtifact !== 'none' && (
             <div className="p-0 rounded-lg border border-indigo-500/50 bg-zinc-950 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                    {previewArtifact === 'manifest' ? 'PREVIEW: ucp.json' : 'PREVIEW: migration_guide.md'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-zinc-800" onClick={handleCopy}>
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
                    </Button>
                    <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-zinc-800" onClick={() => setPreviewArtifact('none')}>
                      <X className="h-4 w-4 text-zinc-500" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 max-h-[400px] overflow-auto custom-scrollbar bg-zinc-950/50">
                  {previewArtifact === 'manifest' ? (
                    <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
                      {JSON.stringify(data.artifacts.manifestContent, null, 2)}
                    </pre>
                  ) : (
                    <MarkdownRenderer content={data.artifacts.migrationGuide} />
                  )}
                </div>
             </div>
           )}
          <IssueList issues={data.issues} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <h3 className="font-semibold text-zinc-200 mb-4">Generated Artifacts</h3>
            <div className="space-y-3">
              {/* Manifest Item */}
              <div 
                className={`p-3 border rounded text-sm font-mono flex justify-between items-center group cursor-pointer transition-all ${previewArtifact === 'manifest' ? 'bg-indigo-950/30 border-indigo-500/50 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-indigo-500/30'}`}
                onClick={() => setPreviewArtifact(previewArtifact === 'manifest' ? 'none' : 'manifest')}
              >
                <div className="flex items-center gap-2">
                  <FileJson className={`h-4 w-4 ${previewArtifact === 'manifest' ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <span>ucp.json</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 opacity-50 group-hover:opacity-100 mr-2" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:bg-zinc-800 rounded-full"
                    onClick={(e) => handleDownloadManifest(e)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Guide Item */}
              <div 
                className={`p-3 border rounded text-sm font-mono flex justify-between items-center group cursor-pointer transition-all ${previewArtifact === 'guide' ? 'bg-indigo-950/30 border-indigo-500/50 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-indigo-500/30'}`}
                onClick={() => setPreviewArtifact(previewArtifact === 'guide' ? 'none' : 'guide')}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${previewArtifact === 'guide' ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <span>migration_guide.md</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 opacity-50 group-hover:opacity-100 mr-2" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:bg-zinc-800 rounded-full"
                    onClick={(e) => handleDownloadGuide(e)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4 italic">
              * Click to preview generated patches.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-indigo-900/30 bg-indigo-950/10">
            <h3 className="font-semibold text-indigo-400 mb-2">Guardian Pro</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Automate your agent compliance with continuous monitoring and auto-patching pipelines.
            </p>
            <Button className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}