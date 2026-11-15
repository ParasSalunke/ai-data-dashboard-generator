'use client';

import { useRouter } from 'next/navigation';
import FileUpload from '@/components/file-upload/FileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  Brain,
  GripVertical,
  Sparkles,
  Zap,
  Upload,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { PieChartDefault } from '@/components/charts/pie-charts/PieChartDefault';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import AuthControl from '@/components/auth/AuthControl';
import RecentDatasets from '@/components/dashboard/RecentDatasets';

const features = [
  {
    icon: BarChart3,
    title: 'Auto-Generated Charts',
    description:
      'Bar, line, scatter, pie, histogram — every chart type auto-selected based on your data shape.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description:
      'GPT-4o analyzes your dataset and surfaces 5 actionable business insights in plain language.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: GripVertical,
    title: 'Drag & Drop Dashboard',
    description:
      'Rearrange charts to match your priorities. Ask questions about your data in plain English.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
];

const stats = [
  { label: 'Chart Types', value: '6+' },
  { label: 'AI Insights', value: '5' },
  { label: 'Setup Time', value: '0s' },
  { label: 'Config Required', value: 'No' },
];

export default function HomePage() {
  const router = useRouter();

  const handleUploadSuccess = (datasetId: string) => {
    router.push(`/dashboard?id=${datasetId}`);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-sky-500 text-white font-bold shadow-md shadow-violet-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Datovo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
              <AuthControl />
          </div>
        </div>
      </header>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-125 w-125 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute -top-20 -right-40 h-100 w-100 rounded-full bg-sky-600/20 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pt-16 sm:pb-12">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <Badge
              variant="outline"
              className="gap-2 border-violet-500/40 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Data Analytics
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Your Data.{' '}
            <span className="bg-linear-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Instant Insights.
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground leading-relaxed sm:mb-10 sm:text-lg">
            Drop any CSV file and get auto-generated charts, AI-powered business insights, and a
            fully interactive dashboard - in seconds. No configuration. No SQL. Just drag, drop,
            and discover.
          </p>

          {/* Stats row */}
          <div className="mb-8 flex flex-wrap justify-center gap-6 sm:mb-12 sm:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upload zone */}
          <div className="mx-auto max-w-2xl">
            <FileUpload onSuccess={handleUploadSuccess} />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Supports CSV files up to 100MB · Securely stored in Firestore · Instant AI charts
          </p>

          {/* Recent user datasets from Firestore */}
          <RecentDatasets />
        </div>
      </div>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            Everything you need to understand your data
          </h2>
          <p className="mt-2 text-muted-foreground">
            From raw CSV to boardroom-ready dashboard in one drag-and-drop
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className={`border ${f.border} bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <CardContent className="p-6">
                <div className={`mb-4 inline-flex rounded-xl ${f.bg} p-3`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 bg-card/30 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-12 text-2xl font-semibold text-foreground md:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Upload, step: '01', title: 'Upload CSV', desc: 'Drag & drop your data file. We detect encoding, column types, and data patterns automatically.' },
              { icon: BarChart3, step: '02', title: 'Instant Charts', desc: 'Charts are auto-generated based on your data shape. Histograms, bar charts, time-series and more.' },
              { icon: TrendingUp, step: '03', title: 'AI Insights', desc: 'GPT-4o reads your data summary and delivers 5 specific, actionable business insights.' },
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/20 to-sky-500/20 ring-1 ring-violet-500/30">
                    <step.icon className="h-7 w-7 text-violet-400" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" />
          <span>AI Data Dashboard Generator</span>
        </div>
      </footer>
    </main>
  );
}
