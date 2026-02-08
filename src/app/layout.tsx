import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import './modal.css';

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
      <head>
        <link rel="icon" href="/images/postry-favicon.png" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
