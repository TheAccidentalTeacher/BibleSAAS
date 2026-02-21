import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, children, disabled, className = "", ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-40 select-none";

    const variants = {
      primary:
        "bg-[var(--color-accent)] text-[#0F0F0F] hover:bg-[var(--color-accent-dim)]",
      ghost:
        "bg-transparent text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)]",
      outline:
        "border border-[var(--color-border)] bg-transparent text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-[var(--radius-button)]",
      md: "h-10 px-4 text-[15px] rounded-[var(--radius-button)]",
      lg: "h-12 px-6 text-base rounded-[var(--radius-button)]",
    };

    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
