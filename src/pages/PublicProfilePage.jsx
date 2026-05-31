import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import IdeaCard from '../components/IdeaCard'
import IdeaCardSkeleton from '../components/IdeaCardSkeleton'
import Navbar from '../components/Navbar'
import SkillPill from '../components/SkillPill'
import { useAuth } from '../context/AuthContext'
import { getIdeas } from '../services/ideasService'
import { createNotification } from '../services/notificationsService'
import { getUserProfile } from '../services/usersService'

const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem' }

function getPortfolioUrl(profile) {
  return profile?.portfolioLink || profile?.portfolioURL || profile?.portfolioUrl || profile?.website || profile?.github || ''
}

function normalizeUrl(url) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function PublicProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [failedPhotoUrl, setFailedPhotoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const [profileData, ideaList] = await Promise.all([
          getUserProfile(userId),
          getIdeas({}),
        ])

        if (!mounted) return
        setProfile(profileData)
        setIdeas(ideaList)
        setLoading(false)
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Unable to load this profile.')
          setLoading(false)
        }
      }
    }

    void loadProfile()
    return () => { mounted = false }
  }, [userId])

  const isOwnProfile = currentUser?.uid === userId
  const photoUrl = profile?.photoURL || ''
  const shouldShowPhoto = photoUrl && failedPhotoUrl !== photoUrl
  const portfolioUrl = normalizeUrl(getPortfolioUrl(profile))
  const postedIdeas = useMemo(() => (
    ideas.filter((idea) => idea.authorId === userId || profile?.ideasPosted?.includes(idea.id))
  ), [ideas, profile?.ideasPosted, userId])

  const handleConnect = useCallback(async () => {
    if (!profile || isOwnProfile) return
    await createNotification({
      toUserId: profile.uid || userId,
      fromUserId: currentUser?.uid,
      fromUserName: userProfile?.name || currentUser?.displayName || 'Foundr Member',
      fromUserPhoto: userProfile?.photoURL || currentUser?.photoURL || '',
      type: 'cofounder_request',
      message: 'sent you a co-founder request',
    })
    navigate('/messages', { state: { user: { ...profile, uid: profile.uid || userId } } })
  }, [currentUser, isOwnProfile, navigate, profile, userId, userProfile])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="animate-pulse p-7" style={card}>
            <div className="h-24 w-24 rounded-2xl" style={{ background: 'rgba(99,102,241,0.15)' }} />
            <div className="mt-5 h-8 w-56 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="mt-3 h-4 w-72 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </section>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <IdeaCardSkeleton />
            <IdeaCardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <section className="p-8 text-center" style={card}>
            <h1 className="text-3xl font-black text-white">Profile not found</h1>
            <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {error || 'We could not find a Foundr profile for this user.'}
            </p>
            <Link to="/" className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary">
              Back to feed
            </Link>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="p-7" style={card}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {shouldShowPhoto ? (
                <img
                  src={photoUrl}
                  alt={profile.name}
                  onError={() => setFailedPhotoUrl(photoUrl)}
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}>
                  {(profile.name ?? 'F').slice(0, 1).toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>{isOwnProfile ? 'Your profile' : 'Foundr profile'}</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{profile.name ?? 'Foundr Member'}</h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{profile.college || 'College not added yet'}</p>
                <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
                  {profile.bio || 'No bio added yet.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(profile.skills ?? []).length > 0
                    ? profile.skills.map((skill) => <SkillPill key={skill} skill={skill} />)
                    : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No skills listed</span>}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full px-3 py-1 text-sm font-semibold capitalize" style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.25)' }}>
                    Looking for {profile.lookingFor ?? 'both'}
                  </span>
                  {portfolioUrl ? (
                    <a href={portfolioUrl} target="_blank" rel="noreferrer" className="rounded-full px-3 py-1 text-sm font-semibold btn-ghost">
                      Portfolio
                    </a>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No portfolio link yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {isOwnProfile ? (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                    This is you
                  </span>
                  <Link to={`/profile/${userId}/edit`} className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold btn-ghost">
                    Edit profile
                  </Link>
                </div>
              ) : (
                <button type="button" onClick={handleConnect} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white btn-primary">
                  Connect
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight text-white">Posted ideas</h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{postedIdeas.length} total</span>
          </div>

          {postedIdeas.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {postedIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
            </div>
          ) : (
            <div className="rounded-2xl p-10 text-center text-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(99,102,241,0.2)', color: 'var(--text-muted)' }}>
              This builder has not posted any ideas yet.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
