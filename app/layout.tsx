import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PaintPro — Premium Painter Quotation Studio',
  description:
    'Professional painter quotation and project management workspace. Create precise measurements, calculate paint quantities, and generate premium client quotations.',
  keywords: ['painter', 'quotation', 'paint', 'berger', 'asian paints', 'birla opus', 'contractor'],
  authors: [{ name: 'PaintPro' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PaintPro',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1f2528',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
