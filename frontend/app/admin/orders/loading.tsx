export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_25%),linear-gradient(180deg,#0a0f1f_0%,#0b1020_40%,#070b16_100%)] text-white">
      <div className="mx-auto w-full max-w-[1600px] animate-pulse space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-8 w-60 rounded-xl bg-white/10" />
          <div className="h-4 w-96 rounded-xl bg-white/5" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-[28px] border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>

        <div className="h-20 rounded-[28px] border border-white/10 bg-white/[0.04]" />
        <div className="h-[480px] rounded-[30px] border border-white/10 bg-white/[0.04]" />
      </div>
    </main>
  );
}
