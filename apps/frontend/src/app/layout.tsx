import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Postry AI - Multimodal Content Orchestrator',
  description:
    'Transform blog articles into multi-platform social content automatically. Generate LinkedIn posts, TikTok scripts, and cover images with AI.',
  keywords: ['AI', 'content generation', 'social media', 'automation', 'marketing'],
  authors: [{ name: 'Postry AI' }],
  openGraph: {
    title: 'Postry AI - Multimodal Content Orchestrator',
    description: 'Transform blog articles into multi-platform social content automatically.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
