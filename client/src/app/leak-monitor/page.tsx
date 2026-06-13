'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, ShieldCheck, Mail, Phone, Lock, RefreshCw, ChevronRight } from 'lucide-react';

interface Breach {
  source: string;
  date: string;
  dataTypes: string[];
  severity: 'HIGH' | 'CRITICAL' | 'LOW';
  description: string;
}

const mockBreaches: Record<string, Breach[]> = {
  email: [
    {
      source: 'LinkedIn Global Leak (2021)',
      date: 'May 2021',
      dataTypes: ['Email Addresses', 'Hashed Passwords', 'Full Names', 'Professional History'],
      severity: 'HIGH',
      description: 'A scraped database of 700 million LinkedIn users was posted online. The leak contains credentials, emails, and job profiles.'
    },
    {
      source: 'Ledger Ledger Database Breach (2020)',
      date: 'June 2020',
      dataTypes: ['Email Addresses', 'Phone Numbers', 'Physical Mailing Addresses', 'Purchase History'],
      severity: 'CRITICAL',
      description: 'A marketing database breach exposed Ledger customer purchase orders, raising high risk for targeted voice phishing and physical mail scams.'
    }
  ],
  phone: [
    {
      source: 'Facebook Regional User Leak (2021)',
      date: 'April 2021',
      dataTypes: ['Phone Numbers', 'Facebook IDs', 'Full Names', 'Birth Dates'],
      severity: 'CRITICAL',
      description: 'Over 533 million Facebook user records were leaked on an online forum. The database contains mobile contact records and profile settings.'
    }
  ]
};

export default function LeakMonitor() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Breach[]>([]);
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearched(false);
    setResults([]);

    setTimeout(() => {
      // Basic simulation check
      const input = query.toLowerCase();
      let matchedBreaches: Breach[] = [];

      if (searchType === 'email') {
        // If checking a typical format
        if (input.includes('demo') || input.includes('scam') || input.includes('leak')) {
          matchedBreaches = mockBreaches.email;
        }
      } else {
        if (input.includes('98765') || input.includes('99999') || input.includes('88888')) {
          matchedBreaches = mockBreaches.phone;
        }
      }

      setResults(matchedBreaches);
      setSearching(false);
      setSearched(true);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-6 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Dark Web Leak Monitor
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Verify if your email address or mobile contact has been exposed in public database breaches.
        </p>
      </div>

      {/* Input Console */}
      <div className="glass-panel p-6 rounded-xl border-border space-y-6">
        <div className="flex justify-center border-b border-border pb-4 gap-4">
          <button
            onClick={() => { setSearchType('email'); setSearched(false); setQuery(''); }}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              searchType === 'email'
                ? 'bg-primary text-black'
                : 'text-gray-400 hover:text-white bg-background/40 hover:bg-gray-900 border border-border'
            }`}
          >
            <Mail className="h-4 w-4" />
            Check Email Address
          </button>
          <button
            onClick={() => { setSearchType('phone'); setSearched(false); setQuery(''); }}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              searchType === 'phone'
                ? 'bg-primary text-black'
                : 'text-gray-400 hover:text-white bg-background/40 hover:bg-gray-900 border border-border'
            }`}
          >
            <Phone className="h-4 w-4" />
            Check Mobile Number
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type={searchType === 'email' ? 'email' : 'text'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'email' ? 'Enter email (e.g. demo@shieldcall.ai)' : 'Enter phone number (e.g. +91 98765...)'}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              required
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-600" />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary text-black font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {searching ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Inspect Leaks'}
          </button>
        </form>
      </div>

      {/* Results Display */}
      <AnimatePresence mode="wait">
        {searching && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center text-xs text-gray-500 space-y-3"
          >
            <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="font-mono">Auditing data breach registers and dark-web repositories...</p>
          </motion.div>
        )}

        {searched && !searching && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {results.length === 0 ? (
              // Clean result card
              <div className="glass-panel p-8 rounded-xl border-emerald-500/20 text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.02)]">
                <div className="h-14 w-14 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <ShieldCheck className="h-8 w-8 text-glow-cyan" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Your Credentials are Secure!</h3>
                  <p className="text-gray-400 text-xs max-w-sm mx-auto">
                    We scanned public database records and found no active compromises for <span className="text-white font-semibold font-mono">{query}</span>.
                  </p>
                </div>
              </div>
            ) : (
              // Breach listing
              <div className="space-y-4">
                <div className="p-4 bg-rose-950/20 border border-rose-500/20 text-rose-500 rounded-lg flex items-start gap-3 text-xs">
                  <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider">Breach Alert Issued!</h4>
                    <p className="text-gray-300 mt-1">
                      This credential has been found in <span className="font-bold text-white font-mono">{results.length} compromised datasets</span>. Critical action is recommended.
                    </p>
                  </div>
                </div>

                {results.map((breach, idx) => (
                  <div key={idx} className="glass-panel p-5 rounded-xl border-border space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h3 className="font-bold text-sm text-white">{breach.source}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        breach.severity === 'CRITICAL' ? 'bg-rose-950/40 text-rose-500 border border-rose-500/30' :
                        breach.severity === 'HIGH' ? 'bg-amber-950/40 text-amber-500 border border-amber-500/30' :
                        'bg-yellow-950/40 text-yellow-500 border border-yellow-500/30'
                      }`}>
                        SEVERITY: {breach.severity}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">{breach.description}</p>

                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Exposed Telemetry Data:</p>
                      <div className="flex flex-wrap gap-2">
                        {breach.dataTypes.map((type, i) => (
                          <span key={i} className="text-[10px] px-2.5 py-1 rounded bg-background border border-border text-gray-300 font-mono">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mitigation Card */}
                <div className="glass-panel p-5 rounded-xl border-border space-y-3 bg-background/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    Security Remediation Protocol
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-2 list-decimal list-inside leading-relaxed pl-1">
                    <li>Reset passwords on compromised sites immediately. Use strong, randomized passwords.</li>
                    <li>Activate Two-Factor Authentication (2FA) across all digital credentials.</li>
                    <li>Be cautious of unsolicited phone calls or SMS messages demanding verify codes (OTP).</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
