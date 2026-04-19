export default function UserCardSkeleton() {
  return (
    <div
      className="rounded-[1.5rem] p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-4">
        <div className="shimmer h-14 w-14 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-5 w-36 rounded-full" />
          <div className="shimmer h-3.5 w-28 rounded-full" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="shimmer h-6 w-16 rounded-full" />
        <div className="shimmer h-6 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="shimmer h-3.5 w-full rounded-full" />
        <div className="shimmer h-3.5 w-5/6 rounded-full" />
      </div>
      <div className="shimmer mt-5 h-9 w-28 rounded-full" />
    </div>
  )
}
