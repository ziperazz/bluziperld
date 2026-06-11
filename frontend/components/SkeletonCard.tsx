"use client"

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/10 animate-pulse">
      <div className="h-32 bg-white/10" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  )
}
