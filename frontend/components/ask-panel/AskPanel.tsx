'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { askQuestion } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { saveChatMessage } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChartCard from '@/components/charts/ChartCard';
import { MessageSquare, Send, Bot, User2, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AskResponse, ChartConfig } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chart?: ChartConfig | null;
  isError?: boolean;
}

interface AskPanelProps {
  datasetId: string;
  hideHeader?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'What is the average value of the main numeric column?',
  'Which category appears most frequently?',
  'What are the key trends in this dataset?',
  'Are there any outliers or anomalies?',
];

export default function AskPanel({ datasetId, hideHeader }: AskPanelProps) {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const askMutation = useMutation({
    mutationFn: (q: string) => askQuestion(datasetId, q),
    onSuccess: (data: AskResponse, variables: string) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: variables },
        { role: 'assistant', content: data.answer, chart: data.chart },
      ]);
      if (user) {
        saveChatMessage(user.uid, datasetId, { role: 'user', content: variables }).catch((err) =>
          console.error('Failed to save user chat to Firestore:', err)
        );
        saveChatMessage(user.uid, datasetId, { role: 'assistant', content: data.answer }).catch(
          (err) => console.error('Failed to save assistant chat to Firestore:', err)
        );
      }
      inputRef.current?.focus();
    },
    onError: (err: Error, variables: string) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: variables },
        { role: 'assistant', content: 'sorry but i canot answer do to some problem', isError: true },
      ]);
    },
  });

  const submit = (q: string) => {
    if (!q.trim() || askMutation.isPending) return;
    setQuestion('');
    askMutation.mutate(q.trim());
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {!hideHeader && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15">
            <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ask Your Data</h2>
            <p className="text-[10px] text-muted-foreground">Natural language Q&amp;A</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 mb-3 min-h-0">
        <div className="space-y-3 pr-1">
          {messages.length === 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Try asking:
              </p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => submit(q)}
                  disabled={askMutation.isPending}
                  className="w-full rounded-lg border border-border/50 bg-card/40 px-3 py-2 text-left text-[11px] text-muted-foreground transition-all hover:border-sky-500/40 hover:bg-sky-500/5 hover:text-foreground disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-violet-500/20' : 'bg-sky-500/20'
                  }`}
              >
                {msg.role === 'user'
                  ? <User2 className="h-3 w-3 text-violet-400" />
                  : <Bot className="h-3 w-3 text-sky-400" />
                }
              </div>
              <div className={`min-w-0 max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed ${msg.role === 'user'
                      ? 'bg-violet-500/15 text-foreground'
                      : msg.isError
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-card/60 border border-border/50 text-foreground'
                    }`}
                >
                  <ReactMarkdown
                    components={{
                      strong: ({ node, ...props }) => <span className="font-bold text-foreground" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-1" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-0.5" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.chart && (
                  <div className="w-full">
                    <ChartCard chart={msg.chart} compact />
                  </div>
                )}
              </div>
            </div>
          ))}

          {askMutation.isPending && (
            <div className="flex gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20">
                <Bot className="h-3 w-3 text-sky-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 px-3 py-2">
                <Loader2 className="h-3 w-3 animate-spin text-sky-400" />
                <span className="text-[11px] text-muted-foreground">Analyzing…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(question); }}
        className="flex gap-1.5"
      >
        <Input
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your data…"
          className="h-8 text-[11px] bg-card/50 border-border/60 flex-1 min-w-0"
          disabled={askMutation.isPending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!question.trim() || askMutation.isPending}
          className="h-8 w-8 shrink-0 p-0 bg-sky-600 hover:bg-sky-500"
        >
          {askMutation.isPending
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Send className="h-3 w-3" />
          }
        </Button>
      </form>
    </div>
  );
}
