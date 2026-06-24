"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  FileVideo,
  Play,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/safeguard/Navbar";
import { Footer } from "@/components/safeguard/Footer";
import { NDEAHelplineCard } from "@/components/safeguard/NDEAHelplineCard";
import { toast } from "sonner";
import Link from "next/link";

const SUPPORTED_FORMATS = [
  { ext: "MP4", mime: "video/mp4", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { ext: "MOV", mime: "video/quicktime", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { ext: "AVI", mime: "video/avi", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { ext: "MKV", mime: "video/x-matroska", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { ext: "WebM", mime: "video/webm", color: "bg-green-100 text-green-700 border-green-200" },
];

const MAX_SIZE_MB = 500;

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (f: File): string | null => {
    if (!f.type.startsWith("video/")) return "Please upload a valid video file.";
    if (f.size > MAX_SIZE_MB * 1024 * 1024)
      return `File size exceeds ${MAX_SIZE_MB}MB limit.`;
    return null;
  };

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    setError(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    toast.success(`${f.name} loaded successfully`);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Please upload a video first."); return; }
    if (!consent) { toast.error("You must provide consent to proceed."); return; }

    setIsProcessing(true);
    toast.loading("Uploading to Gemini File API...", { id: "upload" });

    // Simulate async processing pipeline
    await new Promise((r) => setTimeout(r, 1500));
    toast.loading("Running Gemini 2.5 Pro analysis...", { id: "upload" });
    await new Promise((r) => setTimeout(r, 2000));
    toast.loading("Generating structured report...", { id: "upload" });
    await new Promise((r) => setTimeout(r, 1000));
    toast.dismiss("upload");
    toast.success("Safety report generated! Redirecting...");

    setIsProcessing(false);
    router.push("/report");
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit = !!file && consent && !isProcessing;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-[#f8fafc]">
        {/* Page header */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl sg-teal-gradient flex items-center justify-center">
                <Upload className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#0f172a]">
                Upload Video for Analysis
              </h1>
            </div>
            <p className="text-slate-500 text-sm ml-12">
              Videos are processed temporarily by Google Gemini 2.5 Pro and
              never permanently stored.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Upload area (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drop Zone */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-[#0f172a] flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-[#0d9488]" />
                    Video Upload
                  </h2>
                </div>

                <div className="p-6">
                  {!file ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                        dragActive
                          ? "border-[#0d9488] bg-[#f0fdfa] scale-[1.01]"
                          : "border-slate-200 hover:border-[#0d9488] hover:bg-[#f0fdfa]/50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div
                        className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
                          dragActive
                            ? "bg-[#0d9488] text-white"
                            : "bg-[#f0fdfa] text-[#0d9488]"
                        }`}
                      >
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="font-semibold text-[#0f172a] text-lg mb-1">
                        {dragActive
                          ? "Drop your video here"
                          : "Drag & drop your video"}
                      </p>
                      <p className="text-slate-400 text-sm mb-4">
                        or click to browse from your device
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#0d9488] text-[#0d9488] hover:bg-[#f0fdfa] rounded-full pointer-events-none"
                      >
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File info */}
                      <div className="flex items-center gap-3 p-4 bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-[#0d9488] flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0f172a] text-sm truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatBytes(file.size)} · {file.type}
                          </p>
                        </div>
                        <button
                          onClick={removeFile}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>

                      {/* Video preview */}
                      {videoUrl && (
                        <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800">
                            <Play className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400 font-medium">
                              Preview
                            </span>
                          </div>
                          <video
                            src={videoUrl}
                            controls
                            className="w-full max-h-64 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                </div>

                {/* Supported formats */}
                <div className="px-6 pb-5">
                  <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                    Supported Formats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_FORMATS.map((fmt) => (
                      <span
                        key={fmt.ext}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${fmt.color}`}
                      >
                        {fmt.ext}
                      </span>
                    ))}
                    <span className="text-xs text-slate-400 self-center">
                      · Max {MAX_SIZE_MB}MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-[#0f172a] mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0d9488]" />
                  Context Description{" "}
                  <span className="text-slate-400 font-normal text-sm">
                    (Optional)
                  </span>
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Provide any relevant context about the video to improve
                  analysis accuracy.
                </p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. This video was recorded in a community setting. The individuals shown may be exhibiting signs of substance use..."
                  className="min-h-[100px] resize-none border-slate-200 focus-visible:ring-[#0d9488] rounded-xl text-sm"
                  maxLength={1000}
                />
                <div className="mt-1 text-right text-xs text-slate-400">
                  {description.length}/1000
                </div>
              </div>

              {/* Consent */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v as boolean)}
                    className="mt-0.5 data-[state=checked]:bg-[#0d9488] data-[state=checked]:border-[#0d9488]"
                  />
                  <Label htmlFor="consent" className="cursor-pointer">
                    <span className="text-sm font-medium text-[#0f172a]">
                      I provide informed consent for this video to be analysed
                    </span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      I understand that (1) the video will be temporarily
                      processed by the Google Gemini API and not permanently
                      stored, (2) an AI-generated risk assessment will be
                      produced, (3) that report will be reviewed by a human
                      administrator, and (4) no medical diagnoses will be made.
                      I have read the{" "}
                      <Link
                        href="/privacy"
                        className="text-[#0d9488] underline hover:text-[#0f766e]"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </Label>
                </div>

                {consent && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Consent provided — you may now generate a safety report.
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing with Gemini 2.5 Pro...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Generate Safety Report
                  </>
                )}
              </Button>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Process card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#0f172a] mb-4">
                  What Happens Next?
                </h3>
                <ol className="space-y-3">
                  {[
                    { n: 1, text: "Video uploaded to Gemini File API" },
                    { n: 2, text: "Gemini 2.5 Pro analyses the content" },
                    { n: 3, text: "Structured report is generated" },
                    { n: 4, text: "Human administrator reviews the report" },
                    { n: 5, text: "Final outcome determined" },
                  ].map((step) => (
                    <li key={step.n} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] text-[#0d9488] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.n}
                      </span>
                      <span className="text-sm text-slate-600">{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Privacy reminder */}
              <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 p-5">
                <h3 className="font-semibold text-[#0f172a] mb-3 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#0d9488]" />
                  Privacy Guarantees
                </h3>
                <ul className="space-y-2">
                  {[
                    "Video deleted after analysis",
                    "No permanent data storage",
                    "Gemini API only — no third parties",
                    "Human review always required",
                    "No medical diagnoses made",
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-xs text-slate-600 flex items-start gap-2"
                    >
                      <CheckCircle className="w-3 h-3 text-[#0d9488] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* NDEA Card */}
              <NDEAHelplineCard variant="compact" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
