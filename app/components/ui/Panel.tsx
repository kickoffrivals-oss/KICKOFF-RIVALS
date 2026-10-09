import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, padding = "md", interactive = false, children, ...props }, ref) => {
    const paddingStyles = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#13171F] border border-[#222938] rounded-[6px] transition-colors duration-150",
          interactive && "hover:border-[#323C50] cursor-pointer",
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Panel.displayName = "Panel";
