import React from 'react';
import { X, Copy, Check, Terminal, Code2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface PatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    code: string;
}

export function PatchModal({ isOpen, onClose, title, code }: PatchModalProps) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Terminal className="h-5 w-5" />
                        <h3 className="font-mono font-bold tracking-tight">GENERATED_PATCH</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-800 rounded-full h-8 w-8">
                        <X className="h-5 w-5 text-zinc-500" />
                    </Button>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="space-y-1">
                        <p className="text-xs font-mono text-zinc-500 uppercase">Target Vulnerability</p>
                        <p className="text-sm text-zinc-200 font-medium">{title}</p>
                    </div>

                    <div className="relative group rounded-md border border-zinc-800 bg-zinc-900/50">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
                             <div className="flex items-center gap-2">
                                <Code2 className="h-4 w-4 text-zinc-500" />
                                <span className="text-xs text-zinc-500 font-mono">patch.txt</span>
                             </div>
                             <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 gap-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                {copied ? "COPIED" : "COPY"}
                            </Button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-400 leading-relaxed custom-scrollbar min-h-[150px] whitespace-pre-wrap break-all">
                            {code}
                        </pre>
                    </div>
                    
                    <div className="flex gap-3 p-3 rounded bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-300/80 leading-relaxed">
                        <div className="shrink-0 mt-0.5">
                            <Terminal className="h-4 w-4" />
                        </div>
                        <p>
                            <span className="font-bold">INSTRUCTIONS:</span> Copy this snippet and inject it into your application codebase. 
                            For JSON files, place in root. For HTML tags, place in `&lt;head&gt;`.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-2 shrink-0 rounded-b-lg">
                    <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                        Dismiss
                    </Button>
                    <Button onClick={() => { handleCopy(); setTimeout(onClose, 500); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Copy & Mark Fixed
                    </Button>
                </div>
            </div>
        </div>
    );
}