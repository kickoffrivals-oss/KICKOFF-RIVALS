import React, { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      prefixElement,
      suffixElement,
      id: customId,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider select-none"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex items-center bg-[#1B212D] border border-[#222938] rounded-[4px] px-3 transition-colors duration-150",
            "focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981]",
            error && "border-[#EF4444] focus-within:border-[#EF4444] focus-within:ring-[#EF4444]",
            disabled && "opacity-40 cursor-not-allowed bg-[#13171F]"
          )}
        >
          {prefixElement && (
            <span className="shrink-0 mr-2 text-[#94A3B8] text-xs font-semibold" aria-hidden="true">
              {prefixElement}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full h-10 bg-transparent text-sm text-[#FFFFFF] placeholder-[#64748B] focus:outline-none disabled:cursor-not-allowed",
              props.type === "number" && "font-mono tabular-nums",
              className
            )}
            {...props}
          />

          {suffixElement && (
            <span className="shrink-0 ml-2 text-[#94A3B8] text-xs font-semibold" aria-hidden="true">
              {suffixElement}
            </span>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-[#EF4444]">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[#94A3B8]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
