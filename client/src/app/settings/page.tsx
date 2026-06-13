'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldAlert, Sliders, Volume2, Key, HelpCircle, Eye, Info, User, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/services/api';

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  
  // Settings options
  const [liveMonitor, setLiveMonitor] = useState(true);
  const [deepfakeAudit, setDeepfakeAudit] = useState(true);
  const [familyAlerts, setFamilyAlerts] = useState(true);
  
  // Accessibility
  const [textSize, setTextSize] = useState<'standard' | 'large' | 'xl'>('standard');
  const [highContrast, setHighContrast] = useState(false);

  // Profile edits
  const [emailInput, setEmailInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New AI & Telegram Hook states
  const [aiEngine, setAiEngine] = useState('gemini');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const loadProfile = async () => {
    try {
      const userProf = await apiService.getUserProfile();
      setProfile(userProf);
      setEmailInput(userProf.email);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
    if (typeof window !== 'undefined') {
      setAiEngine(localStorage.getItem('shieldcall_ai_engine') || 'gemini');
      setTelegramToken(localStorage.getItem('shieldcall_telegram_token') || '');
      setTelegramChatId(localStorage.getItem('shieldcall_telegram_chatid') || '');
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('shieldcall_ai_engine', aiEngine);
      localStorage.setItem('shieldcall_telegram_token', telegramToken);
      localStorage.setItem('shieldcall_telegram_chatid', telegramChatId);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      alert('Please fill out both Telegram Token and Chat ID first!');
      return;
    }
    setTelegramTestStatus('testing');
    const success = await apiService.testTelegramSettings(telegramToken, telegramChatId);
    if (success) {
      setTelegramTestStatus('success');
    } else {
      setTelegramTestStatus('failed');
    }
    setTimeout(() => setTelegramTestStatus('idle'), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-6 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          System Settings & Preferences
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Configure security modules, accessibility overrides, and API integration options.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Core Security Controls */}
        <div className="glass-panel p-6 rounded-xl border-border space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-border pb-3">
            <Sliders className="h-4.5 w-4.5 text-primary" />
            Active Security Controls
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Live Transcript Analysis</p>
                <p className="text-[10px] text-gray-500">Scan active lines and translate voice to text.</p>
              </div>
              <input
                type="checkbox"
                checked={liveMonitor}
                onChange={(e) => setLiveMonitor(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring bg-background"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Deepfake Voice Diagnostics</p>
                <p className="text-[10px] text-gray-500">Inspect call recordings for synthesizer signatures.</p>
              </div>
              <input
                type="checkbox"
                checked={deepfakeAudit}
                onChange={(e) => setDeepfakeAudit(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring bg-background"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Family Notification Hook</p>
                <p className="text-[10px] text-gray-500">Trigger warnings to safety network on critical threat triggers.</p>
              </div>
              <input
                type="checkbox"
                checked={familyAlerts}
                onChange={(e) => setFamilyAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring bg-background"
              />
            </div>
          </div>
        </div>

        {/* Accessibility Panel (For Elderly / Emergency mode) */}
        <div className="glass-panel p-6 rounded-xl border-border space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-border pb-3">
            <Eye className="h-4.5 w-4.5 text-primary" />
            Accessibility Preferences (Elderly Mode)
          </h3>

          <div className="space-y-4">
            {/* Text size selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-xs font-bold text-white">System Font Scaling</p>
                <p className="text-[10px] text-gray-500">Adjust layout text sizing for clear readability.</p>
              </div>
              <div className="flex gap-2">
                {(['standard', 'large', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTextSize(size)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all ${
                      textSize === size
                        ? 'bg-primary text-black border-primary'
                        : 'bg-background/40 text-gray-400 border-border hover:border-border'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">High Contrast Interfaces</p>
                <p className="text-[10px] text-gray-500">Increase visual difference between background panels.</p>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring bg-background"
              />
            </div>
          </div>
        </div>

        {/* AI Model Analysis Engine */}
        <div className="glass-panel p-6 rounded-xl border-border space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-border pb-3">
            <Key className="h-4.5 w-4.5 text-primary" />
            AI Threat Analysis Engine
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white">Select Primary Model Engine:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'gemini', name: 'Gemini 1.5 (Cloud)', desc: 'Full AI capabilities' },
                  { id: 'ollama', name: 'Ollama Llama 3 (Local)', desc: 'Run offline locally' },
                  { id: 'local', name: 'Classic NLP Heuristics', desc: 'Lightweight rule matching' }
                ].map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => setAiEngine(engine.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      aiEngine === engine.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background/30 text-gray-400 hover:border-primary/20'
                    }`}
                  >
                    <span className="text-xs font-bold">{engine.name}</span>
                    <span className="text-[9px] text-gray-500">{engine.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Alerts Config */}
        <div className="glass-panel p-6 rounded-xl border-border space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-border pb-3">
            <ShieldAlert className="h-4.5 w-4.5 text-primary" />
            Telegram Alert Notifications Hook
          </h3>

          <div className="space-y-4">
            <p className="text-[10px] text-gray-400">
              Forward critical threat alerts and emergency SOS coordinates instantly to your Telegram channel.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Telegram Bot Token</label>
                <input
                  type="password"
                  placeholder="e.g. 123456:ABC-def..."
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Telegram Chat ID / Channel</label>
                <input
                  type="text"
                  placeholder="e.g. -10012345678"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-start items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={telegramTestStatus === 'testing'}
                className="px-4 py-1.5 bg-background border border-border hover:border-primary/30 rounded text-[10px] text-gray-300 font-bold transition-all disabled:opacity-50"
              >
                {telegramTestStatus === 'testing' ? 'Sending...' : 'Send Test Notification'}
              </button>
              {telegramTestStatus === 'success' && (
                <span className="text-[10px] text-emerald-400 font-bold">✓ Test message delivered successfully!</span>
              )}
              {telegramTestStatus === 'failed' && (
                <span className="text-[10px] text-rose-400 font-bold">✗ Failed to deliver test message. Check keys.</span>
              )}
            </div>
          </div>
        </div>

        {/* Deployment Metadata Indicators */}
        <div className="glass-panel p-6 rounded-xl border-border space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-border pb-3">
            <Info className="h-4.5 w-4.5 text-primary" />
            System Deployment status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-background rounded border border-border/60 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Supabase DB Link</span>
              <p className="text-white truncate">{process.env.NEXT_PUBLIC_DATABASE_URL ? 'Linked (Postgres active)' : 'Mock local storage mode fallback active'}</p>
            </div>

            <div className="p-3 bg-background rounded border border-border/60 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Gemini AI Engine</span>
              <p className="text-white">{process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'Active (Gemini 1.5 API)' : 'Mock local NLP processor active'}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 items-center">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-4.5 w-4.5" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary text-black font-bold text-xs rounded-lg transition-all"
          >
            Apply Configurations
          </button>
        </div>

      </form>
    </div>
  );
}
