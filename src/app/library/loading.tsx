export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 pt-6 pb-24 animate-pulse">
      <div className="h-7 w-32 rounded-lg bg-white/[0.06] mb-6" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[0.05]" />
        ))}
      </div>
    </div>
  );
}
