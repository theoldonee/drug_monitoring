'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function IntroOverlay() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing');

  // Check reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setPhase('done');
    }
  }, []);

  // Check if intro has already been shown this session
  useEffect(() => {
    if (reducedMotion) return;
    const shown = sessionStorage.getItem('sg-intro-shown');
    if (shown) {
      setPhase('done');
    }
  }, [reducedMotion]);

  // Auto-complete after animation
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setTimeout(() => {
      setPhase('fading');
      sessionStorage.setItem('sg-intro-shown', '1');
    }, 9000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Remove from DOM after fade
  useEffect(() => {
    if (phase !== 'fading') return;
    const timer = setTimeout(() => setPhase('done'), 800);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleSkip = useCallback(() => {
    if (phase === 'playing') {
      setPhase('fading');
      sessionStorage.setItem('sg-intro-shown', '1');
    }
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className="sg-intro-overlay fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleSkip}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSkip(); }}
      role="button"
      tabIndex={0}
      aria-label="Skip intro animation"
      style={{
        background: 'var(--sg-slate)',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(45, 212, 168, 0.04) 0%, transparent 60%)',
          animation: 'sg-intro-bg 10s ease-out forwards',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Shield icon */}
        <div
          style={{
            animation: 'sg-intro-icon 4s ease-out forwards',
            opacity: 0,
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--sg-lagoon-dim)] ring-1 ring-[var(--sg-lagoon)] ring-opacity-30">
            <Shield className="h-8 w-8 text-[var(--sg-lagoon)]" />
          </div>
        </div>

        {/* Decorative line */}
        <div
          className="h-[1px] bg-[var(--sg-lagoon)]"
          style={{
            animation: 'sg-intro-line 6s ease-out forwards',
            width: 0,
            opacity: 0,
          }}
        />

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-white tracking-[0.3em]"
          style={{
            fontFamily: 'var(--font-sans)',
            animation: 'sg-intro-title 6s ease-out forwards',
            opacity: 0,
          }}
        >
          {t('intro.title')}
        </h1>

        {/* Tagline */}
        <p
          className="text-sm text-[var(--sg-mist)] tracking-wider"
          style={{
            animation: 'sg-intro-tagline 8s ease-out forwards',
            opacity: 0,
          }}
        >
          {t('intro.tagline')}
        </p>
      </div>

      {/* Skip prompt */}
      <p
        className="absolute bottom-8 text-xs text-[var(--sg-mist-dim)] tracking-wider"
        style={{
          animation: 'sg-intro-skip 3s ease-out forwards',
          opacity: 0,
        }}
      >
        {t('intro.skip')}
      </p>
    </div>
  );
}
