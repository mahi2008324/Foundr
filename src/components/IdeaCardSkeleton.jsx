const SKL = ({ w = 'full', h = 4, rounded = 'full', className = '' }) => (
  <div
    className={`shimmer rounded-${rounded} ${className}`}
    style={{ width: w === 'full' ? '100%' : w, height: h, borderRadius: rounded === 'full' ? 999 : undefined }}
  />
)

export default function IdeaCardSkeleton() {
  return (
    <div
      className="rounded-[1.5rem] p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex gap-2">
        <SKL w={80} h={24} rounded="full" />
        <SKL w={60} h={24} rounded="full" />
      </div>
      <SKL h={28} className="mt-4" style={{ borderRadius: 12 }} />
      <SKL h={14} className="mt-3" />
      <SKL w="83%" h={14} className="mt-2" />
      <SKL w="66%" h={14} className="mt-2" />
      <div className="mt-5 flex items-center gap-3">
        <SKL w={36} h={36} rounded="xl" />
        <div className="flex-1">
          <SKL w={120} h={14} />
          <SKL w={90} h={11} className="mt-2" />
        </div>
      </div>
      <div className="mt-5 flex justify-between items-center">
        <SKL w={80} h={32} rounded="full" />
        <SKL w={120} h={14} />
      </div>
    </div>
  )
}
