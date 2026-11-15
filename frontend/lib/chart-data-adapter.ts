import type { ColumnInfo } from './types';
import type { ChartConfig } from '@/components/ui/chart';

export interface AdaptedChartData {
  datasetName: string;
  totalRows: number;
  dateColumnName: string;
  numericColumn1: string;
  numericColumn2: string;
  categoryColumn: string;
  labelColumn: string;

  areaData: Array<Record<string, unknown>>;
  areaConfig: ChartConfig;
  areaTrend: { text: string; subText: string; isUp: boolean };

  barData: Array<Record<string, unknown>>;
  barConfig: ChartConfig;
  barTrend: { text: string; subText: string; isUp: boolean };

  lineData: Array<Record<string, unknown>>;
  lineConfig: ChartConfig;
  lineTrend: { text: string; subText: string; isUp: boolean };

  pieData: Array<Record<string, unknown>>;
  pieConfig: ChartConfig;
  pieTrend: { text: string; subText: string; isUp: boolean };

  radarData: Array<Record<string, unknown>>;
  radarConfig: ChartConfig;
  radarTrend: { text: string; subText: string; isUp: boolean };

  radialData: Array<Record<string, unknown>>;
  radialConfig: ChartConfig;
  radialTrend: { text: string; subText: string; isUp: boolean };

  tooltipData: Array<Record<string, unknown>>;
  tooltipConfig: ChartConfig;
  tooltipTrend: { text: string; subText: string; isUp: boolean };
}

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
];

function formatColumnTitle(name: string): string {
  if (!name) return 'Value';
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bInr\b/i, '(INR)')
    .replace(/\bMm\b/i, '(mm)')
    .replace(/\bPercent\b/i, '(%)')
    .replace(/\bC\b/, '(°C)');
}

function formatMetricUnit(val: number, colName: string): string {
  const lower = colName.toLowerCase();
  if (
    lower.includes('inr') ||
    lower.includes('rupee') ||
    lower.includes('price') ||
    lower.includes('cost') ||
    lower.includes('amount') ||
    lower.includes('salary') ||
    lower.includes('expense') ||
    lower.includes('revenue')
  ) {
    return `₹${Math.round(val).toLocaleString()}`;
  }
  if (lower.includes('percent') || lower.includes('pct') || lower.includes('attendance')) {
    return `${val.toFixed(1)}%`;
  }
  if (lower.includes('temp') || lower.includes('_c')) {
    return `${val.toFixed(1)}°C`;
  }
  if (lower.includes('rain') || lower.includes('mm')) {
    return `${val.toFixed(1)} mm`;
  }
  if (lower.includes('year') || lower.includes('exp')) {
    return `${val.toFixed(1)} yrs`;
  }
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(1);
}

