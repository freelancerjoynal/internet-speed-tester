import Link from "next/link";
import { Cloud, Server, Zap, Activity, Globe, Shield, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-3000"></div>
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-purple-500/20 text-center">
          
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 text-emerald-400 text-sm font-semibold mb-4">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Internet Speed Test Suite</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Test Your Bandwidth
            </h1>
            
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Choose your preferred test provider and measure your internet speed with real-time metrics, 
              colorful visualizations, and detailed analytics.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold text-sm">Real-time</span>
              </div>
              <p className="text-xs text-slate-400">Live speed monitoring with instant updates</p>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
                <Globe className="w-5 h-5" />
                <span className="font-semibold text-sm">Multi-CDN</span>
              </div>
              <p className="text-xs text-slate-400">CloudFlare & Wikimedia CDN options</p>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-sm">Persistent</span>
              </div>
              <p className="text-xs text-slate-400">Data saved across sessions with localStorage</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/cloudflare" className="group">
              <div className="p-6 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">CloudFlare</h3>
                      <p className="text-xs text-slate-400">Speed Test</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="mt-3 text-xs text-slate-400 text-left">
                  ⚡ Global CDN network • High accuracy
                </div>
              </div>
            </Link>

            <Link href="/wikimedia" className="group">
              <div className="p-6 bg-gradient-to-br from-pink-600/20 via-rose-600/20 to-orange-600/20 rounded-2xl border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-500/30">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">Wikimedia</h3>
                      <p className="text-xs text-slate-400">CDN Test</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="mt-3 text-xs text-slate-400 text-left">
                  📦 Open media files • 4 parallel streams
                </div>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Choose a test to begin
              </span>
              <span className="text-slate-600">•</span>
              <span>Free & open source</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                No registration required
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}