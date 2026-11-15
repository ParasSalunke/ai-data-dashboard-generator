'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, Code2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code: string;
}

export function ViewCodeModal({
  isOpen,
  onClose,
  title,
  code,
}: ViewCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader className="p-4 sm:p-5 border-b border-zinc-800 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-violet-400" />
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Shadcn React component code for this chart
            </DialogDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] p-4 font-mono text-xs text-zinc-300 bg-black/60">
          <pre className="overflow-x-auto p-2 leading-relaxed selection:bg-violet-900 selection:text-white">
            <code>{code}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ViewCodeModal;
