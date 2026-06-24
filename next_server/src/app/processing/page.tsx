"use client";

import { useState } from "react";
import {
  Upload,
  Cloud,
  Brain,
  Eye,
  Smile,
  BarChart2,
  FileText,
  UserCheck,
  CheckCircle,
  ArrowDown,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";
import { motion, AnimatePresence } from "framer-motion";

const pipelineSteps = [
  {
    id: 1,
    icon: Upload,
    title: "Video Upload",
    subtitle: "Consent-Based Submission",
    description:
      "User uploads a video through the encrypted SafeGuard MU portal. Consent is verified before any processing begins. The file is never written to permanent storage.",
    tech: "HTTPS · AES-256 Encryption · Consent Gate",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#dbeafe",
  },
  {
    id: 2,
    icon: Cloud,
    title: "Gemini File API",
    subtitle: "Temporary File Ingestion",
    description:
      "The video is uploaded to the Google Gemini File API for temporary processing. The file is held in Google's secure environment only for the duration of analysis.",
    tech: "Google Gemini File API · Temporary Storage · Auto-Deletion",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ede9fe",
  },
  {
    id: 3,
    icon: Brain,
    title: "Gemini 2.5 Pro Analysis",
    subtitle: "Multimodal AI Processing",
    description:
      "Google Gemini 2.5 Pro processes the video using multimodal reasoning — simultaneously analysing visual frames, audio content, speech patterns, and temporal dynamics.",
    tech: "Gemini 2.5 Pro · Multimodal · 1M Token Context",
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "#ccfbf1",
  },
  {
    id: 4,
    icon: Eye,
    title: "Scene Understanding",
    subtitle: "Visual Context Extraction",
    description:
      "The model identifies settings, objects, individuals, and environmental context. It maps spatial relationships, identifies potential risk objects, and assesses environmental safety.",
    tech: "Frame Analysis · Object Detection · Context Mapping",
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "#ccfbf1",
  },
  {
    id: 5,
    icon: Smile,
    title: "Sentiment Analysis",
    subtitle: "Emotional Tone Detection",
    description:
      "Audio-visual sentiment analysis extracts emotional indicators from facial expressions, body language, vocal tone, and speech content. Probabilities are assigned across emotional categories.",
    tech: "Sentiment Classification · Audio NLP · Emotion Detection",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    id: 6,
    icon: BarChart2,
    title: "Risk Assessment",
    subtitle: "Structured Risk Scoring",
    description:
      "Identified signals are weighted and aggregated into a normalised risk score (0–100) across four dimensions: substance-related risk, psychological distress, unsafe situation, and wellbeing concerns.",
    tech: "Risk Scoring · Multi-Dimensional Analysis · Threshold Flagging",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    id: 7,
    icon: FileText,
    title: "Structured Safety Report",
    subtitle: "JSON → Report Generation",
    description:
      "Gemini returns a structured JSON payload containing the risk score, scene summary, emotional tone breakdown, identified concerns, contributing factors, and recommendations. This is rendered into the safety report UI.",
    tech: "Structured Output · JSON Schema · Report Rendering",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#ede9fe",
  },
  {
    id: 8,
    icon: UserCheck,
    title: "Human Validation",
    subtitle: "Mandatory Expert Review",
    description:
      "Every AI-generated report enters a mandatory human review queue. Qualified administrators review findings, can override the risk level, add notes, and approve or flag the report.",
    tech: "Admin Review Portal · Override Controls · Audit Logging",
    color: "#0f172a",
    bg: "#f8fafc",
    border: "#e2e8f0",
  },
  {
    id: 9,
    icon: CheckCircle,
    title: "Final Outcome",
    subtitle: "Approved & Actioned",
    description:
      "Once approved, the report is finalised with referrals to appropriate local support resources (NDEA, Caritas Mauritius). All processing data is deleted. The outcome is documented in the audit trail.",
    tech: "Resource Referral · NDEA Integration · Audit Trail · Data Deletion",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

export default function ProcessingPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const runAnimation = async () => {
    setAnimating(true);
    setCompletedSteps([]);
    setActiveStep(null);
    for (let i = 0; i < pipelineSteps.length; i++) {
      setActiveStep(pipelineSteps[i].id);
      await new Promise((r) => setTimeout(r, 700));
      setCompletedSteps((prev) => [...prev, pipelineSteps[i].id]);
    }
    setActiveStep(null);
    setAnimating(false);
  };

  const reset = () => {
    setActiveStep(null);
    setCompletedSteps([]);
    setAnimating(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#f0fdfa] text-[#0d9488] rounded-full px-3 py-1.5 text-xs font-semibold mb-3">
                  <Brain className="w-3.5 h-3.5" />
                  Platform Architecture
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
                  AI Processing Pipeline
                </h1>
                <p className="text-slate-500 text-sm mt-1 max-w-xl">
                  How SafeGuard MU processes videos using Google Gemini 2.5 Pro — from
                  upload to final human-validated outcome.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  disabled={animating}
                  className="rounded-xl border-slate-200 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={runAnimation}
                  disabled={animating}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {animating ? "Running..." : "Animate Pipeline"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-0">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isComplete = completedSteps.includes(step.id);
              const isLast = index === pipelineSteps.length - 1;

              return (
                <div key={step.id} className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="relative z-10"
                  >
                    <div
                      className={`flex gap-4 sm:gap-6 cursor-pointer group transition-all duration-300 ${
                        isActive ? "scale-[1.02]" : ""
                      }`}
                      onClick={() =>
                        setActiveStep(activeStep === step.id ? null : step.id)
                      }
                    >
                      {/* Step indicator + line */}
                      <div className="flex flex-col items-center shrink-0">
                        <motion.div
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            boxShadow: isActive
                              ? `0 0 0 6px ${step.color}20`
                              : "none",
                          }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 border-2 ${
                            isComplete
                              ? "border-green-500 bg-green-500"
                              : isActive
                              ? `border-[${step.color}]`
                              : "border-slate-200 bg-white"
                          }`}
                          style={
                            isActive && !isComplete
                              ? { borderColor: step.color, backgroundColor: step.bg }
                              : {}
                          }
                        >
                          {isComplete ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Icon
                              className="w-5 h-5 transition-colors"
                              style={{ color: isActive ? step.color : "#94a3b8" }}
                            />
                          )}
                        </motion.div>

                        {!isLast && (
                          <div className="flex-1 w-0.5 bg-slate-200 my-2 min-h-[2rem] relative overflow-hidden rounded-full">
                            {isComplete && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                className="absolute inset-x-0 top-0 bg-green-400 rounded-full"
                                transition={{ duration: 0.4 }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card */}
                      <div className="flex-1 mb-4">
                        <div
                          className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
                            isActive
                              ? `shadow-lg`
                              : isComplete
                              ? "border-green-200 bg-green-50"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                          }`}
                          style={
                            isActive
                              ? { borderColor: step.color, backgroundColor: step.bg }
                              : {}
                          }
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-bold uppercase tracking-widest"
                                  style={{
                                    color: isComplete ? "#16a34a" : isActive ? step.color : "#94a3b8",
                                  }}
                                >
                                  Step {step.id}
                                </span>
                              </div>
                              <h3 className="font-bold text-[#0f172a] text-lg leading-tight">
                                {step.title}
                              </h3>
                              <p
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: isComplete ? "#16a34a" : isActive ? step.color : "#94a3b8" }}
                              >
                                {step.subtitle}
                              </p>
                            </div>
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 rounded-full animate-pulse-slow shrink-0 mt-1"
                                style={{ backgroundColor: step.color }}
                              />
                            )}
                          </div>

                          <AnimatePresence>
                            {(isActive || isComplete) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <p className="text-slate-600 text-sm leading-relaxed mt-2 mb-3">
                                  {step.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {step.tech.split(" · ").map((t) => (
                                    <span
                                      key={t}
                                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border"
                                      style={{ borderColor: step.border, color: step.color }}
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!isActive && !isComplete && (
                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Arrow between steps (mobile only label) */}
                  {!isLast && (
                    <div className="flex justify-start pl-5 mb-0 -mt-3 opacity-30">
                      <ArrowDown className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-[#0f172a] mb-3 text-sm">Pipeline Legend</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: "User Interface", color: "#3b82f6" },
                { label: "Google Gemini API", color: "#8b5cf6" },
                { label: "AI Analysis", color: "#0d9488" },
                { label: "Risk Scoring", color: "#dc2626" },
                { label: "Human Review", color: "#0f172a" },
                { label: "Completed", color: "#16a34a" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
