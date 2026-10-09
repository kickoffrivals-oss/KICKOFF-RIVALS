import { Link } from "@tanstack/react-router";
import { cn } from "../lib/utils";

interface RivalsLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  to?: string;
  disableLink?: boolean;
}

export function RivalsLogo({
  className,
  size = "md",
  variant = "full",
  to = "/",
  disableLink = false,
}: RivalsLogoProps) {
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
  };

  const textSizeClasses = {
    xs: "text-xs tracking-normal",
    sm: "text-sm tracking-tight",
    md: "text-base tracking-tight",
    lg: "text-lg tracking-tight",
    xl: "text-xl tracking-tight",
  };

  const content = (
    <>
      {(variant === "full" || variant === "icon") && (
        <img
          src="/logo.png"
          alt="KickOff Rivals"
          className={cn(
            "object-contain",
            sizeClasses[size],
            "aspect-square",
            variant === "icon" && className,
          )}
        />
      )}
      {(variant === "full" || variant === "text") && (
        <span
          className={cn(
            "font-sport font-black italic tracking-tighter",
            textSizeClasses[size],
            variant === "text" ? className : "text-white",
          )}
        >
          KICKOFF<span className="text-primary">RIVALS</span>
        </span>
      )}
    </>
  );

  if (disableLink) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 whitespace-nowrap",
          variant === "full" && className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to as any}
      className={cn(
        "flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap",
        variant === "full" && className
      )}
    >
      {content}
    </Link>
  );
}

export default RivalsLogo;
