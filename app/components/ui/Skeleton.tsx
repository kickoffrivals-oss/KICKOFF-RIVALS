import React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[#1B212D] border border-[#222938]/60 rounded-[4px] animate-pulse",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
