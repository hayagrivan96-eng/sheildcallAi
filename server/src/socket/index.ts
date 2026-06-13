import { Server as SocketIOServer, Socket } from 'socket.io';
import { analyzeTranscriptLocally, ThreatAnalysisResult } from '../services/ai';

// Predefined demo scenarios matching realistic scam types
interface ScenarioStep {
  text: string;
  delayMs: number;
}

interface DemoScenario {
  name: string;
  callerNumber: string;
  threatType: string;
  isAudio: boolean;
  steps: ScenarioStep[];
}

const scenarios: Record<string, DemoScenario> = {
  otp: {
    name: 'OTP Banking Scam',
    callerNumber: '+91 91102 33456',
    threatType: 'OTP Scam',
    isAudio: false,
    steps: [
      { text: 'Hello, this is the Central Fraud Security team from your credit card provider.', delayMs: 2000 },
      { text: 'We detected a suspicious login attempt of 45,000 rupees in Mumbai right now.', delayMs: 3500 },
      { text: 'To stop this transaction, we have locked your debit card temporarily.', delayMs: 3500 },
      { text: 'I am sending a one-time verification password to your registered phone number.', delayMs: 4000 },
      { text: 'To reverse the card block, please tell me the 6-digit OTP code immediately. Do not hang up.', delayMs: 4500 }
    ]
  },
  police: {
    name: 'Fake Arrest Threat',
    callerNumber: '+91 80091 22340',
    threatType: 'Police Impersonation',
    isAudio: false,
    steps: [
      { text: 'Hello, am I speaking to the owner of this number? This is Customs Inspector Rao from Narcotics Control.', delayMs: 2500 },
      { text: 'We intercepted a DHL express parcel containing illegal MDMA drugs addressed to your credentials.', delayMs: 4000 },
      { text: 'A criminal case under NDPS Act has been registered. An arrest warrant is being processed.', delayMs: 4000 },
      { text: 'This is a secure line. Do not inform anyone or search on internet. If you disconnect, local police will arrest you within 30 minutes.', delayMs: 5000 },
      { text: 'To clear your passport registry and resolve this issue, you must transfer a safety deposit of 98,000 rupees for verification.', delayMs: 5000 }
    ]
  },
  voice_clone: {
    name: 'AI Deepfake Voice Clone',
    callerNumber: '+91 99002 88471',
    threatType: 'Voice Clone',
    isAudio: true, // triggers deepfake voice clone analysis
    steps: [
      { text: 'Mom? Please help me. It\'s really bad. I got into a car accident.', delayMs: 2000 },
      { text: 'My friend is hurt, and my phone screen is shattered. I\'m calling from the hospital desk phone.', delayMs: 3500 },
      { text: 'The police are saying I might go to jail, and the hospital won\'t admit us without an emergency deposit.', delayMs: 4000 },
      { text: 'Please mom, you need to send 25,000 rupees to this UPI address right now. I don\'t know what to do.', delayMs: 4500 }
    ]
  },
  lottery: {
    name: 'Fake Lottery Prize',
    callerNumber: '+1 822 555 0192',
    threatType: 'Lottery/Investment Scam',
    isAudio: false,
    steps: [
      { text: 'Hello lucky winner! I am calling from KBC Lucky Draw department.', delayMs: 2000 },
      { text: 'Your phone number has won a cash prize reward of 25 Lakh Rupees in the subcontinental lottery draw.', delayMs: 3500 },
      { text: 'Your file has been approved by the central bank director.', delayMs: 3000 },
      { text: 'To credit the money into your bank, you only need to transfer a processing and tax clearance fee of 8,500 rupees.', delayMs: 4500 },
      { text: 'Pay this registration fee to our agent code immediately to release your lottery file.', delayMs: 4000 }
    ]
  },
  safe: {
    name: 'Courier Delivery (Safe)',
    callerNumber: '+91 95551 23456',
    threatType: 'Safe Communication',
    isAudio: false,
    steps: [
      { text: 'Hello, this is delivery executive Sunil from BlueDart Express.', delayMs: 2000 },
      { text: 'I have a parcel under your name. Your home address is mentioned as Block 4, Sector 7.', delayMs: 3500 },
      { text: 'Are you available at home within the next 15 minutes to collect it?', delayMs: 3000 },
      { text: 'Okay, no problem. I will arrive soon. Please keep your signature card ready. Thank you.', delayMs: 3500 }
    ]
  }
};

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    let activeScenarioInterval: NodeJS.Timeout | null = null;
    let currentScenarioSteps: ScenarioStep[] = [];
    let stepIndex = 0;
    let accumulatedTranscript = '';

    // Handle Start Simulation event
    socket.on('start_call_simulation', (data: { scenarioId: string }) => {
      // Clear previous simulation running on this socket
      if (activeScenarioInterval) {
        clearInterval(activeScenarioInterval);
      }

      const scenario = scenarios[data.scenarioId];
      if (!scenario) {
        socket.emit('error', { message: 'Invalid scenario ID' });
        return;
      }

      console.log(`Socket ${socket.id} starting scenario: ${scenario.name}`);
      currentScenarioSteps = scenario.steps;
      stepIndex = 0;
      accumulatedTranscript = '';

      // Send initial metadata
      socket.emit('simulation_started', {
        callerNumber: scenario.callerNumber,
        scenarioName: scenario.name,
        isAudio: scenario.isAudio
      });

      const executeNextStep = () => {
        if (stepIndex >= currentScenarioSteps.length) {
          // Finish simulation
          socket.emit('simulation_ended', { success: true });
          if (activeScenarioInterval) clearInterval(activeScenarioInterval);
          return;
        }

        const currentStep = currentScenarioSteps[stepIndex];
        accumulatedTranscript += (accumulatedTranscript ? ' ' : '') + currentStep.text;
        
        // Analyze accumulated transcript
        const analysis = analyzeTranscriptLocally(accumulatedTranscript, scenario.isAudio);

        // Generate simulated waveform data (amplitude levels between 10 and 100)
        const waveform = Array.from({ length: 20 }, () => Math.floor(Math.random() * (analysis.risk === 'SAFE' ? 30 : 80)) + 15);

        // Emit speech transcript fragment and threat analytics
        socket.emit('call_packet', {
          subtitle: currentStep.text,
          fullTranscript: accumulatedTranscript,
          waveform,
          analysis
        });

        stepIndex++;
        
        // Schedule the next step after the specified delay
        if (stepIndex < currentScenarioSteps.length) {
          activeScenarioInterval = setTimeout(executeNextStep, currentScenarioSteps[stepIndex].delayMs);
        } else {
          activeScenarioInterval = setTimeout(executeNextStep, 4000); // end 4s after last text
        }
      };

      // Start the first step
      activeScenarioInterval = setTimeout(executeNextStep, 5000 / 10); // execute step 1 shortly after starting
    });

    // Handle Stop Simulation event
    socket.on('stop_call_simulation', () => {
      if (activeScenarioInterval) {
        clearInterval(activeScenarioInterval);
        activeScenarioInterval = null;
        console.log(`Socket ${socket.id} stopped call simulation`);
      }
      socket.emit('simulation_stopped');
    });

    // Handle emergency alert broadcasting (when user triggers SOS, it broadcasts to all)
    socket.on('emergency_sos_triggered', (data: { userId: string; latitude: number; longitude: number; time: string }) => {
      console.log(`SOS Alert Triggered by User ${data.userId}: Lat ${data.latitude}, Lng ${data.longitude}`);
      // Broadcast to all clients (e.g. admins monitoring dashboard)
      io.emit('admin_emergency_alert', {
        id: crypto.randomUUID(),
        ...data,
        status: 'Active'
      });
    });

    socket.on('disconnect', () => {
      if (activeScenarioInterval) {
        clearInterval(activeScenarioInterval);
      }
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
}
