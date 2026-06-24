"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Flag,
  MessageSquare,
  Shield,
  Sliders,
  FileText,
  Brain,
  Target,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";
import { RiskBadge } from "@/components/safeguard/RiskBadge";
import type { RiskLevel } from "@/components/safeguard/RiskBadge";
import { NDEAHelplineCard } from "@/components/safeguard/NDEAHelplineCard";
import { toast } from "sonner";
import Link from "next/link";

// Mock report for review
const reportData = {
  id: "SGR-2025-0471",
  date: "24 Jun 2025, 08:15",
  videoName: "community_footage_06_24.mp4",
  riskLevel: "medium" as RiskLevel,
  riskScore: 47,
  submitter: "Community Worker A",
  status: "pending",

  sceneSummary:
    "The video depicts a group of 4-5 individuals in an outdoor urban setting. Two individuals display behaviour consistent with altered coordination and reduced inhibition. Environmental factors include limited lighting and presence of unidentified substances.",

  emotionalTones: [
    { label: "Distressed", score: 38 },
    { label: "Euphoric", score: 29 },
    { label: "Lethargic", score: 21 },
    { label: "Neutral", score: 12 },
  ],

  identifiedConcerns: [
    "Possible substance-induced coordination impairment",
    "Signs of psychological distress",
    "Unsafe environmental conditions",
  ],

  recommendations: [
    "Refer for professional substance use assessment",
    "Engage community outreach workers",
    "Provide NDEA helpline information",
  ],
};

export default function ReviewPage() {
  const [reviewNotes, setReviewNotes] = useState("");
  const [overrideLevel, setOverrideLevel] = useState<RiskLevel | "">(
    ""
  );
  const [actionTaken, setActionTaken] = useState<"approved" | "flagged" | null>(null);

  const handleApprove = () => {
    toast.success(`Report ${reportData.id} approved and finalised.`);
    setActionTaken("approved");
  };

  const handleFlag = () => {
    toast.error(`Report ${reportData.id} flagged for further review.`);
    setActionTaken("flagged");
  };

  const handleOverride = () => {
    if (!overrideLevel) { toast.error("Please select a risk level to override."); return; }
    toast.success(`Risk level overridden to ${overrideLevel}.`);
  };

  const handleNotesSave = () => {
    if (!reviewNotes.trim()) { toast.error("Please add some review notes first."); return; }
    toast.success("Review notes saved.");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
              <Link href="/admin" className="hover:text-[#0d9488] flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Admin Dashboard
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#0d9488] font-medium">Review: {reportData.id}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#0d9488]" />
                  Submission Review
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {reportData.id} · {reportData.date} · {reportData.submitter}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {actionTaken ? (
                  <span
                    className={`text-sm font-semibold px-4 py-2 rounded-xl border ${
                      actionTaken === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {actionTaken === "approved" ? "✓ Approved" : "⚑ Flagged"}
                  </span>
                ) : (
                  <span className="text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl">
                    ⏳ Awaiting Review
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main report content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Risk overview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0d9488]" />
                  AI Risk Assessment
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <RiskBadge level={reportData.riskLevel} size="lg" />
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-[#d97706]">{reportData.riskScore}</span>
                    <span className="text-slate-400 text-sm mb-1">/ 100</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width: `${reportData.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Scene Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#0d9488]" />
                  Scene Summary
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {reportData.sceneSummary}
                </p>
              </div>

              {/* Emotional Tone */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4">Emotional Tone Analysis</h2>
                <div className="grid grid-cols-2 gap-3">
                  {reportData.emotionalTones.map((tone) => (
                    <div key={tone.label} className="p-3 bg-[#f8fafc] rounded-xl border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">{tone.label}</div>
                      <div className="text-lg font-bold text-[#0f172a]">{tone.score}%</div>
                      <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0d9488] rounded-full"
                          style={{ width: `${tone.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Concerns */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Identified Concerns
                </h2>
                <ul className="space-y-2">
                  {reportData.identifiedConcerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  AI Recommendations
                </h2>
                <ul className="space-y-2">
                  {reportData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Review Actions Sidebar */}
            <div className="space-y-5">

              {/* Action buttons */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-[#0f172a] mb-4">Review Actions</h3>

                <div className="space-y-3">
                  {/* Approve */}
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
                          disabled={!!actionTaken}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Report
                        </Button>
                      }
                    />
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Report</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to approve report {reportData.id}. This confirms the AI
                          assessment is accurate and appropriate. This action will be logged.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleApprove}
                          className="bg-green-600 hover:bg-green-700 rounded-xl"
                        >
                          Confirm Approval
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Flag */}
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl gap-2"
                          disabled={!!actionTaken}
                        >
                          <Flag className="w-4 h-4" />
                          Flag & Escalate
                        </Button>
                      }
                    />
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Flag This Report</AlertDialogTitle>
                        <AlertDialogDescription>
                          Flagging this report marks it for escalation and additional review. It will
                          be moved to the priority queue and will not be closed until resolved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleFlag}
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                          Confirm Flag
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Override Risk Level */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#0f172a] mb-3 flex items-center gap-2 text-sm">
                  <Sliders className="w-4 h-4 text-[#0d9488]" />
                  Override Risk Level
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Override the AI-determined risk level based on your expert assessment.
                </p>
                <Select onValueChange={(v) => setOverrideLevel(v as RiskLevel)}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-sm mb-3">
                    <SelectValue placeholder="Select new risk level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOverride}
                  className="w-full border-[#0d9488] text-[#0d9488] hover:bg-[#f0fdfa] rounded-xl"
                >
                  Apply Override
                </Button>
              </div>

              {/* Review Notes */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#0f172a] mb-3 flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-[#0d9488]" />
                  Review Notes
                </h3>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your professional observations, context, or reasoning..."
                  className="min-h-[100px] resize-none border-slate-200 focus-visible:ring-[#0d9488] rounded-xl text-sm mb-3"
                />
                <Button
                  size="sm"
                  onClick={handleNotesSave}
                  className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl"
                >
                  Save Notes
                </Button>
              </div>

              {/* NDEA card */}
              <NDEAHelplineCard variant="compact" />

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
