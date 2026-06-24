'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AlertCircle, CheckCircle2, Shield, Upload, MapPin, Loader2, LogIn } from 'lucide-react';

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
      setErrorMessage('Invalid file format. Please select an MP4, MOV, or WEBM video.');
      setFile(null);
      setDuration(null);
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 100MB limit.');
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
      return [...acc, <strong key={index} className="text-red-400 font-bold">148</strong>, part];
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
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-200 py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-zinc-900/50 border border-white/[0.06] rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/[0.06] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 ring-1 ring-red-500/30">
              <Shield className="h-4.5 w-4.5 text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                SafeGuard MU
              </h1>
              <p className="text-xs text-zinc-500">Anonymous Incident Reporting</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 ring-1 ring-white/[0.05]">
              Secure &amp; Anonymous
            </span>
            <Link
              href="/login"
              id="staff-login-btn"
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10"
            >
              <LogIn className="h-3.5 w-3.5" />
              Staff Login
            </Link>
          </div>
        </header>

        {/* Status: Uploading */}
        {statusState === 'uploading' && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
            <h2 className="text-lg font-medium text-zinc-100">Uploading Video...</h2>
            <p className="text-xs text-zinc-500 mt-1">Please keep this window open while the video is transferred.</p>
            <div className="w-full max-w-md bg-zinc-800 h-2.5 rounded-full mt-6 overflow-hidden ring-1 ring-white/[0.04]">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-emerald-400 mt-2">{uploadPercent}%</span>
          </div>
        )}

        {/* Status: Analysing */}
        {statusState === 'analysing' && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-12 w-10 text-indigo-400 animate-spin mb-4" />
            <h2 className="text-lg font-medium text-zinc-100 animate-pulse">Analysing Incident...</h2>
            <p className="text-xs text-zinc-500 mt-1">Our AI is extracting frames and evaluating risk metrics.</p>
          </div>
        )}

        {/* Status: Complete (AI Report Card) */}
        {statusState === 'complete' && analysisResult && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Assessment Complete</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Score card */}
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Incident Severity</p>
                  <p className="text-3xl font-extrabold text-zinc-100 mt-2">
                    {analysisResult.risk_assessment.risk_score}
                    <span className="text-sm text-zinc-500 font-normal"> / 100</span>
                  </p>
                </div>
                <div className="mt-4">
                  {analysisResult.risk_assessment.risk_level === 'CRITICAL' && (
                    <span className="inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-400 ring-1 ring-red-500/20">Critical Risk</span>
                  )}
                  {analysisResult.risk_assessment.risk_level === 'HIGH' && (
                    <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400 ring-1 ring-orange-500/20">High Risk</span>
                  )}
                  {analysisResult.risk_assessment.risk_level === 'MEDIUM' && (
                    <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-400 ring-1 ring-yellow-500/20">Medium Risk</span>
                  )}
                  {analysisResult.risk_assessment.risk_level === 'LOW' && (
                    <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/20">Low Risk</span>
                  )}
                </div>
              </div>

              {/* Sentiment card */}
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Sentiment &amp; Urgency</p>
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500 font-medium">Tone:</span> {analysisResult.sentiment.tone}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500 font-medium">Urgency:</span>{' '}
                    <span className="capitalize">{analysisResult.sentiment.urgency_level}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scene Summary */}
            <div className="mt-6 p-5 rounded-xl border border-white/[0.06] bg-zinc-900/50">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Scene Summary</p>
              <p className="text-sm text-zinc-300 leading-6">{analysisResult.scene_summary}</p>
            </div>

            {/* Grid lists */}
            <div className="grid gap-6 mt-6 sm:grid-cols-2">
              <div className="p-5 rounded-xl border border-white/[0.06] bg-zinc-900/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Emotional Indicators</p>
                <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1.5">
                  {analysisResult.sentiment.emotional_indicators.map((ind: string, idx: number) => (
                    <li key={idx}>{ind}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.06] bg-zinc-900/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Identified Concerns</p>
                <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1.5">
                  {analysisResult.risk_assessment.identified_concerns.map((con: string, idx: number) => (
                    <li key={idx}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contributing factors */}
            <div className="mt-6 p-5 rounded-xl border border-white/[0.06] bg-zinc-900/50">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Contributing Factors</p>
              <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1.5">
                {analysisResult.risk_assessment.contributing_factors.map((fac: string, idx: number) => (
                  <li key={idx}>{fac}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-5 rounded-xl border border-red-500/10 bg-red-500/[0.02]">
              <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-3">Recommendations &amp; Local Resources</p>
              <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-2">
                {analysisResult.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="leading-6">
                    {highlightHelpline(rec)}
                  </li>
                ))}
              </ul>
            </div>

            <footer className="mt-8 text-center text-xs text-zinc-600 border-t border-white/[0.04] pt-4">
              This report has been submitted for professional review.
            </footer>
          </div>
        )}

        {/* Status: Idle or Error (Form UI) */}
        {(statusState === 'idle' || statusState === 'error') && (
          <div className="p-6 space-y-6">
            {statusState === 'error' && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-400">Submission Error</h3>
                  <p className="text-xs text-red-300/80 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* 1. Video Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-300">Video Upload</label>
              <div className="relative border-2 border-dashed border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-xl bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-300 font-medium">Click to select video</p>
                <p className="text-xs text-zinc-500 mt-1">MP4, MOV, or WEBM up to 100MB</p>
                
                {file && (
                  <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium">
                    Selected: {file.name} {duration !== null ? `(${duration}s)` : ''}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Incident Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-zinc-300">Incident Description</label>
                <span className="text-xs text-zinc-500">Min 20 characters</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed — behaviour, surroundings, what was said..."
                rows={4}
                className="w-full rounded-xl bg-zinc-950 border border-white/[0.08] focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all resize-none"
              />
              <div className="flex justify-between items-center text-xs text-zinc-600 px-1">
                <span>{description.length} characters</span>
                {description.length > 0 && description.length < 20 && (
                  <span className="text-amber-500/70">Needs {20 - description.length} more characters</span>
                )}
              </div>
            </div>

            {/* 3. Drug(s) Involved */}
            <div className="space-y-2 relative">
              <label className="block text-sm font-semibold text-zinc-300">Drug(s) Involved</label>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full text-left rounded-xl bg-zinc-950 border border-white/[0.08] p-4 text-sm text-zinc-400 flex items-center justify-between focus:outline-none focus:border-white/[0.15]"
              >
                <span>
                  {selectedDrugs.length > 0
                    ? selectedDrugs.join(', ')
                    : 'Select Drug(s) (required)'}
                </span>
                <span className="text-zinc-500 text-xs">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 rounded-xl bg-zinc-900 border border-white/[0.08] shadow-2xl p-4 max-h-[300px] overflow-y-auto space-y-4">
                  {Object.entries(DRUG_OPTIONS).map(([tier, drugs]) => (
                    <div key={tier} className="space-y-2">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.04] pb-1">
                        {tier} Tier
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
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'hover:bg-white/[0.02] border border-transparent text-zinc-400'
                              }`}
                            >
                              <div
                                className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked
                                    ? 'border-red-400 bg-red-400/20 text-red-400'
                                    : 'border-white/[0.1] bg-zinc-950'
                                }`}
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
                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                  Derived Severity: <span className="font-semibold text-red-400">{deriveSeverityTier()}</span>
                </div>
              )}
            </div>

            {/* 4. Incident Location (Map) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-300">Incident Location (required)</label>
              <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                <MapPicker onLocationSelect={handleLocationSelect} selectedLat={lat} selectedLng={lng} />
              </div>
              {address && (
                <div className="bg-zinc-950/40 border border-white/[0.04] p-3 rounded-lg flex items-start gap-2.5 text-xs text-zinc-400">
                  <MapPin className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-300 block mb-0.5">Selected Address:</span>
                    <span className="leading-5">{address}</span>
                    <span className="text-[10px] text-zinc-600 block mt-1">Coordinates: {lat?.toFixed(6)}, {lng?.toFixed(6)}</span>
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
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/[0.02]'
                  : 'bg-gradient-to-r from-red-500 to-amber-500 text-zinc-100 hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-lg shadow-red-500/10'
              }`}
            >
              Submit Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
