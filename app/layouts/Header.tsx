'use client';

import { useState, useEffect } from 'react';
import { MapPin, Copy, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const [clientIP, setClientIP] = useState<string>('202.191.122.112');
  const [copied, setCopied] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => setClientIP(data.ip))
      .catch(() => setClientIP('202.191.122.112'));
  }, []);

  const copyIP = () => {
    navigator.clipboard.writeText(clientIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-400" />
          <span className="text-base font-semibold uppercase tracking-[0.2em] text-teal-400">
            Global
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyIP}
            className={`flex items-center gap-2 text-sm font-mono ${
              isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
            } transition-colors`}
            title="Copy IP address"
          >
            {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            {clientIP}
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md border ${
              isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
            } transition-colors`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}