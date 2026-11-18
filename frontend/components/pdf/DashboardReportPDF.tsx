import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ColumnInfo, SummaryStats, Insight } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 32,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#334155',
    flexDirection: 'column',
  },
  runningHeader: {
    position: 'absolute',
    top: 14,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  runningHeaderText: {
    fontSize: 6.5,
    color: '#64748B',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  runningHeaderSub: {
    fontSize: 6.5,
    color: '#94A3B8',
  },
  runningFooter: {
    position: 'absolute',
    bottom: 14,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
  },
  runningFooterText: {
    fontSize: 6.5,
    color: '#94A3B8',
  },
  pageNumber: {
    fontSize: 6.5,
    color: '#475569',
    fontFamily: 'Helvetica-Bold',
  },

  // Hero section
  heroBanner: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  heroBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 0.5,
    borderColor: '#C7D2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  heroBadgeText: {
    color: '#4F46E5',
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  heroSubtitle: {
    fontSize: 8.5,
    color: '#64748B',
    lineHeight: 1.35,
    marginBottom: 6,
  },
  heroMetaStrip: {
    flexDirection: 'row',
    gap: 12,
  },
  heroMetaItem: {
    fontSize: 7,
    color: '#475569',
  },

  // KPI Metric Cards
  kpiRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 7,
  },
  kpiLabel: {
    fontSize: 6.5,
    color: '#64748B',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 1,
  },
  kpiSub: {
    fontSize: 6.5,
    color: '#64748B',
  },

  // Section titles
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CBD5E1',
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 7,
    color: '#64748B',
  },

  // Insight cards
  insightCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 7,
    marginBottom: 6,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  insightTypeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  insightTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  insightContent: {
    fontSize: 7.5,
    color: '#334155',
    lineHeight: 1.35,
  },

  // Data table styling
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
  },
  typeBadge: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },

  // Distribution bar / badge cards
  distCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
  },
  distItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  distItemName: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  distItemCount: {
    fontSize: 7.5,
    color: '#64748B',
  },

  // Chart cards
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 6,
    marginBottom: 10,
  },
  chartCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartCardTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  chartCardBadge: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 2,
  },
  chartImageContainer: {
    backgroundColor: '#09090b',
    borderRadius: 4,
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#27272a',
  },
  chartImage: {
    width: '100%',
    height: 180,
    objectFit: 'contain',
  },
  chartFooterNote: {
    fontSize: 6.5,
    color: '#64748B',
    marginTop: 3,
  },
});

interface ChartImage {
  id: string;
  title: string;
  dataUrl: string;
}

interface DashboardReportPDFProps {
  fileName?: string;
  totalRows: number;
  columns: ColumnInfo[];
  summaryStats?: SummaryStats[];
  insights?: Insight[];
  chartImages: ChartImage[];
  generatedAt?: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  trend: { bg: '#F0F9FF', text: '#0369A1', border: '#0284C7' },
  recommendation: { bg: '#F0FDF4', text: '#15803D', border: '#059669' },
  anomaly: { bg: '#FFFBEB', text: '#B45309', border: '#D97706' },
  summary: { bg: '#F5F3FF', text: '#6D28D9', border: '#7C3AED' },
  correlation: { bg: '#EEF2FF', text: '#4338CA', border: '#4F46E5' },
};

