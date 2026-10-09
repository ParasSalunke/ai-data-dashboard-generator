import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 30,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#09090b',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 5,
  },
  chartContainer: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 14,
    color: '#09090b',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chartImage: {
    width: '100%',
    objectFit: 'contain',
  }
});

interface ChartImage {
  id: string;
  title: string;
  dataUrl: string;
}

interface DashboardReportPDFProps {
  totalRows: number;
  columns: number;
  chartsCount: number;
  chartImages: ChartImage[];
}

export const DashboardReportPDF = ({ totalRows, columns, chartsCount, chartImages }: DashboardReportPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Data Dashboard Report</Text>
        <Text style={styles.subtitle}>{totalRows.toLocaleString()} rows · {columns} columns · {chartsCount} charts</Text>
        <Text style={styles.subtitle}>Generated {new Date().toLocaleDateString()}</Text>
      </View>

      {chartImages.map((chart, i) => (
        <View key={chart.id} style={styles.chartContainer} break={i > 0 && i % 2 === 0}>
          <Text style={styles.chartTitle}>{chart.title}</Text>
          <Image src={chart.dataUrl} style={styles.chartImage} />
        </View>
      ))}
    </Page>
  </Document>
);
