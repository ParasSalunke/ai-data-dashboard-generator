'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserDatasets, type FirestoreDataset } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Calendar, ArrowRight, Loader2 } from 'lucide-react';

export default function RecentDatasets() {
  const { user, isSignedIn } = useAuth();
  const [datasets, setDatasets] = useState<FirestoreDataset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setDatasets([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getUserDatasets(user.uid)
      .then((data) => {
        if (isMounted) setDatasets(data);
      })
      .catch((err) => console.error('Failed to load recent datasets:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, user]);

  if (!isSignedIn || (!loading && datasets.length === 0)) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-foreground">Your Saved Datasets</h2>
        </div>
        <span className="text-xs text-muted-foreground">Stored securely in Firestore</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          <span>Loading datasets…</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {datasets.map((dataset) => {
            const dateStr = dataset.createdAt?.toDate
              ? dataset.createdAt.toDate().toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <Card
                key={dataset.id}
                className="group border border-border/60 bg-card/60 hover:border-violet-500/40 transition-all duration-200 hover:shadow-md"
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold truncate text-foreground group-hover:text-violet-400 transition-colors">
                    {dataset.fileName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {dataset.rowCount.toLocaleString()} rows
                    </Badge>
                    <span>·</span>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {dataset.columnCount} cols
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dateStr}
                    </span>
                    <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <Link href={`/dashboard?id=${dataset.id}`}>
                        Open
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
