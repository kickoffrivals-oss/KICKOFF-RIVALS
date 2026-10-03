import { Link } from "@tanstack/react-router";
import { cn } from "../lib/utils";

interface RivalsLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
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
    sm: "h-6",
    md: "h-10",
    lg: "h-14",
    xl: "h-20",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
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
