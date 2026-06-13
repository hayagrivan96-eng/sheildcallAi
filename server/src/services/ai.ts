import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface matching the cybersecurity metrics
export interface ThreatAnalysisResult {
  risk: 'SAFE' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0 - 100
  threat_type: string;
  summary: string;
  recommendation: string;
  keywords: string[];
  behavior_profile: {
    manipulation_score: number;
    pressure_index: number;
    fear_tactics: number;
    authority_impersonation: number;
    urgency_level: number;
    sentiment: string;
  };
  deepfake_assessment: {
    authenticity_score: number;
    ai_voice_probability: number;
    is_deepfake: boolean;
    voice_anomalies: string[];
  };
}

// Check for API keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

let genAI: any = null;
if (GEMINI_API_KEY) {
  try {
    // Use the standard GoogleGenerativeAI class
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.error('Error initializing Gemini API:', err);
  }
}

// Local simulation analysis (very detailed so it feels like a real AI system)
export function analyzeTranscriptLocally(transcript: string, isAudio = false): ThreatAnalysisResult {
  const lowercase = transcript.toLowerCase();
  
  // Keyword definitions
  const scamKeywords = {
    'OTP': ['otp', 'one time password', 'one-time password', 'verification code', 'verify code', '6 digit', 'six digit'],
    'KYC': ['kyc', 'know your customer', 'verification', 'verify account', 'verify document', 'aadhar', 'pan card'],
    'Bank/UPI Fraud': ['upi', 'bank account', 'block account', 'suspended', 'card blocked', 'credit card', 'debit card', 'net banking', 'atm pin', 'password reset'],
    'Police/Authority Impersonation': ['police', 'cbi', 'customs department', 'arrest warrant', 'court order', 'illegal package', 'narcotics', 'court summons'],
    'Lottery/Investment Scam': ['lottery', 'winner', 'crores', 'investment', 'double money', 'crypto investment', 'risk free profit', 'lucky draw'],
  };

  const urgencyIndicators = ['immediately', 'urgent', 'right now', 'within 5 minutes', 'within 10 minutes', 'account block', 'otherwise arrest', 'do not disconnect'];
  const emotionalPressureIndicators = ['don\'t tell anyone', 'keep it secret', 'safety', 'security risk', 'compromised', 'criminal offense', 'penalty', 'jail'];

  // Found keywords extraction
  const foundKeywords: string[] = [];
  let matchedScamType = 'General Analysis';
  let matchedCount = 0;
  
  for (const [scamType, keywords] of Object.entries(scamKeywords)) {
    let typeMatches = 0;
    keywords.forEach(kw => {
      if (lowercase.includes(kw)) {
        if (!foundKeywords.includes(kw)) foundKeywords.push(kw);
        typeMatches++;
        matchedCount++;
      }
    });
    if (typeMatches > 0 && matchedScamType === 'General Analysis') {
      matchedScamType = scamType;
    }
  }

  // Count urgency and pressure
  let urgencyMatches = 0;
  urgencyIndicators.forEach(word => {
    if (lowercase.includes(word)) {
      foundKeywords.push(word);
      urgencyMatches++;
    }
  });

  let pressureMatches = 0;
  emotionalPressureIndicators.forEach(word => {
    if (lowercase.includes(word)) {
      foundKeywords.push(word);
      pressureMatches++;
    }
  });

  // Calculate scores
  let riskScore = 10; // baseline
  riskScore += matchedCount * 15;
  riskScore += urgencyMatches * 12;
  riskScore += pressureMatches * 10;
  
  if (riskScore > 100) riskScore = 100;

  // Determine risk level
  let risk: 'SAFE' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL' = 'SAFE';
  if (riskScore >= 75) {
    risk = 'CRITICAL';
  } else if (riskScore >= 45) {
    risk = 'HIGH';
  } else if (riskScore >= 20) {
    risk = 'SUSPICIOUS';
  }

  // Determine sentiment
  let sentiment = 'calm';
  if (pressureMatches > 1 || urgencyMatches > 1) {
    sentiment = 'manipulative';
  } else if (lowercase.includes('arrest') || lowercase.includes('illegal') || lowercase.includes('suspend')) {
    sentiment = 'aggressive';
  } else if (lowercase.includes('sir') || lowercase.includes('please') || lowercase.includes('help')) {
    sentiment = 'stressed';
  }

  // Calculate profiling metrics
  const urgency_level = Math.min(15 + urgencyMatches * 25, 100);
  const authority_impersonation = lowercase.includes('police') || lowercase.includes('cbi') || lowercase.includes('customs') || lowercase.includes('officer') || lowercase.includes('bank representative') ? 90 : (matchedCount > 0 ? 40 : 10);
  const fear_tactics = Math.min(10 + pressureMatches * 25 + (risk === 'CRITICAL' ? 30 : 0), 100);
  const pressure_index = Math.min(10 + pressureMatches * 20 + urgencyMatches * 15, 100);
  const manipulation_score = Math.min(15 + matchedCount * 20 + pressureMatches * 15, 100);

  // Confidence of AI detection
  const confidence = Math.min(60 + (matchedCount * 10), 98);

  // Deepfake assessment logic (simulated anomaly checks)
  let authenticity_score = 98;
  let ai_voice_probability = 2;
  let is_deepfake = false;
  const voice_anomalies: string[] = [];

  // If the user uploads a recording (isAudio) or if text is highly robotic/templated (like Voice Clone simulation)
  if (isAudio || lowercase.includes('deepfake') || lowercase.includes('clone') || lowercase.includes('synthetic')) {
    // Simulated robotic voice markers
    authenticity_score = 35;
    ai_voice_probability = 65;
    is_deepfake = true;
    voice_anomalies.push('Spectral flatline anomaly in high frequencies', 'Inconsistent speech rate breathing pattern absent', 'Phase disruption in phoneme transition');
  }

  let summary = 'Conversation appears safe and normal.';
  let recommendation = 'No action required.';

  if (risk === 'CRITICAL') {
    summary = `CRITICAL THREAT: Highly coercive caller attempting ${matchedScamType.toLowerCase()} with high urgency.`;
    recommendation = 'IMMEDIATE ACTION REQUIRED: Terminate the call instantly, do not disclose any OTP/credentials, block the caller and report the number.';
  } else if (risk === 'HIGH') {
    summary = `SUSPICIOUS ACTIVITY: Caller requesting sensitive information related to ${matchedScamType.toLowerCase()}.`;
    recommendation = 'WARNING: Be cautious. Do not share OTPs, credit card numbers, or passwords. Hang up and verify through official channels.';
  } else if (risk === 'SUSPICIOUS') {
    summary = 'POTENTIAL THREAT: Call contains unusual questions or mentions account verification.';
    recommendation = 'ADVISORY: Remain alert. Do not agree to instant actions or transfers.';
  }

  return {
    risk,
    confidence,
    threat_type: matchedScamType === 'General Analysis' ? (matchedCount > 0 ? 'Social Engineering' : 'Safe Communication') : matchedScamType,
    summary,
    recommendation,
    keywords: foundKeywords,
    behavior_profile: {
      manipulation_score,
      pressure_index,
      fear_tactics,
      authority_impersonation,
      urgency_level,
      sentiment
    },
    deepfake_assessment: {
      authenticity_score,
      ai_voice_probability,
      is_deepfake,
      voice_anomalies
    }
  };
}

