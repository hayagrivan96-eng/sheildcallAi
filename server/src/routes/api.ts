import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest, sanitizeInput, apiLimiter } from '../middleware/security';
import { analyzeTranscript, transcribeAudio } from '../services/ai';
import { dbService } from '../services/db';
import { scanUrlWithVirusTotal, checkIpWithAbuseIPDB } from '../services/lookup';
import { notifyCriticalThreat, notifyEmergencySOS, sendTelegramNotification } from '../services/telegram';

const router = Router();

// Zod schemas for input validation
const analyzeSchema = z.object({
  body: z.object({
    transcript: z.string().min(3, 'Transcript must be at least 3 characters long'),
    isAudio: z.boolean().optional(),
    callerNumber: z.string().optional(),
    userId: z.string().optional(),
    engine: z.string().optional(),
  }),
});

const transcribeSchema = z.object({
  body: z.object({
    base64Audio: z.string().min(10, 'Audio data is required'),
  }),
});

const lookupSchema = z.object({
  body: z.object({
    query: z.string().min(3, 'Query must be at least 3 characters'),
    type: z.enum(['url', 'ip', 'domain']),
  }),
});

const reportSchema = z.object({
  body: z.object({
    phone_number: z.string().min(5, 'Phone number must be at least 5 characters long'),
    scam_type: z.string().min(2, 'Scam type is required'),
    description: z.string().min(5, 'Description must be at least 5 characters long'),
    evidence_url: z.string().url().nullable().optional(),
    reporter_id: z.string().optional(),
  }),
});

const emergencySchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    user_id: z.string().optional(),
  }),
});

const blockSchema = z.object({
  body: z.object({
    phone_number: z.string().min(5),
    reason: z.string().min(3),
    user_id: z.string().optional(),
  }),
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    services: {
      database: process.env.DATABASE_URL ? 'CONNECTED (Live)' : 'RUNNING (Simulation Local)',
      ai: process.env.GEMINI_API_KEY ? 'ACTIVE (Gemini)' : 'RUNNING (NLP Local Fallback)'
    }
  });
});

// AI analysis route
router.post('/analyze', apiLimiter, validateRequest(analyzeSchema), sanitizeInput, async (req: Request, res: Response) => {
  try {
    const { transcript, isAudio, callerNumber, userId, engine, telegramToken, telegramChatId } = req.body;
    
    // Analyze transcript using AI service
    const analysis = await analyzeTranscript(transcript, isAudio, engine);

    // Save threat log if userId is provided
    const targetUserId = userId || 'user-default-id-1234567890';
    const number = callerNumber || 'Unknown Caller';
    
    await dbService.createThreatLog(
      targetUserId,
      number,
      transcript,
      analysis.risk === 'SAFE' ? 0 : (analysis.risk === 'SUSPICIOUS' ? 30 : (analysis.risk === 'HIGH' ? 65 : 90)),
      analysis.threat_type,
      analysis.confidence,
      analysis.behavior_profile
    );

    // Deduct user safety health score if threat is CRITICAL or HIGH
    if (analysis.risk === 'CRITICAL') {
      await dbService.updateUserHealthScore(targetUserId, -10);
      // Trigger Telegram Notification (Async / non-blocking)
      notifyCriticalThreat(number, analysis.threat_type, analysis.confidence, analysis.summary, telegramToken, telegramChatId).catch(err => {
        console.error('Failed to dispatch Telegram critical threat alert:', err.message);
      });
    } else if (analysis.risk === 'HIGH') {
      await dbService.updateUserHealthScore(targetUserId, -5);
    }

    res.status(200).json({ status: 'success', data: analysis });
  } catch (error: any) {
    console.error('Error during call analysis:', error);
    res.status(500).json({ status: 'error', message: 'Failed to analyze transcript', details: error.message });
  }
});

// Retrieve and create community reports
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const reports = await dbService.getScamReports();
    res.status(200).json({ status: 'success', data: reports });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to load scam reports' });
  }
});

router.post('/reports', apiLimiter, validateRequest(reportSchema), sanitizeInput, async (req: Request, res: Response) => {
  try {
    const { phone_number, scam_type, description, evidence_url, reporter_id } = req.body;
    const targetReporterId = reporter_id || 'user-default-id-1234567890';
    
    const newReport = await dbService.createScamReport(
      targetReporterId,
      phone_number,
      scam_type,
      description,
      evidence_url || null
    );

    res.status(201).json({ status: 'success', data: newReport });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to create scam report' });
  }
});

// SOS alerts
router.get('/emergency', async (req: Request, res: Response) => {
  try {
    const alerts = await dbService.getEmergencyAlerts();
    res.status(200).json({ status: 'success', data: alerts });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to load emergency alerts' });
  }
});

