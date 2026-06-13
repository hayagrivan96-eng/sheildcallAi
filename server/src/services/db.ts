import { Pool } from 'pg';
import crypto from 'crypto';

// Types matching database structures
export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  health_score: number;
  created_at: Date;
}

export interface ScamReport {
  id: string;
  reporter_id: string | null;
  phone_number: string;
  scam_type: string;
  description: string;
  evidence_url: string | null;
  reputation_score: number;
  created_at: Date;
}

export interface ThreatLog {
  id: string;
  user_id: string;
  caller_number: string;
  transcript: string;
  risk_score: number;
  threat_type: string;
  confidence: number;
  behavior_profile: any;
  created_at: Date;
}

export interface BlockedNumber {
  id: string;
  user_id: string;
  phone_number: string;
  reason: string;
  created_at: Date;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  status: 'Active' | 'Resolved';
  created_at: Date;
}

export interface BlockchainLog {
  id: string;
  report_id: string;
  block_hash: string;
  prev_hash: string;
  timestamp: Date;
}

// Check PostgreSQL configuration
const SUPABASE_DB_URL = process.env.DATABASE_URL || '';
let pool: Pool | null = null;

if (SUPABASE_DB_URL) {
  try {
    pool = new Pool({
      connectionString: SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false }
    });
    console.log('PostgreSQL database pool initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize PG pool, falling back to local memory store:', err);
  }
}

// In-Memory Database store fallbacks
const mockUsers: UserProfile[] = [
  {
    id: 'd3b07384-d113-4ec5-a581-9b16d10f88bb',
    email: 'admin@shieldcall.ai',
    role: 'admin',
    health_score: 95,
    created_at: new Date()
  },
  {
    id: 'user-default-id-1234567890',
    email: 'demo@shieldcall.ai',
    role: 'user',
    health_score: 85,
    created_at: new Date()
  }
];

const mockScamReports: ScamReport[] = [
  {
    id: 'r1',
    reporter_id: 'user-default-id-1234567890',
    phone_number: '+91 98765 43210',
    scam_type: 'OTP Scam',
    description: 'Caller claimed to be from bank and requested SMS OTP verification code.',
    evidence_url: null,
    reputation_score: 5,
    created_at: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: 'r2',
    reporter_id: 'user-default-id-1234567890',
    phone_number: '+91 90123 45678',
    scam_type: 'Police Impersonation',
    description: 'Received threat that a package of illegal substances was sent in my name.',
    evidence_url: null,
    reputation_score: 4,
    created_at: new Date(Date.now() - 3600000 * 5)
  }
];

const mockThreatLogs: ThreatLog[] = [
  {
    id: 't1',
    user_id: 'user-default-id-1234567890',
    caller_number: '+91 88888 77777',
    transcript: 'Hello, I am calling from customs office. We found contraband in your container.',
    risk_score: 85,
    threat_type: 'Police Impersonation',
    confidence: 90,
    behavior_profile: { urgency_level: 80, fear_tactics: 90 },
    created_at: new Date(Date.now() - 3600000 * 24)
  }
];

const mockBlockedNumbers: BlockedNumber[] = [
  {
    id: 'b1',
    user_id: 'user-default-id-1234567890',
    phone_number: '+91 98765 43210',
    reason: 'Reported Bank OTP Fraud',
    created_at: new Date()
  }
];

const mockEmergencyAlerts: EmergencyAlert[] = [];
const mockBlockchainLogs: BlockchainLog[] = [];

