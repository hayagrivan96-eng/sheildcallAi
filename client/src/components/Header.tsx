'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Bell, User, Cpu, AlertTriangle } from 'lucide-react';
import { apiService } from '@/services/api';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [healthScore, setHealthScore] = useState<number>(100);
  const [userEmail, setUserEmail] = useState<string>('demo@shieldcall.ai');

  // Load user details for real-time safety indicator
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiService.getUserProfile();
        if (profile && profile.health_score !== undefined) {
          setHealthScore(profile.health_score);
          setUserEmail(profile.email);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProfile();
    // Poll safety score updates every 3 seconds to keep it reactive during simulations
    const interval = setInterval(fetchProfile, 3000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Threat Intel', href: '/intelligence' },
    { name: 'SOS Alert', href: '/emergency' },
    { name: 'Safety Academy', href: '/education' },
    { name: 'Leak Monitor', href: '/leak-monitor' },
    { name: 'Admin Hub', href: '/admin' },
    { name: 'Settings', href: '/settings' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.png" 
                alt="ShieldCall Logo" 
                className="h-10 w-auto brightness-110 contrast-105 rounded bg-white py-0.5 px-2" 
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/15 border border-primary/20 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section widgets */}
          <div className="hidden md:flex items-center gap-4">
            {/* Safety Score Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${getScoreColor(healthScore)}`}>
              <Cpu className="h-3.5 w-3.5" />
              <span>Safety Rating: {healthScore}%</span>
            </div>

            {/* Notification bell (simulated) */}
            <button className="text-gray-400 hover:text-white relative p-1 rounded-full hover:bg-gray-800 transition-colors">
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown (mocked) */}
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                S
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Agent Account</p>
                <p className="text-xs font-medium text-gray-300 max-w-[100px] truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button className="text-gray-400 hover:text-white relative p-1.5 rounded-full hover:bg-gray-800 transition-colors">
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              <Bell className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-md focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-border bg-background/95 py-3 px-4 space-y-2">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-950 pb-3 mb-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getScoreColor(healthScore)}`}>
              <Cpu className="h-3 w-3" />
              <span>Safety Score: {healthScore}%</span>
            </div>
            <span className="text-xs text-gray-400 truncate max-w-[150px]">{userEmail}</span>
          </div>
          
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-all ${
                  isActive
                    ? 'text-primary bg-primary/25 border-l-4 border-l-primary'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
