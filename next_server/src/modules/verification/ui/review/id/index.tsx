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
  Save, Check, Loader2, AlertCircle
} from "lucide-react"

export function ReviewPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    
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
                    setError("Failed to load incident report details.");
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
                setError("An error occurred while communicating with the server.");
            }
        }
        
        fetchData();
    }, [params.id]);

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
            setSuccessMessage("Changes saved successfully.");
            router.refresh();
        } else {
            setError(updateErr || "An error occurred while saving changes.");
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
            setSuccessMessage("Report has been validated and approved.");
            router.refresh();
        } else {
            setError(updateErr || "An error occurred while validating the report.");
        }
        setIsSaving(false);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8 flex flex-col items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-zinc-300 font-medium mb-4">{error}</p>
                <Link href="/review" className="text-sm text-teal-400 hover:underline flex items-center gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Case Review
                </Link>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Loading Report...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 py-8 px-6 font-sans">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Navigation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/review"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                Review Case Report
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                    data.status === 'APPROVED' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : data.status === 'FLAGGED'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {data.status}
                                </span>
                            </h1>
                            <p className="text-xs text-zinc-500 mt-0.5">Report ID: {data.id}</p>
                        </div>
                    </div>
                    
                    {/* Top Action Indicators */}
                    <div className="flex items-center gap-3">
                        {isSaving && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving...
                            </span>
                        )}
                        {successMessage && (
                            <span className="text-xs text-emerald-400 font-medium">
                                ✓ {successMessage}
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video / Visual Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden bg-zinc-900 border-white/[0.06] text-zinc-200 shadow-xl">
                            <CardHeader className="pb-3 border-b border-white/[0.04]">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Video className="h-4 w-4 text-teal-400" />
                                    Original Video
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
                                        <Video className="h-8 w-8 text-zinc-700 mb-2" />
                                        <span className="text-xs text-zinc-500">No video file available</span>
                                        {data.video_duration != null && (
                                            <span className="text-[10px] text-zinc-600 mt-1">Duration: {data.video_duration}s</span>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Metadata and AI assessment Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Report Info */}
                        <Card className="bg-zinc-900 border-white/[0.06] text-zinc-200 shadow-xl">
                            <CardHeader className="pb-3 border-b border-white/[0.04]">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-teal-400" />
                                    Witness Submission Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="incident_description" className="text-zinc-400 font-medium">Incident Description</Label>
                                            <textarea
                                                id="incident_description"
                                                value={data.incident_description}
                                                onChange={(e) => setData({ ...data, incident_description: e.target.value })}
                                                className="w-full min-h-[100px] rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 mt-1.5"
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor="reported_drugs" className="text-zinc-400 font-medium">Reported Drugs (comma-separated)</Label>
                                                <Input
                                                    id="reported_drugs"
                                                    value={data.reported_drugs.join(", ")}
                                                    onChange={(e) => setData({ ...data, reported_drugs: e.target.value.split(",").map(x => x.trim()).filter(Boolean) })}
                                                    className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="drug_severity_tier" className="text-zinc-400 font-medium">Severity Tier</Label>
                                                <select
                                                    id="drug_severity_tier"
                                                    value={data.drug_severity_tier}
                                                    onChange={(e) => setData({ ...data, drug_severity_tier: e.target.value })}
                                                    className="w-full h-10 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 mt-1.5"
                                                >
                                                    <option value="NONE">NONE</option>
                                                    <option value="MILD">MILD</option>
                                                    <option value="MODERATE">MODERATE</option>
                                                    <option value="SEVERE">SEVERE</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor="location_address" className="text-zinc-400 font-medium">Location Address</Label>
                                                <Input
                                                    id="location_address"
                                                    value={data.location_address}
                                                    onChange={(e) => setData({ ...data, location_address: e.target.value })}
                                                    className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="status" className="text-zinc-400 font-medium">Case Status</Label>
                                                <select
                                                    id="status"
                                                    value={data.status}
                                                    onChange={(e) => setData({ ...data, status: e.target.value })}
                                                    className="w-full h-10 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 mt-1.5"
                                                >
                                                    <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                                                    <option value="APPROVED">APPROVED</option>
                                                    <option value="FLAGGED">FLAGGED</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Incident Description</span>
                                            <p className="text-sm text-zinc-300 mt-1.5 leading-6 bg-zinc-950/40 p-4 rounded-lg border border-white/[0.03]">
                                                {data.incident_description}
                                            </p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Reported Drugs</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {data.reported_drugs.length > 0 ? (
                                                        data.reported_drugs.map((d: string, i: number) => (
                                                            <span key={i} className="text-xs bg-zinc-850 text-zinc-300 px-2 py-0.5 rounded border border-white/[0.04]">
                                                                {d}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-zinc-600">None</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Severity Tier</span>
                                                <p className="text-sm text-zinc-300 mt-1.5 font-semibold uppercase">{data.drug_severity_tier}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Location</span>
                                                <p className="text-sm text-zinc-300 mt-1.5 truncate">
                                                    {data.location_address || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Summary Card */}
                        <Card className="bg-zinc-900 border-white/[0.06] text-zinc-200 shadow-xl">
                            <CardHeader className="pb-3 border-b border-white/[0.04]">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-indigo-400" />
                                    AI Case Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-5">
                                <div>
                                    <Label htmlFor="scene_summary" className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Scene Summary</Label>
                                    {isEditing ? (
                                        <textarea
                                            id="scene_summary"
                                            value={data.scene_summary}
                                            onChange={(e) => setData({ ...data, scene_summary: e.target.value })}
                                            className="w-full min-h-[80px] rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 mt-1.5"
                                        />
                                    ) : (
                                        <p className="text-sm text-zinc-300 mt-1.5 leading-6 bg-zinc-950/40 p-4 rounded-lg border border-white/[0.03]">
                                            {data.scene_summary || 'No AI summary generated'}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Sentiment Card */}
                                    <Card className="bg-zinc-950/40 border-white/[0.04]">
                                        <CardHeader className="pb-2 pt-3 px-4 border-b border-white/[0.03]">
                                            <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                Sentiment Analysis
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
                                    <Card className="bg-zinc-950/40 border-white/[0.04]">
                                        <CardHeader className="pb-2 pt-3 px-4 border-b border-white/[0.03]">
                                            <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                Risk Assessment
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
                                <Card className="bg-zinc-950/40 border-white/[0.04]">
                                    <CardHeader className="pb-2 pt-3 px-4 border-b border-white/[0.03]">
                                        <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                                            <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                                            Action Recommendations
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
                <div className="sticky bottom-4 z-40 bg-zinc-900/90 backdrop-blur border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-2">
                        {data.status !== 'APPROVED' && (
                            <Button 
                                onClick={handleValidate}
                                disabled={isEditing || isSaving}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-600/10 flex items-center gap-1.5"
                            >
                                <Check className="h-4 w-4" />
                                Validate &amp; Approve
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isSaving}
                            className="border-white/[0.08] hover:bg-zinc-800 text-zinc-300"
                        >
                            {isEditing ? "Cancel" : "Edit Insights"}
                        </Button>
                    </div>

                    {isEditing && (
                        <Button 
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10 flex items-center gap-1.5 w-full sm:w-auto"
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Sentiment({ sentiment, isEditing, onChange }: { sentiment: any; isEditing: boolean; onChange: (updated: any) => void }) {
    if (isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="tone" className="text-zinc-400 font-medium">Tone</Label>
                    <Input
                        id="tone"
                        value={sentiment.tone}
                        onChange={(e) => onChange({ ...sentiment, tone: e.target.value })}
                        className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                    />
                </div>
                <div>
                    <Label htmlFor="urgency" className="text-zinc-400 font-medium">Urgency Level</Label>
                    <select
                        id="urgency"
                        value={sentiment.urgency_level}
                        onChange={(e) => onChange({ ...sentiment, urgency_level: e.target.value })}
                        className="w-full h-10 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 mt-1.5"
                    >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                        <option value="critical">critical</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="emotions" className="text-zinc-400 font-medium">Emotional Indicators (comma-separated)</Label>
                    <Input
                        id="emotions"
                        value={Array.isArray(sentiment.emotional_indicators) ? sentiment.emotional_indicators.join(", ") : ""}
                        onChange={(e) => onChange({ ...sentiment, emotional_indicators: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })}
                        className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Tone</span>
                <span className="text-sm font-semibold text-zinc-300 capitalize">{sentiment.tone || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Urgency</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    sentiment.urgency_level === 'critical' || sentiment.urgency_level === 'high'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                        : 'bg-zinc-800 text-zinc-400'
                }`}>
                    {sentiment.urgency_level}
                </span>
            </div>
            <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Emotional Indicators</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.isArray(sentiment.emotional_indicators) && sentiment.emotional_indicators.length > 0 ? (
                      sentiment.emotional_indicators.map((indicator: string, idx: number) => (
                        <span key={idx} className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded text-xs border border-white/[0.04]">
                            {indicator}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-650">None</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function RiskAssessment({ riskAssessment, isEditing, onChange }: { riskAssessment: any; isEditing: boolean; onChange: (updated: any) => void }) {
    if (isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="level" className="text-zinc-400 font-medium">Risk Level</Label>
                    <select
                        id="level"
                        value={riskAssessment.risk_level}
                        onChange={(e) => onChange({ ...riskAssessment, risk_level: e.target.value })}
                        className="w-full h-10 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 mt-1.5"
                    >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="score" className="text-zinc-400 font-medium">Risk Score (0-100)</Label>
                    <Input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={riskAssessment.risk_score}
                        onChange={(e) => onChange({ ...riskAssessment, risk_score: parseInt(e.target.value) || 0 })}
                        className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                    />
                </div>
                <div>
                    <Label htmlFor="concerns" className="text-zinc-400 font-medium">Identified Concerns (comma-separated)</Label>
                    <Input
                        id="concerns"
                        value={Array.isArray(riskAssessment.identified_concerns) ? riskAssessment.identified_concerns.join(", ") : ""}
                        onChange={(e) => onChange({ ...riskAssessment, identified_concerns: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })}
                        className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                    />
                </div>
                <div>
                    <Label htmlFor="factors" className="text-zinc-400 font-medium">Contributing Factors (comma-separated)</Label>
                    <Input
                        id="factors"
                        value={Array.isArray(riskAssessment.contributing_factors) ? riskAssessment.contributing_factors.join(", ") : ""}
                        onChange={(e) => onChange({ ...riskAssessment, contributing_factors: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })}
                        className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Risk Level</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    riskAssessment.risk_level === 'CRITICAL' || riskAssessment.risk_level === 'HIGH'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                        : 'bg-zinc-800 text-zinc-400'
                }`}>
                    {riskAssessment.risk_level}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Risk Score</span>
                <span className="text-sm font-semibold text-zinc-300">{riskAssessment.risk_score}/100</span>
            </div>
            <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Identified Concerns</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.isArray(riskAssessment.identified_concerns) && riskAssessment.identified_concerns.length > 0 ? (
                      riskAssessment.identified_concerns.map((concern: string, idx: number) => (
                        <span key={idx} className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/15">
                            {concern}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-650">None</span>
                    )}
                </div>
            </div>
            <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Contributing Factors</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.isArray(riskAssessment.contributing_factors) && riskAssessment.contributing_factors.length > 0 ? (
                      riskAssessment.contributing_factors.map((factor: string, idx: number) => (
                        <span key={idx} className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded text-xs border border-white/[0.04]">
                            {factor}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-650">None</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function Recommendation({ recommendations, isEditing, onChange }: { recommendations: string[]; isEditing: boolean; onChange: (updated: string[]) => void }) {
    if (isEditing) {
        return (
            <div className="space-y-4">
                <Label htmlFor="recs" className="text-zinc-400 font-medium">Recommendations (comma-separated)</Label>
                <Input
                    id="recs"
                    value={Array.isArray(recommendations) ? recommendations.join(", ") : ""}
                    onChange={(e) => onChange(e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))}
                    className="mt-1.5 bg-zinc-800 border-white/[0.08] text-zinc-100"
                    placeholder="Enter recommendations separated by commas"
                />
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {Array.isArray(recommendations) && recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-950/40 rounded-lg border border-white/[0.03]">
                    <span className="text-teal-400 font-bold text-xs mt-0.5">{idx + 1}.</span>
                    <span className="text-xs text-zinc-350 leading-5">{rec}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-650">None</span>
            )}
        </div>
    );
}