export function adaptCsvData(
  columns: ColumnInfo[] = [],
  rows: Record<string, unknown>[] = [],
  fileName?: string
): AdaptedChartData {
  const datasetName = fileName || 'Dataset';
  const totalRows = rows.length;

  if (!rows || rows.length === 0 || !columns || columns.length === 0) {
    return getDefaultAdaptedData(datasetName);
  }

  // 1. Column Role Detection
  const colNames = columns.map((c) => c.name);

  // Date column: look for datetime or date/time/timestamp in name (excluding non-dates like 'update' or 'student')
  const dateCol = columns.find(
    (c) =>
      c.dtype === 'datetime' ||
      (/(date|time|timestamp)/i.test(c.name) && !/(update|candidate|student)/i.test(c.name))
  )?.name;

  // ID columns: skip these for primary metrics
  const isIdColumn = (name: string) => /^(id|_id|.*_id|index|serial|uuid|guid)$/i.test(name.trim());

  // Numeric columns (excluding IDs)
  const numericCols = columns
    .filter((c) => c.dtype === 'numeric' && !isIdColumn(c.name))
    .map((c) => c.name);

  // If no pure numeric columns detected, check if any column contains parseable numbers
  if (numericCols.length === 0) {
    for (const c of columns) {
      if (isIdColumn(c.name)) continue;
      const parseable = rows.filter((r) => !isNaN(Number(r[c.name])) && r[c.name] !== null && r[c.name] !== '').length;
      if (parseable >= Math.max(1, rows.length * 0.5)) {
        numericCols.push(c.name);
      }
    }
  }

  // Text/Categorical columns (excluding date and IDs)
  const textCols = columns
    .filter((c) => c.name !== dateCol && !isIdColumn(c.name) && !numericCols.includes(c.name))
    .map((c) => c.name);

  // Determine Primary and Secondary Numeric Columns
  const num1 = numericCols[0] || 'count';
  const num2 = numericCols[1] || num1;
  const num3 = numericCols[2] || num2;

  // Determine Best Category Column (low/medium cardinality between 2 and 15 unique items)
  let catCol = '';
  const groupableCols = textCols.filter((name) => {
    const uniques = new Set(rows.map((r) => String(r[name] ?? ''))).size;
    return uniques >= 2 && uniques <= 20;
  });

  if (groupableCols.length > 0) {
    // Prioritize columns whose name sounds like a categorical attribute
    groupableCols.sort((a, b) => {
      const aPriority = /category|department|dept|product|city|class|type|status|mode|condition|gender|role/i.test(a) ? 0 : 1;
      const bPriority = /category|department|dept|product|city|class|type|status|mode|condition|gender|role/i.test(b) ? 0 : 1;
      return aPriority - bPriority;
    });
    catCol = groupableCols[0];
  } else if (textCols.length > 0) {
    catCol = textCols[0];
  } else {
    catCol = dateCol || columns[0]?.name || 'category';
  }

  // Determine Best Row Label Column (e.g. date, student_name, employee_name, product, or description)
  const nameCol = textCols.find((c) => /name|title|product|description|label/i.test(c));
  const labelCol = dateCol || nameCol || catCol;

  // 2. Format Chronological / Row Progression Data (Area & Line Charts)
  let sortedRows = [...rows];
  if (dateCol) {
    sortedRows.sort((a, b) => {
      const da = new Date(String(a[dateCol])).getTime();
      const db = new Date(String(b[dateCol])).getTime();
      return isNaN(da) || isNaN(db) ? 0 : da - db;
    });
  }

  // Keep up to 30 data points
  const step = Math.max(1, Math.floor(sortedRows.length / 30));
  const sampledRows = sortedRows.filter((_, idx) => idx % step === 0).slice(0, 30);

  const areaData = sampledRows.map((r, i) => {
    let dateStr = '';
    let shortLabel = '';

    if (dateCol && r[dateCol]) {
      const rawDate = String(r[dateCol]).trim();
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        dateStr = rawDate.slice(0, 10);
        shortLabel = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateStr = rawDate.slice(0, 10);
        shortLabel = rawDate.slice(0, 8);
      }
    } else {
      const rawLabel = String(r[labelCol] || `Item ${i + 1}`).trim();
      dateStr = rawLabel;
      shortLabel = rawLabel.length > 12 ? rawLabel.slice(0, 10) + '…' : rawLabel;
    }

    const val1 = Number(r[num1]) || 0;
    const val2 = num2 !== num1 && r[num2] !== undefined ? Number(r[num2]) || 0 : Math.round(val1 * 0.75);
    const val3 = num3 !== num2 && r[num3] !== undefined ? Number(r[num3]) || 0 : Math.round((val1 + val2) / 2);

    return {
      date: dateStr,
      month: shortLabel,
      category: shortLabel,
      name: shortLabel,
      label: shortLabel,
      desktop: val1,
      mobile: val2,
      running: val1,
      swimming: val2,
      visitors: val1,
      value: val1,
      count: val1,
      other: val3,
      fill: PALETTE[i % PALETTE.length],
    };
  });

  // Calculate Area & Line Trends
  const firstPoint = areaData[0]?.desktop ?? 0;
  const lastPoint = areaData[areaData.length - 1]?.desktop ?? 0;
  const areaChangePct =
    firstPoint !== 0
      ? (((lastPoint - firstPoint) / Math.abs(firstPoint)) * 100).toFixed(1)
      : '0.0';
  const areaIsUp = Number(areaChangePct) >= 0;

  const firstDate = areaData[0]?.date || 'Start';
  const lastDate = areaData[areaData.length - 1]?.date || 'End';

  const num1Label = formatColumnTitle(num1);
  const num2Label = formatColumnTitle(num2);

  const areaConfig: ChartConfig = {
    desktop: { label: num1Label, color: 'var(--chart-1)' },
    mobile: { label: num2Label, color: 'var(--chart-2)' },
    running: { label: num1Label, color: 'var(--chart-1)' },
    swimming: { label: num2Label, color: 'var(--chart-2)' },
    visitors: { label: num1Label, color: 'var(--chart-1)' },
    value: { label: num1Label, color: 'var(--chart-1)' },
    count: { label: num1Label, color: 'var(--chart-1)' },
    other: { label: formatColumnTitle(num3 || 'Other'), color: 'var(--chart-4)' },
  };

  const areaTrend = {
    text: `${num1Label}: Trending ${areaIsUp ? 'up' : 'down'} by ${Math.abs(Number(areaChangePct))}% (${formatMetricUnit(firstPoint, num1)} → ${formatMetricUnit(lastPoint, num1)})`,
    subText: `${firstDate} – ${lastDate} (${areaData.length} records)`,
    isUp: areaIsUp,
  };

  // 3. Format Bar Data (Categorical Aggregation by catCol)
  const categoryAggregates: Record<
    string,
    { count: number; sum1: number; sum2: number }
  > = {};

  for (const r of rows) {
    const rawCat = String(r[catCol] ?? 'General').trim() || 'General';
    if (!categoryAggregates[rawCat]) {
      categoryAggregates[rawCat] = { count: 0, sum1: 0, sum2: 0 };
    }
    categoryAggregates[rawCat].count += 1;
    categoryAggregates[rawCat].sum1 += Number(r[num1]) || 0;
    categoryAggregates[rawCat].sum2 += Number(r[num2]) || 0;
  }

  // Sort by metric sum or frequency
  const sortedCategories = Object.entries(categoryAggregates)
    .sort((a, b) => (b[1].sum1 || b[1].count) - (a[1].sum1 || a[1].count))
    .slice(0, 8);

  const avgMetric =
    sortedCategories.reduce((acc, [, val]) => acc + (val.sum1 || val.count), 0) /
    (sortedCategories.length || 1);

  const barData = sortedCategories.map(([cat, stats], i) => {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const metricVal = stats.sum1 > 0 ? Math.round(stats.sum1) : stats.count;
    const secondaryVal = stats.sum2 > 0 ? Math.round(stats.sum2) : Math.round(stats.count * 0.7);
    const deviation = Math.round(metricVal - avgMetric);

    return {
      category: cat,
      month: cat,
      name: cat,
      browser: slug,
      date: cat,
      count: stats.count,
      desktop: metricVal,
      mobile: secondaryVal,
      visitors: deviation, // Supports negative bar charts
      value: metricVal,
      fill: PALETTE[i % PALETTE.length],
    };
  });

  const topCategory = barData[0]?.category || 'None';
  const topVal = barData[0]?.desktop || 0;
  const totalSum1 = sortedCategories.reduce((sum, [, s]) => sum + s.sum1, 0);

  const barConfig: ChartConfig = {
    desktop: { label: num1Label, color: 'var(--chart-1)' },
    mobile: { label: num2Label, color: 'var(--chart-2)' },
    running: { label: num1Label, color: 'var(--chart-1)' },
    swimming: { label: num2Label, color: 'var(--chart-2)' },
    visitors: { label: `${num1Label} Variance`, color: 'var(--chart-3)' },
    count: { label: 'Record Count', color: 'var(--chart-1)' },
    value: { label: num1Label, color: 'var(--chart-1)' },
  };

  // Add category slug mappings for charts that look up config by category slug
  barData.forEach((b, idx) => {
    barConfig[b.browser] = {
      label: b.category,
      color: PALETTE[idx % PALETTE.length],
    };
  });

  const barTrend = {
    text: `Highest ${formatColumnTitle(catCol)}: ${topCategory} (${formatMetricUnit(topVal, num1)})`,
    subText: `Total ${num1Label}: ${formatMetricUnit(totalSum1 || topVal, num1)} across ${sortedCategories.length} categories`,
    isUp: true,
  };

  // 4. Format Pie & Radial Data (Top 5-6 segments)
  const pieData = sortedCategories.slice(0, 6).map(([cat, stats], i) => {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const segmentVal = stats.sum1 > 0 ? Math.round(stats.sum1) : stats.count;
    return {
      browser: slug,
      name: cat,
      category: cat,
      month: cat,
      visitors: segmentVal,
      value: segmentVal,
      desktop: segmentVal,
      mobile: stats.sum2 > 0 ? Math.round(stats.sum2) : Math.round(segmentVal * 0.6),
      fill: PALETTE[i % PALETTE.length],
    };
  });

  const pieConfig: ChartConfig = {
    visitors: { label: num1Label },
    value: { label: num1Label },
    desktop: { label: num1Label, color: 'var(--chart-1)' },
    mobile: { label: num2Label, color: 'var(--chart-2)' },
  };
  pieData.forEach((p, idx) => {
    pieConfig[p.browser] = {
      label: p.name,
      color: PALETTE[idx % PALETTE.length],
    };
  });

  const pieTotal = pieData.reduce((sum, p) => sum + p.visitors, 0);
  const topPieShare = pieTotal > 0 ? Math.round((pieData[0].visitors / pieTotal) * 100) : 0;

  const pieTrend = {
    text: `${topCategory} accounts for ${topPieShare}% of total ${num1Label}`,
    subText: `Distribution across top ${pieData.length} ${formatColumnTitle(catCol)} segments`,
    isUp: true,
  };

  // 5. Format Radar Data
  const radarData = sortedCategories.slice(0, 6).map(([cat, stats]) => {
    const dVal = stats.sum1 > 0 ? Math.round(stats.sum1) : stats.count * 10;
    const mVal = stats.sum2 > 0 ? Math.round(stats.sum2) : Math.round(dVal * 0.7);
    return {
      month: cat,
      category: cat,
      name: cat,
      desktop: dVal,
      mobile: mVal,
      value: dVal,
      visitors: dVal,
    };
  });

  const radarConfig: ChartConfig = {
    desktop: { label: num1Label, color: 'var(--chart-1)' },
    mobile: { label: num2Label, color: 'var(--chart-2)' },
    category: { label: formatColumnTitle(catCol), color: 'var(--chart-1)' },
  };

  const radarTrend = {
    text: `Metric comparison: ${num1Label} vs ${num2Label}`,
    subText: `Evaluating ${radarData.length} key segments in ${formatColumnTitle(catCol)}`,
    isUp: true,
  };

  // 6. Format Radial Data
  const radialData = [...pieData];
  const radialConfig = { ...pieConfig };
  const radialTrend = {
    text: `Top performer: ${topCategory} with ${formatMetricUnit(pieData[0]?.visitors || 0, num1)}`,
    subText: `Aggregated from ${totalRows} records in ${datasetName}`,
    isUp: true,
  };

  // 7. Format Tooltip Data (Time-series / Sequential entries)
  const tooltipData = areaData.slice(0, 15).map((d) => ({
    date: d.date,
    month: d.month,
    running: d.desktop,
    swimming: d.mobile,
    desktop: d.desktop,
    mobile: d.mobile,
    value: d.desktop,
    visitors: d.desktop,
  }));

  const tooltipConfig: ChartConfig = {
    running: { label: num1Label, color: 'var(--chart-1)' },
    swimming: { label: num2Label, color: 'var(--chart-2)' },
    desktop: { label: num1Label, color: 'var(--chart-1)' },
    mobile: { label: num2Label, color: 'var(--chart-2)' },
  };

  const tooltipTrend = {
    text: `Detailed metrics inspector for ${num1Label} and ${num2Label}`,
    subText: `Sample of ${tooltipData.length} sequential data entries`,
    isUp: true,
  };

  return {
    datasetName,
    totalRows,
    dateColumnName: dateCol || 'Index',
    numericColumn1: num1Label,
    numericColumn2: num2Label,
    categoryColumn: formatColumnTitle(catCol),
    labelColumn: formatColumnTitle(labelCol),
    areaData,
    areaConfig,
    areaTrend,
    barData,
    barConfig,
    barTrend,
    lineData: areaData,
    lineConfig: areaConfig,
    lineTrend: areaTrend,
    pieData,
    pieConfig,
    pieTrend,
    radarData,
    radarConfig,
    radarTrend,
    radialData,
    radialConfig,
    radialTrend,
    tooltipData,
    tooltipConfig,
    tooltipTrend,
  };
}

