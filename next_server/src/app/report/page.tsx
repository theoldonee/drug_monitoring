import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronRight,
  Download,
  FileText,
  MessageSquare,
  Share2,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";
import { RiskBadge } from "@/components/safeguard/RiskBadge";
import {
  NDEAHelplineCard,
  CaritasMUCard,
} from "@/components/safeguard/NDEAHelplineCard";
import Link from "next/link";

// ── Mock report data ──────────────────────────────────────────────────
const reportData = {
  id: "SGR-2025-0471",
  generatedAt: "2025-06-24T08:15:00Z",
  videoName: "community_footage_06_24.mp4",
  riskLevel: "medium" as const,
  riskScore: 47,
  status: "pending_review",

  sceneSummary:
    "The video depicts a group of 4-5 individuals in an outdoor urban setting, approximately 20-30 years of age. Interactions appear largely informal and social. Two individuals display behaviour consistent with altered coordination and reduced inhibition. Environmental factors include limited lighting and presence of unidentified substances. No immediate physical danger is apparent, however several behavioural indicators warrant closer professional evaluation.",

  emotionalTones: [
    { label: "Distressed", score: 38, color: "#ef4444" },
    { label: "Euphoric", score: 29, color: "#f59e0b" },
    { label: "Lethargic", score: 21, color: "#8b5cf6" },
    { label: "Neutral", score: 12, color: "#64748b" },
  ],

  identifiedConcerns: [
    "Possible substance-induced coordination impairment",
    "Signs of psychological distress in one individual",
    "Unsafe environmental conditions (poor lighting, unmonitored location)",
    "Social isolation indicators",
    "Reduced inhibition behaviours",
  ],

  contributingFactors: [
    {
      factor: "Behavioural Indicators",
      detail: "Unsteady gait, slurred speech patterns detected via audio-visual analysis.",
    },
    {
      factor: "Environmental Risk",
      detail: "Location identified as a known high-risk area with limited supervision.",
    },
    {
      factor: "Social Dynamics",
      detail: "Peer group dynamics suggest potential social pressure influence.",
    },
    {
      factor: "Time & Context",
      detail: "Late-evening recording; reduced community visibility.",
    },
  ],

  recommendations: [
    "Refer for professional substance use assessment",
    "Engage community outreach workers for follow-up support",
    "Provide NDEA helpline information to individuals",
    "Document and monitor location for recurring safety concerns",
    "Connect to Caritas Mauritius counselling services",
  ],
};

function ScoreBar({ score, color = "#0d9488" }: { score: number; color?: string }) {
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function ReportPage() {
  const dateStr = new Date(reportData.generatedAt).toLocaleString("en-MU", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                  <Link href="/" className="hover:text-[#0d9488] transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link href="/upload" className="hover:text-[#0d9488] transition-colors">Upload</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[#0d9488] font-medium">Safety Report</span>
                </div>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#0d9488]" />
                  AI Safety Report
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Report ID: <span className="font-mono font-semibold text-[#0f172a]">{reportData.id}</span>
                  {" · "}Generated {dateStr}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                  <Download className="w-4 h-4 mr-1.5" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Pending review banner */}
            <div className="mt-4 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Awaiting Human Review</strong> — This AI-generated report has not yet
                been reviewed by a human administrator. No outcome has been determined.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content (2/3) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Risk Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-bold text-[#0f172a] mb-2">Risk Assessment Overview</h2>
                    <RiskBadge level={reportData.riskLevel} size="lg" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-[#d97706]">
                      {reportData.riskScore}
                    </div>
                    <div className="text-sm text-slate-400 font-medium">out of 100</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                    <span>Risk Score</span>
                    <span className="text-[#d97706] font-bold">{reportData.riskScore}/100</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${reportData.riskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0 — Minimal</span>
                    <span>50 — Moderate</span>
                    <span>100 — Critical</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Video", value: reportData.videoName.slice(0, 18) + "…", sub: "Source File" },
                    { label: "Gemini 2.5 Pro", value: "Scene + Sentiment", sub: "Analysis Model" },
                    { label: "Pending", value: "Human Review", sub: "Current Status" },
                  ].map((item) => (
                    <div key={item.sub} className="bg-[#f8fafc] rounded-xl p-3 border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium mb-1">{item.sub}</div>
                      <div className="text-xs font-semibold text-[#0f172a] truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scene Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#0d9488]" />
                  Scene Summary
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {reportData.sceneSummary}
                </p>
              </div>

              {/* Emotional Tone Analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
                  Emotional Tone Analysis
                </h2>
                <div className="space-y-4">
                  {reportData.emotionalTones.map((tone) => (
                    <div key={tone.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-[#0f172a]">{tone.label}</span>
                        <span className="font-bold" style={{ color: tone.color }}>
                          {tone.score}%
                        </span>
                      </div>
                      <ScoreBar score={tone.score} color={tone.color} />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  Sentiment probabilities are derived from audio-visual feature extraction by Gemini 2.5 Pro. Not a diagnostic tool.
                </p>
              </div>

              {/* Identified Concerns */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Identified Concerns
                </h2>
                <div className="flex flex-wrap gap-2">
                  {reportData.identifiedConcerns.map((concern, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-full px-3.5 py-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {concern}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Contributing Factors
                </h2>
                <div className="space-y-3">
                  {reportData.contributingFactors.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 bg-[#f8fafc] rounded-xl border border-slate-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0f172a] text-sm">{item.factor}</div>
                        <div className="text-slate-500 text-sm mt-0.5">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Recommendations
                </h2>
                <ul className="space-y-3">
                  {reportData.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-green-900 font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Report meta */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#0f172a] mb-4 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0d9488]" />
                  Report Details
                </h3>
                <dl className="space-y-3">
                  {[
                    { label: "Report ID", value: reportData.id },
                    { label: "Generated", value: dateStr },
                    { label: "Model", value: "Gemini 2.5 Pro" },
                    { label: "Status", value: "Pending Human Review" },
                    { label: "Risk Level", value: "Medium (47/100)" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2 text-sm">
                      <dt className="text-slate-400">{label}</dt>
                      <dd className="font-medium text-[#0f172a] text-right text-xs">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Disclaimer */}
              <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-[#0f172a] text-sm">Important Disclaimer</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This report is AI-generated and has <strong>not yet been reviewed</strong> by a
                  human administrator. It does not constitute a medical diagnosis, legal finding,
                  or official determination. All findings are provisional pending expert review.
                </p>
              </div>

              {/* Support resources */}
              <div>
                <h3 className="font-semibold text-[#0f172a] mb-3 text-sm">Local Support Resources</h3>
                <div className="space-y-3">
                  <NDEAHelplineCard variant="full" />
                  <CaritasMUCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
