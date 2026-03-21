import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'TruthGrid Career Agent',
  description: 'AI-powered career assessment and insights platform for Indian university students',
  keywords: ['career assessment', 'AI', 'students', 'TruthID', 'skills', 'India'],
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