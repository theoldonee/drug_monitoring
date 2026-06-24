import Link from "next/link";
import {
  Shield,
  Upload,
  Brain,
  FileCheck,
  Users,
  Lock,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Phone,
  ChevronRight,
  Database,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";

const howItWorksSteps = [
  {
    step: "01",
    icon: Upload,
    title: "Secure Upload",
    description:
      "Upload your video through our encrypted, consent-based submission portal. No data is retained without your knowledge.",
    color: "text-[#0d9488]",
    bg: "bg-[#f0fdfa]",
    border: "border-[#ccfbf1]",
  },
  {
    step: "02",
    icon: Brain,
    title: "Gemini 2.5 Pro Analysis",
    description:
      "Google Gemini 2.5 Pro processes the video through scene understanding, sentiment analysis, and behavioral pattern recognition.",
    color: "text-[#3b82f6]",
    bg: "bg-[#eff6ff]",
    border: "border-[#dbeafe]",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Structured Report Generation",
    description:
      "A comprehensive risk assessment report is automatically generated, covering risk scores, emotional tone, and recommendations.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    step: "04",
    icon: UserCheck,
    title: "Human Expert Review",
    description:
      "Every AI-generated report is reviewed by a qualified human administrator before any action or outcome is determined.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    step: "05",
    icon: CheckCircle,
    title: "Final Outcome",
    description:
      "Approved reports with appropriate recommendations and referrals to local support resources are delivered securely.",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
];

const missionPillars = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Identifying risks early to protect individuals and communities across Mauritius from substance-related harms.",
  },
  {
    icon: Brain,
    title: "AI-Assisted Insight",
    description:
      "Leveraging Google Gemini 2.5 Pro for deep scene understanding, emotional analysis, and behavioral pattern recognition.",
  },
  {
    icon: Users,
    title: "Human Oversight",
    description:
      "Every AI report is reviewed by qualified human administrators. No automated outcomes — always human-in-the-loop.",
  },
];

