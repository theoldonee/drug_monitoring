'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCaseReport } from "@/app/review/actions"
import { 
  ArrowLeft, Video, FileText, Shield, 
  MessageSquare, AlertTriangle, Lightbulb, 
  Save, Check, Loader2, AlertCircle, Pill
} from "lucide-react"
import { useLanguage } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { RiskGauge } from '@/components/RiskGauge'

export function ReviewPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { t } = useLanguage();
    
    const [data, setData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) {
                console.log("No ID provided");
                return;
            }

            console.log("Fetching case report and AI response with ID:", params.id);
            setError(null);
            
            try {
                const supabase = await createClient();
                
                // 1. Fetch report details
                const { data: report, error: reportError } = await supabase
                    .from("reports")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (reportError) {
                    console.error("Report fetch error:", reportError);
                    setError(t('detail.loadError'));
                    return;
                }

                // 2. Fetch AI response details
                const { data: ai, error: aiError } = await supabase
                    .from("ai_responses")
                    .select("*")
                    .eq("report_id", params.id)
                    .maybeSingle();

                if (aiError) {
                    console.error("AI response fetch error:", aiError);
                }

                // Set combined state
                setData({
                    id: report.id,
                    incident_description: report.incident_description,
                    reported_drugs: report.reported_drugs || [],
                    drug_severity_tier: report.drug_severity_tier || 'NONE',
                    location_address: report.location_address || '',
                    location_lat: report.location_lat,
                    location_lng: report.location_lng,
                    video_url: report.video_url,
                    video_duration: report.video_duration,
                    status: report.status || 'PENDING_REVIEW',
                    ai_response_id: ai?.id,
                    scene_summary: ai?.scene_summary || '',
                    sentiment: {
                      tone: ai?.sentiment_tone || '',
                      urgency_level: ai?.urgency_level || 'low',
                      emotional_indicators: ai?.emotional_indicators || [],
                    },
                    risk_assessment: {
                      risk_level: ai?.risk_level || 'LOW',
                      risk_score: ai?.risk_score ?? 0,
                      identified_concerns: ai?.identified_concerns || [],
                      contributing_factors: ai?.contributing_factors || [],
                    },
                    recommendations: ai?.recommendations || [],
                });
            } catch (err) {
                console.error("Error in data loading pipeline:", err);
                setError(t('detail.serverError'));
            }
        }
        
        fetchData();
    }, [params.id, t]);

    const handleSaveChanges = async () => {
        if (!data) return;
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        
        const reportUpdates = {
            incident_description: data.incident_description,
            reported_drugs: data.reported_drugs,
            drug_severity_tier: data.drug_severity_tier,
            location_address: data.location_address,
            status: data.status,
        };

        const aiUpdates = {
            scene_summary: data.scene_summary,
            sentiment_tone: data.sentiment.tone,
            urgency_level: data.sentiment.urgency_level,
            emotional_indicators: data.sentiment.emotional_indicators,
            risk_level: data.risk_assessment.risk_level,
            risk_score: data.risk_assessment.risk_score,
            identified_concerns: data.risk_assessment.identified_concerns,
            contributing_factors: data.risk_assessment.contributing_factors,
            recommendations: data.recommendations,
        };

        const { success, error: updateErr } = await updateCaseReport(Number(params.id), reportUpdates, aiUpdates);
        
        if (success) {
            setIsEditing(false);
            setSuccessMessage(t('detail.savedSuccess'));
            router.refresh();
        } else {
            setError(updateErr || t('detail.saveError'));
        }
        setIsSaving(false);
    };

    const handleValidate = async () => {
        if (!data) return;
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        
        const reportUpdates = {
            status: 'APPROVED',
        };

        const { success, error: updateErr } = await updateCaseReport(Number(params.id), reportUpdates, {});
        
        if (success) {
            setData({ ...data, status: 'APPROVED' });
            setSuccessMessage(t('detail.validated'));
            router.refresh();
        } else {
            setError(updateErr || t('detail.serverError'));
        }
        setIsSaving(false);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--sg-slate)] text-[var(--sg-mist)] p-8 flex flex-col items-center justify-center">
                <AlertCircle className="h-10 w-10 text-[var(--sg-coral)] mb-4" />
                <p className="text-zinc-300 font-medium mb-4">{error}</p>
                <Link href="/review" className="text-sm text-[var(--sg-lagoon)] hover:underline flex items-center gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    {t('detail.backToReview')}
                </Link>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[var(--sg-slate)] text-[var(--sg-mist)] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-[var(--sg-lagoon)] animate-spin" />
                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('detail.loading')}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--sg-slate)] text-[var(--sg-mist)] py-8 px-6 font-sans">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Navigation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--sg-line)] pb-5">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/review"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sg-surface)] border border-[var(--sg-line)] text-[var(--sg-mist)] hover:text-zinc-205 hover:bg-[var(--sg-surface-raised)] transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                {t('detail.reviewReport')}
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                    data.status === 'APPROVED' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : data.status === 'FLAGGED'
                                        ? 'bg-[var(--sg-coral-dim)] text-[var(--sg-coral)] border-[var(--sg-coral)]/20'
                                        : 'bg-[var(--sg-amber-dim)] text-[var(--sg-amber)] border-[var(--sg-amber)]/20'
                                }`}>
                                    {data.status}
                                </span>
                            </h1>
                            <p className="text-xs text-[var(--sg-mist-dim)] mt-0.5 sg-mono">{t('detail.reportId')}: {data.id}</p>
                        </div>
                    </div>
                    
                    {/* Top Action Indicators & Language Switcher */}
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="flex items-center gap-3">
                            {isSaving && (
                                <span className="text-xs text-[var(--sg-mist-dim)] flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    {t('detail.saving')}
                                </span>
                            )}
                            {successMessage && (
                                <span className="text-xs text-emerald-450 font-medium">
                                    ✓ {successMessage}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video / Visual Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden bg-[var(--sg-surface)] border-[var(--sg-line)] text-[var(--sg-mist)] shadow-xl">
                            <CardHeader className="pb-3 border-b border-[var(--sg-line)] bg-[var(--sg-slate)]/40">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Video className="h-4 w-4 text-[var(--sg-lagoon)]" />
                                    {t('detail.originalVideo')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 bg-black aspect-video flex items-center justify-center">
                                {data.video_url ? (
                                    <video 
                                        src={data.video_url} 
                                        controls 
                                        className="w-full h-full object-contain" 
                                    />
                                ) : (
                                    <div className="text-center p-6 flex flex-col items-center">
                                        <Video className="h-8 w-8 text-[var(--sg-mist-dim)] mb-2" />
                                        <span className="text-xs text-[var(--sg-mist-dim)]">{t('detail.noVideo')}</span>
                                        {data.video_duration != null && (
                                            <span className="text-[10px] text-[var(--sg-mist-dim)] mt-1 sg-mono">{t('detail.duration')}: {data.video_duration}s</span>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Metadata and AI assessment Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Report Info */}
                        <Card className="bg-[var(--sg-surface)] border-[var(--sg-line)] text-[var(--sg-mist)] shadow-xl">
                            <CardHeader className="pb-3 border-b border-[var(--sg-line)] bg-[var(--sg-slate)]/40">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[var(--sg-lagoon)]" />
                                    {t('detail.witnessDetails')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="incident_description" className="text-[var(--sg-mist)] font-medium">{t('review.incidentDescription')}</Label>
                                            <textarea
                                                id="incident_description"
                                                value={data.incident_description}
                                                onChange={(e) => setData({ ...data, incident_description: e.target.value })}
                                                className="w-full min-h-[100px] rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 py-2 text-sm text-zinc-100 placeholder-[var(--sg-mist-dim)] outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] mt-1.5"
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor="reported_drugs" className="text-[var(--sg-mist)] font-medium">{t('review.reportedDrugs')} (comma-separated)</Label>
                                                <Input
                                                    id="reported_drugs"
                                                    value={data.reported_drugs.join(", ")}
                                                    onChange={(e) => setData({ ...data, reported_drugs: e.target.value.split(",").map(x => x.trim()).filter(Boolean) })}
                                                    className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100 focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)]"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="drug_severity_tier" className="text-[var(--sg-mist)] font-medium">{t('review.severityTier')}</Label>
                                                <div className="relative mt-1.5">
                                                    <select
                                                        id="drug_severity_tier"
                                                        value={data.drug_severity_tier}
                                                        onChange={(e) => setData({ ...data, drug_severity_tier: e.target.value })}
                                                        className="w-full h-10 rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] appearance-none"
                                                    >
                                                        <option value="NONE">NONE</option>
                                                        <option value="MILD">MILD</option>
                                                        <option value="MODERATE">MODERATE</option>
                                                        <option value="SEVERE">SEVERE</option>
                                                    </select>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sg-mist-dim)] pointer-events-none text-xs">▼</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor="location_address" className="text-[var(--sg-mist)] font-medium">{t('review.locationLabel')}</Label>
                                                <Input
                                                    id="location_address"
                                                    value={data.location_address}
                                                    onChange={(e) => setData({ ...data, location_address: e.target.value })}
                                                    className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100 focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)]"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="status" className="text-[var(--sg-mist)] font-medium">Case Status</Label>
                                                <div className="relative mt-1.5">
                                                    <select
                                                        id="status"
                                                        value={data.status}
                                                        onChange={(e) => setData({ ...data, status: e.target.value })}
                                                        className="w-full h-10 rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] appearance-none"
                                                    >
                                                        <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                                                        <option value="APPROVED">APPROVED</option>
                                                        <option value="FLAGGED">FLAGGED</option>
                                                    </select>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sg-mist-dim)] pointer-events-none text-xs">▼</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('review.incidentDescription')}</span>
                                            <p className="text-sm text-zinc-300 mt-1.5 leading-6 bg-[var(--sg-slate)]/40 p-4 rounded-lg border border-[var(--sg-line)]">
                                                {data.incident_description}
                                            </p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('review.reportedDrugs')}</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {data.reported_drugs.length > 0 ? (
                                                        data.reported_drugs.map((d: string, i: number) => (
                                                            <span key={i} className="text-xs bg-[var(--sg-surface-raised)] text-zinc-300 px-2 py-0.5 rounded border border-[var(--sg-line)]">
                                                                {d}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-[var(--sg-mist-dim)]">{t('detail.none')}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('review.severityTier')}</span>
                                                <p className="text-sm text-zinc-300 mt-1.5 font-semibold uppercase">{data.drug_severity_tier}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('review.locationLabel')}</span>
                                                <p className="text-sm text-zinc-300 mt-1.5 truncate">
                                                    {data.location_address || t('review.notProvided')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Summary Card */}
                        <Card className="bg-[var(--sg-surface)] border-[var(--sg-line)] text-[var(--sg-mist)] shadow-xl">
                            <CardHeader className="pb-3 border-b border-[var(--sg-line)] bg-[var(--sg-slate)]/40">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-[var(--sg-lagoon)]" />
                                    {t('detail.aiInsights')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-5">
                                <div>
                                    <Label htmlFor="scene_summary" className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('review.sceneSummary')}</Label>
                                    {isEditing ? (
                                        <textarea
                                            id="scene_summary"
                                            value={data.scene_summary}
                                            onChange={(e) => setData({ ...data, scene_summary: e.target.value })}
                                            className="w-full min-h-[80px] rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 py-2 text-sm text-zinc-100 placeholder-[var(--sg-mist-dim)] outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] mt-1.5"
                                        />
                                    ) : (
                                        <p className="text-sm text-zinc-305 mt-1.5 leading-6 bg-[var(--sg-slate)]/40 p-4 rounded-lg border border-[var(--sg-line)]">
                                            {data.scene_summary || 'No AI summary generated'}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Sentiment Card */}
                                    <Card className="bg-[var(--sg-slate)]/40 border-[var(--sg-line)]">
                                        <CardHeader className="pb-2 pt-3 px-4 border-b border-[var(--sg-line)]">
                                            <CardTitle className="text-xs font-semibold uppercase text-[var(--sg-mist)] flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5 text-[var(--sg-lagoon)]" />
                                                {t('detail.sentimentAnalysis')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <Sentiment 
                                                sentiment={data.sentiment} 
                                                isEditing={isEditing} 
                                                onChange={(updated) => setData({ ...data, sentiment: updated })}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Risk Assessment Card */}
                                    <Card className="bg-[var(--sg-slate)]/40 border-[var(--sg-line)]">
                                        <CardHeader className="pb-2 pt-3 px-4 border-b border-[var(--sg-line)]">
                                            <CardTitle className="text-xs font-semibold uppercase text-[var(--sg-mist)] flex items-center gap-1.5">
                                                <AlertTriangle className="h-3.5 w-3.5 text-[var(--sg-lagoon)]" />
                                                {t('detail.riskAssessment')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <RiskAssessment 
                                                riskAssessment={data.risk_assessment} 
                                                isEditing={isEditing} 
                                                onChange={(updated) => setData({ ...data, risk_assessment: updated })}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recommendations */}
                                <Card className="bg-[var(--sg-slate)]/40 border-[var(--sg-line)]">
                                    <CardHeader className="pb-2 pt-3 px-4 border-b border-[var(--sg-line)]">
                                        <CardTitle className="text-xs font-semibold uppercase text-[var(--sg-mist)] flex items-center gap-1.5">
                                            <Lightbulb className="h-3.5 w-3.5 text-[var(--sg-amber)]" />
                                            {t('detail.actionRecs')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <Recommendation 
                                            recommendations={data.recommendations} 
                                            isEditing={isEditing} 
                                            onChange={(updated) => setData({ ...data, recommendations: updated })}
                                        />
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-4 z-40 bg-[var(--sg-surface)]/90 backdrop-blur border border-[var(--sg-line)] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-2">
                        {data.status !== 'APPROVED' && (
                            <Button 
                                onClick={handleValidate}
                                disabled={isEditing || isSaving}
                                className="bg-[var(--sg-lagoon)] text-[var(--sg-slate)] hover:opacity-90 font-bold shadow-md shadow-[var(--sg-lagoon-glow)] flex items-center gap-1.5 cursor-pointer"
                            >
                                <Check className="h-4 w-4" />
                                {t('detail.validateApprove')}
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isSaving}
                            className="border-[var(--sg-line-strong)] hover:bg-[var(--sg-surface-raised)] text-[var(--sg-mist)] bg-transparent"
                        >
                            {isEditing ? t('detail.cancel') : t('detail.editInsights')}
                        </Button>
                    </div>

                    {isEditing && (
                        <Button 
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="bg-[var(--sg-lagoon)] text-[var(--sg-slate)] hover:opacity-90 font-bold shadow-md shadow-[var(--sg-lagoon-glow)] flex items-center gap-1.5 w-full sm:w-auto cursor-pointer"
                        >
                            <Save className="h-4 w-4" />
                            {t('detail.saveChanges')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Sentiment({ sentiment, isEditing, onChange }: { sentiment: any; isEditing: boolean; onChange: (updated: any) => void }) {
    const { t } = useLanguage();

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="tone" className="text-[var(--sg-mist)] font-medium">{t('detail.tone')}</Label>
                    <Input
                        id="tone"
                        value={sentiment.tone}
                        onChange={(e) => onChange({ ...sentiment, tone: e.target.value })}
                        className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100"
                    />
                </div>
                <div>
                    <Label htmlFor="urgency" className="text-[var(--sg-mist)] font-medium">{t('detail.urgencyLevel')}</Label>
                    <div className="relative mt-1.5">
                        <select
                            id="urgency"
                            value={sentiment.urgency_level}
                            onChange={(e) => onChange({ ...sentiment, urgency_level: e.target.value })}
                            className="w-full h-10 rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] appearance-none"
                        >
                            <option value="low">low</option>
                            <option value="medium">medium</option>
                            <option value="high">high</option>
                            <option value="critical">critical</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sg-mist-dim)] pointer-events-none text-xs">▼</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="emotions" className="text-[var(--sg-mist)] font-medium">{t('detail.emotionalIndicators')} (comma-separated)</Label>
                    <Input
                        id="emotions"
                        value={Array.isArray(sentiment.emotional_indicators) ? sentiment.emotional_indicators.join(", ") : ""}
                        onChange={(e) => onChange({ ...sentiment, emotional_indicators: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })}
                        className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('detail.tone')}</span>
                <span className="text-sm font-semibold text-zinc-300 capitalize">{sentiment.tone || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('detail.urgencyLevel')}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    sentiment.urgency_level === 'critical' || sentiment.urgency_level === 'high'
                        ? 'bg-[var(--sg-coral-dim)] text-[var(--sg-coral)] border border-[var(--sg-coral)]/15'
                        : 'bg-[var(--sg-surface-raised)] text-[var(--sg-mist)]'
                }`}>
                    {sentiment.urgency_level}
                </span>
            </div>
            <div>
                <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('detail.emotionalIndicators')}</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.isArray(sentiment.emotional_indicators) && sentiment.emotional_indicators.length > 0 ? (
                      sentiment.emotional_indicators.map((indicator: string, idx: number) => (
                        <span key={idx} className="bg-[var(--sg-slate)] text-[var(--sg-mist)] px-2 py-0.5 rounded text-xs border border-[var(--sg-line)]">
                            {indicator}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--sg-mist-dim)]">{t('detail.none')}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function RiskAssessment({ riskAssessment, isEditing, onChange }: { riskAssessment: any; isEditing: boolean; onChange: (updated: any) => void }) {
    const { t } = useLanguage();

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="level" className="text-[var(--sg-mist)] font-medium">{t('detail.riskLevel')}</Label>
                    <div className="relative mt-1.5">
                        <select
                            id="level"
                            value={riskAssessment.risk_level}
                            onChange={(e) => onChange({ ...riskAssessment, risk_level: e.target.value })}
                            className="w-full h-10 rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] appearance-none"
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sg-mist-dim)] pointer-events-none text-xs">▼</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="score" className="text-[var(--sg-mist)] font-medium">{t('detail.riskScore')} (0-100)</Label>
                    <Input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={riskAssessment.risk_score}
                        onChange={(e) => onChange({ ...riskAssessment, risk_score: parseInt(e.target.value) || 0 })}
                        className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100"
                    />
                </div>
                <div>
                    <Label htmlFor="concerns" className="text-[var(--sg-mist)] font-medium">{t('detail.identifiedConcerns')} (comma-separated)</Label>
                    <Input
                        id="concerns"
                        value={Array.isArray(riskAssessment.identified_concerns) ? riskAssessment.identified_concerns.join(", ") : ""}
                        onChange={(e) => onChange({ ...riskAssessment, identified_concerns: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })}
                        className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100"
                    />
                </div>
                <div>
                    <Label htmlFor="factors" className="text-[var(--sg-mist)] font-medium">{t('detail.contributingFactors')} (comma-separated)</Label>
                    <Input
                        id="factors"
                        value={Array.isArray(riskAssessment.contributing_factors) ? riskAssessment.contributing_factors.join(", ") : ""}
                        onChange={(e) => onChange({ ...riskAssessment, contributing_factors: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })}
                        className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 flex flex-col items-center">
            <RiskGauge
                score={riskAssessment.risk_score}
                level={riskAssessment.risk_level}
                size={140}
            />
            <div className="w-full space-y-3 mt-4 text-left">
                <div>
                    <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('detail.identifiedConcerns')}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {Array.isArray(riskAssessment.identified_concerns) && riskAssessment.identified_concerns.length > 0 ? (
                          riskAssessment.identified_concerns.map((concern: string, idx: number) => (
                            <span key={idx} className="bg-[var(--sg-coral-dim)] text-[var(--sg-coral)] px-2 py-0.5 rounded text-xs border border-[var(--sg-coral)]/15">
                                {concern}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[var(--sg-mist-dim)]">{t('detail.none')}</span>
                        )}
                    </div>
                </div>
                <div>
                    <span className="text-xs text-[var(--sg-mist-dim)] uppercase tracking-wider font-semibold">{t('detail.contributingFactors')}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {Array.isArray(riskAssessment.contributing_factors) && riskAssessment.contributing_factors.length > 0 ? (
                          riskAssessment.contributing_factors.map((factor: string, idx: number) => (
                            <span key={idx} className="bg-[var(--sg-slate)] text-[var(--sg-mist)] px-2 py-0.5 rounded text-xs border border-[var(--sg-line)]">
                                {factor}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[var(--sg-mist-dim)]">{t('detail.none')}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Recommendation({ recommendations, isEditing, onChange }: { recommendations: string[]; isEditing: boolean; onChange: (updated: string[]) => void }) {
    const { t } = useLanguage();

    if (isEditing) {
        return (
            <div className="space-y-4">
                <Label htmlFor="recs" className="text-[var(--sg-mist)] font-medium">{t('detail.actionRecs')} (comma-separated)</Label>
                <Input
                    id="recs"
                    value={Array.isArray(recommendations) ? recommendations.join(", ") : ""}
                    onChange={(e) => onChange(e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))}
                    className="mt-1.5 bg-[var(--sg-slate)] border-[var(--sg-line-strong)] text-zinc-100"
                    placeholder="Enter recommendations separated by commas"
                />
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {Array.isArray(recommendations) && recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--sg-slate)]/40 rounded-lg border border-[var(--sg-line)]">
                    <span className="text-[var(--sg-lagoon)] font-bold text-xs mt-0.5">{idx + 1}.</span>
                    <span className="text-xs text-zinc-350 leading-5">{rec}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-[var(--sg-mist-dim)]">{t('detail.none')}</span>
            )}
        </div>
    );
}