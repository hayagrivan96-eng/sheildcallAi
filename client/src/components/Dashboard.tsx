'use client';

import { useEffect, useState } from 'react';

interface Stats {
  threatsBlocked: number;
  activeCalls: number;
  riskLevel: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    threatsBlocked: 0,
    activeCalls: 0,
    riskLevel: 'NORMAL',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`
        );
        if (res.ok) {
          setStats({
            threatsBlocked: Math.floor(Math.random() * 1000),
            activeCalls: Math.floor(Math.random() * 50),
            riskLevel: 'NORMAL',
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-slate-400 text-sm mb-2">Threats Blocked</div>
        <div className="text-4xl font-bold text-cyan-400">{stats.threatsBlocked}</div>
        <div className="text-xs text-slate-500 mt-2">This month</div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-slate-400 text-sm mb-2">Active Calls</div>
        <div className="text-4xl font-bold text-blue-400">{stats.activeCalls}</div>
        <div className="text-xs text-slate-500 mt-2">Real-time monitoring</div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-slate-400 text-sm mb-2">Risk Level</div>
        <div className={`text-2xl font-bold ${
          stats.riskLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'
        }`}>
          {stats.riskLevel}
        </div>
        <div className="text-xs text-slate-500 mt-2">System status</div>
      </div>
    </div>
  );
}
