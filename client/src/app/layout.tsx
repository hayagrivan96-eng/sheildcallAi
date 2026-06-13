import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShieldCall AI | Real-Time Scam & Social Engineering Protection',
  description: 'Futuristic AI platform detecting call scams, phishing attempts, fake KYC requests, and deepfake voice clone fraud in real time.',
  keywords: ['cybersecurity', 'scam detection', 'AI scam call blocker', 'deepfake voice detection', 'security SaaS'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        {/* Futuristic layout wrapper */}
        <div className="relative min-h-screen flex flex-col overflow-hidden">
          {/* Background cyber grid effect */}
          <div className="absolute inset-0 cyber-grid pointer-events-none z-0"></div>
          
          {/* Navigation Header */}
          <Header />
          
          {/* Main content body */}
          <main className="flex-grow flex flex-col z-10 relative">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="z-10 bg-background/80 backdrop-blur-md border-t border-border py-6 text-center text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>&copy; {new Date().getFullYear()} ShieldCall AI. Enterprise Scam Prevention Engine. Protected by Cryptographic Ledger.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">API Docs</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
