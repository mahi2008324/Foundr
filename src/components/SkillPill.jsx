import { memo } from 'react'

function SkillPill({ skill }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: 'rgba(139,92,246,0.12)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.22)' }}
    >
      {skill}
    </span>
  )
}

export default memo(SkillPill)
