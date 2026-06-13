'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Eye, ShieldCheck, Activity, Terminal, RefreshCw, BarChart2 } from 'lucide-react';
import { apiService } from '@/services/api';

interface ScamReport {
  id: string;
  phone_number: string;
  scam_type: string;
  description: string;
  reputation_score: number;
  created_at: string;
}

interface ThreatLog {
  id: string;
  caller_number: string;
  threat_type: string;
  risk_score: number;
  confidence: number;
  created_at: string;
}

export default function AdminHub() {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'moderation' | 'logs'>('moderation');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const reportsList = await apiService.getReports();
      setReports(reportsList);

      const history = await apiService.getThreatHistory();
      setLogs(history);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveReport = (id: string) => {
    // Simulates approving (e.g. increases reputation score)
    setReports(reports.map(r => r.id === id ? { ...r, reputation_score: Math.min(5, r.reputation_score + 1) } : r));
  };

  const handleRemoveReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) return 'text-rose-500 bg-rose-950/20 border border-rose-500/20';
    if (score >= 45) return 'text-amber-500 bg-amber-950/20 border border-amber-500/20';
    return 'text-emerald-400 bg-emerald-950/20 border border-emerald-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Terminal className="h-8 w-8 text-primary" />
            Admin Operations Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            System performance telemetry, reported numbers moderation, and AI request logs.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="px-4 py-1.5 rounded-lg border border-border hover:border-border bg-background/40 hover:bg-gray-900 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload System
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-xl border-border space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Scams Logged</p>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-white font-mono">{reports.length + logs.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">+12% weekly</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border-border space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Average Threat Score</p>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-rose-500 font-mono">
              {logs.length > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.risk_score, 0) / logs.length) : 65}%
            </span>
            <span className="text-xs text-gray-500 font-semibold">High Severity</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border-border space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Active Geopoints</p>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-white font-mono">4</span>
            <span className="text-xs text-gray-500 font-semibold">Nodes Active</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border-border space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">API Gateways Status</p>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-5 w-5" />
              Operational
            </span>
            <span className="text-xs text-gray-500 font-mono">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Main Panel tabs */}
      <div className="glass-panel rounded-xl border-border overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border bg-background/40">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'moderation'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Report Moderation Queue ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Live AI Telemetry Logs ({logs.length})
          </button>
        </div>

        {/* Panel Body */}
        <div className="p-6">
          {loading ? (
            <p className="text-center text-xs text-gray-500 py-12">Querying database registry...</p>
          ) : activeTab === 'moderation' ? (
            // Moderation list
            reports.length === 0 ? (
              <p className="text-center text-xs text-gray-600 py-12">Moderation queue is empty.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-background p-4 rounded-lg border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold text-sm">{report.phone_number}</span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {report.scam_type}
                        </span>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{report.description}</p>
                      <p className="text-[10px] text-gray-600">Timestamp: {new Date(report.created_at).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleApproveReport(report.id)}
                        className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-colors text-center"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRemoveReport(report.id)}
                        className="flex-1 md:flex-none px-3 py-1.5 bg-gray-900 hover:bg-rose-950/30 border border-border hover:border-rose-900/30 text-gray-400 hover:text-rose-500 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Live AI telemetry transaction logs
            logs.length === 0 ? (
              <p className="text-center text-xs text-gray-600 py-12 font-mono">No AI requests logged.</p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-background rounded border border-border flex justify-between items-center flex-wrap gap-2 text-gray-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-600">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                      <span className="text-white font-bold">API::ANALYZE</span>
                      <span className="text-gray-500">caller:</span>
                      <span className="text-primary font-semibold">{log.caller_number}</span>
                      <span className="text-gray-500">vector:</span>
                      <span className="text-primary">{log.threat_type}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadge(log.risk_score)}`}>
                      RISK: {log.risk_score}% (Confidence: {log.confidence}%)
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
