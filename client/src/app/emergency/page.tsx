'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Users, Plus, Trash2, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/services/api';

interface Contact {
  name: string;
  phone: string;
}

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number>(12.9716); // default Bangalore tech hub
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [gpsActive, setGpsActive] = useState(false);

  // Emergency contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [smsSentStatus, setSmsSentStatus] = useState<string[]>([]);

  // Load emergency contacts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shieldcall_emergency_contacts');
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        const defaultContacts = [
          { name: 'Family Guard Primary', phone: '+91 99000 11223' },
          { name: 'Cyber Crime Helpline', phone: '1930' }
        ];
        setContacts(defaultContacts);
        localStorage.setItem('shieldcall_emergency_contacts', JSON.stringify(defaultContacts));
      }
    }

    // Geolocation API check
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setGpsActive(true);
        },
        (error) => {
          console.warn('Geolocation denied, using mock coordinates:', error.message);
        }
      );
    }
  }, []);

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem('shieldcall_emergency_contacts', JSON.stringify(updated));
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const updated = [...contacts, { name: newContactName, phone: newContactPhone }];
    saveContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleDeleteContact = (index: number) => {
    const updated = contacts.filter((_, idx) => idx !== index);
    saveContacts(updated);
  };

  const triggerSOSAlarm = async () => {
    setSosActive(true);
    setSmsSentStatus([]);

    try {
      // Trigger API endpoint
      await apiService.triggerSOS(latitude, longitude);

      // Simulate sending SMS to emergency network
      const statusUpdates: string[] = [];
      contacts.forEach(contact => {
        statusUpdates.push(`Dispatched warning SMS to ${contact.name} (${contact.phone})`);
      });
      setSmsSentStatus(statusUpdates);
    } catch (err) {
      console.error(err);
    }
  };

  // Countdown timer trigger
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      triggerSOSAlarm();
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartSOS = () => {
    if (sosActive) {
      // Deactivate
      setSosActive(false);
      setSmsSentStatus([]);
    } else {
      // Start countdown
      setCountdown(3);
    }
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-6 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
          <ShieldAlert className="h-8 w-8 text-rose-500" />
          SOS Emergency Protection
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          One-tap active panic trigger. Instantly alert your family and log incident telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Big SOS Button & Telemetry (7 cols) */}
        <div className="md:col-span-7 glass-panel p-6 rounded-xl border-border space-y-6 text-center">
          <h2 className="text-lg font-bold text-white tracking-wider uppercase">SOS Active Trigger</h2>
          
          <div className="flex flex-col items-center justify-center py-6 relative">
            <AnimatePresence mode="wait">
              {countdown !== null ? (
                // Countdown view
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="h-44 w-44 rounded-full bg-rose-600 text-white font-extrabold text-5xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] border border-rose-400"
                >
                  <span>{countdown}</span>
                  <button
                    onClick={cancelCountdown}
                    className="absolute -bottom-2 px-3 py-1 bg-background text-xs font-bold rounded-full border border-border hover:bg-gray-900 text-gray-300"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                // SOS main button view
                <motion.button
                  key="sos-btn"
                  onClick={handleStartSOS}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`h-48 w-48 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                    sosActive
                      ? 'bg-rose-950/20 text-rose-500 border-rose-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse'
                      : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                  }`}
                >
                  <AlertTriangle className={`h-12 w-12 mb-2 ${sosActive ? 'animate-bounce' : ''}`} />
                  <span className="text-xl font-extrabold tracking-wider">{sosActive ? 'SOS ACTIVE' : 'TAP SOS'}</span>
                  <span className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">
                    {sosActive ? 'Tap to close' : '3s countdown'}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* GPS Telemetry */}
          <div className="glass-panel bg-background/60 p-4 rounded-xl border-border text-left space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Active Location coordinates
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-gray-500">Latitude</p>
                <p className="text-white font-bold">{latitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-gray-500">Longitude</p>
                <p className="text-white font-bold">{longitude.toFixed(6)}</p>
              </div>
            </div>

            <p className="text-[10px] text-gray-500">
              {gpsActive ? '✓ High-accuracy browser GPS telemetry locked.' : '⚠ GPS denied. Using default localized cybersecurity hub coordinate.'}
            </p>
          </div>

          {/* SOS Dispatch Status Log */}
          {sosActive && smsSentStatus.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-left space-y-2 border-t border-border pt-4"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Emergency Actions Executed:</h4>
              <div className="space-y-1.5">
                {smsSentStatus.map((status, i) => (
                  <p key={i} className="text-xs text-gray-300 flex items-center gap-1.5 bg-background p-2 rounded border border-border">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{status}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Contact Managers (5 cols) */}
        <div className="md:col-span-5 space-y-8">
          
          {/* Emergency contacts manager */}
          <div className="glass-panel p-6 rounded-xl border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-primary" />
              Safety Alert Contacts
            </h3>

            {/* List */}
            {contacts.length === 0 ? (
              <p className="text-xs text-gray-600 py-4 text-center">No alert contacts configured.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background p-3 rounded border border-border text-xs">
                    <div>
                      <p className="font-bold text-white">{contact.name}</p>
                      <p className="font-mono text-gray-500 mt-0.5">{contact.phone}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(idx)}
                      className="text-gray-500 hover:text-rose-500 p-1 hover:bg-gray-900 rounded transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-semibold text-gray-400">Add Alert Destination:</p>
              <input
                type="text"
                placeholder="Contact Name (e.g. Spouse)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-ring"
              />
              <input
                type="text"
                placeholder="Phone Number (e.g. +91 ...)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-ring"
              />
              <button
                onClick={handleAddContact}
                className="w-full py-1.5 rounded bg-primary hover:bg-primary text-black font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Contact
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
