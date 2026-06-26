'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Dashboard from '@/components/Dashboard';
import Simulator from '@/components/Simulator';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-950/80 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">ShieldCall AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm text-slate-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView('dashboard')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              view === 'dashboard'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('simulator')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              view === 'simulator'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Simulator
          </button>
        </div>

        {view === 'dashboard' && <Dashboard />}
        {view === 'simulator' && socket && <Simulator socket={socket} />}
      </div>
    </main>
  );
}
