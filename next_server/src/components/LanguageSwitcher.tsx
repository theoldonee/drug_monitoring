'use client';

import { useLanguage, type Lang } from '@/lib/i18n';

const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  fr: 'FR',
  kr: 'KR',
};

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-[var(--sg-line-strong)] overflow-hidden">
      {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all duration-200 ${
            lang === l
              ? 'bg-[var(--sg-lagoon)] text-[var(--sg-slate)]'
              : 'text-[var(--sg-mist-dim)] hover:text-[var(--sg-mist)] hover:bg-[var(--sg-surface-raised)]'
          }`}
          aria-label={`Switch language to ${l.toUpperCase()}`}
          aria-pressed={lang === l}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
