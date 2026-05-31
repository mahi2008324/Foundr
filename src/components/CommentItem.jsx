import { memo } from 'react'
import { useNavigate } from 'react-router-dom'

function CommentItem({ comment }) {
  const navigate = useNavigate()
  const handleProfileClick = () => {
    if (comment.authorId) navigate(`/profile/${comment.authorId}`)
  }

  return (
    <article
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        type="button"
        onClick={handleProfileClick}
        disabled={!comment.authorId}
        className="flex max-w-full items-center gap-3 rounded-xl text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-default"
      >
        {comment.authorPhoto ? (
          <img src={comment.authorPhoto} alt={comment.authorName} className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-500/20" />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
          >
            {(comment.authorName ?? 'F').slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">{comment.authorName}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : 'Just now'}
          </p>
        </div>
      </button>
      <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>{comment.text}</p>
    </article>
  )
}

export default memo(CommentItem)
