import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import IdeaCard from '../components/IdeaCard'
import IdeaCardSkeleton from '../components/IdeaCardSkeleton'
import Navbar from '../components/Navbar'
import SkillPill from '../components/SkillPill'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from '../services/usersService'
import { getIdeas as fetchIdeas } from '../services/ideasService'

const initialEditForm = { bio: '', college: '', skills: '', lookingFor: 'both' }

const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem' }
const inputClass = 'input-dark w-full rounded-2xl px-4 py-3 text-sm transition'
const errorEl = (msg) => msg ? <p className="mt-1.5 text-xs text-red-400">{msg}</p> : null

export default function Profile() {
  const { uid } = useParams()
  const { currentUser, userProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('posted')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [profileData, ideaList] = await Promise.all([getUserProfile(uid), fetchIdeas({})])
        if (!mounted) return
        setProfile(profileData)
        setIdeas(ideaList)
        setEditForm({
          bio: profileData?.bio ?? '',
          college: profileData?.college ?? '',
          skills: (profileData?.skills ?? []).join(', '),
          lookingFor: profileData?.lookingFor ?? 'both',
        })
        setLoading(false)
      } catch (err) {
        if (mounted) { setError(err.message || 'Unable to load profile.'); setLoading(false) }
      }
    }
    void load()
    return () => { mounted = false }
  }, [uid, userProfile])

  const isOwnProfile = currentUser?.uid === uid

  const postedIdeas = useMemo(() => ideas.filter((i) => profile?.ideasPosted?.includes(i.id)), [ideas, profile?.ideasPosted])
  const bookmarkedIdeas = useMemo(() => ideas.filter((i) => profile?.bookmarks?.includes(i.id)), [ideas, profile?.bookmarks])
  const visibleIdeas = activeTab === 'posted' ? postedIdeas : bookmarkedIdeas

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target
    setEditForm((c) => ({ ...c, [name]: value }))
    setFormErrors((c) => ({ ...c, [name]: '' }))
  }, [])

  const validateForm = useCallback(() => {
    const e = {}
    if (!editForm.bio.trim()) e.bio = 'Bio is required.'
    if (!editForm.college.trim()) e.college = 'College is required.'
    if (!editForm.skills.trim()) e.skills = 'Add at least one skill.'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }, [editForm])

  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const updatedSkills = editForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
    try {
      setIsSaving(true)
      await updateUserProfile(uid, { bio: editForm.bio.trim(), college: editForm.college.trim(), skills: updatedSkills, lookingFor: editForm.lookingFor })
      const refreshed = await getUserProfile(uid)
      setProfile(refreshed)
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || 'Could not update profile.')
    } finally {
      setIsSaving(false)
    }
  }, [editForm, uid, validateForm])

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploadingPhoto(true)
      const photoURL = await uploadProfilePhoto(uid, file)
      await updateUserProfile(uid, { photoURL })
      const refreshed = await getUserProfile(uid)
      setProfile(refreshed)
      toast.success('Photo updated!')
    } catch (err) {
      toast.error(err.message || 'Could not upload photo.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }, [uid])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[2rem] p-8" style={card}>
            <div className="h-24 w-24 rounded-2xl" style={{ background: 'rgba(99,102,241,0.15)' }} />
            <div className="mt-5 h-8 w-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="mt-3 h-4 w-64 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl px-5 py-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 text-center">
          <h1 className="text-3xl font-black text-white">Profile not found</h1>
        </main>
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile card */}
        <section style={card} className="p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name} className="h-24 w-24 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
                  >
                    {(profile.name ?? 'F').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>
                  {isOwnProfile ? 'Your profile' : 'Founder profile'}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-white">{profile.name}</h1>
                  {profile.isVerified && (
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>✓ Verified</span>
                  )}
                </div>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{profile.college || 'College not added yet'}</p>
                <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{profile.bio || 'No bio added yet.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(profile.skills ?? []).length > 0
                    ? profile.skills.map((s) => <SkillPill key={s} skill={s} />)
                    : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No skills listed</span>}
                </div>
                <div className="mt-4">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    Looking for {profile.lookingFor ?? 'both'}
                  </span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing((c) => !c)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold btn-ghost"
                >
                  {isEditing ? '✕ Close editor' : '✎ Edit profile'}
                </button>
                <label className="cursor-pointer rounded-xl px-5 py-2.5 text-center text-sm font-semibold btn-ghost">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {isUploadingPhoto ? 'Uploading…' : '📷 Upload photo'}
                </label>
              </div>
            )}
          </div>

          {/* Edit form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-7 grid gap-4 rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">Bio</label>
                <textarea name="bio" rows="3" value={editForm.bio} onChange={handleEditChange} placeholder="Write a short builder bio" className={inputClass} />
                {errorEl(formErrors.bio)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white">College</label>
                  <input name="college" value={editForm.college} onChange={handleEditChange} placeholder="Your college" className={inputClass} />
                  {errorEl(formErrors.college)}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white">Skills <span style={{ color: 'var(--text-muted)' }}>(comma separated)</span></label>
                  <input name="skills" value={editForm.skills} onChange={handleEditChange} placeholder="React, Design, Marketing" className={inputClass} />
                  {errorEl(formErrors.skills)}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">Looking for</label>
                <select name="lookingFor" value={editForm.lookingFor} onChange={handleEditChange} className={`${inputClass} max-w-xs`}>
                  <option value="cofounder">Cofounder</option>
                  <option value="feedback">Feedback</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                  {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {isSaving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Tabs */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            {[{ key: 'posted', label: `Ideas posted (${postedIdeas.length})` }, { key: 'bookmarks', label: `Bookmarked (${bookmarkedIdeas.length})` }].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className="rounded-full px-5 py-2 text-sm font-semibold transition-all"
                style={
                  activeTab === tab.key
                    ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {visibleIdeas.length > 0 ? (
              visibleIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
            ) : (
              <div
                className="rounded-2xl p-10 text-center text-sm lg:col-span-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(99,102,241,0.2)', color: 'var(--text-muted)' }}
              >
                {activeTab === 'posted' ? 'This builder has not posted any ideas yet.' : 'No bookmarked ideas yet.'}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
