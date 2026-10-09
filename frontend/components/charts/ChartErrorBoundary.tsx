'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  chartTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Chart render error (${this.props.chartTitle || 'unknown'}):`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="h-full flex flex-col items-center justify-center border-border/60 bg-card/60 backdrop-blur-sm min-h-[200px]">
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                Chart failed to render
              </p>
              {this.props.chartTitle && (
                <p className="text-xs text-muted-foreground">
                  {this.props.chartTitle}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="gap-2 mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
