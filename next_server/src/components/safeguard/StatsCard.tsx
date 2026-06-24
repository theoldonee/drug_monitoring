"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend?: { value: number; label: string };
  icon: React.ReactNode;
  color?: "teal" | "blue" | "amber" | "red" | "purple";
  className?: string;
}

const colorConfig = {
  teal: {
    bg: "bg-[#f0fdfa]",
    icon: "bg-[#0d9488]",
    value: "text-[#0d9488]",
  },
  blue: {
    bg: "bg-[#eff6ff]",
    icon: "bg-[#3b82f6]",
    value: "text-[#3b82f6]",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-500",
    value: "text-amber-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-500",
    value: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-500",
    value: "text-purple-600",
  },
};

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

export function StatsCard({
  title,
  value,
  suffix = "",
  trend,
  icon,
  color = "teal",
  className,
}: StatsCardProps) {
  const animated = useCountUp(value);
  const colors = colorConfig[color];
  const isPositiveTrend = trend && trend.value > 0;
  const isNeutral = trend && trend.value === 0;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 p-6 sg-card-hover shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm",
            colors.icon
          )}
        >
          <div className="text-white">{icon}</div>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isNeutral
                ? "bg-slate-100 text-slate-600"
                : isPositiveTrend
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className={cn("text-3xl font-bold mb-1", colors.value)}>
        {animated}
        {suffix}
      </div>
      <div className="text-sm text-slate-500 font-medium">{title}</div>
      {trend && (
        <div className="text-xs text-slate-400 mt-1">{trend.label}</div>
      )}
    </div>
  );
}
