import { memo } from 'react'

function TagBadge({ label }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
    >
      {label}
    </span>
  )
}

export default memo(TagBadge)
