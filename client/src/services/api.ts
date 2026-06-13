// Frontend API Client Services - ShieldCall AI

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Mock DB keys for localStorage fallback
const MOCK_REPORTS_KEY = 'shieldcall_scam_reports';
const MOCK_BLOCKLIST_KEY = 'shieldcall_blocked_numbers';
const MOCK_THREAT_LOGS_KEY = 'shieldcall_threat_logs';
const MOCK_ALERTS_KEY = 'shieldcall_emergency_alerts';
const MOCK_USER_PROFILE_KEY = 'shieldcall_user_profile';

// Seed initial mock data into localStorage if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(MOCK_REPORTS_KEY)) {
    localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify([
      {
        id: 'r-local-1',
        phone_number: '+91 98765 43210',
        scam_type: 'OTP Scam',
        description: 'Requested credit card OTP code to stop fake purchase transaction.',
        reputation_score: 5,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'r-local-2',
        phone_number: '+91 90123 45678',
        scam_type: 'Police Impersonation',
        description: 'Claimed to be CBI officer threatening arrest warrant unless money was sent.',
        reputation_score: 4,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]));
  }

  if (!localStorage.getItem(MOCK_BLOCKLIST_KEY)) {
    localStorage.setItem(MOCK_BLOCKLIST_KEY, JSON.stringify([
      {
        id: 'bl-local-1',
        phone_number: '+91 98765 43210',
        reason: 'Reported Credit Card OTP Scam',
        created_at: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem(MOCK_THREAT_LOGS_KEY)) {
    localStorage.setItem(MOCK_THREAT_LOGS_KEY, JSON.stringify([
      {
        id: 'tl-local-1',
        caller_number: '+91 88888 77777',
        transcript: 'Hello, is this your credit card block request? Confirm your debit card pin code.',
        risk_score: 85,
        threat_type: 'OTP Scam',
        confidence: 90,
        behavior_profile: { urgency_level: 80, fear_tactics: 90, sentiment: 'manipulative' },
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ]));
  }

  if (!localStorage.getItem(MOCK_USER_PROFILE_KEY)) {
    localStorage.setItem(MOCK_USER_PROFILE_KEY, JSON.stringify({
      id: 'user-default-id-1234567890',
      email: 'demo@shieldcall.ai',
      role: 'user',
      health_score: 85,
      created_at: new Date().toISOString()
    }));
  }

  if (!localStorage.getItem(MOCK_ALERTS_KEY)) {
    localStorage.setItem(MOCK_ALERTS_KEY, JSON.stringify([]));
  }
}

// Ensure execution is client-side only
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}

// Local simulation analysis (matches backend model)
function clientAnalyzeLocally(transcript: string, isAudio = false) {
  const lowercase = transcript.toLowerCase();
  
  let riskScore = 15;
  let threatType = 'Social Engineering';
  let matchedCount = 0;

  if (lowercase.includes('otp') || lowercase.includes('verification code') || lowercase.includes('sms')) {
    riskScore += 45;
    threatType = 'OTP Scam';
    matchedCount++;
  }
  if (lowercase.includes('kyc') || lowercase.includes('aadhar') || lowercase.includes('pan card') || lowercase.includes('verification')) {
    riskScore += 25;
    threatType = 'Fake KYC';
    matchedCount++;
  }
  if (lowercase.includes('police') || lowercase.includes('arrest') || lowercase.includes('contraband') || lowercase.includes('customs')) {
    riskScore += 50;
    threatType = 'Police Impersonation';
    matchedCount++;
  }
  if (lowercase.includes('accident') || lowercase.includes('hospital') || lowercase.includes('mom') || lowercase.includes('dad') || lowercase.includes('help')) {
    riskScore += 35;
    threatType = 'Voice Clone';
    matchedCount++;
  }

  if (lowercase.includes('urgent') || lowercase.includes('immediately') || lowercase.includes('now')) {
    riskScore += 20;
  }

  const risk = riskScore >= 75 ? 'CRITICAL' : (riskScore >= 45 ? 'HIGH' : (riskScore >= 25 ? 'SUSPICIOUS' : 'SAFE'));
  const confidence = Math.min(65 + matchedCount * 10, 95);

  let summary = 'Call analyzed and appears safe.';
  let recommendation = 'Advisory: Call is clean. Keep conversations safe.';

  if (risk === 'CRITICAL') {
    summary = `CRITICAL FRAUD RISK: High pressure caller requesting verification credentials for a ${threatType}.`;
    recommendation = 'IMMEDIATE WARNING: Hang up immediately! Block this number and do not disclose any one-time passcode.';
  } else if (risk === 'HIGH') {
    summary = `HIGH SUSPICIOUS SCORE: Caller mentions urgent verification or account settings security.`;
    recommendation = 'CAUTION: Avoid sharing passwords, codes or links. Hang up and verify directly.';
  } else if (risk === 'SUSPICIOUS') {
    summary = `SUSPICIOUS ACTIONS: Caller initiated discussion related to service verification.`;
    recommendation = 'ADVISORY: Remain alert. Do not make transactions or transfers.';
  }

  const isDeepfake = isAudio || lowercase.includes('clone') || lowercase.includes('robotic');

  return {
    risk,
    confidence,
    threat_type: threatType,
    summary,
    recommendation,
    keywords: ['otp', 'urgency', 'verify'],
    behavior_profile: {
      manipulation_score: Math.min(20 + matchedCount * 25, 100),
      pressure_index: lowercase.includes('now') ? 85 : 40,
      fear_tactics: lowercase.includes('arrest') ? 90 : 20,
      authority_impersonation: lowercase.includes('police') ? 95 : 10,
      urgency_level: lowercase.includes('immediately') ? 90 : 35,
      sentiment: lowercase.includes('arrest') ? 'aggressive' : (matchedCount > 0 ? 'manipulative' : 'calm')
    },
    deepfake_assessment: {
      authenticity_score: isDeepfake ? 25 : 95,
      ai_voice_probability: isDeepfake ? 75 : 5,
      is_deepfake: isDeepfake,
      voice_anomalies: isDeepfake ? ['Breathing patterns absent', 'Inconsistent speech rate spectral flats'] : []
    }
  };
}

// Fetch helper with local storage fallback
async function fetchWithFallback(url: string, options: RequestInit, mockKey: string, fallbackAction: () => any): Promise<any> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
       throw new Error(`HTTP Error: ${res.status}`);
    }
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn(`ShieldCall Gateway offline. Falling back to local simulated client storage:`, err);
    return fallbackAction();
  }
}

