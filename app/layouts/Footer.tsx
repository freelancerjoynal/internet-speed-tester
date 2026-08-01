'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();
  const border = isDark ? 'border-slate-800' : 'border-slate-200';
  const subtext = isDark ? 'text-slate-500' : 'text-slate-500';
  const text = isDark ? 'text-slate-100' : 'text-slate-900';

  return (
    <footer className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-8">
      <div className={`border-t ${border} mt-10 pt-8`}>
        <h2 className={`text-2xl font-bold mb-3 ${text}`}>About this test</h2>
        <p className={`text-lg ${subtext} leading-relaxed mb-6`}>
          netspeedly measures your connection against a Singapore-based server, so results reflect
          your real broadband performance rather than a distant, congested route. Run it during peak
          and off-peak hours to see the full picture of what your line delivers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Local infrastructure', desc: 'Runs against Singapore-hosted servers on the local backbone, not an overseas region.' },
            { label: 'Independent & ISP-neutral', desc: 'Not owned or operated by Singtel, StarHub, M1, or any provider.' },
            { label: 'No install, no account', desc: 'Open the page and press Start — nothing to download or sign up for.' },
            { label: 'Built for tracking trends', desc: 'Your history is saved on this device so you can compare tests over time.' },
          ].map((item) => (
            <div key={item.label} className={`border ${border} rounded-lg p-4`}>
              <div className={`text-lg font-semibold mb-1 ${text}`}>{item.label}</div>
              <div className={`text-base ${subtext} leading-relaxed`}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}