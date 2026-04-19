import { increment } from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import CommentItem from '../components/CommentItem'
import Navbar from '../components/Navbar'
import SkillPill from '../components/SkillPill'
import StageBadge from '../components/StageBadge'
import TagBadge from '../components/TagBadge'
import { useAuth } from '../context/AuthContext'
import useBookmark from '../hooks/useBookmark'
import useComments from '../hooks/useComments'
import useVote from '../hooks/useVote'
import { isMockMode } from '../services/firebase'
import { getAIFeedback } from '../services/claudeService'
import { addIdeaBuildLog, deleteIdea, getIdeaById, subscribeBuildLogs, updateIdea } from '../services/ideasService'

const initialEditForm = { title: '', problem: '', solution: '', stage: 'idea' }
const initialBuildLogForm = { title: '', content: '' }

function parseFeedbackSections(feedback) {
  if (!feedback) return []
  const matches = [...feedback.matchAll(/\*\*(.*?)\*\*/g)]
  return matches.map((match, i) => {
    const title = match[1]
    const contentStart = match.index + match[0].length
    const contentEnd = i < matches.length - 1 ? matches[i + 1].index : feedback.length
    return { title, content: feedback.slice(contentStart, contentEnd).trim() }
  })
}

const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem' }
const inputClass = 'input-dark w-full rounded-2xl px-4 py-3 text-sm transition'
const errorEl = (msg) => msg ? <p className="mt-1.5 text-xs text-red-400">{msg}</p> : null

