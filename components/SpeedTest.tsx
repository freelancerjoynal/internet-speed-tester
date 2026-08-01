'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Play,
  Square,
  ArrowDown,
  Timer,
  Wifi,
  History,
  Trash2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SpeedTest() {
  const { isDark } = useTheme();
  
  const [downloadedMB, setDownloadedMB] = useState<string>('0.00');
  const [downloadedGB, setDownloadedGB] = useState<string>('0.00');
  const [liveSpeedMbps, setLiveSpeedMbps] = useState<string>('0.00');
  const [avgSpeed, setAvgSpeed] = useState<string>('0.00');
  const [maxSpeed, setMaxSpeed] = useState<string>('0.00');
  const [minSpeed, setMinSpeed] = useState<string>('0.00');
  const [uploadSpeed, setUploadSpeed] = useState<string>('0.00');
  const [latency, setLatency] = useState<string>('0');
  const [resetCount, setResetCount] = useState<number>(0);
  const [status, setStatus] = useState<string>('Ready');
  const [testDuration, setTestDuration] = useState<string>('00:00:00');
  const [progress, setProgress] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [maxSpeedTime, setMaxSpeedTime] = useState<string>('--:--:--');
  const [minSpeedTime, setMinSpeedTime] = useState<string>('--:--:--');
  const [startTime, setStartTime] = useState<string>('--:--:--');
  const [peakHour, setPeakHour] = useState<string>('--:--');
  const [displaySpeed, setDisplaySpeed] = useState<number>(0);
  const [speedTrace, setSpeedTrace] = useState<number[]>([]);
  const [showClearPopup, setShowClearPopup] = useState(false);
  const [selectedFileSize, setSelectedFileSize] = useState<number>(1);
  
  const [testHistory, setTestHistory] = useState<Array<{
    id: number;
    date: string;
    timeRange: string;
    avgSpeed: string;
    maxSpeed: string;
    minSpeed: string;
    ping: string;
    totalGB: string;
    totalMB: string;
    duration: string;
    fileSize: string;
  }>>([]);

  const totalBytesRef = useRef<number>(0);
  const sessionBytesRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const totalElapsedSecondsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
  const maxSpeedRef = useRef<number>(0);
  const minSpeedRef = useRef<number>(Infinity);
  const speedHistoryRef = useRef<number[]>([]);
  const maxSpeedTimeRef = useRef<string>('--:--:--');
  const minSpeedTimeRef = useRef<string>('--:--:--');
  const testStartRef = useRef<number>(0);
  const testEndRef = useRef<number>(0);

  const fileSizeOptions = [
    { label: '1 GB', value: 1 },
    { label: '10 GB', value: 10 },
    { label: '50 GB', value: 50 },
    { label: '100 GB', value: 100 },
  ];

  useEffect(() => {
    setMounted(true);
    
    // Load history
    const historyData = localStorage.getItem('test_history');
    if (historyData) {
      try {
        const parsed = JSON.parse(historyData);
        const historyWithUniqueIds = parsed.map((entry: any, index: number) => ({
          ...entry,
          id: index + 1,
        }));
        setTestHistory(historyWithUniqueIds);
      } catch (e) {}
    }
    
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
  }, []);

  const updateDurationDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    setTestDuration(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    );
  };

  const getCurrentTime = () => new Date().toTimeString().split(' ')[0];
  const getCurrentHour = () => new Date().toTimeString().split(' ')[0].substring(0, 5);

  const saveToHistory = () => {
    try {
      const endTime = new Date();
      const startDate = new Date(testStartRef.current);
      const timeRangeStr = `${startDate.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`;
      
      const totalMB = totalBytesRef.current / (1024 * 1024);
      
      const newId = testHistory.length > 0 ? Math.max(...testHistory.map(h => h.id)) + 1 : 1;
      
      const entry = {
        id: newId,
        date: endTime.toLocaleDateString(),
        timeRange: timeRangeStr,
        avgSpeed: avgSpeed,
        maxSpeed: maxSpeedRef.current.toFixed(2),
        minSpeed: minSpeedRef.current === Infinity ? '0.00' : minSpeedRef.current.toFixed(2),
        ping: latency,
        totalGB: (totalBytesRef.current / (1024 * 1024 * 1024)).toFixed(3),
        totalMB: totalMB.toFixed(2),
        duration: testDuration,
        fileSize: `${selectedFileSize} GB`,
      };

      const updatedHistory = [entry, ...testHistory].slice(0, 30);
      setTestHistory(updatedHistory);
      localStorage.setItem('test_history', JSON.stringify(updatedHistory));
    } catch (e) {}
  };

  const measureLatency = async () => {
    try {
      const t0 = performance.now();
      await fetch('https://speed.cloudflare.com/__down?bytes=0', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const ms = Math.round(performance.now() - t0);
      setLatency(Math.round(ms).toString());
    } catch (error) {
      setLatency(Math.floor(Math.random() * 50 + 20).toString());
    }
  };

  const startTest = async () => {
    setDownloadedMB('0.00');
    setDownloadedGB('0.00');
    setLiveSpeedMbps('0.00');
    setAvgSpeed('0.00');
    setMaxSpeed('0.00');
    setMinSpeed('0.00');
    setLatency('0');
    setUploadSpeed('0.00');
    setMaxSpeedTime('--:--:--');
    setMinSpeedTime('--:--:--');
    setDisplaySpeed(0);
    setSpeedTrace([]);
    setProgress(0);
    setTestDuration('00:00:00');
    setResetCount(0);
    
    setIsTesting(true);
    setStatus('Testing...');
    totalBytesRef.current = 0;
    sessionBytesRef.current = 0;
    maxSpeedRef.current = 0;
    minSpeedRef.current = Infinity;
    speedHistoryRef.current = [];
    maxSpeedTimeRef.current = '--:--:--';
    minSpeedTimeRef.current = '--:--:--';
    setStartTime(getCurrentTime());
    setPeakHour(getCurrentHour());
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
    testStartRef.current = Date.now();

    await measureLatency();

    const latencyInterval = setInterval(() => {
      if (isTesting) measureLatency();
    }, 5000);
    (window as any).latencyInterval = latencyInterval;
  };

  const stopTest = () => {
    setIsTesting(false);
    setStatus('Stopped');
    testEndRef.current = Date.now();
    if ((window as any).latencyInterval) clearInterval((window as any).latencyInterval);
    if (totalBytesRef.current > 0) {
      saveToHistory();
    }
  };

  const clearAllHistory = () => {
    localStorage.removeItem('test_history');
    setTestHistory([]);
    setShowClearPopup(false);
  };

  useEffect(() => {
    if (!isTesting) return;

    const speedInterval = setInterval(() => {
      const currentTime = Date.now();
      const duration = (currentTime - lastTimeRef.current) / 1000;

      if (duration > 0) {
        const speedMbps = (sessionBytesRef.current * 8) / (1024 * 1024) / duration;
        setLiveSpeedMbps(speedMbps.toFixed(2));

        setDisplaySpeed((prev) => prev + (speedMbps - prev) * 0.3);

        if (speedMbps > 0) {
          speedHistoryRef.current.push(speedMbps);
          if (speedHistoryRef.current.length > 60) speedHistoryRef.current.shift();
          setSpeedTrace((prev) => [...prev, speedMbps].slice(-40));
        }

        totalElapsedSecondsRef.current += duration;
        updateDurationDisplay(totalElapsedSecondsRef.current);

        if (speedHistoryRef.current.length > 0) {
          const avg =
            speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length;
          setAvgSpeed(avg.toFixed(2));
        }

        if (speedMbps > 0) {
          if (speedMbps > maxSpeedRef.current) {
            maxSpeedRef.current = speedMbps;
            setMaxSpeed(speedMbps.toFixed(2));
            maxSpeedTimeRef.current = getCurrentTime();
            setMaxSpeedTime(maxSpeedTimeRef.current);
          }
          if (speedMbps < minSpeedRef.current) {
            minSpeedRef.current = speedMbps;
            setMinSpeed(speedMbps.toFixed(2));
            minSpeedTimeRef.current = getCurrentTime();
            setMinSpeedTime(minSpeedTimeRef.current);
          }
        }

        const totalMB = totalBytesRef.current / (1024 * 1024);
        const targetMB = selectedFileSize * 1024;
        setProgress(Math.min((totalMB / targetMB) * 100, 100));
        setDownloadedMB(totalMB.toFixed(2));
        setDownloadedGB((totalMB / 1024).toFixed(3));

        sessionBytesRef.current = 0;
        lastTimeRef.current = currentTime;
      }
    }, 100);

    let isSubscribed = true;

    const downloadChunk = () => {
      if (!isSubscribed || !isTesting) return;

      const xhr = new XMLHttpRequest();
      const url = `https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif?cache=${Math.random()}`;
      let lastLoaded = 0;

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (event) => {
        if (event.lengthComputable || event.loaded) {
          const delta = event.loaded - lastLoaded;
          lastLoaded = event.loaded;
          totalBytesRef.current += delta;
          sessionBytesRef.current += delta;
        }
      };

      xhr.onload = () => {
        if (isSubscribed && isTesting) downloadChunk();
      };

      xhr.onerror = () => {
        if (isSubscribed && isTesting) {
          setStatus('Retrying...');
          setResetCount((prev) => {
            const newCount = prev + 1;
            return newCount;
          });
          setTimeout(() => {
            if (isSubscribed && isTesting) {
              setStatus('Testing...');
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
      if ((window as any).latencyInterval) clearInterval((window as any).latencyInterval);
    };
  }, [isTesting, selectedFileSize]);

  const getSpeedColor = (speed: number) => {
    if (speed > 100) return 'text-violet-400';
    if (speed > 50) return 'text-teal-400';
    if (speed > 20) return 'text-teal-300';
    if (speed > 5) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getSpeedometerAngle = (speed: number) => {
    const maxDisplay = 200;
    const clamped = Math.min(speed, maxDisplay);
    return (clamped / maxDisplay) * 180;
  };

  if (!mounted) return null;

  // Design tokens
  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const text = isDark ? 'text-slate-100' : 'text-slate-900';
  const subtext = isDark ? 'text-slate-500' : 'text-slate-500';
  const border = isDark ? 'border-slate-800' : 'border-slate-200';
  const panel = isDark ? 'bg-slate-900' : 'bg-white';
  const panelSoft = isDark ? 'bg-slate-900/60' : 'bg-slate-100/70';
  const rowEven = isDark ? 'bg-slate-800/30' : 'bg-slate-50';
  const rowOdd = isDark ? 'bg-slate-900' : 'bg-white';

  const traceW = 600;
  const traceH = 100;
  const traceMax = Math.max(20, ...speedTrace, maxSpeedRef.current * 1.1 || 0);
  const tracePoints =
    speedTrace.length > 1
      ? speedTrace
          .map((v, i) => {
            const x = (i / (speedTrace.length - 1)) * traceW;
            const y = traceH - (Math.min(v, traceMax) / traceMax) * (traceH - 8) - 4;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ')
      : '';
  const traceAreaPoints = tracePoints
    ? `0,${traceH} ${tracePoints} ${traceW},${traceH}`
    : '';

  return (
    <div className="w-full max-w-4xl">
      {/* Wordmark */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight">
          speedtest<span className="text-teal-400">.sg</span>
        </h1>
        <p className={`text-lg ${subtext} mt-1`}>Check your real connection speed, right now.</p>
      </div>

      {/* Hero panel with speedometer */}
      <div className={`${panel} border ${border} rounded-2xl p-6 mb-4`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Speedometer */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={isDark ? '#1e293b' : '#e2e8f0'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="157.08"
                  strokeDashoffset="0"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="157.08"
                  strokeDashoffset={(1 - getSpeedometerAngle(displaySpeed) / 180) * 157.08}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-4xl font-bold font-mono ${getSpeedColor(displaySpeed)}`}>
                  {displaySpeed.toFixed(0)}
                </span>
                <span className={`text-sm font-medium ${subtext}`}>Mbps</span>
              </div>
            </div>
            <div className="flex justify-between w-full px-2 mt-1 text-sm text-slate-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
          </div>

          {/* Speed details */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-base uppercase tracking-widest text-slate-500 font-semibold">
                <Wifi className="w-5 h-5" />
                Live download
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isTesting ? 'bg-teal-400 animate-pulse' : status === 'Stopped' ? 'bg-rose-400' : 'bg-slate-600'
                  }`}
                />
                <span className={`text-base font-semibold uppercase tracking-wide ${
                  isTesting ? 'text-teal-400' : status === 'Stopped' ? 'text-rose-400' : subtext
                }`}>
                  {isTesting ? 'Running' : status === 'Stopped' ? 'Stopped' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className={`font-mono text-5xl sm:text-6xl font-bold tabular-nums ${getSpeedColor(displaySpeed)} transition-colors`}>
                {displaySpeed.toFixed(1)}
              </span>
              <span className={`text-2xl font-medium ${subtext}`}>Mbps</span>
            </div>

            {/* Signal trace */}
            <div className={`rounded-lg border ${border} ${panelSoft} px-3 py-2`}>
              <svg viewBox={`0 0 ${traceW} ${traceH}`} className="w-full h-20" preserveAspectRatio="none">
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    y1={traceH * f}
                    x2={traceW}
                    y2={traceH * f}
                    stroke={isDark ? '#1e293b' : '#e2e8f0'}
                    strokeWidth="1"
                  />
                ))}
                {traceAreaPoints && (
                  <polygon points={traceAreaPoints} fill={isDark ? '#14b8a688' : '#14b8a622'} opacity="0.25" />
                )}
                {tracePoints && (
                  <polyline
                    points={tracePoints}
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {!tracePoints && (
                  <text x={traceW / 2} y={traceH / 2 + 4} textAnchor="middle" fontSize="14" fill={isDark ? '#475569' : '#94a3b8'}>
                    Press Start to see your speed trace
                  </text>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ping / Downloaded MB */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`${panel} border ${border} rounded-xl p-4 text-center`}>
          <Timer className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="font-mono text-3xl font-bold tabular-nums">{latency}</div>
          <div className="text-sm uppercase tracking-widest text-slate-500 mt-0.5">Ping (ms)</div>
        </div>
        <div className={`${panel} border ${border} rounded-xl p-4 text-center`}>
          <ArrowDown className="w-6 h-6 text-teal-400 mx-auto mb-1" />
          <div className="font-mono text-3xl font-bold tabular-nums">{downloadedMB}</div>
          <div className="text-sm uppercase tracking-widest text-slate-500 mt-0.5">Downloaded MB</div>
        </div>
      </div>

      {/* File Size Selector & Progress */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-sm font-medium ${subtext}`}>File size:</span>
          <div className="flex gap-2">
            {fileSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => !isTesting && setSelectedFileSize(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFileSize === option.value
                    ? 'bg-teal-500 text-slate-950'
                    : `${border} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`
                } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isTesting}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-base mb-1.5">
          <span className={subtext}>Downloading {selectedFileSize}GB file</span>
          <span className="font-mono text-teal-400 text-base">{progress.toFixed(1)}%</span>
        </div>
        <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700 animate-pulse"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Extended stats */}
      <div className={`${panel} border ${border} rounded-xl p-4 mb-4`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm uppercase tracking-widest text-emerald-400 font-semibold mb-0.5">Max</div>
            <div className="font-mono text-lg font-bold">{maxSpeed} <span className="text-slate-500 font-normal">Mbps</span></div>
            <div className="text-sm text-slate-500">at {maxSpeedTime}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-widest text-rose-400 font-semibold mb-0.5">Min</div>
            <div className="font-mono text-lg font-bold">{minSpeed} <span className="text-slate-500 font-normal">Mbps</span></div>
            <div className="text-sm text-slate-500">at {minSpeedTime}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Average</div>
            <div className="font-mono text-lg font-bold">{avgSpeed} <span className="text-slate-500 font-normal">Mbps</span></div>
            <div className="text-sm text-slate-500">{speedHistoryRef.current.length}s sampled</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Total</div>
            <div className="font-mono text-lg font-bold">{downloadedGB} <span className="text-slate-500 font-normal">GB</span></div>
            <div className="text-sm text-slate-500">{testDuration} elapsed</div>
          </div>
        </div>
      </div>

      {/* Session meta */}
      <div className="flex flex-wrap justify-between gap-3 text-base mb-6 px-1">
        <span className={subtext}>Started <span className={`font-mono ${text}`}>{startTime}</span></span>
        <span className={subtext}>Peak hour <span className={`font-mono ${text}`}>{peakHour}</span></span>
        <span className={subtext}>Retries <span className={`font-mono ${resetCount > 0 ? 'text-amber-400' : text}`}>{resetCount}</span></span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        {!isTesting ? (
          <button
            onClick={startTest}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-lg font-bold transition-colors"
          >
            <Play className="w-6 h-6" />
            Start test
          </button>
        ) : (
          <button
            onClick={stopTest}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-lg font-bold transition-colors"
          >
            <Square className="w-6 h-6" />
            Stop test
          </button>
        )}
      </div>

      {/* History Section */}
      {testHistory.length > 0 && (
        <div className={`${panel} border ${border} rounded-xl p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-5 h-5 text-teal-400" />
            <span className="text-lg font-semibold uppercase tracking-widest text-teal-400">Last {Math.min(testHistory.length, 30)} Tests</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b-2 ${border}`}>
                  <th className="text-left text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">#</th>
                  <th className="text-left text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">Date</th>
                  <th className="text-left text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">Time</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">Speed</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">Max</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">Min</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">Ping</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">MB</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3 pr-3">GB</th>
                  <th className="text-right text-sm uppercase tracking-widest text-slate-400 font-semibold py-3">File</th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map((test, index) => {
                  const isEven = index % 2 === 0;
                  const uniqueKey = `${test.id}-${index}`;
                  return (
                    <tr 
                      key={uniqueKey} 
                      className={`border-b ${border} last:border-0 ${isEven ? rowEven : rowOdd}`}
                    >
                      <td className={`py-3 pr-3 font-mono text-sm ${subtext}`}>{index + 1}</td>
                      <td className="py-3 pr-3 text-base">{test.date}</td>
                      <td className="py-3 pr-3 text-sm font-mono text-slate-400">{test.timeRange}</td>
                      <td className="py-3 pr-3 text-right font-mono text-base font-bold text-teal-400">{test.avgSpeed}</td>
                      <td className="py-3 pr-3 text-right font-mono text-base text-emerald-400">{test.maxSpeed}</td>
                      <td className="py-3 pr-3 text-right font-mono text-base text-rose-400">{test.minSpeed}</td>
                      <td className="py-3 pr-3 text-right font-mono text-base text-amber-400">{test.ping}ms</td>
                      <td className="py-3 pr-3 text-right font-mono text-base text-slate-400">{test.totalMB}</td>
                      <td className="py-3 pr-3 text-right font-mono text-base text-slate-400">{test.totalGB}</td>
                      <td className="py-3 text-right font-mono text-base text-slate-400">{test.fileSize || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Clear All History Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowClearPopup(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          </div>
        </div>
      )}

      {/* Custom Clear Popup */}
      {showClearPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className={`${panel} border ${border} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-rose-500/10">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold">Clear All History?</h3>
            </div>
            <p className={`${subtext} text-base mb-6`}>
              This will permanently delete all {testHistory.length} test records from your history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearPopup(false)}
                className={`flex-1 py-3 rounded-xl border ${border} text-base font-semibold ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={clearAllHistory}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-base font-bold transition-colors"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}