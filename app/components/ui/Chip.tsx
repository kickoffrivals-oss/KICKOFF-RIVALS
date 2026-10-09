import React from "react";
import { cn } from "../../lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "live" | "open" | "final" | "accent" | "reward" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Chip({
  className,
  variant = "neutral",
  size = "sm",
  dot = false,
  children,
  ...props
}: ChipProps) {
  const baseStyles =
    "inline-flex items-center font-semibold rounded-full border tracking-wide select-none font-mono tabular-nums uppercase";

  const variantStyles = {
    live: "bg-[#381014] border-[#EF4444]/40 text-[#EF4444]",
    open: "bg-[#382305] border-[#F59E0B]/40 text-[#F59E0B]",
    final: "bg-[#1B212D] border-[#222938] text-[#94A3B8]",
    accent: "bg-[#062E1E] border-[#10B981]/40 text-[#10B981]",
    reward: "bg-[#382305] border-[#F59E0B]/50 text-[#FBBF24]",
    neutral: "bg-[#1B212D] border-[#222938] text-[#F0F4FC]",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-sm px-3 py-1 gap-2",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "live" && "bg-[#EF4444] animate-pulse",
            variant === "open" && "bg-[#F59E0B]",
            variant === "accent" && "bg-[#10B981]",
            variant === "reward" && "bg-[#FBBF24]",
            (variant === "final" || variant === "neutral") && "bg-[#94A3B8]"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