router.post('/emergency', apiLimiter, validateRequest(emergencySchema), async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, user_id, telegramToken, telegramChatId } = req.body;
    const targetUserId = user_id || 'user-default-id-1234567890';
    
    const alert = await dbService.createEmergencyAlert(targetUserId, latitude, longitude);
    
    // Trigger Telegram SOS Notification (Async / non-blocking)
    dbService.getUserProfile(targetUserId).then(profile => {
      notifyEmergencySOS(targetUserId, profile?.email || 'demo@shieldcall.ai', latitude, longitude, telegramToken, telegramChatId);
    }).catch(err => {
      console.error('Failed to dispatch Telegram SOS alert:', err.message);
    });

    res.status(201).json({ status: 'success', data: alert });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to trigger SOS emergency alert' });
  }
});

router.post('/emergency/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) {
       res.status(400).json({ status: 'error', message: 'SOS alert id is required' });
       return;
    }
    const resolved = await dbService.resolveEmergencyAlert(id);
    res.status(200).json({ status: 'success', resolved });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to resolve emergency alert' });
  }
});

// Blocklist routes
router.get('/blocklist', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-default-id-1234567890';
    const list = await dbService.getBlockedNumbers(userId);
    res.status(200).json({ status: 'success', data: list });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to load blocklist' });
  }
});

router.post('/blocklist', validateRequest(blockSchema), sanitizeInput, async (req: Request, res: Response) => {
  try {
    const { phone_number, reason, user_id } = req.body;
    const targetUserId = user_id || 'user-default-id-1234567890';
    
    const blocked = await dbService.blockNumber(targetUserId, phone_number, reason);
    res.status(201).json({ status: 'success', data: blocked });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to block number' });
  }
});

router.delete('/blocklist', async (req: Request, res: Response) => {
  try {
    const { phone_number, user_id } = req.body;
    const targetUserId = user_id || 'user-default-id-1234567890';
    if (!phone_number) {
       res.status(400).json({ status: 'error', message: 'phone_number is required' });
       return;
    }
    
    const unblocked = await dbService.unblockNumber(targetUserId, phone_number);
    res.status(200).json({ status: 'success', unblocked });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to unblock number' });
  }
});

// User profile & stats
router.get('/user/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-default-id-1234567890';
    let profile = await dbService.getUserProfile(userId);
    if (!profile) {
      profile = await dbService.createUserProfile(userId, 'demo@shieldcall.ai');
    }
    res.status(200).json({ status: 'success', data: profile });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to load user profile' });
  }
});

router.get('/user/threats', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-default-id-1234567890';
    const logs = await dbService.getThreatLogs(userId);
    res.status(200).json({ status: 'success', data: logs });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to load threat history logs' });
  }
});

// Blockchain immutable logs
router.get('/blockchain', async (req: Request, res: Response) => {
  try {
    const chain = await dbService.getBlockchainLogs();
    res.status(200).json({ status: 'success', data: chain });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve incident chain logs' });
  }
});

// Whisper Transcription Endpoint
router.post('/transcribe', validateRequest(transcribeSchema), async (req: Request, res: Response) => {
  try {
    const { base64Audio } = req.body;
    const transcript = await transcribeAudio(base64Audio);
    res.status(200).json({ status: 'success', transcript });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to transcribe audio call' });
  }
});

// IP & URL Lookup scan endpoint
router.post('/lookup', validateRequest(lookupSchema), async (req: Request, res: Response) => {
  try {
    const { query, type } = req.body;
    let result;
    if (type === 'ip') {
      result = await checkIpWithAbuseIPDB(query);
    } else {
      result = await scanUrlWithVirusTotal(query);
    }
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to check threat reputation' });
  }
});

// Test Telegram Alerts endpoint
router.post('/settings/test-telegram', async (req: Request, res: Response) => {
  try {
    const { botToken, chatId } = req.body;
    if (!botToken || !chatId) {
      res.status(400).json({ status: 'error', message: 'Telegram Bot Token and Chat ID are required' });
      return;
    }
    
    // Temporarily overwrite process.env variables to execute test
    const prevToken = process.env.TELEGRAM_BOT_TOKEN;
    const prevChat = process.env.TELEGRAM_CHAT_ID;
    process.env.TELEGRAM_BOT_TOKEN = botToken;
    process.env.TELEGRAM_CHAT_ID = chatId;

    const success = await sendTelegramNotification('🤖 *SHIELDCALL AI*: Telegram Alert Hook configured successfully! This is a test notification.');
    
    // Revert
    process.env.TELEGRAM_BOT_TOKEN = prevToken;
    process.env.TELEGRAM_CHAT_ID = prevChat;

    if (success) {
      res.status(200).json({ status: 'success', message: 'Test message delivered!' });
    } else {
      res.status(500).json({ status: 'error', message: 'Failed to deliver test message. Check your Token and Chat ID.' });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error sending test message' });
  }
});

export default router;
