'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AlertCircle, CheckCircle2, Shield, Upload, MapPin, Loader2, LogIn } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { IntroOverlay } from '@/components/IntroOverlay';
import { RiskGauge } from '@/components/RiskGauge';

// Dynamically import Leaflet Map Picker to prevent SSR errors
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const DRUG_OPTIONS = {
  NONE: ['None / Unknown'],
  MILD: ['Alcohol', 'Cannabis'],
  MODERATE: [
    'Prescription Medication (misuse)',
    'Benzodiazepines (e.g. Xanax, Valium)',
    'Tramadol',
    'Synthetic Cannabinoids (K2/Spice)',
  ],
  SEVERE: [
    'Heroin',
    'Cocaine',
    'Crack Cocaine',
    'Crystal Methamphetamine',
    'MDMA / Ecstasy',
  ],
  OTHER: ['Multiple Substances', 'Other'],
};

export default function HomePage() {
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Location states
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // Flow states: 'idle' | 'uploading' | 'analysing' | 'complete' | 'error'
  const [statusState, setStatusState] = useState<'idle' | 'uploading' | 'analysing' | 'complete' | 'error'>('idle');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const getVideoDuration = (videoFile: File): Promise<number> => {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        window.URL.revokeObjectURL(v.src);
        resolve(Math.round(v.duration));
      };
      v.onerror = () => resolve(0);
      v.src = URL.createObjectURL(videoFile);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setErrorMessage('');
    
    if (!selectedFile) {
      setFile(null);
      setDuration(null);
      return;
    }

    const validExtensions = ['mp4', 'mov', 'webm'];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(extension)) {
      setErrorMessage(t('home.invalidFormat'));
      setFile(null);
      setDuration(null);
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMessage(t('home.fileTooLarge'));
      setFile(null);
      setDuration(null);
      return;
    }

    setFile(selectedFile);
    const dur = await getVideoDuration(selectedFile);
    setDuration(dur);
  };

  const handleDrugToggle = (drug: string) => {
    if (selectedDrugs.includes(drug)) {
      setSelectedDrugs(selectedDrugs.filter((d) => d !== drug));
    } else {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
  };

  // Derive drug severity tier
  const deriveSeverityTier = () => {
    const hasSevere = selectedDrugs.some((d) => DRUG_OPTIONS.SEVERE.includes(d));
    if (hasSevere) return 'SEVERE';

    const hasModerate = selectedDrugs.some((d) => DRUG_OPTIONS.MODERATE.includes(d));
    if (hasModerate) return 'MODERATE';

    const hasMild = selectedDrugs.some((d) => DRUG_OPTIONS.MILD.includes(d));
    if (hasMild) return 'MILD';

    return 'NONE';
  };

  const handleLocationSelect = (selectedLat: number, selectedLng: number, selectedAddress: string) => {
    setLat(selectedLat);
    setLng(selectedLng);
    setAddress(selectedAddress);
  };

  const handleSubmit = () => {
    if (
      !file ||
      description.length < 20 ||
      selectedDrugs.length === 0 ||
      lat === null ||
      lng === null ||
      !address
    ) return;

    setStatusState('uploading');
    setUploadPercent(0);
    setErrorMessage('');

    const drugSeverity = deriveSeverityTier();

    const formData = new FormData();
    formData.append('video', file);
    formData.append('duration', duration !== null ? duration.toString() : '0');
    formData.append('incident_description', description);
    formData.append('reported_drugs', JSON.stringify(selectedDrugs));
    formData.append('drug_severity_tier', drugSeverity);
    
    if (lat !== null && lng !== null && address !== null) {
      formData.append('location_lat', lat.toString());
      formData.append('location_lng', lng.toString());
      formData.append('location_address', address);
    }

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadPercent(percent);
      }
    });

    xhr.upload.addEventListener('load', () => {
      setStatusState('analysing');
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          const responseData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setAnalysisResult(responseData.ai_response);
            setStatusState('complete');
          } else {
            setErrorMessage(responseData.error || 'Video analysis failed. Please try again.');
            setStatusState('error');
          }
        } catch (err) {
          setErrorMessage(`Analysis failed. Server returned status code ${xhr.status}.`);
          setStatusState('error');
        }
      }
    };

    xhr.open('POST', '/api/analyse-video');
    xhr.send(formData);
  };

  // Bold helper for helplines containing "148"
  const highlightHelpline = (text: string) => {
    const parts = text.split('148');
    return parts.reduce((acc, part, index) => {
      if (index === 0) return [part] as any[];
      return [...acc, <strong key={index} className="text-[var(--sg-coral)] font-bold sg-mono">148</strong>, part];
    }, [] as any[]);
  };

  const isSubmitDisabled =
    !file ||
    description.length < 20 ||
    selectedDrugs.length === 0 ||
    lat === null ||
    lng === null ||
    !address ||
    statusState === 'uploading' ||
    statusState === 'analysing';

  return (
    <>
      <IntroOverlay />
      <div className="min-h-screen py-12 px-6 flex flex-col items-center justify-center" style={{ background: 'var(--sg-slate)' }}>
        <div className="w-full max-w-2xl sg-card shadow-2xl shadow-black/30 overflow-hidden">
          {/* Header */}
          <header className="border-b border-[var(--sg-line)] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sg-lagoon-dim)] ring-1 ring-[var(--sg-lagoon)]/30">
                <Shield className="h-4.5 w-4.5 text-[var(--sg-lagoon)]" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('nav.brand')}
                </h1>
                <p className="text-xs text-[var(--sg-mist-dim)]">{t('nav.tagline')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <span className="hidden sm:inline-flex text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-[var(--sg-surface-raised)] text-[var(--sg-mist-dim)] ring-1 ring-[var(--sg-line)]">
                {t('nav.secure')}
              </span>
              <Link
                href="/login"
                id="staff-login-btn"
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--sg-lagoon)] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[var(--sg-lagoon)]/20 hover:border-[var(--sg-lagoon)]/40 bg-[var(--sg-lagoon-dim)] hover:bg-[var(--sg-lagoon)]/20"
              >
                <LogIn className="h-3.5 w-3.5" />
                {t('nav.staffLogin')}
              </Link>
            </div>
          </header>

          {/* Status: Uploading */}
          {statusState === 'uploading' && (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-10 w-10 text-[var(--sg-lagoon)] animate-spin mb-4" />
              <h2 className="text-lg font-medium text-white">{t('home.uploading')}</h2>
              <p className="text-xs text-[var(--sg-mist-dim)] mt-1">{t('home.uploadHint')}</p>
              <div className="w-full max-w-md h-2.5 rounded-full mt-6 overflow-hidden ring-1 ring-[var(--sg-line)]" style={{ background: 'var(--sg-surface-raised)' }}>
                <div
                  className="h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadPercent}%`, background: 'var(--sg-lagoon)' }}
                />
              </div>
              <span className="text-sm font-semibold text-[var(--sg-lagoon)] mt-2 sg-mono">{uploadPercent}%</span>
            </div>
          )}

          {/* Status: Analysing */}
          {statusState === 'analysing' && (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-12 w-10 text-[var(--sg-lagoon)] animate-spin mb-4" />
              <h2 className="text-lg font-medium text-white animate-pulse">{t('home.analysing')}</h2>
              <p className="text-xs text-[var(--sg-mist-dim)] mt-1">{t('home.analysisHint')}</p>
            </div>
          )}

          {/* Status: Complete (AI Report Card) */}
          {statusState === 'complete' && analysisResult && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-5 w-5 text-[var(--sg-lagoon)]" />
                <h2 className="text-lg font-semibold text-white">{t('home.complete')}</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Risk Gauge */}
                <div className="sg-card-raised p-6 flex flex-col items-center justify-center">
                  <p className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold mb-4">{t('home.severity')}</p>
                  <RiskGauge
                    score={analysisResult.risk_assessment.risk_score}
                    level={analysisResult.risk_assessment.risk_level}
                    size={180}
                  />
                </div>

                {/* Sentiment card */}
                <div className="sg-card-raised p-5">
                  <p className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('home.sentiment')}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-sm text-[var(--sg-mist)]">
                      <span className="text-[var(--sg-mist-dim)] font-medium">{t('home.tone')}:</span> {analysisResult.sentiment.tone}
                    </p>
                    <p className="text-sm text-[var(--sg-mist)]">
                      <span className="text-[var(--sg-mist-dim)] font-medium">{t('home.urgency')}:</span>{' '}
                      <span className="capitalize">{analysisResult.sentiment.urgency_level}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Scene Summary */}
              <div className="mt-6 p-5 sg-card-raised">
                <p className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold mb-2">{t('home.sceneSummary')}</p>
                <p className="text-sm text-[var(--sg-mist)] leading-6">{analysisResult.scene_summary}</p>
              </div>

              {/* Grid lists */}
              <div className="grid gap-6 mt-6 sm:grid-cols-2">
                <div className="p-5 sg-card-raised">
                  <p className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold mb-3">{t('home.emotionalIndicators')}</p>
                  <ul className="list-disc pl-5 text-sm text-[var(--sg-mist)] space-y-1.5">
                    {analysisResult.sentiment.emotional_indicators.map((ind: string, idx: number) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 sg-card-raised">
                  <p className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold mb-3">{t('home.identifiedConcerns')}</p>
                  <ul className="list-disc pl-5 text-sm text-[var(--sg-mist)] space-y-1.5">
                    {analysisResult.risk_assessment.identified_concerns.map((con: string, idx: number) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contributing factors */}
              <div className="mt-6 p-5 sg-card-raised">
                <p className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold mb-3">{t('home.contributingFactors')}</p>
                <ul className="list-disc pl-5 text-sm text-[var(--sg-mist)] space-y-1.5">
                  {analysisResult.risk_assessment.contributing_factors.map((fac: string, idx: number) => (
                    <li key={idx}>{fac}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-5 rounded-lg border border-[var(--sg-coral)]/10" style={{ background: 'var(--sg-coral-dim)' }}>
                <p className="text-xs text-[var(--sg-coral)] uppercase tracking-wider font-semibold mb-3">{t('home.recommendations')}</p>
                <ul className="list-disc pl-5 text-sm text-[var(--sg-mist)] space-y-2">
                  {analysisResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="leading-6">
                      {highlightHelpline(rec)}
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="mt-8 text-center text-xs text-[var(--sg-mist-dim)] border-t border-[var(--sg-line)] pt-4">
                {t('home.reportSubmitted')}
              </footer>
            </div>
          )}

          {/* Status: Idle or Error (Form UI) */}
          {(statusState === 'idle' || statusState === 'error') && (
            <div className="p-6 space-y-6">
              {statusState === 'error' && (
                <div className="rounded-lg p-4 flex items-start gap-3 border border-[var(--sg-coral)]/20" style={{ background: 'var(--sg-coral-dim)' }}>
                  <AlertCircle className="h-5 w-5 text-[var(--sg-coral)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--sg-coral)]">{t('home.submissionError')}</h3>
                    <p className="text-xs text-[var(--sg-coral)]/80 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* 1. Video Upload */}
              <div className="space-y-2">
                <label className="sg-label block">{t('home.videoUpload')}</label>
                <div className="relative border-2 border-dashed border-[var(--sg-line-strong)] hover:border-[var(--sg-lagoon)]/30 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer" style={{ background: 'var(--sg-slate)' }}>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-8 w-8 text-[var(--sg-mist-dim)] mb-2" />
                  <p className="text-sm text-[var(--sg-mist)] font-medium">{t('home.clickToSelect')}</p>
                  <p className="text-xs text-[var(--sg-mist-dim)] mt-1">{t('home.fileHint')}</p>
                  
                  {file && (
                    <div className="mt-4 p-2 rounded-lg text-xs font-medium border border-[var(--sg-lagoon)]/20" style={{ background: 'var(--sg-lagoon-dim)', color: 'var(--sg-lagoon)' }}>
                      {t('home.selected')}: {file.name} {duration !== null ? `(${duration}s)` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Incident Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="sg-label block">{t('home.description')}</label>
                  <span className="text-xs text-[var(--sg-mist-dim)]">{t('home.descMin')}</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('home.descPlaceholder')}
                  rows={4}
                  className="w-full sg-input resize-none"
                />
                <div className="flex justify-between items-center text-xs text-[var(--sg-mist-dim)] px-1">
                  <span>{description.length} {t('home.characters')}</span>
                  {description.length > 0 && description.length < 20 && (
                    <span className="text-[var(--sg-amber)]/70">{t('home.needsMore', { n: 20 - description.length })}</span>
                  )}
                </div>
              </div>

              {/* 3. Drug(s) Involved */}
              <div className="space-y-2 relative">
                <label className="sg-label block">{t('home.drugsInvolved')}</label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full text-left sg-input flex items-center justify-between"
                >
                  <span className="text-[var(--sg-mist-dim)]">
                    {selectedDrugs.length > 0
                      ? selectedDrugs.join(', ')
                      : t('home.selectDrugs')}
                  </span>
                  <span className="text-[var(--sg-mist-dim)] text-xs">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl p-4 max-h-[300px] overflow-y-auto space-y-4 border border-[var(--sg-line-strong)]" style={{ background: 'var(--sg-surface)' }}>
                    {Object.entries(DRUG_OPTIONS).map(([tier, drugs]) => (
                      <div key={tier} className="space-y-2">
                        <h4 className="text-[10px] font-bold text-[var(--sg-mist-dim)] uppercase tracking-widest border-b border-[var(--sg-line)] pb-1">
                          {tier} {t('home.tier')}
                        </h4>
                        <div className="grid gap-2 grid-cols-2">
                          {drugs.map((drug) => {
                            const isChecked = selectedDrugs.includes(drug);
                            return (
                              <div
                                key={drug}
                                onClick={() => handleDrugToggle(drug)}
                                className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                  isChecked
                                    ? 'text-[var(--sg-coral)] border border-[var(--sg-coral)]/20'
                                    : 'hover:bg-white/[0.02] border border-transparent text-[var(--sg-mist)]'
                                }`}
                                style={isChecked ? { background: 'var(--sg-coral-dim)' } : undefined}
                              >
                                <div
                                  className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${
                                    isChecked
                                      ? 'border-[var(--sg-coral)] text-[var(--sg-coral)]'
                                      : 'border-[var(--sg-line-strong)]'
                                  }`}
                                  style={isChecked ? { background: 'var(--sg-coral-dim)' } : { background: 'var(--sg-slate)' }}
                                >
                                  {isChecked && '✓'}
                                </div>
                                <span className="truncate">{drug}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDrugs.length > 0 && (
                  <div className="text-xs text-[var(--sg-mist-dim)] mt-1 flex items-center gap-1.5">
                    {t('home.derivedSeverity')}: <span className="font-semibold text-[var(--sg-coral)]">{deriveSeverityTier()}</span>
                  </div>
                )}
              </div>

              {/* 4. Incident Location (Map) */}
              <div className="space-y-2">
                <label className="sg-label block">{t('home.location')}</label>
                <div className="rounded-xl overflow-hidden border border-[var(--sg-line-strong)]">
                  <MapPicker onLocationSelect={handleLocationSelect} selectedLat={lat} selectedLng={lng} />
                </div>
                {address && (
                  <div className="p-3 rounded-lg flex items-start gap-2.5 text-xs text-[var(--sg-mist)] border border-[var(--sg-line)]" style={{ background: 'var(--sg-slate)' }}>
                    <MapPin className="h-4 w-4 text-[var(--sg-mist-dim)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[var(--sg-mist)] block mb-0.5">{t('home.selectedAddress')}:</span>
                      <span className="leading-5">{address}</span>
                      <span className="text-[10px] text-[var(--sg-mist-dim)] block mt-1 sg-mono">{t('home.coordinates')}: {lat?.toFixed(6)}, {lng?.toFixed(6)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isSubmitDisabled
                    ? 'cursor-not-allowed border border-[var(--sg-line)] text-[var(--sg-mist-dim)]'
                    : 'text-[var(--sg-slate)] hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-lg'
                }`}
                style={
                  isSubmitDisabled
                    ? { background: 'var(--sg-surface-raised)' }
                    : { background: 'var(--sg-lagoon)', boxShadow: '0 4px 20px var(--sg-lagoon-glow)' }
                }
              >
                {t('home.submit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