function getDefaultAdaptedData(datasetName: string): AdaptedChartData {
  const areaData = [
    { date: '2024-01-01', month: 'January', category: 'January', name: 'January', desktop: 186, mobile: 80, running: 186, swimming: 80, visitors: 186, value: 186, count: 186, other: 133 },
    { date: '2024-02-01', month: 'February', category: 'February', name: 'February', desktop: 305, mobile: 200, running: 305, swimming: 200, visitors: 305, value: 305, count: 305, other: 252 },
    { date: '2024-03-01', month: 'March', category: 'March', name: 'March', desktop: 237, mobile: 120, running: 237, swimming: 120, visitors: 237, value: 237, count: 237, other: 178 },
    { date: '2024-04-01', month: 'April', category: 'April', name: 'April', desktop: 173, mobile: 190, running: 173, swimming: 190, visitors: 173, value: 173, count: 173, other: 181 },
    { date: '2024-05-01', month: 'May', category: 'May', name: 'May', desktop: 209, mobile: 130, running: 209, swimming: 130, visitors: 209, value: 209, count: 209, other: 169 },
    { date: '2024-06-01', month: 'June', category: 'June', name: 'June', desktop: 214, mobile: 140, running: 214, swimming: 140, visitors: 214, value: 214, count: 214, other: 177 },
  ];

  const barData = [
    { category: 'Category A', month: 'Category A', name: 'Category A', browser: 'category_a', date: 'Category A', count: 186, desktop: 186, mobile: 80, visitors: 25, value: 186, fill: 'var(--chart-1)' },
    { category: 'Category B', month: 'Category B', name: 'Category B', browser: 'category_b', date: 'Category B', count: 305, desktop: 305, mobile: 200, visitors: 45, value: 305, fill: 'var(--chart-2)' },
    { category: 'Category C', month: 'Category C', name: 'Category C', browser: 'category_c', date: 'Category C', count: 237, desktop: 237, mobile: 120, visitors: -15, value: 237, fill: 'var(--chart-3)' },
    { category: 'Category D', month: 'Category D', name: 'Category D', browser: 'category_d', date: 'Category D', count: 173, desktop: 173, mobile: 190, visitors: -30, value: 173, fill: 'var(--chart-4)' },
    { category: 'Category E', month: 'Category E', name: 'Category E', browser: 'category_e', date: 'Category E', count: 209, desktop: 209, mobile: 130, visitors: 10, value: 209, fill: 'var(--chart-5)' },
  ];

  const pieData = [
    { browser: 'segment_1', name: 'Segment 1', category: 'Segment 1', month: 'Segment 1', visitors: 275, value: 275, desktop: 275, mobile: 160, fill: 'var(--chart-1)' },
    { browser: 'segment_2', name: 'Segment 2', category: 'Segment 2', month: 'Segment 2', visitors: 200, value: 200, desktop: 200, mobile: 120, fill: 'var(--chart-2)' },
    { browser: 'segment_3', name: 'Segment 3', category: 'Segment 3', month: 'Segment 3', visitors: 187, value: 187, desktop: 187, mobile: 110, fill: 'var(--chart-3)' },
    { browser: 'segment_4', name: 'Segment 4', category: 'Segment 4', month: 'Segment 4', visitors: 173, value: 173, desktop: 173, mobile: 100, fill: 'var(--chart-4)' },
    { browser: 'segment_5', name: 'Segment 5', category: 'Segment 5', month: 'Segment 5', visitors: 90, value: 90, desktop: 90, mobile: 60, fill: 'var(--chart-5)' },
  ];

  const config: ChartConfig = {
    desktop: { label: 'Primary Measure', color: 'var(--chart-1)' },
    mobile: { label: 'Secondary Measure', color: 'var(--chart-2)' },
    running: { label: 'Primary Measure', color: 'var(--chart-1)' },
    swimming: { label: 'Secondary Measure', color: 'var(--chart-2)' },
    count: { label: 'Count', color: 'var(--chart-1)' },
    visitors: { label: 'Variance', color: 'var(--chart-3)' },
    value: { label: 'Primary Measure', color: 'var(--chart-1)' },
    other: { label: 'Other', color: 'var(--chart-4)' },
  };

  pieData.forEach((p) => {
    config[p.browser] = { label: p.name, color: p.fill };
  });

  const trend = {
    text: 'Metrics successfully initialized',
    subText: 'Ready for dataset inspection',
    isUp: true,
  };

  return {
    datasetName,
    totalRows: 0,
    dateColumnName: 'Period',
    numericColumn1: 'Primary Measure',
    numericColumn2: 'Secondary Measure',
    categoryColumn: 'Category',
    labelColumn: 'Label',
    areaData,
    areaConfig: config,
    areaTrend: trend,
    barData,
    barConfig: config,
    barTrend: trend,
    lineData: areaData,
    lineConfig: config,
    lineTrend: trend,
    pieData,
    pieConfig: config,
    pieTrend: trend,
    radarData: barData,
    radarConfig: config,
    radarTrend: trend,
    radialData: pieData,
    radialConfig: config,
    radialTrend: trend,
    tooltipData: areaData,
    tooltipConfig: config,
    tooltipTrend: trend,
  };
}