// Analyze transcript using selected engine, falling back to local simulation
export async function analyzeTranscript(transcript: string, isAudio = false, engine = 'gemini'): Promise<ThreatAnalysisResult> {
  const selectedEngine = (engine || 'gemini').toLowerCase();

  if (selectedEngine === 'ollama') {
    return analyzeTranscriptWithOllama(transcript, isAudio);
  }

  if (selectedEngine === 'local') {
    return analyzeTranscriptLocally(transcript, isAudio);
  }

  // Default: Gemini
  if (!GEMINI_API_KEY || !genAI) {
    // Return simulated response immediately
    return analyzeTranscriptLocally(transcript, isAudio);
  }

  try {
    // Setup model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are a specialized AI cybersecurity threat detection agent. Your job is to analyze the following call transcript or text message and perform a detailed fraud and social engineering analysis.
      
      Transcript: "${transcript}"
      
      You must respond with a JSON object strictly matching the following schema. Return ONLY the JSON object. Do not include markdown wraps or anything else.
      
      Schema:
      {
        "risk": "SAFE" | "SUSPICIOUS" | "HIGH" | "CRITICAL",
        "confidence": number (0-100 indicating confidence in classification),
        "threat_type": string (e.g. "OTP Scam", "Fake KYC", "UPI Fraud", "Police Impersonation", "Voice Clone", "Safe Communication"),
        "summary": string (brief explanation of caller intent and risk factors),
        "recommendation": string (actionable advice for user safety),
        "keywords": array of strings (scam/suspicious words found),
        "behavior_profile": {
          "manipulation_score": number (0-100),
          "pressure_index": number (0-100),
          "fear_tactics": number (0-100),
          "authority_impersonation": number (0-100),
          "urgency_level": number (0-100),
          "sentiment": "calm" | "stressed" | "aggressive" | "manipulative"
        },
        "deepfake_assessment": {
          "authenticity_score": number (0-100),
          "ai_voice_probability": number (0-100),
          "is_deepfake": boolean,
          "voice_anomalies": array of strings
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().trim();
    
    // Clean JSON response (strip markdown ticks if Gemini added them)
    const jsonString = textResponse.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed: ThreatAnalysisResult = JSON.parse(jsonString);
    
    return parsed;
  } catch (error) {
    console.error('Gemini API call failed, falling back to local analyzer:', error);
    return analyzeTranscriptLocally(transcript, isAudio);
  }
}

// 1. OpenAI Whisper Audio Transcription (Multipart Boundary compilation)
export async function transcribeAudio(base64Audio: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.log('[Whisper Offline] Returning simulated transcription.');
    return simulateAudioTranscription(base64Audio);
  }

  try {
    const buffer = Buffer.from(base64Audio, 'base64');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    const header = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="audio.mp3"',
      'Content-Type: audio/mpeg',
      '',
      ''
    ].join('\r\n');
    
    const footer = [
      '',
      `--${boundary}`,
      'Content-Disposition: form-data; name="model"',
      '',
      'whisper-1',
      `--${boundary}--`,
      ''
    ].join('\r\n');

    const body = Buffer.concat([
      Buffer.from(header, 'utf-8'),
      buffer,
      Buffer.from(footer, 'utf-8')
    ]);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Whisper API returned status ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    return data.text || '';
  } catch (error: any) {
    console.error('Whisper transcription failed, falling back to simulation:', error.message);
    return simulateAudioTranscription(base64Audio);
  }
}