const privacyFeatures = [
  {
    icon: Database,
    title: "No Permanent Video Storage",
    description:
      "Videos are processed in memory only. Nothing is stored on our servers after analysis is complete.",
  },
  {
    icon: Clock,
    title: "Temporary Processing",
    description:
      "Files are deleted immediately after the Gemini API completes its analysis. Zero retention.",
  },
  {
    icon: Eye,
    title: "Human Review Required",
    description:
      "No AI report produces an outcome without mandatory human expert validation.",
  },
  {
    icon: Lock,
    title: "GDPR-Inspired Framework",
    description:
      "Built on GDPR-inspired consent, data minimisation, and purpose-limitation principles.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden sg-hero-gradient-subtle text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0d9488]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#3b82f6]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0d9488]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                Powered by Google Gemini 2.5 Pro
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI-Powered{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8]">
                  Safety Analysis
                </span>{" "}
                for Mauritius
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
                SafeGuard MU analyzes video content to identify substance-related
                risks, psychological distress, and wellbeing concerns — with every
                report reviewed by qualified human administrators.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl px-6 shadow-lg shadow-teal-900/30 font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload a Video
                  </Button>
                </Link>
                <Link href="/processing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 rounded-xl px-6 backdrop-blur-sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    See How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-4">
                {[
                  { text: "No Medical Diagnoses" },
                  { text: "Human Reviewed" },
                  { text: "GDPR-Inspired" },
                ].map((badge) => (
                  <div
                    key={badge.text}
                    className="flex items-center gap-1.5 text-sm text-slate-300"
                  >
                    <CheckCircle className="w-4 h-4 text-[#2dd4bf]" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual card */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="sg-glass rounded-3xl p-6 shadow-2xl border border-white/20">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#0d9488] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[#0f172a] font-bold text-sm">
                        AI Safety Report
                      </div>
                      <div className="text-slate-400 text-xs">
                        Generated 2 minutes ago
                      </div>
                    </div>
                    <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1">
                      Medium Risk
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">
                          Risk Score
                        </span>
                        <span className="font-bold text-amber-600">47/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                          style={{ width: "47%" }}
                        />
                      </div>
                    </div>

                    {[
                      { label: "Scene Understanding", value: "✓ Complete" },
                      { label: "Sentiment Analysis", value: "✓ Complete" },
                      { label: "Human Review", value: "⏳ Pending" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between py-2 border-b border-slate-50 text-sm"
                      >
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-medium text-[#0f172a]">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-[#f0fdfa] rounded-xl border border-[#ccfbf1]">
                    <p className="text-xs text-[#0f766e] font-medium">
                      ⚠️ This report requires human administrator review before any
                      outcome is determined.
                    </p>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      Privacy First
                    </span>
                  </div>
                </div>

                {/* Bottom badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-700">
                        NDEA: 148
                      </div>
                      <div className="text-[10px] text-slate-400">
                        24/7 Helpline
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Mission Statement ─── */}
      <section className="sg-section-pad bg-white">
        <div className="sg-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f0fdfa] text-[#0d9488] rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Shield className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
              Protecting Communities Through{" "}
              <span className="text-[#0d9488]">Responsible AI</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              SafeGuard MU combines cutting-edge AI analysis with mandatory human
              oversight to identify risks early — without replacing human judgment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {missionPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group p-6 rounded-2xl border border-slate-100 bg-white shadow-sm sg-card-hover"
                >
                  <div className="w-12 h-12 rounded-xl sg-teal-gradient flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="sg-section-pad bg-[#f8fafc]">
        <div className="sg-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#eff6ff] text-[#3b82f6] rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Brain className="w-4 h-4" />
              Platform Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
              How SafeGuard MU Works
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              A transparent, auditable pipeline from video submission to final
              outcome.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#0d9488] via-[#3b82f6] to-green-400 -translate-x-1/2 opacity-20" />

            <div className="space-y-4">
              {howItWorksSteps.map((step, i) => {
                const Icon = step.icon;
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={step.step}
                    className={`flex gap-4 lg:gap-8 items-start ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Card */}
                    <div
                      className={`flex-1 ${isEven ? "lg:text-right" : "lg:text-left"}`}
                    >
                      <div
                        className={`inline-block p-5 rounded-2xl border ${step.border} ${step.bg} sg-card-hover shadow-sm max-w-sm ${isEven ? "lg:ml-auto" : "lg:mr-auto"} text-left`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${step.bg} border ${step.border} flex items-center justify-center`}
                          >
                            <Icon className={`w-4 h-4 ${step.color}`} />
                          </div>
                          <span
                            className={`text-xs font-bold ${step.color} uppercase tracking-wider`}
                          >
                            Step {step.step}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#0f172a] mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden lg:flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full ${step.bg} border-2 ${step.border} flex items-center justify-center shadow-md z-10`}
                      >
                        <span className={`text-xs font-bold ${step.color}`}>
                          {step.step}
                        </span>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden lg:block flex-1" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/processing">
              <Button
                variant="outline"
                className="border-[#0d9488] text-[#0d9488] hover:bg-[#f0fdfa] rounded-xl"
              >
                View Full Architecture Diagram
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Privacy First ─── */}
      <section className="sg-section-pad bg-white">
        <div className="sg-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#f0fdfa] text-[#0d9488] rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                <Lock className="w-4 h-4" />
                Privacy Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
                Built with Privacy at Its Core
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                SafeGuard MU was designed with a privacy-first approach. No video
                is permanently stored. All data processing is temporary, minimal,
                and consent-based.
              </p>
              <Link href="/privacy">
                <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl">
                  Read Our Privacy Policy
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {privacyFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100 sg-card-hover"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[#2dd4bf]" />
                    </div>
                    <h3 className="font-bold text-[#0f172a] text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── NDEA Helpline Banner ─── */}
      <section className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  Need Immediate Help?
                </div>
                <div className="text-red-100 text-sm">
                  NDEA National Drug Helpline — Free, Confidential, 24/7
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:148"
                className="flex items-center gap-2 bg-white text-red-700 font-bold rounded-full px-8 py-3 text-xl hover:bg-red-50 transition-colors shadow-lg"
              >
                <Phone className="w-5 h-5" />
                148
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="sg-section-pad sg-hero-gradient text-white">
        <div className="sg-container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Generate a Safety Assessment?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Upload a video and let SafeGuard MU&apos;s AI pipeline generate a
            structured risk report — reviewed by human experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl px-8 font-semibold shadow-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Video Now
              </Button>
            </Link>
            <Link href="/privacy">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8"
              >
                Learn About Privacy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