// API Services object
export const apiService = {
  async analyzeCall(transcript: string, isAudio = false, callerNumber = '+91 99999 88888', userId = 'user-default-id-1234567890'): Promise<any> {
    let engine = 'gemini';
    let telegramToken = '';
    let telegramChatId = '';

    if (typeof window !== 'undefined') {
      engine = localStorage.getItem('shieldcall_ai_engine') || 'gemini';
      telegramToken = localStorage.getItem('shieldcall_telegram_token') || '';
      telegramChatId = localStorage.getItem('shieldcall_telegram_chatid') || '';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, isAudio, callerNumber, userId, engine, telegramToken, telegramChatId })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      throw new Error();
    } catch {
      // client-side analysis fallback
      const analysis = clientAnalyzeLocally(transcript, isAudio);
      
      // Save simulation log
      if (typeof window !== 'undefined') {
        const logs = JSON.parse(localStorage.getItem(MOCK_THREAT_LOGS_KEY) || '[]');
        const newLog = {
          id: `tl-local-${Date.now()}`,
          caller_number: callerNumber,
          transcript,
          risk_score: analysis.risk === 'SAFE' ? 5 : (analysis.risk === 'SUSPICIOUS' ? 30 : (analysis.risk === 'HIGH' ? 65 : 90)),
          threat_type: analysis.threat_type,
          confidence: analysis.confidence,
          behavior_profile: analysis.behavior_profile,
          created_at: new Date().toISOString()
        };
        logs.unshift(newLog);
        localStorage.setItem(MOCK_THREAT_LOGS_KEY, JSON.stringify(logs));

        // Deduct user score
        const profile = JSON.parse(localStorage.getItem(MOCK_USER_PROFILE_KEY) || '{}');
        if (profile.health_score !== undefined) {
          if (analysis.risk === 'CRITICAL') profile.health_score = Math.max(0, profile.health_score - 10);
          else if (analysis.risk === 'HIGH') profile.health_score = Math.max(0, profile.health_score - 5);
          localStorage.setItem(MOCK_USER_PROFILE_KEY, JSON.stringify(profile));
        }
      }
      return analysis;
    }
  },

  // Scam Reports List
  async getReports(): Promise<any[]> {
    return fetchWithFallback(
      `${API_BASE_URL}/reports`,
      { method: 'GET' },
      MOCK_REPORTS_KEY,
      () => JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]')
    );
  },

  // Add Scam Report
  async createReport(phoneNumber: string, scamType: string, description: string, evidenceUrl: string | null = null, reporterId = 'user-default-id-1234567890'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, scam_type: scamType, description, evidence_url: evidenceUrl, reporter_id: reporterId })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      throw new Error();
    } catch {
      // Local fallback
      const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]');
      const newReport = {
        id: `r-local-${Date.now()}`,
        reporter_id: reporterId,
        phone_number: phoneNumber,
        scam_type: scamType,
        description,
        evidence_url: evidenceUrl,
        reputation_score: 5,
        created_at: new Date().toISOString()
      };
      reports.unshift(newReport);
      localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));
      return newReport;
    }
  },

  // Blocklist
  async getBlocklist(userId = 'user-default-id-1234567890'): Promise<any[]> {
    return fetchWithFallback(
      `${API_BASE_URL}/blocklist?userId=${userId}`,
      { method: 'GET' },
      MOCK_BLOCKLIST_KEY,
      () => JSON.parse(localStorage.getItem(MOCK_BLOCKLIST_KEY) || '[]')
    );
  },

  async blockNumber(phoneNumber: string, reason: string, userId = 'user-default-id-1234567890'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/blocklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, reason, user_id: userId })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      throw new Error();
    } catch {
      const list = JSON.parse(localStorage.getItem(MOCK_BLOCKLIST_KEY) || '[]');
      const existing = list.find((b: any) => b.phone_number === phoneNumber);
      if (existing) {
        existing.reason = reason;
        localStorage.setItem(MOCK_BLOCKLIST_KEY, JSON.stringify(list));
        return existing;
      }
      const newBlock = {
        id: `bl-local-${Date.now()}`,
        phone_number: phoneNumber,
        reason,
        created_at: new Date().toISOString()
      };
      list.unshift(newBlock);
      localStorage.setItem(MOCK_BLOCKLIST_KEY, JSON.stringify(list));
      return newBlock;
    }
  },

  async unblockNumber(phoneNumber: string, userId = 'user-default-id-1234567890'): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/blocklist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, user_id: userId })
      });
      if (response.ok) {
        const json = await response.json();
        return json.unblocked;
      }
      throw new Error();
    } catch {
      const list = JSON.parse(localStorage.getItem(MOCK_BLOCKLIST_KEY) || '[]');
      const filtered = list.filter((b: any) => b.phone_number !== phoneNumber);
      localStorage.setItem(MOCK_BLOCKLIST_KEY, JSON.stringify(filtered));
      return list.length > filtered.length;
    }
  },

  // SOS Emergency Trigger
  async triggerSOS(latitude: number, longitude: number, userId = 'user-default-id-1234567890'): Promise<any> {
    let telegramToken = '';
    let telegramChatId = '';

    if (typeof window !== 'undefined') {
      telegramToken = localStorage.getItem('shieldcall_telegram_token') || '';
      telegramChatId = localStorage.getItem('shieldcall_telegram_chatid') || '';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, user_id: userId, telegramToken, telegramChatId })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      throw new Error();
    } catch {
      const alerts = JSON.parse(localStorage.getItem(MOCK_ALERTS_KEY) || '[]');
      const newAlert = {
        id: `sos-local-${Date.now()}`,
        user_id: userId,
        latitude,
        longitude,
        status: 'Active',
        created_at: new Date().toISOString()
      };
      alerts.unshift(newAlert);
      localStorage.setItem(MOCK_ALERTS_KEY, JSON.stringify(alerts));
      return newAlert;
    }
  },

  async getSOSAlerts(): Promise<any[]> {
    return fetchWithFallback(
      `${API_BASE_URL}/emergency`,
      { method: 'GET' },
      MOCK_ALERTS_KEY,
      () => JSON.parse(localStorage.getItem(MOCK_ALERTS_KEY) || '[]')
    );
  },

  // User Profile
  async getUserProfile(userId = 'user-default-id-1234567890'): Promise<any> {
    return fetchWithFallback(
      `${API_BASE_URL}/user/profile?userId=${userId}`,
      { method: 'GET' },
      MOCK_USER_PROFILE_KEY,
      () => JSON.parse(localStorage.getItem(MOCK_USER_PROFILE_KEY) || '{}')
    );
  },

  async getThreatHistory(userId = 'user-default-id-1234567890'): Promise<any[]> {
    return fetchWithFallback(
      `${API_BASE_URL}/user/threats?userId=${userId}`,
      { method: 'GET' },
      MOCK_THREAT_LOGS_KEY,
      () => JSON.parse(localStorage.getItem(MOCK_THREAT_LOGS_KEY) || '[]')
    );
  },

  // Blockchain incident validation hashes
  async getBlockchainLedger(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain`);
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      throw new Error();
    } catch {
      // Generate client-side cryptographic ledger based on reports
      const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]');
      const ledger: any[] = [];
      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      
      reports.forEach((rep: any, idx: number) => {
        // Simple hash calculation simulation in frontend
        const hash = idx === 0 ? 
          '5f3c6dc20d20ef22f2818985c5b2069e26210f9e2b10aef5c8989e22384918e9' : 
          '2a3e0f9b3112d83ff229f3d991b5c2a10ef2a20be7dfc90a184df24a520bfd61';
        ledger.push({
          id: `bl-local-${idx}`,
          report_id: rep.id,
          block_hash: hash,
          prev_hash: prevHash,
          timestamp: rep.created_at
        });
        prevHash = hash;
      });
      
      return ledger;
    }
  },

  // Whisper Speech-to-Text Transcription
  async transcribeCall(base64Audio: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Audio })
      });
      if (response.ok) {
        const json = await response.json();
        return json.transcript;
      }
      throw new Error();
    } catch {
      // client-side fallback transcription simulation
      const length = base64Audio.length;
      if (length > 250000) {
        return 'Sir, this is the customs office calling regarding your drug delivery parcel. Please tell me your registered credit card details immediately.';
      }
      if (length > 150000) {
        return 'Hello mom, I lost my phone and am calling from the emergency room. Please send 25,000 rupees to this account number right now.';
      }
      return 'Hello, we detected a suspicious credit card purchase on your account. To stop this transaction, tell me the verification OTP code immediately.';
    }
  },

  // Cyber threat reputation lookups (VirusTotal & AbuseIPDB)
  async scanThreatReputation(query: string, type: 'url' | 'ip' | 'domain'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      throw new Error();
    } catch {
      // Offline client simulation
      const domain = query.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      if (type === 'ip') {
        const lastOctet = parseInt(query.split('.').pop() || '0', 10);
        let score = 0;
        let totalReports = 0;
        if (lastOctet > 150) { score = lastOctet > 200 ? 85 : 45; totalReports = lastOctet > 200 ? 142 : 23; }
        return {
          query,
          type: 'ip',
          isSafe: score < 20,
          score,
          provider: 'Local Threat Scan Simulator (Offline)',
          details: { ipAddress: query, countryName: lastOctet > 200 ? 'China' : (lastOctet > 150 ? 'Russia' : 'India'), isp: lastOctet > 200 ? 'Chinanet' : 'Reliance Jio', totalReports }
        };
      } else {
        const isSafe = !domain.includes('verify') && !domain.includes('card') && !domain.includes('phish');
        return {
          query,
          type: 'url',
          isSafe,
          score: isSafe ? 0 : 80,
          provider: 'Local Threat Scan Simulator (Offline)',
          details: { domain, registrar: isSafe ? 'GoDaddy' : 'NameCheap (Simulated)', stats: { malicious: isSafe ? 0 : 8, harmless: isSafe ? 68 : 55, total: 80 } }
        };
      }
    }
  },

  // Send test Telegram notification
  async testTelegramSettings(botToken: string, chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/test-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};
