import React from "react";
import { cn } from "../../lib/utils";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  variant?: "default" | "reward" | "accent" | "live";
  size?: "sm" | "md" | "lg";
}

export function Stat({
  className,
  label,
  value,
  unit,
  variant = "default",
  size = "md",
  ...props
}: StatProps) {
  const valueColor = {
    default: "text-[#FFFFFF]",
    reward: "text-[#F59E0B]",
    accent: "text-[#10B981]",
    live: "text-[#EF4444]",
  };

  const valueSize = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl sm:text-2xl",
  };

  return (
    <div className={cn("flex flex-col gap-0.5 select-none", className)} {...props}>
      <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-1 font-mono tabular-nums font-bold">
        <span className={cn(valueColor[variant], valueSize[size])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-[#94A3B8] uppercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