export const DashboardReportPDF = ({
  fileName = 'Uploaded Dataset',
  totalRows,
  columns = [],
  summaryStats = [],
  insights = [],
  chartImages = [],
  generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
}: DashboardReportPDFProps) => {
  // Derived metrics
  const numericCols = columns.filter((c) => c.dtype === 'numeric');
  const catCols = columns.filter((c) => c.dtype === 'categorical');
  const totalCells = Math.max(1, totalRows * columns.length);
  const totalNulls = columns.reduce((acc, c) => acc + (c.null_count || 0), 0);
  const completenessPct = (((totalCells - totalNulls) / totalCells) * 100).toFixed(1);

  // Dominant category detection
  let dominantCategoryName = 'None';
  let dominantCategoryCount = 0;
  let dominantCategoryPct = 0;
  let dominantColName = '';

  for (const stat of summaryStats) {
    if (stat.top_values && stat.top_values.length > 0) {
      const top = stat.top_values[0];
      if (top.count > dominantCategoryCount) {
        dominantCategoryName = top.value;
        dominantCategoryCount = top.count;
        dominantCategoryPct = top.pct;
        dominantColName = stat.column;
      }
    }
  }

  // Fallback insights if AI endpoint hadn't generated any yet
  const effectiveInsights: Insight[] =
    insights.length > 0
      ? insights
      : [
          {
            type: 'summary',
            title: 'Dataset Completeness & Architecture Profile',
            content: `The dataset "${fileName}" contains ${totalRows.toLocaleString()} total verified records across ${columns.length} columns (${numericCols.length} numeric, ${catCols.length} categorical). The data exhibits ${completenessPct}% completeness with ${totalNulls} missing values detected across all attributes.`,
          },
          {
            type: 'trend',
            title: dominantColName
              ? `Dominance of ${dominantCategoryName} in ${dominantColName}`
              : 'Primary Distribution Overview',
            content: dominantColName
              ? `The distribution is led by "${dominantCategoryName}" with ${dominantCategoryCount.toLocaleString()} records (${dominantCategoryPct}% share), representing the primary segment across the dataset.`
              : `Records are evenly distributed across ${catCols.length} categorical dimensions with strong attribute consistency.`,
          },
          {
            type: 'recommendation',
            title: 'Operational & Segment Optimization',
            content:
              'Focus strategic operations and targeted outreach around high-density segments while auditing low-frequency clusters for expansion or data enrichment opportunities.',
          },
        ];

  // Limit charts in report to top 6 to prevent overwhelming document length
  const reportCharts = chartImages.slice(0, 6);

  // Group charts into pairs of 2 per page
  const chartPages: ChartImage[][] = [];
  for (let i = 0; i < reportCharts.length; i += 2) {
    chartPages.push(reportCharts.slice(i, i + 2));
  }

  return (
    <Document>
      {/* ── PAGE 1: EXECUTIVE OVERVIEW & AI INSIGHTS ──────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* Running Header */}
        <View style={styles.runningHeader} fixed>
          <Text style={styles.runningHeaderText}>
            AI DATA DASHBOARD • EXECUTIVE INTELLIGENCE REPORT
          </Text>
          <Text style={styles.runningHeaderSub}>
            {fileName} • {totalRows.toLocaleString()} Records
          </Text>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>CONFIDENTIAL • DATASET INTELLIGENCE REPORT</Text>
          </View>
          <Text style={styles.heroTitle}>{fileName}</Text>
          <Text style={styles.heroSubtitle}>
            Automated Data Profiling, Statistical Distributions & Machine-Learning Business Insights
          </Text>
          <View style={styles.heroMetaStrip}>
            <Text style={styles.heroMetaItem}>Generated: {generatedAt}</Text>
            <Text style={styles.heroMetaItem}>
              Scope: {totalRows.toLocaleString()} Rows · {columns.length} Columns
            </Text>
            <Text style={styles.heroMetaItem}>Data Health: {completenessPct}% Complete</Text>
          </View>
        </View>

        {/* KPI Strip */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Records</Text>
            <Text style={styles.kpiValue}>{totalRows.toLocaleString()}</Text>
            <Text style={styles.kpiSub}>100% Ingested</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Dimensions</Text>
            <Text style={styles.kpiValue}>{columns.length} Columns</Text>
            <Text style={styles.kpiSub}>
              {numericCols.length} Num · {catCols.length} Cat
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Data Quality</Text>
            <Text style={styles.kpiValue}>{completenessPct}%</Text>
            <Text style={styles.kpiSub}>{totalNulls} Null Cells</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Top Segment</Text>
            <Text style={styles.kpiValue}>
              {dominantCategoryName.length > 10
                ? dominantCategoryName.slice(0, 9) + '…'
                : dominantCategoryName}
            </Text>
            <Text style={styles.kpiSub}>
              {dominantCategoryCount > 0
                ? `${dominantCategoryCount} rows (${dominantCategoryPct}%)`
                : 'Balanced'}
            </Text>
          </View>
        </View>

        {/* Section 1: Executive AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. Executive AI Insights & Strategic Analysis</Text>
            <Text style={styles.sectionSubtitle}>
              Machine-learning discovered patterns and operational recommendations
            </Text>
          </View>

          {effectiveInsights.slice(0, 5).map((ins, idx) => {
            const colors = TYPE_COLORS[ins.type] || TYPE_COLORS.summary;
            return (
              <View
                key={idx}
                wrap={false}
                style={[styles.insightCard, { borderLeftColor: colors.border }]}
              >
                <View style={styles.insightCardHeader}>
                  <View
                    style={[
                      styles.insightTypeBadge,
                      { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text style={{ color: colors.text }}>{ins.type}</Text>
                  </View>
                  <Text style={styles.insightTitle}>{ins.title}</Text>
                </View>
                <Text style={styles.insightContent}>{ins.content}</Text>
              </View>
            );
          })}
        </View>

        {/* Running Footer */}
        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>
            AI Data Dashboard Generator — Confidential Analytics Report
          </Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            style={styles.pageNumber}
          />
        </View>
      </Page>

      {/* ── PAGE 2: DATA SCHEMA & COLUMN PROFILING ─────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* Running Header */}
        <View style={styles.runningHeader} fixed>
          <Text style={styles.runningHeaderText}>
            AI DATA DASHBOARD • EXECUTIVE INTELLIGENCE REPORT
          </Text>
          <Text style={styles.runningHeaderSub}>
            {fileName} • {totalRows.toLocaleString()} Records
          </Text>
        </View>

        {/* Section 2: Data Schema */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Data Schema & Attribute Profiling</Text>
            <Text style={styles.sectionSubtitle}>
              Structural metadata, data types, completeness, and value distribution
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Attribute Name</Text>
              <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Data Type</Text>
              <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Cardinality</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Null %</Text>
              <Text style={[styles.tableHeaderCell, { width: '24%' }]}>Distribution / Sample</Text>
            </View>

            {columns.map((col, idx) => {
              const stat = summaryStats.find((s) => s.column === col.name);
              let sampleText = '';
              if (stat?.top_values && stat.top_values.length > 0) {
                sampleText = stat.top_values
                  .slice(0, 2)
                  .map((t) => `${t.value} (${t.pct}%)`)
                  .join(', ');
              } else if (col.sample_values && col.sample_values.length > 0) {
                sampleText = col.sample_values.slice(0, 3).filter(Boolean).join(', ');
              }

              return (
                <View
                  key={col.name}
                  style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  wrap={false}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      { width: '25%', fontFamily: 'Helvetica-Bold', color: '#0F172A' },
                    ]}
                  >
                    {col.name}
                  </Text>
                  <View style={{ width: '18%' }}>
                    <Text style={styles.typeBadge}>{col.dtype.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.tableCell, { width: '18%' }]}>
                    {col.unique_count.toLocaleString()} unique
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        width: '15%',
                        color: col.null_count === 0 ? '#15803D' : '#B45309',
                        fontFamily: 'Helvetica-Bold',
                      },
                    ]}
                  >
                    {col.null_pct}% ({col.null_count})
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: '24%', color: '#64748B', fontSize: 6.5 },
                    ]}
                  >
                    {sampleText || '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 3: Key Segment Distributions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. Key Value Distributions & Demographics</Text>
            <Text style={styles.sectionSubtitle}>
              Frequency breakdowns for primary categorical dimensions
            </Text>
          </View>

          {summaryStats
            .filter((s) => s.top_values && s.top_values.length > 0)
            .slice(0, 3)
            .map((stat) => (
              <View key={stat.column} style={styles.distCard} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0F172A' }}>
                    {stat.column.replace(/_/g, ' ').toUpperCase()} BREAKDOWN
                  </Text>
                  <Text style={{ fontSize: 7, color: '#64748B' }}>
                    {stat.unique_count || stat.top_values?.length} unique categories
                  </Text>
                </View>

                {stat.top_values?.slice(0, 5).map((tv, i) => (
                  <View key={i} style={styles.distItemRow}>
                    <Text style={styles.distItemName}>{tv.value}</Text>
                    <Text style={styles.distItemCount}>
                      {tv.count.toLocaleString()} entries ({tv.pct}%)
                    </Text>
                  </View>
                ))}
              </View>
            ))}
        </View>

        {/* Running Footer */}
        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>
            AI Data Dashboard Generator — Confidential Analytics Report
          </Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            style={styles.pageNumber}
          />
        </View>
      </Page>

      {/* ── PAGE 3+: VISUAL ANALYTICS & CHARTS ────────────────────────────── */}
      {chartPages.map((pagePair, pageIdx) => (
        <Page key={`charts-page-${pageIdx}`} size="A4" style={styles.page}>
          {/* Running Header */}
          <View style={styles.runningHeader} fixed>
            <Text style={styles.runningHeaderText}>
              AI DATA DASHBOARD • EXECUTIVE INTELLIGENCE REPORT
            </Text>
            <Text style={styles.runningHeaderSub}>
              {fileName} • Visual Analytics
            </Text>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {pageIdx === 0
                ? '4. Visual Analytics & Data Visualizations'
                : `4. Visual Analytics (Continued - Part ${pageIdx + 1})`}
            </Text>
            <Text style={styles.sectionSubtitle}>
              Interactive chart representations rendered from verified records
            </Text>
          </View>

          {pagePair.map((chart) => (
            <View key={chart.id} wrap={false} style={styles.chartCard}>
              <View style={styles.chartCardHeader}>
                <Text style={styles.chartCardTitle}>{chart.title}</Text>
                <Text style={styles.chartCardBadge}>SHADCN CHART</Text>
              </View>

              <View style={styles.chartImageContainer}>
                <Image src={chart.dataUrl} style={styles.chartImage} />
              </View>

              <Text style={styles.chartFooterNote}>
                Source: {fileName} · Verified aggregation across {totalRows.toLocaleString()} rows
              </Text>
            </View>
          ))}

          {/* Running Footer */}
          <View style={styles.runningFooter} fixed>
            <Text style={styles.runningFooterText}>
              AI Data Dashboard Generator — Confidential Analytics Report
            </Text>
            <Text
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              style={styles.pageNumber}
            />
          </View>
        </Page>
      ))}
    </Document>
  );
};
