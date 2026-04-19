export default function EmptyState({ title, description, className = '' }) {
  return (
    <div
      className={`rounded-[1.5rem] p-12 text-center ${className}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(99,102,241,0.25)',
      }}
    >
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        🔍
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  )
}
