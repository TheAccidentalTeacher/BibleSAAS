export default function JourneyLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] animate-pulse">
      {/* Tab bar skeleton */}
      <div className="h-12 border-b border-white/[0.06] flex items-center px-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-5 w-12 rounded-md bg-white/[0.06]" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="px-4 pt-5 space-y-4">
        <div className="flex justify-between items-end">
          <div className="h-6 w-36 rounded-lg bg-white/[0.06]" />
          <div className="h-5 w-16 rounded-lg bg-white/[0.06]" />
        </div>
        <div className="h-2 w-full rounded-full bg-white/[0.05]" />

        {/* Map placeholder */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06]" style={{ aspectRatio: "8/5" }} />
      </div>
    </div>
  );
}
