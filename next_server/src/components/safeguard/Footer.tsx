import Link from "next/link";
import { Shield, Phone, Mail, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg sg-teal-gradient flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">SafeGuard MU</div>
                <div className="text-[10px] text-[#2dd4bf] tracking-widest uppercase">
                  Mauritius
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-assisted risk assessment platform for Mauritius. Powered by
              Google Gemini 2.5 Pro. Human reviewed, privacy first.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: "/upload", label: "Upload Video" },
                { href: "/report", label: "View Report" },
                { href: "/processing", label: "How It Works" },
                { href: "/admin", label: "Admin Dashboard" },
                { href: "/admin/analytics", label: "Analytics" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-[#2dd4bf] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Legal & Ethics
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/privacy#ethics", label: "AI Ethics" },
                { href: "/privacy#consent", label: "Consent Framework" },
                { href: "/privacy#disclaimer", label: "Medical Disclaimer" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-[#2dd4bf] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Support Resources
            </h4>
            <div className="space-y-3">
              <a
                href="tel:148"
                className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-800/50 rounded-lg hover:bg-red-900/50 transition-colors group"
              >
                <Phone className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-red-300">
                    NDEA Helpline
                  </div>
                  <div className="text-xl font-bold text-red-200">148</div>
                  <div className="text-xs text-slate-400">
                    24/7 Free & Confidential
                  </div>
                </div>
              </a>
              <a
                href="https://www.caritas.mu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-3 bg-blue-900/30 border border-blue-800/50 rounded-lg hover:bg-blue-900/50 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-blue-300">
                    Caritas Mauritius
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    Counselling & Support{" "}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            © 2025 SafeGuard MU. This platform does not provide medical
            diagnoses. AI reports require human review before any action is
            taken.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
            Powered by Google Gemini 2.5 Pro
          </div>
        </div>
      </div>
    </footer>
  );
}
