export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 pt-6 pb-24 animate-pulse">
      {/* Greeting skeleton */}
      <div className="h-7 w-48 rounded-lg bg-white/[0.06] mb-1" />
      <div className="h-4 w-32 rounded-lg bg-white/[0.04] mb-8" />

      {/* Streak card */}
      <div className="h-24 rounded-2xl bg-white/[0.05] mb-4" />

      {/* Reading plan card */}
      <div className="h-32 rounded-2xl bg-white/[0.05] mb-4" />

      {/* Cards row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-28 rounded-2xl bg-white/[0.05]" />
        <div className="h-28 rounded-2xl bg-white/[0.05]" />
      </div>

      {/* On This Day card */}
      <div className="h-24 rounded-2xl bg-white/[0.05]" />
    </div>
  );
}
