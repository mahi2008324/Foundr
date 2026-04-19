import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import Navbar from '../components/Navbar'
import UserCard from '../components/UserCard'
import UserCardSkeleton from '../components/UserCardSkeleton'
import { getMatchableUsers } from '../services/usersService'

const skillOptions = ['Design', 'Frontend', 'Backend', 'AI', 'Marketing', 'Product']

export default function CofounderMatch() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [collegeQuery, setCollegeQuery] = useState('')
  const [lookingFor, setLookingFor] = useState('all')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const list = await getMatchableUsers()
        if (mounted) { setUsers(list); setLoading(false) }
      } catch (err) {
        if (mounted) { setError(err.message || 'Unable to load co-founder matches.'); setLoading(false) }
      }
    }
    void load()
    return () => { mounted = false }
  }, [])

  const handleSkillToggle = useCallback((e) => {
    const skill = e.currentTarget.dataset.skill
    setSelectedSkills((c) => c.includes(skill) ? c.filter((s) => s !== skill) : [...c, skill])
  }, [])

  const filteredUsers = useMemo(() => {
    const q = collegeQuery.trim().toLowerCase()
    return users.filter((u) => {
      const matchCollege = q ? (u.college ?? '').toLowerCase().includes(q) : true
      const matchLooking = lookingFor === 'all' ? true : u.lookingFor === lookingFor
      const matchSkills = selectedSkills.length === 0 ? true : selectedSkills.every((s) => (u.skills ?? []).includes(s))
      return matchCollege && matchLooking && matchSkills
    })
  }, [collegeQuery, lookingFor, selectedSkills, users])

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-[2rem] px-8 py-12 text-white"
          style={{ background: 'linear-gradient(140deg, #0f1030 0%, #160d2e 40%, #0d0e1a 100%)' }}
        >
          <div className="orb" style={{ width: 500, height: 500, background: '#6366f1', top: -150, left: -80, opacity: 0.22 }} />
          <div className="orb" style={{ width: 300, height: 300, background: '#7c3aed', bottom: -80, right: -60, opacity: 0.18 }} />
          <div className="relative">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
            >
              🤝 Cofounder Match
            </div>
            <h1 className="text-4xl font-black tracking-tight font-['Outfit',sans-serif]">
              Find your missing <span className="gradient-text">build superpower.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
              Filter by skills, college, and collaboration intent to discover student builders who complement how you work.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section
          className="mt-6 rounded-[1.5rem] p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Filter by skill</p>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill} type="button" data-skill={skill} onClick={handleSkillToggle}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all bounce-on-hover"
                    style={
                      selectedSkills.includes(skill)
                        ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', border: '1px solid rgba(99,102,241,0.5)' }
                        : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.07)' }
                    }
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>College</p>
                <input
                  type="search" value={collegeQuery}
                  onChange={(e) => setCollegeQuery(e.target.value)}
                  placeholder="Search by college…"
                  className="input-dark w-full rounded-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Intent</p>
                <select
                  value={lookingFor} onChange={(e) => setLookingFor(e.target.value)}
                  className="input-dark w-full rounded-full px-4 py-2.5 text-sm font-semibold"
                >
                  <option value="all">All intents</option>
                  <option value="cofounder">Cofounder</option>
                  <option value="feedback">Feedback</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl px-5 py-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <UserCardSkeleton key={i} />)
            : filteredUsers.length > 0
              ? filteredUsers.map((u) => <UserCard key={u.uid} user={u} />)
              : (
                <EmptyState
                  className="md:col-span-2"
                  title="No co-founder matches found."
                  description="Try widening your skill filters or searching with a different college name."
                />
              )
          }
        </section>
      </main>
    </div>
  )
}
