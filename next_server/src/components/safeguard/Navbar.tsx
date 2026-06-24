"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Shield, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/processing", label: "How It Works" },
  { href: "/privacy", label: "Privacy & Ethics" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg sg-teal-gradient flex items-center justify-center shadow-md">
            <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[15px] text-[#0f172a] tracking-tight">
              SafeGuard
            </span>
            <span className="text-[10px] font-semibold text-[#0d9488] tracking-widest uppercase">
              Mauritius
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-[#f0fdfa] text-[#0d9488]"
                  : "text-slate-600 hover:text-[#0d9488] hover:bg-[#f0fdfa]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* NDEA Helpline badge */}
          <a
            href="tel:148"
            className="hidden sm:flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            <Phone className="w-3 h-3" />
            NDEA Helpline 148
          </a>
          <Link href="/upload">
            <Button
              size="sm"
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-full px-4 shadow-sm"
            >
              Upload Video
            </Button>
          </Link>

          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6 text-[#0f172a]" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg sg-teal-gradient flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-[#0f172a]">SafeGuard MU</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          pathname === link.href
                            ? "bg-[#f0fdfa] text-[#0d9488]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-slate-100">
                    <a
                      href="tel:148"
                      className="flex items-center justify-center gap-2 w-full bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm font-semibold"
                    >
                      <Phone className="w-4 h-4" />
                      NDEA Helpline: 148
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
