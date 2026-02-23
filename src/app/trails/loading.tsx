export default function TrailsLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 pt-6 pb-24 animate-pulse">
      <div className="h-7 w-28 rounded-lg bg-white/[0.06] mb-2" />
      <div className="h-4 w-48 rounded-lg bg-white/[0.04] mb-6" />
      {/* Trail cards */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/[0.05]" />
        ))}
      </div>
    </div>
  );
}
