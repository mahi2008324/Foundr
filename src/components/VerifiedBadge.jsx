import { memo } from 'react'

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
      style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
    >
      ✓ Verified
    </span>
  )
}

export default memo(VerifiedBadge)
