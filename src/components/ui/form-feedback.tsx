interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-button)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-400"
    >
      {message}
    </div>
  );
}

interface FormSuccessProps {
  message?: string | null;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-[var(--radius-button)] border border-green-500/30 bg-green-500/10 px-4 py-3 text-[14px] text-green-400"
    >
      {message}
    </div>
  );
}
