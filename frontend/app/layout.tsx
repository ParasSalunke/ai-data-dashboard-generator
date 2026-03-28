import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Providers from '../app/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Data Dashboard Generator',
  description:
    'Upload any CSV file and instantly get AI-powered charts, insights, and analytics — no configuration required.',
  keywords: ['data dashboard', 'AI analytics', 'CSV visualizer', 'chart generator'],
  openGraph: {
    title: 'AI Data Dashboard Generator',
    description: 'Transform your CSV data into actionable insights with AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