// Helper to calculate cryptographic SHA256 hashes for blockchain log simulation
function calculateHash(reportId: string, prevHash: string, timestamp: Date): string {
  const data = `${reportId}-${prevHash}-${timestamp.toISOString()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Initialize block chain log
if (mockScamReports.length > 0) {
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  mockScamReports.forEach((report, index) => {
    const hash = calculateHash(report.id, prevHash, report.created_at);
    mockBlockchainLogs.push({
      id: `bl-${index + 1}`,
      report_id: report.id,
      block_hash: hash,
      prev_hash: prevHash,
      timestamp: report.created_at
    });
    prevHash = hash;
  });
}

// Database Service Implementation with dual mode
export const dbService = {
  // Users Profiles
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM public.users WHERE id = $1', [userId]);
      return rows[0] || null;
    }
    return mockUsers.find(u => u.id === userId) || null;
  },

  async createUserProfile(userId: string, email: string, role = 'user'): Promise<UserProfile> {
    if (pool) {
      const { rows } = await pool.query(
        'INSERT INTO public.users (id, email, role) VALUES ($1, $2, $3) RETURNING *',
        [userId, email, role]
      );
      return rows[0];
    }
    const newUser: UserProfile = { id: userId, email, role: role as any, health_score: 100, created_at: new Date() };
    mockUsers.push(newUser);
    return newUser;
  },

  async updateUserHealthScore(userId: string, change: number): Promise<UserProfile | null> {
    if (pool) {
      const { rows } = await pool.query(
        'UPDATE public.users SET health_score = GREATEST(0, LEAST(100, health_score + $1)) WHERE id = $2 RETURNING *',
        [change, userId]
      );
      return rows[0] || null;
    }
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.health_score = Math.max(0, Math.min(100, user.health_score + change));
      return user;
    }
    return null;
  },

  // Scam Reports
  async getScamReports(): Promise<ScamReport[]> {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM public.scam_reports ORDER BY created_at DESC');
      return rows;
    }
    return [...mockScamReports].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  async createScamReport(reporterId: string | null, phoneNumber: string, scamType: string, description: string, evidenceUrl: string | null): Promise<ScamReport> {
    const reportId = crypto.randomUUID();
    const createdAt = new Date();
    
    if (pool) {
      const { rows } = await pool.query(
        'INSERT INTO public.scam_reports (id, reporter_id, phone_number, scam_type, description, evidence_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [reportId, reporterId, phoneNumber, scamType, description, evidenceUrl]
      );
      // Generate blockchain log
      const latestBlockQuery = await pool.query('SELECT block_hash FROM public.blockchain_logs ORDER BY timestamp DESC LIMIT 1');
      const prevHash = latestBlockQuery.rows[0]?.block_hash || '0000000000000000000000000000000000000000000000000000000000000000';
      const hash = calculateHash(reportId, prevHash, createdAt);
      await pool.query(
        'INSERT INTO public.blockchain_logs (report_id, block_hash, prev_hash, timestamp) VALUES ($1, $2, $3, $4)',
        [reportId, hash, prevHash, createdAt]
      );
      return rows[0];
    }

    const newReport: ScamReport = {
      id: reportId,
      reporter_id: reporterId,
      phone_number: phoneNumber,
      scam_type: scamType,
      description,
      evidence_url: evidenceUrl,
      reputation_score: 5,
      created_at: createdAt
    };

    mockScamReports.push(newReport);
    
    // Add to simulated Blockchain Logs
    const prevHash = mockBlockchainLogs[mockBlockchainLogs.length - 1]?.block_hash || '0000000000000000000000000000000000000000000000000000000000000000';
    const hash = calculateHash(reportId, prevHash, createdAt);
    mockBlockchainLogs.push({
      id: `bl-${mockBlockchainLogs.length + 1}`,
      report_id: reportId,
      block_hash: hash,
      prev_hash: prevHash,
      timestamp: createdAt
    });

    return newReport;
  },

  // Threat Logs
  async getThreatLogs(userId: string): Promise<ThreatLog[]> {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM public.threat_logs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return rows;
    }
    return mockThreatLogs.filter(t => t.user_id === userId).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  async createThreatLog(userId: string, callerNumber: string, transcript: string, riskScore: number, threatType: string, confidence: number, behaviorProfile: any): Promise<ThreatLog> {
    if (pool) {
      const { rows } = await pool.query(
        'INSERT INTO public.threat_logs (user_id, caller_number, transcript, risk_score, threat_type, confidence, behavior_profile) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, callerNumber, transcript, riskScore, threatType, confidence, JSON.stringify(behaviorProfile)]
      );
      return rows[0];
    }
    const newLog: ThreatLog = {
      id: crypto.randomUUID(),
      user_id: userId,
      caller_number: callerNumber,
      transcript,
      risk_score: riskScore,
      threat_type: threatType,
      confidence,
      behavior_profile: behaviorProfile,
      created_at: new Date()
    };
    mockThreatLogs.push(newLog);
    return newLog;
  },

  // Blocked Numbers
  async getBlockedNumbers(userId: string): Promise<BlockedNumber[]> {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM public.blocked_numbers WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return rows;
    }
    return mockBlockedNumbers.filter(b => b.user_id === userId);
  },

  async blockNumber(userId: string, phoneNumber: string, reason: string): Promise<BlockedNumber> {
    if (pool) {
      const { rows } = await pool.query(
        'INSERT INTO public.blocked_numbers (user_id, phone_number, reason) VALUES ($1, $2, $3) ON CONFLICT (user_id, phone_number) DO UPDATE SET reason = EXCLUDED.reason RETURNING *',
        [userId, phoneNumber, reason]
      );
      return rows[0];
    }
    const existingIndex = mockBlockedNumbers.findIndex(b => b.user_id === userId && b.phone_number === phoneNumber);
    if (existingIndex > -1) {
      mockBlockedNumbers[existingIndex].reason = reason;
      return mockBlockedNumbers[existingIndex];
    }
    const newBlock: BlockedNumber = {
      id: crypto.randomUUID(),
      user_id: userId,
      phone_number: phoneNumber,
      reason,
      created_at: new Date()
    };
    mockBlockedNumbers.push(newBlock);
    return newBlock;
  },

  async unblockNumber(userId: string, phoneNumber: string): Promise<boolean> {
    if (pool) {
      const { rowCount } = await pool.query(
        'DELETE FROM public.blocked_numbers WHERE user_id = $1 AND phone_number = $2',
        [userId, phoneNumber]
      );
      return (rowCount ?? 0) > 0;
    }
    const initialLength = mockBlockedNumbers.length;
    for (let i = mockBlockedNumbers.length - 1; i >= 0; i--) {
      if (mockBlockedNumbers[i].user_id === userId && mockBlockedNumbers[i].phone_number === phoneNumber) {
        mockBlockedNumbers.splice(i, 1);
      }
    }
    return mockBlockedNumbers.length < initialLength;
  },

  // Emergency SOS triggers
  async getEmergencyAlerts(): Promise<EmergencyAlert[]> {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM public.emergency_alerts ORDER BY created_at DESC');
      return rows;
    }
    return [...mockEmergencyAlerts].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  async createEmergencyAlert(userId: string, latitude: number, longitude: number): Promise<EmergencyAlert> {
    if (pool) {
      const { rows } = await pool.query(
        'INSERT INTO public.emergency_alerts (user_id, latitude, longitude) VALUES ($1, $2, $3) RETURNING *',
        [userId, latitude, longitude]
      );
      return rows[0];
    }
    const newAlert: EmergencyAlert = {
      id: crypto.randomUUID(),
      user_id: userId,
      latitude,
      longitude,
      status: 'Active',
      created_at: new Date()
    };
    mockEmergencyAlerts.push(newAlert);
    return newAlert;
  },

  async resolveEmergencyAlert(alertId: string): Promise<boolean> {
    if (pool) {
      const { rowCount } = await pool.query(
        "UPDATE public.emergency_alerts SET status = 'Resolved' WHERE id = $1",
        [alertId]
      );
      return (rowCount ?? 0) > 0;
    }
    const alert = mockEmergencyAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'Resolved';
      return true;
    }
    return false;
  },

  // Blockchain Immutable Audit Ledger
  async getBlockchainLogs(): Promise<BlockchainLog[]> {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM public.blockchain_logs ORDER BY timestamp DESC');
      return rows;
    }
    return [...mockBlockchainLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
};
