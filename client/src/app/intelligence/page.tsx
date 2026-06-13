'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, AlertOctagon, HelpCircle, FileText, Send, Lock, Eye, Database, Globe, MapPin, Search, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { apiService } from '@/services/api';

interface ScamReport {
  id: string;
  phone_number: string;
  scam_type: string;
  description: string;
  reputation_score: number;
  created_at: string;
}

interface BlockchainBlock {
  id: string;
  report_id: string;
  block_hash: string;
  prev_hash: string;
  timestamp: string;
}

export default function Intelligence() {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [blockchain, setBlockchain] = useState<BlockchainBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [scamType, setScamType] = useState('OTP Scam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Threat database lookup states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'url' | 'ip'>('url');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      let type: 'url' | 'ip' | 'domain' = searchType;
      const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipPattern.test(searchQuery.trim())) {
        type = 'ip';
        setSearchType('ip');
      } else {
        type = 'url';
        setSearchType('url');
      }

      const res = await apiService.scanThreatReputation(searchQuery.trim(), type);
      setLookupResult(res);
    } catch (err: any) {
      console.error(err);
      setLookupError('Failed to fetch scanner metrics. Please verify API parameters.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Map hotspot select state
  const [selectedHotspot, setSelectedHotspot] = useState({
    city: 'New Delhi',
    reports: 4320,
    scamType: 'Police Summons Fraud',
    trend: '+14.2% (UP)'
  });

  const hotspots = [
    { city: 'New Delhi', reports: 4320, scamType: 'Police Summons Fraud', trend: '+14.2% (UP)', x: 180, y: 120 },
    { city: 'Mumbai', reports: 3120, scamType: 'OTP Banking Scam', trend: '+9.4% (UP)', x: 120, y: 180 },
    { city: 'Bangalore', reports: 2840, scamType: 'AI Voice Clones', trend: '+18.1% (UP)', x: 150, y: 220 },
    { city: 'Kolkata', reports: 1950, scamType: 'Fake KYC Verification', trend: '-2.4% (DOWN)', x: 230, y: 150 }
  ];

  const loadIntelData = async () => {
    try {
      const list = await apiService.getReports();
      setReports(list);

      const chain = await apiService.getBlockchainLedger();
      setBlockchain(chain);

      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadIntelData();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !description) return;
    
    setSubmitting(true);
    try {
      await apiService.createReport(phoneNumber, scamType, description);
      setPhoneNumber('');
      setDescription('');
      loadIntelData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Threat Intelligence center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Browse regional hotspot metrics, submit incidents, and review immutable blockchain proofs.
          </p>
        </div>
      </div>

      {/* Grid: Map & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Map Widget (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl border-border space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Map className="h-4.5 w-4.5 text-primary" />
              Regional Threat Hotspots
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">click coordinates for telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG MAP */}
            <div className="md:col-span-7 flex justify-center bg-background rounded-xl p-4 border border-border relative overflow-hidden h-64">
              {/* Radar scan lines */}
              <div className="absolute inset-0 radar-scan pointer-events-none opacity-40"></div>
              
              <svg className="w-full h-full max-w-[320px]" viewBox="0 0 320 280">
                {/* Cyber Grid Outline */}
                <rect x="0" y="0" width="320" height="280" fill="none" stroke="rgba(253, 164, 175, 0.05)" strokeWidth="1" />
                
                {/* Simulated Map Outline Shapes */}
                <path d="M 50,40 L 90,30 L 140,50 L 180,30 L 260,60 L 290,110 L 250,180 L 190,240 L 140,250 L 80,210 L 40,120 Z" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="3 3" />
                
                {/* Pulse waves and hotspots dots */}
                {hotspots.map((spot, i) => (
                  <g key={spot.city} className="cursor-pointer" onClick={() => setSelectedHotspot(spot)}>
                    {/* Pulsing outer ring */}
                    <circle cx={spot.x} cy={spot.y} r="8" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1">
                      <animate attributeName="r" values="4;15;4" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                      <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                    </circle>
                    {/* Hotspot core */}
                    <circle cx={spot.x} cy={spot.y} r="4.5" fill={selectedHotspot.city === spot.city ? '#00f0ff' : '#ef4444'} className="transition-all duration-300" />
                  </g>
                ))}
              </svg>
            </div>

            {/* Selected Hotspot Data Card */}
            <div className="md:col-span-5 bg-background p-4 rounded-xl border border-border space-y-4 text-xs">
              <h3 className="font-bold text-sm text-white border-b border-border pb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {selectedHotspot.city} Metrics
              </h3>
              
              <div className="space-y-2.5">
                <div>
                  <p className="text-gray-500">Active reported cases</p>
                  <p className="text-base font-bold text-white font-mono">{selectedHotspot.reports}</p>
                </div>
                <div>
                  <p className="text-gray-500">Predominant Vector</p>
                  <p className="font-semibold text-primary">{selectedHotspot.scamType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Weekly Trend Velocity</p>
                  <p className={`font-bold ${selectedHotspot.trend.includes('UP') ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {selectedHotspot.trend}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Submit Scam Report Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border-border space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-primary" />
            Submit Scam Incident
          </h2>
          
          <form onSubmit={handleCreateReport} className="space-y-3">
            <div>
              <label className="block text-[11px] text-gray-500 font-bold uppercase mb-1">Scammer Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-background border border-border rounded p-2 text-xs text-white focus:outline-none focus:border-ring"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 font-bold uppercase mb-1">Classification Vector</label>
              <select
                value={scamType}
                onChange={(e) => setScamType(e.target.value)}
                className="w-full bg-background border border-border rounded p-2 text-xs text-white focus:outline-none focus:border-ring"
              >
                <option value="OTP Scam">OTP Banking Scam</option>
                <option value="Police Impersonation">Police/CBI Summon</option>
                <option value="Voice Clone">AI Voice Clone</option>
                <option value="Lottery Scam">Lottery KBC Lucky Draw</option>
                <option value="Fake KYC">Fake Document KYC</option>
                <option value="UPI Refund Fraud">UPI Payment Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 font-bold uppercase mb-1">Scam Incident Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of what the caller requested, fear tactics used, etc..."
                rows={3}
                className="w-full bg-background border border-border rounded p-2 text-xs text-white focus:outline-none focus:border-ring placeholder:text-gray-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-primary hover:bg-primary text-black font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Publishing telemetry...' : 'File Secure Report'}
            </button>
          </form>
        </div>

      </div>

      {/* Real-time Cyber Threat Scanner Widget */}
      <div className="glass-panel rounded-xl border-border overflow-hidden relative p-6 space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-accent to-primary"></div>
        
        <div>
          <h2 className="text-lg font-bold text-white tracking-wider uppercase flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            IP & URL Threat Reputation Scanner
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Query malicious indicators across VirusTotal and AbuseIPDB live directories.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-background border border-border rounded-lg p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSearchType('url')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                searchType === 'url' ? 'bg-primary text-black' : 'text-gray-400'
              }`}
            >
              URL / Domain
            </button>
            <button
              type="button"
              onClick={() => setSearchType('ip')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                searchType === 'ip' ? 'bg-primary text-black' : 'text-gray-400'
              }`}
            >
              IP Reputation
            </button>
          </div>

          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === 'url' ? 'e.g. https://phishing-bank-link.com' : 'e.g. 185.190.140.15'}
              className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-ring"
              required
            />
          </div>

          <button
            type="submit"
            disabled={lookupLoading}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-black font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {lookupLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Scanning Indicators...
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" />
                Scan Database
              </>
            )}
          </button>
        </form>

        {/* Results section */}
        {lookupLoading && (
          <div className="py-6 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="font-mono">Auditing database records. Please hold...</p>
          </div>
        )}

        {lookupError && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold">
            {lookupError}
          </div>
        )}

        {lookupResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border ${
              lookupResult.isSafe 
                ? 'bg-emerald-950/10 border-emerald-500/20' 
                : 'bg-rose-950/10 border-rose-500/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-mono">Target Indicator</p>
                <p className="text-sm font-mono font-bold text-white truncate max-w-md">{lookupResult.query}</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  lookupResult.isSafe 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                }`}>
                  {lookupResult.isSafe ? (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      CLEAN / SAFE INDICATOR
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      THREAT VERIFIED
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <p className="text-gray-500 mb-0.5">Threat Score Index</p>
                <p className={`text-xl font-bold font-mono ${lookupResult.isSafe ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {lookupResult.score} / 100
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-0.5">Data Provider</p>
                <p className="text-white font-semibold">{lookupResult.provider}</p>
              </div>

              {lookupResult.type === 'ip' ? (
                <div>
                  <p className="text-gray-500 mb-0.5">Telemetry Origin</p>
                  <p className="text-white font-semibold">
                    {lookupResult.details?.countryName || 'Unknown'} ({lookupResult.details?.isp || 'Unknown ISP'})
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-0.5">Registrar</p>
                  <p className="text-white font-semibold">{lookupResult.details?.registrar || 'Unknown'}</p>
                </div>
              )}
            </div>

            {lookupResult.type === 'ip' && lookupResult.details?.totalReports > 0 && (
              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border text-[11px] text-gray-400">
                ⚠️ AbuseIPDB database logs show this IP has been reported <strong className="text-white">{lookupResult.details.totalReports} times</strong> for malicious behaviors (scanning, fraud, or brute force).
              </div>
            )}

            {lookupResult.type === 'url' && !lookupResult.isSafe && (
              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border text-[11px] text-gray-400">
                ⚠️ VirusTotal audit scan: <strong className="text-white">{lookupResult.details.stats?.malicious || 0} security vendors</strong> flagged this URL link as malicious or active phishing site vector.
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Grid: Community Ledger & Blockchain Proofs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Community Database Directory List (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl border-border space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Database className="h-4.5 w-4.5 text-primary" />
            Incident Registry Directory
          </h2>

          {loading ? (
            <p className="text-xs text-gray-500">Synchronizing database log ledgers...</p>
          ) : reports.length === 0 ? (
            <p className="text-xs text-gray-500">Registry is empty.</p>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {reports.map((report) => (
                <div key={report.id} className="bg-background/70 p-4 rounded-xl border border-border/60 text-xs space-y-2.5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-mono text-white font-bold text-sm">{report.phone_number}</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 font-semibold">
                        {report.scam_type}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-950/30 text-rose-500 border border-rose-900/30 font-bold uppercase">
                        Severity: {report.reputation_score}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{report.description}</p>
                  <p className="text-[10px] text-gray-600">Filed at: {new Date(report.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blockchain proof visualization logs (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border-border space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Lock className="h-4.5 w-4.5 text-primary" />
            Immutable Audit Ledger Hash
          </h2>
          <p className="text-xs text-gray-500">
            Cryptographic SHA256 chain links every report to protect history from database manipulation or unauthorized removal.
          </p>

          {loading ? (
            <p className="text-xs text-gray-500">Reconstructing blockchain ledger...</p>
          ) : blockchain.length === 0 ? (
            <p className="text-xs text-gray-500">Genesis block pending.</p>
          ) : (
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {blockchain.map((block, idx) => (
                <div key={block.id} className="relative bg-background p-3 rounded-lg border border-border text-[10px] space-y-1.5 font-mono">
                  <div className="flex justify-between text-[9px] text-gray-500 border-b border-border pb-1 mb-1">
                    <span>BLOCK #{blockchain.length - idx}</span>
                    <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-500">Hash: </span>
                    <span className="text-primary font-bold">{block.block_hash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-500">Prev: </span>
                    <span className="text-gray-400">{block.prev_hash}</span>
                  </div>
                  {idx < blockchain.length - 1 && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-4 border-l border-primary/25 z-20"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
