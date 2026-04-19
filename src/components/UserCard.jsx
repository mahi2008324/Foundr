import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SkillPill from './SkillPill'

function UserCard({ user }) {
  const navigate = useNavigate()

  const handleConnect = useCallback(() => {
    navigate('/messages', { state: { user } })
  }, [navigate, user])

  return (
    <article
      className="glow-hover rounded-[1.5rem] p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}
    >
      <div className="flex items-start gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.name} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0" />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
          >
            {(user.name ?? 'F').slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-tight text-white">{user.name}</h3>
            {user.isVerified && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
              >✓ Verified</span>
            )}
          </div>
          <p className="mt-0.5 text-sm truncate" style={{ color: 'var(--text-muted)' }}>{user.college || 'College not listed'}</p>
          <span
            className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            {user.lookingFor}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {user.bio?.length > 140 ? `${user.bio.slice(0, 140).trim()}…` : user.bio || 'No bio added yet.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(user.skills ?? []).length > 0 ? (
          user.skills.map((skill) => <SkillPill key={skill} skill={skill} />)
        ) : (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No skills listed</span>
        )}
      </div>

      <button
        type="button"
        onClick={handleConnect}
        data-uid={user.uid}
        className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary"
      >
        <span>✉</span> Connect
      </button>
    </article>
  )
}

export default memo(UserCard)
