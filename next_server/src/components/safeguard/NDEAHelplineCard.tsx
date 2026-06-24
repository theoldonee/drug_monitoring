import { Phone, Heart, ExternalLink } from "lucide-react";

interface NDEAHelplineCardProps {
  variant?: "compact" | "full";
}

export function NDEAHelplineCard({ variant = "full" }: NDEAHelplineCardProps) {
  if (variant === "compact") {
    return (
      <a
        href="tel:148"
        className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors group"
      >
        <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-red-700">NDEA Helpline</div>
          <div className="text-2xl font-bold text-red-800 leading-none">148</div>
        </div>
        <ExternalLink className="w-4 h-4 text-red-400 shrink-0" />
      </a>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -translate-y-16 translate-x-16" />
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-md shrink-0">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
              National Drug Enforcement Agency
            </div>
            <h3 className="text-xl font-bold text-red-900">NDEA Helpline</h3>
          </div>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <a
            href="tel:148"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 py-3 font-bold text-lg transition-colors shadow-md"
          >
            <Phone className="w-5 h-5" />
            148
          </a>
          <div className="text-sm text-red-700">
            <div className="font-semibold">Free &amp; Confidential</div>
            <div className="text-red-600">Available 24/7</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-red-700/80 leading-relaxed">
          If you or someone you know needs immediate help with substance use or
          crisis support, call the NDEA helpline. All calls are confidential.
        </p>
      </div>
    </div>
  );
}

export function CaritasMUCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16" />
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Professional Support
            </div>
            <h3 className="text-xl font-bold text-blue-900">Caritas Mauritius</h3>
          </div>
        </div>
        <p className="mt-4 text-sm text-blue-700/80 leading-relaxed">
          Caritas Mauritius provides counselling, rehabilitation support, and
          social welfare services across Mauritius.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://www.caritas.mu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit Website
          </a>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2 text-sm font-medium">
            <Phone className="w-3.5 h-3.5" />
            +230 454 1234
          </div>
        </div>
      </div>
    </div>
  );
}
