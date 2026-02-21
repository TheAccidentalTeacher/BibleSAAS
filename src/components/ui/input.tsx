import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="label"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            h-11 w-full rounded-[var(--radius-button)] border px-3 text-[15px]
            bg-[var(--color-surface-2)] border-[var(--color-border)]
            text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]
            transition-colors
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-[13px]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
