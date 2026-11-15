import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/auth/AuthProvider';

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
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <Analytics />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
