import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle, Zap } from "lucide-react";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const riskConfig = {
  low: {
    label: "Low Risk",
    className: "sg-badge-low",
    Icon: CheckCircle,
  },
  medium: {
    label: "Medium Risk",
    className: "sg-badge-medium",
    Icon: AlertCircle,
  },
  high: {
    label: "High Risk",
    className: "sg-badge-high",
    Icon: AlertTriangle,
  },
  critical: {
    label: "Critical Risk",
    className: "sg-badge-critical",
    Icon: Zap,
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-3 py-1 gap-1.5",
  lg: "text-base px-4 py-1.5 gap-2",
};

export function RiskBadge({
  level,
  showIcon = true,
  size = "md",
  className,
}: RiskBadgeProps) {
  const config = riskConfig[level];
  const { Icon } = config;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} />}
      {config.label}
    </span>
  );
}

export type { RiskLevel };
