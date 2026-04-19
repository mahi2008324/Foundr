import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { createIdea } from '../services/ideasService'

const DRAFT_KEY = 'foundr_draft'
const tagOptions = ['EdTech', 'FinTech', 'Health', 'Social', 'Other']
const initialForm = { title: '', problem: '', solution: '', stage: 'idea', tags: [], lookingFor: 'feedback' }

const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem' }

function FieldLabel({ children }) {
  return <label className="mb-2 block text-sm font-semibold text-white">{children}</label>
}

export default function PostIdea() {
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()
  const [formData, setFormData] = useState(() => {
    try { return { ...initialForm, ...JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? '{}') } }
    catch { return initialForm }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  useEffect(() => { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(formData)) }, [formData])
  useEffect(() => {
    if (!draftSaved) return
    const t = window.setTimeout(() => setDraftSaved(false), 1400)
    return () => window.clearTimeout(t)
  }, [draftSaved])

  const validate = useCallback(() => {
    const e = {}
    if (!formData.title.trim()) e.title = 'Title is required.'
    else if (formData.title.trim().length < 10) e.title = 'Title must be at least 10 characters.'
    if (!formData.problem.trim()) e.problem = 'Problem statement is required.'
    else if (formData.problem.trim().length < 30) e.problem = 'At least 30 characters.'
    if (!formData.solution.trim()) e.solution = 'Solution is required.'
    else if (formData.solution.trim().length < 30) e.solution = 'At least 30 characters.'
    if (!formData.stage) e.stage = 'Stage is required.'
    if (formData.tags.length === 0) e.tags = 'Select at least one tag.'
    if (!formData.lookingFor) e.lookingFor = 'Choose what you are looking for.'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((c) => ({ ...c, [name]: value }))
    setErrors((c) => ({ ...c, [name]: '' }))
    setDraftSaved(true)
  }, [])

  const handleTagToggle = useCallback((e) => {
    const tag = e.currentTarget.dataset.tag
    setFormData((c) => ({
      ...c,
      tags: c.tags.includes(tag) ? c.tags.filter((t) => t !== tag) : [...c.tags, tag],
    }))
    setErrors((c) => ({ ...c, tags: '' }))
    setDraftSaved(true)
  }, [])

  const handleClearDraft = useCallback(() => {
    setFormData(initialForm)
    setErrors({})
    window.localStorage.removeItem(DRAFT_KEY)
    setDraftSaved(false)
    toast.success('Draft cleared')
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate() || !currentUser?.uid) return
    try {
      setIsSubmitting(true)
      const id = await createIdea({
        ...formData,
        title: formData.title.trim(),
        problem: formData.problem.trim(),
        solution: formData.solution.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.name ?? currentUser.displayName ?? 'Foundr Member',
        authorPhoto: userProfile?.photoURL ?? currentUser.photoURL ?? '',
        isVerified: userProfile?.isVerified ?? false,
      })
      window.localStorage.removeItem(DRAFT_KEY)
      toast.success('Idea posted! 🚀')
      navigate(`/idea/${id}`, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not post your idea.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentUser, formData, navigate, userProfile, validate])

  const tagButtons = useMemo(() =>
    tagOptions.map((tag) => (
      <button
        key={tag} type="button" data-tag={tag} onClick={handleTagToggle}
        className="rounded-full px-4 py-2 text-sm font-semibold transition-all bounce-on-hover"
        style={
          formData.tags.includes(tag)
            ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }
            : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }
        }
      >
        {tag}
      </button>
    )),
    [formData.tags, handleTagToggle],
  )

  const inputClass = 'input-dark w-full rounded-2xl px-4 py-3 text-sm transition'
  const errorEl = (msg) => msg ? <p className="mt-1.5 text-xs text-red-400">{msg}</p> : null

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
          >
            ✦ Launch your idea
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white font-['Outfit',sans-serif]">Post a startup concept</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
            Give the community enough context to challenge the idea, validate the need, and decide whether they want to build with you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div style={card} className="p-6">
            <FieldLabel>Title</FieldLabel>
            <input
              id="title" name="title" value={formData.title} onChange={handleChange}
              className={inputClass} placeholder="A clear one-line summary of your startup idea"
            />
            {errorEl(errors.title)}
          </div>

          {/* Problem */}
          <div style={card} className="p-6">
            <FieldLabel>Problem</FieldLabel>
            <textarea
              id="problem" name="problem" rows="5" value={formData.problem} onChange={handleChange}
              className={inputClass} placeholder="What painful, expensive, or inefficient thing are you trying to solve?"
            />
            {errorEl(errors.problem)}
          </div>

          {/* Solution */}
          <div style={card} className="p-6">
            <FieldLabel>Solution</FieldLabel>
            <textarea
              id="solution" name="solution" rows="5" value={formData.solution} onChange={handleChange}
              className={inputClass} placeholder="How will your product solve it better than the current workaround?"
            />
            {errorEl(errors.solution)}
          </div>

          {/* Stage + Looking For */}
          <div className="grid gap-5 md:grid-cols-2">
            <div style={card} className="p-6">
              <FieldLabel>Stage</FieldLabel>
              <select name="stage" value={formData.stage} onChange={handleChange} className={inputClass}>
                <option value="idea">💡 Idea</option>
                <option value="building">🔨 Building</option>
                <option value="launched">🚀 Launched</option>
              </select>
              {errorEl(errors.stage)}
            </div>

            <div style={card} className="p-6">
              <p className="mb-3 text-sm font-semibold text-white">Looking for</p>
              <div className="grid gap-2">
                {['cofounder', 'feedback', 'both'].map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all"
                    style={{
                      background: formData.lookingFor === opt ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.lookingFor === opt ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: formData.lookingFor === opt ? '#a5b4fc' : 'var(--text-secondary)',
                    }}
                  >
                    <input
                      type="radio" name="lookingFor" value={opt}
                      checked={formData.lookingFor === opt} onChange={handleChange}
                      className="accent-indigo-500"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
              {errorEl(errors.lookingFor)}
            </div>
          </div>

          {/* Tags */}
          <div style={card} className="p-6">
            <p className="mb-3 text-sm font-semibold text-white">Tags</p>
            <div className="flex flex-wrap gap-2">{tagButtons}</div>
            {errorEl(errors.tags)}
            {draftSaved && (
              <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: '#818cf8' }}>
                <span>✓</span> Draft saved
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {isSubmitting ? 'Publishing…' : 'Publish idea 🚀'}
            </button>
            <button
              type="button" onClick={handleClearDraft} disabled={isSubmitting}
              className="rounded-full px-6 py-3 text-sm font-semibold btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear draft
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
