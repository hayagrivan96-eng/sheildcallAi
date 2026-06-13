'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Play, CheckCircle2, AlertOctagon, HelpCircle, Activity, Heart, Award, Lock } from 'lucide-react';

export default function Home() {
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Quick landing page interactive sandbox analyzer
  const handleTestDemo = () => {
    if (!demoInput.trim()) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      const lowercase = demoInput.toLowerCase();
      let risk: 'SAFE' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL' = 'SAFE';
      let type = 'Safe Conversation';
      let score = 5;
      let rec = 'No warning actions required.';

      if (lowercase.includes('otp') || lowercase.includes('verification')) {
        risk = 'CRITICAL';
        type = 'OTP Banking Scam';
        score = 94;
        rec = 'Terminate the call immediately! Block number and report.';
      } else if (lowercase.includes('police') || lowercase.includes('arrest') || lowercase.includes('cbi')) {
        risk = 'CRITICAL';
        type = 'Authority Impersonation';
        score = 88;
        rec = 'Hang up. Security warning: Police officers never request transfers via phone.';
      } else if (lowercase.includes('winner') || lowercase.includes('lottery') || lowercase.includes('prize')) {
        risk = 'HIGH';
        type = 'Lottery Fraud';
        score = 72;
        rec = 'Caution: Disregard claims of unexpected financial rewards.';
      } else if (lowercase.includes('accident') || lowercase.includes('hospital') || lowercase.includes('money')) {
        risk = 'HIGH';
        type = 'AI Voice Clone Scam';
        score = 82;
        rec = 'Verify caller identity. Call your relative back on their known official number.';
      } else if (lowercase.includes('upi') || lowercase.includes('bank account') || lowercase.includes('block')) {
        risk = 'SUSPICIOUS';
        type = 'Financial Phishing';
        score = 48;
        rec = 'Do not click links or reveal card credentials.';
      }

      setDemoResult({ risk, type, score, rec });
      setAnalyzing(false);
    }, 1200);
  };

  const loadPreset = (presetText: string) => {
    setDemoInput(presetText);
    setDemoResult(null);
  };

  return (
    <div className="relative min-h-screen">
      {/* Decorative gradients */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-32 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary"
              >
                <Lock className="h-3 w-3" />
                <span>Enterprise SaaS Protection Platform</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
              >
                AI-Powered Protection Against{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary text-glow-cyan">
                  Scam Calls
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0"
              >
                ShieldCall AI analyzes suspicious transcripts, caller patterns, and deepfake audio anomalies in real time. Safeguard yourself, your family, and your business before fraud happens.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4"
              >
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-black bg-primary hover:bg-primary hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Enter Cyber Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#sandbox"
                  className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold border border-border hover:border-gray-500 hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Test Demo Sandbox
                  <Play className="h-4 w-4" />
                </Link>
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-4 border-t border-border pt-8 mt-8 text-left max-w-lg mx-auto lg:mx-0"
              >
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">1.2M+</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Threats Blocked</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">99.8%</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">AI Accuracy</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">&lt; 1.5s</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Analysis Speed</p>
                </div>
              </motion.div>
            </div>

            {/* Right Interactive Orb/Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative h-80 w-80 sm:h-96 sm:w-96 flex items-center justify-center"
              >
                {/* Holographic Shield Layers */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: '20s' }}></div>
                <div className="absolute inset-6 rounded-full border border-purple-500/10 animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-12 rounded-full border border-primary/30 animate-pulse"></div>
                
                {/* Floating Central Core Orb */}
                <div className="floating-orb relative h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-white border border-primary/40 flex flex-col items-center justify-center shadow-lg z-10 p-4 overflow-hidden">
                  <img src="/logo.png" alt="ShieldCall Core Logo" className="w-full h-auto max-h-[85%] object-contain" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Sandbox Section */}
      <section id="sandbox" className="py-16 border-t border-border bg-background/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold">Threat Sandbox Analyzer</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Simulate call conversations below to test the automated scam recognition engine.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-border">
            {/* Presets */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={() => loadPreset('Sir your card net banking account will be suspended immediately. Please tell me the OTP verification code sent to your phone to reverse the lock.')}
                className="text-xs px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 border border-border hover:border-border transition-colors"
              >
                Card OTP Scam
              </button>
              <button
                onClick={() => loadPreset('This is Customs Department Officer. We have confiscated a package of contraband drugs containing your passport detail. Criminal warrant is active.')}
                className="text-xs px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 border border-border hover:border-border transition-colors"
              >
                Narcotics Arrest
              </button>
              <button
                onClick={() => loadPreset('Hey mom, it is me. I am in the emergency room. I lost my phone and need money for medical bills. Please transfer 10,000 right now.')}
                className="text-xs px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 border border-border hover:border-border transition-colors"
              >
                Voice Clone Urgent
              </button>
              <button
                onClick={() => loadPreset('Hello, I am blue dart delivery executive. I have a parcel for you, are you at home in 10 minutes?')}
                className="text-xs px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 border border-border hover:border-border transition-colors"
              >
                Safe Delivery Call
              </button>
            </div>

            {/* Input Box */}
            <div className="space-y-4">
              <textarea
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Enter suspicious transcript text or select a preset above..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none text-white transition-colors placeholder:text-gray-600"
              />
              <button
                onClick={handleTestDemo}
                disabled={analyzing}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary text-black font-bold transition-all disabled:opacity-50"
              >
                {analyzing ? 'Analyzing Intent...' : 'Verify Scam Score'}
              </button>
            </div>

            {/* Results Output */}
            {demoResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border-t border-border pt-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className={`h-5 w-5 ${demoResult.risk === 'CRITICAL' || demoResult.risk === 'HIGH' ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <span className="font-semibold text-sm">Classification: <span className="text-white">{demoResult.type}</span></span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    demoResult.risk === 'CRITICAL' ? 'bg-rose-950/40 text-rose-500 border border-rose-500/30' :
                    demoResult.risk === 'HIGH' ? 'bg-amber-950/40 text-amber-500 border border-amber-500/30' :
                    'bg-emerald-950/40 text-emerald-500 border border-emerald-500/30'
                  }`}>
                    RISK LEVEL: {demoResult.risk} ({demoResult.score}%)
                  </div>
                </div>

                <div className="p-3 bg-background rounded-lg border border-border text-sm space-y-2">
                  <p className="text-gray-400 font-medium">Mitigation Protocol:</p>
                  <p className="text-white">{demoResult.rec}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Comprehensive Threat Shield</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Six advanced security models deployed concurrently to block cyber fraud at every vector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
            <Activity className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Speech Recognition AI</h3>
            <p className="text-sm text-gray-400">
              Converts call voice stream into secure text and identifies scam markers using advanced NLP models.
            </p>
          </div>
          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
            <Shield className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Deepfake Voice Scanner</h3>
            <p className="text-sm text-gray-400">
              Scans audio files for synthetic frequencies, breathing inconsistencies, and phase disruption.
            </p>
          </div>
          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
            <AlertOctagon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">SOS Panic Emergency</h3>
            <p className="text-sm text-gray-400">
              One-tap active panic mode instantly alerting designated contacts with real-time location.
            </p>
          </div>
          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
            <Lock className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Immutable Blockchain Log</h3>
            <p className="text-sm text-gray-400">
              Saves incident records to a tamper-proof cryptographic ledger for future forensic validation.
            </p>
          </div>
          {/* Card 5 */}
          <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
            <Award className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Academy & Quizzes</h3>
            <p className="text-sm text-gray-400">
              Earn XP and unlock security achievement badges by learning to spot fraud patterns.
            </p>
          </div>
          {/* Card 6 */}
          <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
            <Heart className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Family Cyber Network</h3>
            <p className="text-sm text-gray-400">
              Link profiles of elderly relatives or children to receive instant alerts if they answer a high-risk call.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 border-t border-border bg-background/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Flexible Protection Plans</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose the security coverage level appropriate for you or your company.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-border">
              <div>
                <h3 className="text-lg font-bold">Standard Shield</h3>
                <p className="text-xs text-gray-500 mt-1">Individual protection</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-gray-500 text-xs"> / forever</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 10 Free AI Scans / Month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Offline Keyword Checker</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Basic Blocklist</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-border hover:border-border transition-colors text-center text-sm font-bold text-white">
                Get Started
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-primary/30 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-black text-xs font-bold">
                RECOMMENDED
              </span>
              <div>
                <h3 className="text-lg font-bold">Cyber Guardian Pro</h3>
                <p className="text-xs text-gray-500 mt-1">Advanced family safety</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">$9</span>
                  <span className="text-gray-500 text-xs"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Unlimited AI Call Auditing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Deepfake Audio Detection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Family Safety Network alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Blockchain-backed Audit Ledger</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 py-2 rounded-lg bg-primary hover:bg-primary text-black text-center text-sm font-bold transition-all">
                Upgrade to Pro
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-purple-500/30">
              <div>
                <h3 className="text-lg font-bold">Enterprise Guard</h3>
                <p className="text-xs text-gray-500 mt-1">Corporate operations</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">$49</span>
                  <span className="text-gray-500 text-xs"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> API Integration Gateway</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Dedicated Admin Center</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Sentry & Monitoring console</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Multi-region scam heat maps</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-border hover:border-border transition-colors text-center text-sm font-bold text-white">
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-lg border-border">
            <h4 className="font-bold mb-2 text-white text-base">How does ShieldCall AI identify scams in real time?</h4>
            <p className="text-sm text-gray-400">
              Our service converts real-time caller voices into text using simulated speech recognition, then passes the transcript to a specialized NLP analysis engine (like Gemini) to check for coercive psychological patterns, key words (like OTP and KYC), and authority intimidation methods.
            </p>
          </div>
          <div className="glass-panel p-5 rounded-lg border-border">
            <h4 className="font-bold mb-2 text-white text-base">What is the Deepfake Voice Detector?</h4>
            <p className="text-sm text-gray-400">
              Voice cloning technology is increasingly used in scams. Our deepfake analysis engine inspects uploaded audio signals for robotic synthesizer patterns, phase disruption anomalies, and missing natural breathing signatures to determine if the speaker is an AI-generated clone.
            </p>
          </div>
          <div className="glass-panel p-5 rounded-lg border-border">
            <h4 className="font-bold mb-2 text-white text-base">What is the Blockchain Incident Ledger?</h4>
            <p className="text-sm text-gray-400">
              When you submit a scam report to our community database, the incident is logged in a simulated cryptographic blockchain ledger. Every report gets assigned a block hash cryptographically linked to the previous block. This ensures threat records cannot be edited or tampered with.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