export default function IdeaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const feedbackCardRef = useRef(null)
  const commentInputRef = useRef(null)
  const viewsTrackedRef = useRef(false)
  const { currentUser, userProfile } = useAuth()
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [editErrors, setEditErrors] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [buildLogs, setBuildLogs] = useState([])
  const [buildLogLoading, setBuildLogLoading] = useState(true)
  const [buildLogForm, setBuildLogForm] = useState(initialBuildLogForm)
  const [buildLogErrors, setBuildLogErrors] = useState({})
  const [buildLogSubmitting, setBuildLogSubmitting] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const { comments, loading: commentsLoading, addComment } = useComments(id)
  const { voteCount, hasVoted, handleVote, isPending: votePending } = useVote(idea?.votes ?? [], currentUser)
  const { isBookmarked, handleBookmark, isPending: bookmarkPending } = useBookmark(userProfile?.bookmarks ?? [], currentUser)
  const isAuthor = currentUser?.uid && currentUser.uid === idea?.authorId

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getIdeaById(id)
        if (!mounted) return
        setIdea(data)
        setAiFeedback(data?.aiFeedback ?? '')
        setEditForm({ title: data?.title ?? '', problem: data?.problem ?? '', solution: data?.solution ?? '', stage: data?.stage ?? 'idea' })
        setLoading(false)
      } catch (err) {
        if (mounted) { setError(err.message || 'Unable to load this idea.'); setLoading(false) }
      }
    }
    void load()
    return () => { mounted = false; viewsTrackedRef.current = false }
  }, [id])

  useEffect(() => {
    if (!id) return undefined
    const unsub = subscribeBuildLogs(id, (logs) => { setBuildLogs(logs); setBuildLogLoading(false) })
    return unsub
  }, [id])

  useEffect(() => {
    if (!idea?.id || viewsTrackedRef.current) return
    viewsTrackedRef.current = true
    void updateIdea(idea.id, { views: isMockMode ? (idea.views ?? 0) + 1 : increment(1) })
  }, [idea?.id, idea?.views])

  useEffect(() => {
    if (aiFeedback && feedbackCardRef.current) {
      feedbackCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [aiFeedback])

  const feedbackSections = useMemo(() => parseFeedbackSections(aiFeedback), [aiFeedback])

  const validateEdit = useCallback(() => {
    const e = {}
    if (!editForm.title.trim() || editForm.title.trim().length < 10) e.title = 'Title must be at least 10 characters.'
    if (!editForm.problem.trim() || editForm.problem.trim().length < 30) e.problem = 'Problem must be at least 30 characters.'
    if (!editForm.solution.trim() || editForm.solution.trim().length < 30) e.solution = 'Solution must be at least 30 characters.'
    setEditErrors(e)
    return Object.keys(e).length === 0
  }, [editForm])

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target
    setEditForm((c) => ({ ...c, [name]: value }))
    setEditErrors((c) => ({ ...c, [name]: '' }))
  }, [])

  const handleSaveEdit = useCallback(async (e) => {
    e.preventDefault()
    if (!validateEdit()) return
    try {
      setEditLoading(true)
      await updateIdea(id, { title: editForm.title.trim(), problem: editForm.problem.trim(), solution: editForm.solution.trim(), stage: editForm.stage })
      const updated = await getIdeaById(id)
      setIdea(updated)
      setAiFeedback(updated?.aiFeedback ?? '')
      setIsEditing(false)
      toast.success('Idea updated!')
    } catch (err) {
      toast.error(err.message || 'Could not save changes.')
    } finally {
      setEditLoading(false)
    }
  }, [editForm, id, validateEdit])

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this idea permanently?')) return
    try {
      setDeleteLoading(true)
      await deleteIdea(id)
      toast.success('Idea deleted.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not delete idea.')
    } finally {
      setDeleteLoading(false)
    }
  }, [id, navigate])

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim()) { setCommentError('Comment cannot be empty.'); return }
    try {
      setCommentSubmitting(true)
      await addComment(id, commentText.trim())
      setCommentText('')
      setCommentError('')
      commentInputRef.current?.focus()
    } catch (err) {
      toast.error(err.message || 'Could not add comment.')
    } finally {
      setCommentSubmitting(false)
    }
  }, [addComment, commentText, id])

  const handleCommentKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleCommentSubmit() }
  }, [handleCommentSubmit])

  const validateBuildLog = useCallback(() => {
    const e = {}
    if (!buildLogForm.title.trim()) e.title = 'Title is required.'
    if (!buildLogForm.content.trim()) e.content = 'Content is required.'
    setBuildLogErrors(e)
    return Object.keys(e).length === 0
  }, [buildLogForm])

  const handleBuildLogSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validateBuildLog() || !currentUser?.uid) return
    try {
      setBuildLogSubmitting(true)
      await addIdeaBuildLog(id, { week: buildLogs.length + 1, title: buildLogForm.title.trim(), content: buildLogForm.content.trim(), authorId: currentUser.uid })
      setBuildLogForm(initialBuildLogForm)
      toast.success('Progress update posted!')
    } catch (err) {
      toast.error(err.message || 'Could not add build log.')
    } finally {
      setBuildLogSubmitting(false)
    }
  }, [buildLogForm, buildLogs.length, currentUser, id, validateBuildLog])

  const handleFeedbackClick = useCallback(async () => {
    if (!idea) return
    // if (idea.aiFeedback) { setAiFeedback(idea.aiFeedback); return }
    try {
      setLoadingAI(true)
      const result = await getAIFeedback(idea)
      setAiFeedback(result)
      setIdea((c) => c ? { ...c, aiFeedback: result } : c)
      await updateIdea(id, { aiFeedback: result })
      toast.success('AI feedback ready! 🤖')
    } catch (err) {
      toast.error(err.message || 'Could not generate AI feedback.')
    } finally {
      setLoadingAI(false)
    }
  }, [id, idea])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse rounded-[2rem] p-8" style={card}>
            <div className="h-6 w-24 rounded-full" style={{ background: 'rgba(99,102,241,0.2)' }} />
            <div className="mt-5 h-10 w-3/4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="mt-4 h-4 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="mt-2 h-4 w-5/6 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </main>
      </div>
    )
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-2xl p-8 text-center" style={card}>
            <p className="text-4xl">🤔</p>
            <h1 className="mt-4 text-2xl font-black text-white">{error || 'Idea not found'}</h1>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary">
              ← Go home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const spinnerEl = <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* idea info */}
        <section style={card} className="p-7">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">Title</label>
                <input name="title" value={editForm.title} onChange={handleEditChange} className={inputClass} />
                {errorEl(editErrors.title)}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">Problem</label>
                <textarea name="problem" rows="5" value={editForm.problem} onChange={handleEditChange} className={inputClass} />
                {errorEl(editErrors.problem)}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">Solution</label>
                <textarea name="solution" rows="5" value={editForm.solution} onChange={handleEditChange} className={inputClass} />
                {errorEl(editErrors.solution)}
              </div>
              <select name="stage" value={editForm.stage} onChange={handleEditChange} className={`${inputClass} max-w-xs`}>
                <option value="idea">💡 Idea</option>
                <option value="building">🔨 Building</option>
                <option value="launched">🚀 Launched</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" disabled={editLoading} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary disabled:opacity-60">
                  {editLoading && spinnerEl} {editLoading ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold btn-ghost">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StageBadge stage={idea.stage} />
                {(idea.tags ?? []).map((tag) => <TagBadge key={tag} label={tag} />)}
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white font-['Outfit',sans-serif]">{idea.title}</h1>
              <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {idea.createdAt?.toDate ? idea.createdAt.toDate().toLocaleString() : 'Recently posted'}
              </p>

              <div className="mt-7 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>Problem</p>
                  <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>{idea.problem}</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c084fc' }}>Solution</p>
                  <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>{idea.solution}</p>
                </div>
              </div>

              {/* maker info and buttons */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  {idea.authorPhoto ? (
                    <img src={idea.authorPhoto} alt={idea.authorName} className="h-12 w-12 rounded-xl object-cover ring-2 ring-indigo-500/25" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}>
                      {(idea.authorName ?? 'F').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{idea.authorName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Looking for {idea.lookingFor} · {idea.views ?? 0} views</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button" onClick={() => void handleVote(id)} disabled={votePending}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition bounce-on-hover disabled:cursor-not-allowed"
                    style={hasVoted
                      ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }
                      : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
                  >
                    {votePending ? spinnerEl : <span>{hasVoted ? '▲' : '△'}</span>}
                    {hasVoted ? 'Upvoted' : 'Upvote'} ({voteCount})
                  </button>

                  <button
                    type="button" onClick={() => void handleBookmark(id)} disabled={bookmarkPending}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition bounce-on-hover disabled:cursor-not-allowed"
                    style={isBookmarked(idea.id)
                      ? { background: 'rgba(139,92,246,0.2)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.35)' }
                      : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
                  >
                    {bookmarkPending ? spinnerEl : <span>{isBookmarked(idea.id) ? '★' : '☆'}</span>}
                    {isBookmarked(idea.id) ? 'Bookmarked' : 'Bookmark'}
                  </button>

                  {isAuthor && (
                    <>
                      <button
                        type="button" onClick={handleFeedbackClick} disabled={loadingAI}
                        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingAI ? spinnerEl : '🤖'}
                        {loadingAI ? 'Analysing…' : aiFeedback ? 'AI Feedback' : 'Get AI Feedback'}
                      </button>
                      <button
                        type="button" onClick={() => setIsEditing(true)}
                        className="rounded-full px-4 py-2.5 text-sm font-semibold btn-ghost"
                      >✎ Edit</button>
                      <button
                        type="button" onClick={handleDelete} disabled={deleteLoading}
                        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                      >
                        {deleteLoading ? spinnerEl : '🗑'} Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ai mentor block */}
        {isAuthor && feedbackSections.length > 0 && (
          <section
            ref={feedbackCardRef}
            style={{ 
              background: 'linear-gradient(145deg, rgba(139,92,246,0.05) 0%, rgba(79,70,229,0.05) 100%)', 
              border: '1px solid rgba(139,92,246,0.25)', 
              borderRadius: '1.5rem',
              boxShadow: '0 8px 32px -8px rgba(139,92,246,0.15), inset 0 1px 1px rgba(255,255,255,0.05)'
            }}
            className="p-8 relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_-8px_rgba(139,92,246,0.3)]"
          >
            {/* background blur */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3 mb-8 pb-5 border-b border-white/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-xl ring-1 ring-purple-500/40 animate-pulse">
                🤖
              </span>
              <div>
                <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-['Outfit',sans-serif]">
                  AI Mentor Feedback
                </h2>
                <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>Tailored specifically for this idea</p>
              </div>
            </div>
            
            <div className="relative z-10 grid gap-5 sm:grid-cols-2">
              {feedbackSections.map((s) => {
                let colorConfig = { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: 'white', titleColor: '#e2e8f0', icon: '✨' }
                
                if (s.title.includes('Strengths')) colorConfig = { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)', titleColor: '#4ade80', icon: '🚀' }
                else if (s.title.includes('Risks')) colorConfig = { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', titleColor: '#f87171', icon: '⚠️' }
                else if (s.title.includes('Market')) colorConfig = { bg: 'rgba(56,189,248,0.06)', border: 'rgba(56,189,248,0.2)', titleColor: '#38bdf8', icon: '🎯' }
                else if (s.title.includes('Next Step')) colorConfig = { bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.3)', titleColor: '#c084fc', icon: '⚡' }

                return (
                  <article 
                    key={s.title} 
                    className="rounded-2xl p-5 transition duration-300 hover:-translate-y-1"
                    style={{ background: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span>{colorConfig.icon}</span>
                      <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: colorConfig.titleColor }}>{s.title}</h3>
                    </div>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.content}</p>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {/* discussion */}
        <section style={card} className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white">Comments</h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{comments.length} total</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={commentInputRef}
              value={commentText} onChange={(e) => { setCommentText(e.target.value); setCommentError('') }}
              onKeyDown={handleCommentKeyDown}
              placeholder="Leave feedback, questions, or ideas…"
              className={`input-dark flex-1 rounded-2xl px-4 py-3 text-sm`}
            />
            <button
              type="button" onClick={handleCommentSubmit} disabled={commentSubmitting}
              className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {commentSubmitting && spinnerEl}
              {commentSubmitting ? 'Posting…' : 'Comment'}
            </button>
          </div>
          {commentError && <p className="mt-2 text-xs text-red-400">{commentError}</p>}

          <div className="mt-5 space-y-3">
            {commentsLoading && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading comments…</p>}
            {!commentsLoading && comments.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first to respond.</p>
            )}
            {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
          </div>
        </section>

        {/* history logs */}
        <section style={card} className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white">Build logs</h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{buildLogs.length} updates</span>
          </div>

          {isAuthor && (
            <form onSubmit={handleBuildLogSubmit} className="mb-6 space-y-3 rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div>
                <input name="title" value={buildLogForm.title}
                  onChange={(e) => { setBuildLogForm((c) => ({ ...c, title: e.target.value })); setBuildLogErrors((c) => ({ ...c, title: '' })) }}
                  placeholder="Update title" className={inputClass} />
                {errorEl(buildLogErrors.title)}
              </div>
              <div>
                <textarea name="content" rows="3" value={buildLogForm.content}
                  onChange={(e) => { setBuildLogForm((c) => ({ ...c, content: e.target.value })); setBuildLogErrors((c) => ({ ...c, content: '' })) }}
                  placeholder="What moved forward this week?" className={inputClass} />
                {errorEl(buildLogErrors.content)}
              </div>
              <button type="submit" disabled={buildLogSubmitting}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary disabled:opacity-60">
                {buildLogSubmitting && spinnerEl}
                {buildLogSubmitting ? 'Posting…' : 'Add progress update'}
              </button>
            </form>
          )}

          {buildLogLoading && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading build logs…</p>}
          {!buildLogLoading && buildLogs.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No build logs yet.</p>
          )}
          <div className="space-y-4">
            {buildLogs.map((log) => (
              <article key={log.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>Week {log.week}</p>
                <h3 className="mt-2 text-lg font-black text-white">{log.title}</h3>
                <p className="mt-2 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>{log.content}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
