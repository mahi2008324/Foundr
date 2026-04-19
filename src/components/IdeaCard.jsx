import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useBookmark from '../hooks/useBookmark'
import useVote from '../hooks/useVote'
import StageBadge from './StageBadge'
import TagBadge from './TagBadge'

const stageGrad = {
  idea:     'from-indigo-500/10 to-violet-500/5',
  building: 'from-violet-500/10 to-purple-500/5',
  launched: 'from-emerald-500/10 to-teal-500/5',
}

function IdeaCard({ idea }) {
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()
  const { voteCount, hasVoted, isPending: votePending, handleVote } = useVote(
    idea.votes ?? [],
    currentUser,
  )
  const { isBookmarked, isPending: bookmarkPending, handleBookmark } = useBookmark(
    userProfile?.bookmarks ?? [],
    currentUser,
  )

  const snippet =
    idea.problem?.length > 130 ? `${idea.problem.slice(0, 130).trim()}…` : idea.problem

  const handleNavigate = useCallback(() => navigate(`/idea/${idea.id}`), [idea.id, navigate])
  const handleBookmarkClick = useCallback((e) => { e.stopPropagation(); void handleBookmark(idea.id) }, [handleBookmark, idea.id])
  const handleVoteClick = useCallback((e) => { e.stopPropagation(); void handleVote(idea.id) }, [handleVote, idea.id])

  const bookmarked = isBookmarked(idea.id)

  return (
    <article
      onClick={handleNavigate}
      className={`glow-hover cursor-pointer rounded-[1.5rem] p-5 overflow-hidden bg-gradient-to-br ${stageGrad[idea.stage] ?? 'from-white/3 to-white/1'}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StageBadge stage={idea.stage} />
          {(idea.tags ?? []).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>

        <button
          type="button"
          onClick={handleBookmarkClick}
          disabled={bookmarkPending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all bounce-on-hover disabled:cursor-not-allowed"
          style={{
            background: bookmarked ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${bookmarked ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: bookmarked ? '#a78bfa' : 'var(--text-muted)',
          }}
          aria-label="Bookmark"
        >
          {bookmarkPending ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          ) : (
            <span className="text-sm">{bookmarked ? '★' : '☆'}</span>
          )}
        </button>
      </div>

      {/* Title */}
      <h3 className="mt-4 text-xl font-black tracking-tight text-white leading-snug line-clamp-2">{idea.title}</h3>
      <p className="mt-2 text-sm leading-6 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{snippet}</p>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        {idea.authorPhoto ? (
          <img src={idea.authorPhoto} alt={idea.authorName} className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-500/20" />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
          >
            {(idea.authorName ?? 'F').slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white leading-none">{idea.authorName ?? 'Foundr Member'}</p>
          <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>Looking for {idea.lookingFor ?? 'feedback'}</p>
        </div>
      </div>

      {/* Footer stats */}
      <div
        className="mt-5 flex items-center justify-between pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          type="button"
          onClick={handleVoteClick}
          disabled={votePending}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition bounce-on-hover disabled:cursor-not-allowed"
          style={{
            background: hasVoted ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${hasVoted ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: hasVoted ? 'white' : 'var(--text-secondary)',
            boxShadow: hasVoted ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
          }}
        >
          {votePending ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          ) : (
            <span>{hasVoted ? '▲' : '△'}</span>
          )}
          <span>{voteCount}</span>
        </button>

        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">💬 {idea.commentCount ?? 0}</span>
          <span className="flex items-center gap-1">👁 {idea.views ?? 0}</span>
        </div>
      </div>
    </article>
  )
}

export default memo(IdeaCard)
