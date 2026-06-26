import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShieldCall AI - Call Screening',
  description: 'AI-powered call screening and smart call management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
