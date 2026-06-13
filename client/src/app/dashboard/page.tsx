'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, PhoneCall, PhoneOff, AlertCircle, AlertTriangle, ShieldCheck, 
  Trash2, UserMinus, ShieldX, UserCheck, Flame, Radio, Activity, Lock, Fingerprint,
  Upload, FileAudio, RefreshCw
} from 'lucide-react';
import { apiService, SOCKET_URL } from '@/services/api';

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Call simulation state
  const [activeCall, setActiveCall] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('otp');
  const [callerNumber, setCallerNumber] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('Line idle. Select scenario and start call.');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(15));
  const [analysis, setAnalysis] = useState<any>(null);

  // File upload state
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'reading' | 'transcribing' | 'analyzing' | 'done' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Lists state
  const [threatHistory, setThreatHistory] = useState<any[]>([]);
  const [blocklist, setBlocklist] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form input
  const [blockNumberInput, setBlockNumberInput] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState('');

  const socketRef = useRef<Socket | null>(null);

  const resetUpload = () => {
    setActiveCall(false);
    setUploadStatus('idle');
    setUploadedFileName('');
    setCallerNumber('');
    setScenarioName('');
    setWaveform(Array(20).fill(15));
    setAnalysis(null);
    setCurrentSubtitle('Line idle. Select scenario or upload call.');
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (.mp3, .wav, etc.)');
      return;
    }

    setUploadedFileName(file.name);
    setUploadStatus('reading');
    setActiveCall(true);
    setCurrentSubtitle(`Reading audio file: ${file.name}...`);
    setWaveform(Array(20).fill(25));
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const base64Data = result.split(',')[1] || result;

        setUploadStatus('transcribing');
        setCurrentSubtitle('Transcribing audio using Whisper STT...');
        
        const interval = setInterval(() => {
          setWaveform(Array.from({ length: 20 }, () => Math.floor(Math.random() * 60) + 15));
        }, 300);

        const transcript = await apiService.transcribeCall(base64Data);
        clearInterval(interval);
        
        setUploadStatus('analyzing');
        setCurrentSubtitle('Analyzing speech transcript for security threats...');
        setAccumulatedTranscript(transcript);

        const threatAnalysis = await apiService.analyzeCall(transcript, true, '+91 UPLOADED FILE');

        setAnalysis(threatAnalysis);
        setCallerNumber('+91 UPLOADED FILE');
        setScenarioName(`Audio Scan: ${file.name}`);
        setIsAudioMode(true);
        setCurrentSubtitle(`Whisper transcript: "${transcript}"`);
        setUploadStatus('done');

        // Animate the final waveform based on severity
        const risk = threatAnalysis.risk;
        if (risk === 'CRITICAL' || risk === 'HIGH') {
          setWaveform(Array.from({ length: 20 }, () => Math.floor(Math.random() * 40) + 40));
        } else {
          setWaveform(Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 10));
        }

        loadDashboardData();
      } catch (err) {
        console.error(err);
        setUploadStatus('error');
        setCurrentSubtitle('Threat analysis failed. Please verify API configurations.');
        setActiveCall(false);
      }
    };

    reader.onerror = () => {
      setUploadStatus('error');
      setCurrentSubtitle('Error reading audio file.');
      setActiveCall(false);
    };

    reader.readAsDataURL(file);
  };

  const loadDashboardData = async () => {
    try {
      const userProf = await apiService.getUserProfile();
      setProfile(userProf);

      const history = await apiService.getThreatHistory();
      setThreatHistory(history);

      const blocked = await apiService.getBlocklist();
      setBlocklist(blocked);
      
      setLoadingHistory(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Initialize socket and load data
  useEffect(() => {
    // Connect to Socket.io
    const socketIo = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    socketRef.current = socketIo;
    setSocket(socketIo);

    // Setup socket listeners
    socketIo.on('connect', () => {
      console.log('Socket.io connected to security server');
    });

    socketIo.on('simulation_started', (data) => {
      setCallerNumber(data.callerNumber);
      setScenarioName(data.scenarioName);
      setIsAudioMode(data.isAudio);
      setAccumulatedTranscript('');
      setAnalysis(null);
    });

    socketIo.on('call_packet', (data) => {
      setCurrentSubtitle(data.subtitle);
      setAccumulatedTranscript(data.fullTranscript);
      setWaveform(data.waveform);
      setAnalysis(data.analysis);
    });

    socketIo.on('simulation_ended', () => {
      setActiveCall(false);
      setCurrentSubtitle('Simulation complete. Call disconnected.');
      // Refresh statistics
      loadDashboardData();
    });

    socketIo.on('simulation_stopped', () => {
      setActiveCall(false);
      setCurrentSubtitle('Call terminated by user safety protocols.');
      loadDashboardData();
    });

    loadDashboardData();

    return () => {
      socketIo.disconnect();
    };
  }, []);

  // Start real-time call simulation
  const startSimulation = () => {
    if (!socket) return;
    setActiveCall(true);
    setCurrentSubtitle('Establishing secure telemetry connection...');
    setWaveform(Array(20).fill(15));
    setAnalysis(null);
    
    // Trigger socket simulation
    socket.emit('start_call_simulation', { scenarioId: selectedScenario });
  };

  // Disconnect call manually
  const terminateCall = () => {
    if (isUploadMode) {
      resetUpload();
    } else {
      if (!socket) return;
      socket.emit('stop_call_simulation');
    }
  };

  // Add caller to blocklist
  const handleBlockCaller = async (num: string, reason: string) => {
    if (!num) return;
    await apiService.blockNumber(num, reason);
    loadDashboardData();
    setBlockNumberInput('');
    setBlockReasonInput('');
  };

  const handleUnblock = async (num: string) => {
    await apiService.unblockNumber(num);
    loadDashboardData();
  };

  // Threat severity layout helpers
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-950/40 text-rose-500 border border-rose-500/30 text-glow-red border-glow-red';
      case 'HIGH':
        return 'bg-amber-950/40 text-amber-500 border border-amber-500/30';
      case 'SUSPICIOUS':
        return 'bg-yellow-950/40 text-yellow-500 border border-yellow-500/30';
      default:
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'aggressive': return '😡 Aggressive';
      case 'manipulative': return '🧠 Manipulative';
      case 'stressed': return '😰 Stressed';
      default: return '🟢 Calm';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Threat Operations Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time telemetry feeds, active line monitoring, and deepfake verification.
          </p>
        </div>

        <div className="flex gap-2.5">
          <div className="glass-panel px-3 py-1.5 rounded-lg border-border flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-300">Telemetry Gateway: Connected</span>
          </div>
          {activeCall && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 flex items-center gap-2 text-xs font-semibold animate-pulse">
              <Radio className="h-3.5 w-3.5" />
              <span>LINE ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Call Simulator & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Live Call Simulator Panel */}
          <div className="glass-panel rounded-xl border-border overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-white tracking-wider uppercase flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Live Call Simulation Lab
                  </h2>
                  {!activeCall && (
                    <div className="flex gap-1.5 bg-background/50 border border-border p-1 rounded-md">
                      <button
                        type="button"
                        onClick={() => setIsUploadMode(false)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                          !isUploadMode ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Simulate
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUploadMode(true)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                          isUploadMode ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Upload Audio
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Scenario dropdown selector / Audio uploader */}
                {!activeCall ? (
                  !isUploadMode ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedScenario}
                        onChange={(e) => setSelectedScenario(e.target.value)}
                        className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-ring"
                      >
                        <option value="otp">Banking OTP Scam</option>
                        <option value="police">Fake Arrest Threat</option>
                        <option value="voice_clone">AI Deepfake Voice Clone</option>
                        <option value="lottery">Fake KBC Lottery Prize</option>
                        <option value="safe">Courier BlueDart (Safe)</option>
                      </select>
                      <button
                        onClick={startSimulation}
                        className="px-4 py-1.5 rounded-md bg-primary hover:bg-primary text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        Test Link
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-4 py-1.5 rounded-md bg-secondary hover:bg-secondary/90 text-black font-bold text-xs flex items-center gap-1.5 transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        Upload Call Audio
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )
                ) : (
                  <button
                    onClick={terminateCall}
                    className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
                  >
                    <PhoneOff className="h-3.5 w-3.5" />
                    {isUploadMode ? 'RESET SCAN' : 'TERMINATE'}
                  </button>
                )}
              </div>

              {/* Call Details Display Box */}
              <div className="glass-panel bg-background/60 rounded-xl p-5 border-border space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>caller telemetry</span>
                  <span>{isAudioMode ? 'audio clone scanning: active' : 'text keyword audit: active'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Line Identity</p>
                    <p className="text-lg font-mono font-bold text-white">{callerNumber || '+91 XXXXX XXXXX'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Threat Type</p>
                    <p className="text-sm font-semibold text-primary">{scenarioName || 'Idle'}</p>
                  </div>
                </div>

                {/* Animated Waveform Display */}
                <div className="h-16 flex items-center justify-between gap-1 border-y border-border/60 py-2">
                  {waveform.map((height, i) => (
                    <div
                      key={i}
                      className={`w-2.5 rounded-full transition-all duration-300 ${
                        activeCall 
                          ? (analysis?.risk === 'CRITICAL' || analysis?.risk === 'HIGH' ? 'bg-rose-500' : 'bg-primary') 
                          : 'bg-gray-800'
                      }`}
                      style={{ 
                        height: `${height}%`,
                        opacity: activeCall ? 0.85 : 0.2
                      }}
                    ></div>
                  ))}
                </div>

                {/* Live Caption scrolling transcript */}
                <div className="min-h-12 bg-background p-3 rounded-lg border border-border text-center">
                  <p className={`text-sm tracking-wide ${activeCall ? 'text-primary font-medium' : 'text-gray-600 font-mono text-xs'}`}>
                    {currentSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Profiling & Deepfake gauges */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Psychological Scam Profiler Card */}
              <div className="glass-panel p-6 rounded-xl border-border space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Fingerprint className="h-4.5 w-4.5 text-primary" />
                  Behavior Threat Profile
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Coercive Manipulation</span>
                      <span className="text-white font-semibold">{analysis.behavior_profile.manipulation_score}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${analysis.behavior_profile.manipulation_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Emotional Fear Tactics</span>
                      <span className="text-white font-semibold">{analysis.behavior_profile.fear_tactics}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${analysis.behavior_profile.fear_tactics}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Urgency Level</span>
                      <span className="text-white font-semibold">{analysis.behavior_profile.urgency_level}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${analysis.behavior_profile.urgency_level}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-border pt-3 mt-3">
                    <span className="text-gray-400">Sentiment Output:</span>
                    <span className="text-white font-bold">{getSentimentEmoji(analysis.behavior_profile.sentiment)}</span>
                  </div>
                </div>
              </div>

              {/* Deepfake Audio Gauge Card */}
              <div className="glass-panel p-6 rounded-xl border-border space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Lock className="h-4.5 w-4.5 text-primary" />
                  Voice Authenticity Audit
                </h3>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-gray-500">AI Clone probability</p>
                      <p className={`text-lg font-bold ${analysis.deepfake_assessment.is_deepfake ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {analysis.deepfake_assessment.ai_voice_probability}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Audio Authenticity</p>
                      <p className="text-lg font-bold text-white">
                        {analysis.deepfake_assessment.authenticity_score}%
                      </p>
                    </div>
                  </div>

                  {analysis.deepfake_assessment.is_deepfake && (
                    <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg space-y-1">
                      <p className="text-[11px] font-bold text-rose-500 tracking-wider uppercase">Voice Clone Anomalies Found:</p>
                      <ul className="text-[10px] text-gray-400 list-disc list-inside space-y-0.5">
                        {analysis.deepfake_assessment.voice_anomalies.map((anom: string, index: number) => (
                          <li key={index}>{anom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!analysis.deepfake_assessment.is_deepfake && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Acoustic signature verifies as authentic physical speaker.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Incident Threat History Logs */}
          <div className="glass-panel p-6 rounded-xl border-border space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              Active Incident Logs
            </h3>

            {loadingHistory ? (
              <p className="text-xs text-gray-500">Syncing database log ledger...</p>
            ) : threatHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No threat history registered. Your line is safe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-gray-500 font-semibold">
                      <th className="py-2.5">Caller ID</th>
                      <th className="py-2.5">Classification</th>
                      <th className="py-2.5">Severity</th>
                      <th className="py-2.5">Confidence</th>
                      <th className="py-2.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threatHistory.slice(0, 5).map((log) => (
                      <tr key={log.id} className="border-b border-border/40 hover:bg-gray-900/20 transition-colors">
                        <td className="py-2.5 font-mono text-white font-medium">{log.caller_number}</td>
                        <td className="py-2.5 text-gray-400">{log.threat_type}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.risk_score >= 75 ? 'bg-rose-950/40 text-rose-500 border border-rose-500/20' :
                            log.risk_score >= 45 ? 'bg-amber-950/40 text-amber-500 border border-amber-500/20' :
                            log.risk_score >= 20 ? 'bg-yellow-950/40 text-yellow-500 border border-yellow-500/20' :
                            'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {log.risk_score >= 75 ? 'CRITICAL' : (log.risk_score >= 45 ? 'HIGH' : (log.risk_score >= 20 ? 'SUSPICIOUS' : 'SAFE'))}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500">{log.confidence}%</td>
                        <td className="py-2.5 text-right text-gray-600">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Threat Assessment & Blocklist (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI Decision Card */}
          <div className="glass-panel p-6 rounded-xl border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-primary" />
              AI Threat Assessment
            </h3>

            {!analysis && (
              <div className="py-8 text-center text-xs text-gray-500 space-y-2">
                <ShieldCheck className="h-10 w-10 text-gray-700 mx-auto" />
                <p>Line is idle. No threat analytics generated.</p>
              </div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Risk score pill */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Scam Severity Indicator:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${getRiskBadge(analysis.risk)}`}>
                    {analysis.risk} ({analysis.confidence}% Confidence)
                  </span>
                </div>

                {/* AI Summary */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Threat Intel Summary:</p>
                  <p className="text-sm text-white font-medium bg-background p-3 rounded-lg border border-border">
                    {analysis.summary}
                  </p>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Recommended Action:</p>
                  <p className="text-xs text-amber-400 font-semibold bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg">
                    {analysis.recommendation}
                  </p>
                </div>

                {/* Block option */}
                {(analysis.risk === 'CRITICAL' || analysis.risk === 'HIGH') && (
                  <button
                    onClick={() => handleBlockCaller(callerNumber, `AI flagged as ${analysis.threat_type}`)}
                    className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-500/20"
                  >
                    <ShieldX className="h-4 w-4" />
                    Block & Blacklist Caller
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Blocklist Management Card */}
          <div className="glass-panel p-6 rounded-xl border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <ShieldX className="h-4.5 w-4.5 text-rose-500" />
              Secure Blocklist
            </h3>

            {/* Quick block input */}
            <div className="space-y-2.5 border-b border-gray-950 pb-4">
              <input
                type="text"
                value={blockNumberInput}
                onChange={(e) => setBlockNumberInput(e.target.value)}
                placeholder="Phone Number (e.g. +91 99999...)"
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <input
                type="text"
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                placeholder="Block Reason (e.g. OTP Scam)"
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <button
                onClick={() => handleBlockCaller(blockNumberInput, blockReasonInput)}
                className="w-full py-1.5 rounded bg-gray-900 hover:bg-gray-800 border border-border hover:border-border text-xs font-bold text-white transition-colors"
              >
                Block Number
              </button>
            </div>

            {/* Block list */}
            {blocklist.length === 0 ? (
              <p className="text-center py-4 text-xs text-gray-600">Your blocklist is empty.</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {blocklist.map((block) => (
                  <div key={block.id} className="flex justify-between items-center bg-background/60 p-2.5 rounded border border-border/60 text-xs">
                    <div>
                      <p className="font-mono text-white font-bold">{block.phone_number}</p>
                      <p className="text-[10px] text-gray-500">{block.reason}</p>
                    </div>
                    <button
                      onClick={() => handleUnblock(block.phone_number)}
                      className="text-gray-500 hover:text-rose-500 p-1 hover:bg-gray-900 rounded transition-colors"
                      title="Unblock number"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
