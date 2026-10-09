import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { IconLoader } from "../Icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  "aria-label"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-[4px] border select-none " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D12] " +
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]";

    const variantStyles = {
      primary:
        "bg-[#10B981] border-[#10B981] text-[#0A0D12] hover:bg-[#34D399] hover:border-[#34D399] active:bg-[#059669]",
      secondary:
        "bg-[#1B212D] border-[#222938] text-[#FFFFFF] hover:bg-[#242C3C] hover:border-[#323C50] active:bg-[#151A24]",
      outline:
        "bg-transparent border-[#222938] text-[#F0F4FC] hover:bg-[#1B212D] hover:border-[#323C50] active:bg-[#13171F]",
      ghost:
        "bg-transparent border-transparent text-[#94A3B8] hover:bg-[#1B212D] hover:text-[#FFFFFF] active:bg-[#13171F]",
      destructive:
        "bg-[#EF4444] border-[#EF4444] text-[#FFFFFF] hover:bg-[#DC2626] hover:border-[#DC2626] active:bg-[#B91C1C]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <IconLoader className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
