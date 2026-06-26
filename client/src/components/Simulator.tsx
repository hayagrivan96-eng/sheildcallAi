'use client';

import { useState } from 'react';

interface SimulatorProps {
  socket: any;
}

export default function Simulator({ socket }: SimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const scenarios = [
    { name: 'OTP Fraud', type: 'otp' },
    { name: 'AI Voice Clone', type: 'voice' },
    { name: 'Tech Support Scam', type: 'tech' },
  ];

  const startSimulation = (scenario: string) => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    socket.emit('start-analysis', { scenario });

    socket.on('analysis-progress', (data: any) => {
      setProgress(data.progress);
    });

    socket.on('analysis-complete', (data: any) => {
      setResult(data);
      setIsRunning(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Call Screening Simulator</h2>
        <p className="text-slate-400 text-sm mb-6">
          Select a scenario to test the AI-powered call analysis system
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {scenarios.map((scenario) => (
            <button
              key={scenario.type}
              onClick={() => startSimulation(scenario.type)}
              disabled={isRunning}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg p-4 transition-colors text-left"
            >
              <div className="font-medium text-white">{scenario.name}</div>
              <div className="text-xs text-slate-400 mt-1">Test Link</div>
            </button>
          ))}
        </div>

        {isRunning && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Analysis Progress</span>
              <span className="text-sm font-medium text-cyan-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <h3 className="font-medium text-white mb-3">Analysis Result</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Score:</span>
                <span className="font-medium text-red-400">{Math.round(result.riskScore)}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Threat Type:</span>
                <span className="font-medium text-yellow-400">{result.threatType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-medium text-green-400">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
