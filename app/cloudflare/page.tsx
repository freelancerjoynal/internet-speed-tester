'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Activity, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  RotateCcw,
  BarChart3,
  Clock,
  Wifi,
  AlertCircle,
  Gauge,
  Signal,
  Sparkles,
  Cloud,
  Globe,
  Shield,
  Rocket,
  Award,
  Target
} from 'lucide-react';

export default function BandwidthTest() {
  const [downloadedMB, setDownloadedMB] = useState<string>('0.00');
  const [downloadedGB, setDownloadedGB] = useState<string>('0.00');
  const [liveSpeedMbps, setLiveSpeedMbps] = useState<string>('0.00');
  const [avgSpeed, setAvgSpeed] = useState<string>('0.00');
  const [maxSpeed, setMaxSpeed] = useState<string>('0.00');
  const [minSpeed, setMinSpeed] = useState<string>('0.00');
  const [resetCount, setResetCount] = useState<number>(0);
  const [status, setStatus] = useState<string>('Running...');
  const [testDuration, setTestDuration] = useState<string>('00:00:00');
  const [progress, setProgress] = useState<number>(0);
  const [connectionQuality, setConnectionQuality] = useState<string>('Excellent');
  const [mounted, setMounted] = useState(false);

  const totalBytesRef = useRef<number>(0);
  const sessionBytesRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const totalElapsedSecondsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
  const maxSpeedRef = useRef<number>(0);
  const minSpeedRef = useRef<number>(Infinity);
  const speedHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBytes = localStorage.getItem('bt_total_bytes');
      const savedResets = localStorage.getItem('bt_reset_count');
      const savedMax = localStorage.getItem('bt_max_speed');
      const savedMin = localStorage.getItem('bt_min_speed');
      const savedTime = localStorage.getItem('bt_total_time');

      if (savedBytes) {
        totalBytesRef.current = parseFloat(savedBytes);
        const mb = totalBytesRef.current / (1024 * 1024);
        setDownloadedMB(mb.toFixed(2));
        setDownloadedGB((mb / 1024).toFixed(3));
      }

      if (savedResets) {
        setResetCount(parseInt(savedResets, 10));
      }

      if (savedMax) {
        maxSpeedRef.current = parseFloat(savedMax);
        setMaxSpeed(maxSpeedRef.current.toFixed(2));
      }

      if (savedMin) {
        minSpeedRef.current = parseFloat(savedMin);
        setMinSpeed(minSpeedRef.current.toFixed(2));
      }

      if (savedTime) {
        totalElapsedSecondsRef.current = parseFloat(savedTime);
        updateDurationDisplay(parseFloat(savedTime));
      }
      
      startTimeRef.current = Date.now();
      lastTimeRef.current = Date.now();
    }
  }, []);

  const updateDurationDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    setTestDuration(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    );
  };

  useEffect(() => {
    const speedInterval = setInterval(() => {
      const currentTime = Date.now();
      const duration = (currentTime - lastTimeRef.current) / 1000;

      if (duration > 0) {
        const speedMbps = ((sessionBytesRef.current * 8) / (1024 * 1024)) / duration;
        const currentSpeedFormatted = speedMbps.toFixed(2);
        setLiveSpeedMbps(currentSpeedFormatted);

        if (speedMbps > 0) {
          speedHistoryRef.current.push(speedMbps);
          if (speedHistoryRef.current.length > 60) {
            speedHistoryRef.current.shift();
          }
        }

        totalElapsedSecondsRef.current += duration;
        localStorage.setItem('bt_total_time', totalElapsedSecondsRef.current.toString());
        updateDurationDisplay(totalElapsedSecondsRef.current);

        if (speedHistoryRef.current.length > 0) {
          const avg = speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length;
          setAvgSpeed(avg.toFixed(2));
          
          if (avg > 100) setConnectionQuality('🚀 Blazing');
          else if (avg > 50) setConnectionQuality('⚡ Excellent');
          else if (avg > 20) setConnectionQuality('👍 Good');
          else if (avg > 5) setConnectionQuality('📶 Fair');
          else setConnectionQuality('🐌 Slow');
        }

        if (speedMbps > 0) {
          if (speedMbps > maxSpeedRef.current) {
            maxSpeedRef.current = speedMbps;
            setMaxSpeed(speedMbps.toFixed(2));
            localStorage.setItem('bt_max_speed', speedMbps.toString());
          }

          if (speedMbps < minSpeedRef.current) {
            minSpeedRef.current = speedMbps;
            setMinSpeed(speedMbps.toFixed(2));
            localStorage.setItem('bt_min_speed', speedMbps.toString());
          }
        }

        const totalMB = totalBytesRef.current / (1024 * 1024);
        const progressPercent = Math.min((totalMB / (100 * 1024)) * 100, 100);
        setProgress(progressPercent);

        sessionBytesRef.current = 0;
        lastTimeRef.current = currentTime;
      }
    }, 1000);

    let isSubscribed = true;

    const downloadChunk = () => {
      if (!isSubscribed) return;

      const xhr = new XMLHttpRequest();
      const url = `https://speed.cloudflare.com/__down?bytes=25000000&cache=${Math.random()}`;

      let lastLoaded = 0;

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (event) => {
        if (event.lengthComputable || event.loaded) {
          const delta = event.loaded - lastLoaded;
          lastLoaded = event.loaded;

          totalBytesRef.current += delta;
          sessionBytesRef.current += delta;

          const totalMB = totalBytesRef.current / (1024 * 1024);
          setDownloadedMB(totalMB.toFixed(2));
          setDownloadedGB((totalMB / 1024).toFixed(3));

          if (Math.floor(totalBytesRef.current / (1024 * 1024)) % 2 === 0) {
            localStorage.setItem('bt_total_bytes', totalBytesRef.current.toString());
          }
        }
      };

      xhr.onload = () => {
        if (isSubscribed) downloadChunk();
      };

      xhr.onerror = () => {
        if (isSubscribed) {
          setStatus('Retrying...');
          setResetCount((prev) => {
            const newCount = prev + 1;
            localStorage.setItem('bt_reset_count', newCount.toString());
            return newCount;
          });

          setTimeout(() => {
            if (isSubscribed) {
              setStatus('Running...');
              downloadChunk();
            }
          }, 2000);
        }
      };

      xhr.send();
    };

    downloadChunk();
    downloadChunk();

    return () => {
      isSubscribed = false;
      clearInterval(speedInterval);
    };
  }, []);

  const handleResetData = () => {
    localStorage.removeItem('bt_total_bytes');
    localStorage.removeItem('bt_reset_count');
    localStorage.removeItem('bt_max_speed');
    localStorage.removeItem('bt_min_speed');
    localStorage.removeItem('bt_total_time');

    totalBytesRef.current = 0;
    totalElapsedSecondsRef.current = 0;
    maxSpeedRef.current = 0;
    minSpeedRef.current = Infinity;
    speedHistoryRef.current = [];

    setDownloadedMB('0.00');
    setDownloadedGB('0.00');
    setLiveSpeedMbps('0.00');
    setAvgSpeed('0.00');
    setMaxSpeed('0.00');
    setMinSpeed('0.00');
    setResetCount(0);
    setTestDuration('00:00:00');
    setProgress(0);
  };

  const getSpeedColor = (speed: number) => {
    if (speed > 100) return 'text-purple-400';
    if (speed > 50) return 'text-cyan-400';
    if (speed > 20) return 'text-emerald-400';
    if (speed > 5) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const speedNum = parseFloat(liveSpeedMbps);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 via-pink-900 to-rose-900 flex items-center justify-center sm:p-4 md:p-6 ">
      {/* Colorful Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-3000"></div>
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1500"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-purple-500/20">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-xl shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent truncate">
                  CloudFlare Speed Test
                </h1>
                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-1 sm:gap-2">
                  <Globe className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="text-cyan-400 font-mono text-xs">{testDuration}</span>
                  <span className="hidden xs:inline">•</span>
                  <span className="text-xs">Powered by CloudFlare</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 ${
                status === 'Running...'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-400/30'
                  : 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-400 border border-rose-400/30'
              }`}>
                <Activity className={`w-3 h-3 ${status === 'Running...' ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{status}</span>
                <span className="xs:hidden">{status === 'Running...' ? 'Live' : 'Retry'}</span>
              </span>
            </div>
          </div>

          {/* Main Speed */}
          <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              Live Download Speed
            </div>
            <div className="mt-2">
              <span className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black ${getSpeedColor(speedNum)}`}>
                {liveSpeedMbps}
              </span>
              <span className="text-xl sm:text-2xl font-semibold text-slate-400 ml-1">Mbps</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="text-slate-400">Max: <span className="text-emerald-400 font-bold">{maxSpeed}</span></span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-rose-500/10 to-red-500/10 px-2 sm:px-3 py-1 rounded-full border border-rose-500/20">
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
                <span className="text-slate-400">Min: <span className="text-rose-400 font-bold">{minSpeed === 'Infinity' ? '0.00' : minSpeed}</span></span>
              </div>
            </div>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-red-500/20 p-3 sm:p-4 rounded-xl border border-pink-500/30 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-pink-400">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                Downloaded
              </div>
              <div className="text-base sm:text-lg font-bold text-pink-400 mt-1">
                {downloadedMB} <span className="text-[10px] sm:text-xs font-normal text-slate-400">MB</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">{downloadedGB} GB</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20 p-3 sm:p-4 rounded-xl border border-orange-500/30 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-orange-400">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                Average
              </div>
              <div className="text-base sm:text-lg font-bold text-orange-400 mt-1">
                {avgSpeed} <span className="text-[10px] sm:text-xs font-normal text-slate-400">Mbps</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">{connectionQuality}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 via-lime-500/20 to-green-500/20 p-3 sm:p-4 rounded-xl border border-yellow-500/30 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-yellow-400">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Resets
              </div>
              <div className="text-base sm:text-lg font-bold text-yellow-400 mt-1">{resetCount}</div>
              <div className="text-[10px] sm:text-xs text-slate-500">Connection attempts</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-cyan-500/20 p-3 sm:p-4 rounded-xl border border-green-500/30 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-green-400">
                <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
                Duration
              </div>
              <div className="text-base sm:text-lg font-bold text-green-400 mt-1 font-mono">{testDuration}</div>
              <div className="text-[10px] sm:text-xs text-slate-500">Running time</div>
            </div>
          </div>

          {/* Max & Min Speed Cards - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 p-3 sm:p-4 rounded-xl border border-emerald-500/30 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Maximum Speed
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
                {maxSpeed} <span className="text-sm font-normal text-slate-400">Mbps</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">Peak performance 🏆</div>
            </div>

            <div className="bg-gradient-to-br from-rose-500/20 via-red-500/20 to-pink-500/20 p-3 sm:p-4 rounded-xl border border-rose-500/30 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-rose-400">
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                Minimum Speed
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
                {minSpeed === 'Infinity' ? '0.00' : minSpeed} <span className="text-sm font-normal text-slate-400">Mbps</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">Lowest recorded 📉</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gradient-to-br from-slate-900/60 via-slate-800/60 to-slate-900/60 p-3 sm:p-4 rounded-xl border border-white/10 mb-4 sm:mb-6">
            <div className="flex flex-wrap justify-between text-[10px] sm:text-xs text-slate-400 mb-2 gap-1">
              <span className="flex items-center gap-1 sm:gap-2">
                <Signal className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                Progress
              </span>
              <span className="font-mono text-cyan-400">{progress.toFixed(1)}% of 100GB</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 sm:h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 via-red-500 via-yellow-500 via-green-500 via-cyan-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Buttons - Responsive */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mb-4">
            <button
              onClick={handleResetData}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              Reset Stats
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-pink-600 via-purple-600 via-cyan-600 to-emerald-600 hover:from-pink-500 hover:via-purple-500 hover:via-cyan-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Restart Test
            </button>
          </div>

          {/* Footer - Responsive */}
          <div className="text-center text-[10px] sm:text-xs text-slate-500 border-t border-white/10 pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-pink-400" />
              <span className="hidden xs:inline">Data persists across sessions</span>
              <span className="xs:hidden">Persists</span>
            </span>
            <span className="text-purple-400 hidden xs:inline">•</span>
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold text-[10px] sm:text-xs">
              ⚡ Max: {maxSpeed} Mbps
            </span>
            <span className="text-purple-400 hidden xs:inline">•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="hidden xs:inline">CloudFlare Network</span>
              <span className="xs:hidden">CF Network</span>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}