'use client';

import { useEffect, useRef, useState } from 'react';

interface RiskGaugeProps {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  size?: number;
}

function getGaugeColor(score: number): string {
  if (score <= 30) return 'var(--sg-lagoon)';
  if (score <= 60) return 'var(--sg-amber)';
  if (score <= 80) return 'var(--sg-orange)';
  return 'var(--sg-coral)';
}

function getLevelLabel(level: string): string {
  switch (level) {
    case 'CRITICAL': return 'Critical Risk';
    case 'HIGH': return 'High Risk';
    case 'MEDIUM': return 'Medium Risk';
    case 'LOW': return 'Low Risk';
    default: return level;
  }
}

function getLevelColorClass(level: string): string {
  switch (level) {
    case 'CRITICAL': return 'text-[var(--sg-coral)]';
    case 'HIGH': return 'text-[var(--sg-orange)]';
    case 'MEDIUM': return 'text-[var(--sg-amber)]';
    case 'LOW': return 'text-[var(--sg-lagoon)]';
    default: return 'text-[var(--sg-mist)]';
  }
}

export function RiskGauge({ score, level, size = 200 }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [animatedDeg, setAnimatedDeg] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const targetDeg = (score / 100) * 180;
  const gaugeColor = getGaugeColor(score);
  const isCritical = level === 'CRITICAL';

  useEffect(() => {
    // Check reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setDisplayScore(score);
      setAnimatedDeg(targetDeg);
      return;
    }

    startTimeRef.current = performance.now();
    const duration = 1200; // ms

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayScore(Math.round(eased * score));
      setAnimatedDeg(eased * targetDeg);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score, targetDeg]);

  const half = size / 2;
  const strokeWidth = Math.max(12, size * 0.07);
  const radius = half - strokeWidth / 2 - 4;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference - (animatedDeg / 180) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: size, height: half + 16 }}
      >
        <svg
          width={size}
          height={half + 16}
          viewBox={`0 0 ${size} ${half + 16}`}
          className="overflow-visible"
        >
          {/* Track */}
          <path
            d={`M ${strokeWidth / 2 + 4} ${half + 4} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 4} ${half + 4}`}
            fill="none"
            stroke="var(--sg-surface-raised)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${strokeWidth / 2 + 4} ${half + 4} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 4} ${half + 4}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: isCritical ? `drop-shadow(0 0 8px ${gaugeColor})` : undefined,
              transition: 'filter 0.3s',
            }}
          />
        </svg>

        {/* Score number */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ bottom: 0 }}
        >
          <span
            className="text-4xl font-bold tabular-nums sg-mono"
            style={{ color: gaugeColor }}
          >
            {displayScore}
          </span>
          <span className="text-sm text-[var(--sg-mist-dim)] ml-0.5">/100</span>
        </div>
      </div>

      {/* Level badge */}
      <span
        className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${getLevelColorClass(level)}`}
        style={{
          background: `color-mix(in srgb, ${gaugeColor} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${gaugeColor} 20%, transparent)`,
          animation: isCritical ? 'sg-gauge-pulse 2s ease-in-out infinite' : undefined,
        }}
      >
        {getLevelLabel(level)}
      </span>
    </div>
  );
}
