'use client';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/superbase/client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export function ReviewPage(){

    const params = useParams<{ id: string }>();
    
    const [data, setData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) {
                console.log("No ID provided");
                return;
            }

            console.log("Fetching report with ID:", params.id);
            
            const supabase = await createClient();
            const { data: reports, error } = await supabase
                .from("reports")
                .select("*")
                .eq("id", params.id);

            if (error) {
                console.error("Query error:", error);
            } else if (reports && reports.length > 0) {
                console.log("Report found:", reports[0]);
                setData(reports[0]);
            } else {
                console.log("No reports found with ID:", params.id);
            }
        }
        
        fetchData();
    }, [params.id]);

    const handleValidate = () => {
        console.log("Report validated:", data);
        // Add validation logic here
    };

    const handleMakeChanges = () => {
        setIsEditing(!isEditing);
    };

    if (!data) {
        return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
    }

    return(
        <div className="w-full min-h-screen flex flex-col gap-6 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Review Report</h1>
                <p className="text-muted-foreground">Report ID: {data.id}</p>
            </div>

            {/* Video and Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Video Section */}
                <div className="lg:col-span-1">
                    <Card className="overflow-hidden">
                        <div className="w-full aspect-video bg-black rounded-t-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-white text-sm">Video Player</div>
                                <div className="text-white text-xs mt-2">{data.video_url || "No video"}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Analysis Cards */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Scene Summary */}
                    {data.scene_summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Scene Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{data.scene_summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sentiment Analysis */}
                    {data.sentiment && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Sentiment Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Sentiment sentiment={data.sentiment} isEditing={isEditing} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Risk Assessment */}
                    {data.risk_assessment && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Assessment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RiskAssessment riskAssessment={data.risk_assessment} isEditing={isEditing} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Recommendation */}
                    {data.recommendations && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Recommendation recommendations={data.recommendations} isEditing={isEditing} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button 
                    variant="outline" 
                    onClick={handleMakeChanges}
                    className="w-full sm:w-auto"
                >
                    {isEditing ? "Cancel Changes" : "Make Changes"}
                </Button>
                <Button 
                    onClick={handleValidate}
                    className="w-full sm:w-auto"
                    disabled={isEditing}
                >
                    Validate Report
                </Button>
            </div>
        </div>
    )
}

function Sentiment({ sentiment, isEditing }: { sentiment: { tone: string; urgency_level: string; emotional_indicators: string[] }; isEditing: boolean }) {
    const [editedSentiment, setEditedSentiment] = useState(sentiment);

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Input
                        id="tone"
                        value={editedSentiment.tone}
                        onChange={(e) => setEditedSentiment({ ...editedSentiment, tone: e.target.value })}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Input
                        id="urgency"
                        value={editedSentiment.urgency_level}
                        onChange={(e) => setEditedSentiment({ ...editedSentiment, urgency_level: e.target.value })}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="emotions">Emotional Indicators (comma-separated)</Label>
                    <Input
                        id="emotions"
                        value={Array.isArray(editedSentiment.emotional_indicators) ? editedSentiment.emotional_indicators.join(", ") : ""}
                        onChange={(e) => setEditedSentiment({ ...editedSentiment, emotional_indicators: e.target.value.split(",").map(e => e.trim()) })}
                        className="mt-2"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tone:</span>
                <span className="font-medium">{sentiment.tone}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Urgency Level:</span>
                <span className="font-medium">{sentiment.urgency_level}</span>
            </div>
            <div>
                <span className="text-muted-foreground">Emotional Indicators:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(sentiment.emotional_indicators) && sentiment.emotional_indicators.map((indicator, idx) => (
                        <span key={idx} className="bg-secondary px-2 py-1 rounded text-sm">
                            {indicator}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RiskAssessment({ riskAssessment, isEditing }: { riskAssessment: { risk_level: string; risk_score: number; identified_concerns: string[]; contributing_factors: string[] }; isEditing: boolean }) {
    const [editedRisk, setEditedRisk] = useState(riskAssessment);

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="level">Risk Level</Label>
                    <Input
                        id="level"
                        value={editedRisk.risk_level}
                        onChange={(e) => setEditedRisk({ ...editedRisk, risk_level: e.target.value })}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="score">Risk Score</Label>
                    <Input
                        id="score"
                        type="number"
                        value={editedRisk.risk_score}
                        onChange={(e) => setEditedRisk({ ...editedRisk, risk_score: parseFloat(e.target.value) })}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="concerns">Identified Concerns (comma-separated)</Label>
                    <Input
                        id="concerns"
                        value={Array.isArray(editedRisk.identified_concerns) ? editedRisk.identified_concerns.join(", ") : ""}
                        onChange={(e) => setEditedRisk({ ...editedRisk, identified_concerns: e.target.value.split(",").map(e => e.trim()) })}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="factors">Contributing Factors (comma-separated)</Label>
                    <Input
                        id="factors"
                        value={Array.isArray(editedRisk.contributing_factors) ? editedRisk.contributing_factors.join(", ") : ""}
                        onChange={(e) => setEditedRisk({ ...editedRisk, contributing_factors: e.target.value.split(",").map(e => e.trim()) })}
                        className="mt-2"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk Level:</span>
                <span className="font-medium">{riskAssessment.risk_level}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk Score:</span>
                <span className="font-medium">{riskAssessment.risk_score}/100</span>
            </div>
            <div>
                <span className="text-muted-foreground">Identified Concerns:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(riskAssessment.identified_concerns) && riskAssessment.identified_concerns.map((concern, idx) => (
                        <span key={idx} className="bg-destructive/10 text-destructive px-2 py-1 rounded text-sm">
                            {concern}
                        </span>
                    ))}
                </div>
            </div>
            <div>
                <span className="text-muted-foreground">Contributing Factors:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(riskAssessment.contributing_factors) && riskAssessment.contributing_factors.map((factor, idx) => (
                        <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            {factor}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Recommendation({ recommendations, isEditing }: { recommendations: string[]; isEditing: boolean }) {
    const [editedRecommendations, setEditedRecommendations] = useState(recommendations);

    if (isEditing) {
        return (
            <div className="space-y-4">
                <Label htmlFor="recs">Recommendations (comma-separated)</Label>
                <Input
                    id="recs"
                    value={Array.isArray(editedRecommendations) ? editedRecommendations.join(", ") : ""}
                    onChange={(e) => setEditedRecommendations(e.target.value.split(",").map(r => r.trim()))}
                    className="mt-2"
                    placeholder="Enter recommendations separated by commas"
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {Array.isArray(recommendations) && recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-secondary rounded">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span>{rec}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}