export default function PageSpinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--surface)' }}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Multi-ring spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>Foundr</p>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading the builder community…</p>
        </div>
      </div>
    </div>
  )
}
