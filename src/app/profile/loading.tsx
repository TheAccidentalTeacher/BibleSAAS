export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 pt-6 pb-24 animate-pulse">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-lg bg-white/[0.06]" />
          <div className="h-3 w-20 rounded-lg bg-white/[0.04]" />
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.05]" />
        ))}
      </div>
      {/* Menu items */}
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}
