import { memo } from 'react'

const stageConfig = {
  idea:     { colors: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.3)', dot: '#6366f1' },
  building: { colors: 'rgba(139,92,246,0.2)', text: '#c084fc', border: 'rgba(139,92,246,0.3)', dot: '#a855f7' },
  launched: { colors: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)', dot: '#10b981' },
}

function StageBadge({ stage }) {
  const cfg = stageConfig[stage] ?? { colors: 'rgba(255,255,255,0.08)', text: '#94a3b8', border: 'rgba(255,255,255,0.12)', dot: '#64748b' }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
      style={{ background: cfg.colors, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full badge-pulse" style={{ background: cfg.dot }} />
      {stage}
    </span>
  )
}

export default memo(StageBadge)