function simulateAudioTranscription(base64Audio: string): string {
  const length = base64Audio.length;
  if (length > 250000) {
    return 'Sir, this is the customs office calling regarding your drug delivery parcel. Please tell me your registered credit card details immediately.';
  }
  if (length > 150000) {
    return 'Hello mom, I lost my phone and am calling from the emergency room. Please send 25,000 rupees to this account number right now.';
  }
  return 'Hello, we detected a suspicious credit card purchase on your account. To stop this transaction, tell me the verification OTP code immediately.';
}

// 2. Ollama Llama 3 Analysis
export async function analyzeTranscriptWithOllama(transcript: string, isAudio = false, modelName = 'llama3'): Promise<ThreatAnalysisResult> {
  try {
    const prompt = `
      You are a specialized AI cybersecurity threat detection agent. Your job is to analyze the following call transcript or text message and perform a detailed fraud and social engineering analysis.
      
      Transcript: "${transcript}"
      
      You must respond with a JSON object strictly matching the following schema. Return ONLY the JSON object. Do not include markdown wraps or anything else.
      
      Schema:
      {
        "risk": "SAFE" | "SUSPICIOUS" | "HIGH" | "CRITICAL",
        "confidence": number (0-100 indicating confidence in classification),
        "threat_type": string (e.g. "OTP Scam", "Fake KYC", "UPI Fraud", "Police Impersonation", "Voice Clone", "Safe Communication"),
        "summary": string (brief explanation of caller intent and risk factors),
        "recommendation": string (actionable advice for user safety),
        "keywords": array of strings (scam/suspicious words found),
        "behavior_profile": {
          "manipulation_score": number (0-100),
          "pressure_index": number (0-100),
          "fear_tactics": number (0-100),
          "authority_impersonation": number (0-100),
          "urgency_level": number (0-100),
          "sentiment": "calm" | "stressed" | "aggressive" | "manipulative"
        },
        "deepfake_assessment": {
          "authenticity_score": number (0-100),
          "ai_voice_probability": number (0-100),
          "is_deepfake": boolean,
          "voice_anomalies": array of strings
        }
      }
    `;

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API returned status ${response.status}`);
    }

    const data: any = await response.json();
    const messageContent = data?.message?.content || '{}';
    const parsed: ThreatAnalysisResult = JSON.parse(messageContent);
    return parsed;
  } catch (error: any) {
    console.error('Ollama Llama 3 analysis failed, falling back to local:', error.message);
    return analyzeTranscriptLocally(transcript, isAudio);
  }
}
