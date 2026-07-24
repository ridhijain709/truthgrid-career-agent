import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'TruthGrid — Healthcare Content Intelligence',
  description: 'AI-powered healthcare content scoring and compliance insight platform for India\'s healthcare, wellness & pharma content teams.',
  keywords: [
    'healthcare content intelligence',
    'medical content compliance',
    'AYUSH guidelines',
    'CDSCO compliance',
    'pharma content India',
    'health content scoring',
    'wellness content audit',
    'TruthGrid',
    'India healthcare',
  ],
  authors: [{ name: 'TruthGrid' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background-dark text-text-dark">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}