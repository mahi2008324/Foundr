import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import IdeaCard from '../components/IdeaCard'
import IdeaCardSkeleton from '../components/IdeaCardSkeleton'
import Navbar from '../components/Navbar'
import useIdeas from '../hooks/useIdeas'
import { useFeed } from '../context/FeedContext'

const tags = ['All', 'EdTech', 'FinTech', 'Health', 'Social', 'Other']

export default function Home() {
  const { activeTag, setActiveTag, activeStage, setActiveStage, sortMode, setSortMode, searchQuery } = useFeed()
  const { ideas, loading, error } = useIdeas({ tag: activeTag, stage: activeStage, sortMode, searchQuery })

  const handleFilterChange = useCallback((e) => setActiveTag(e.currentTarget.dataset.tag), [setActiveTag])
  const handleStageChange = useCallback((e) => setActiveStage(e.target.value), [setActiveStage])
  const handleSortChange = useCallback((e) => setSortMode(e.currentTarget.dataset.mode), [setSortMode])

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero banner */}
        <section
          className="relative overflow-hidden rounded-[2rem] px-7 py-10 text-white"
          style={{ background: 'linear-gradient(140deg, #0f1030 0%, #160d2e 40%, #0d0e1a 100%)' }}
        >
          {/* Ambient orbs */}
          <div className="orb" style={{ width: 600, height: 600, background: '#6366f1', top: -180, left: -100, opacity: 0.25 }} />
          <div className="orb" style={{ width: 400, height: 400, background: '#7c3aed', bottom: -120, right: -60, opacity: 0.2 }} />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
              >
                ✦ Community Feed
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl font-['Outfit',sans-serif] text-white">
                Build publicly.{' '}
                <span className="gradient-text">Find the people</span>{' '}
                who believe before anyone else does.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
                Foundr gives student builders a live space to launch ideas, collect feedback, and pull the right co-founders closer.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/post"
                  className="rounded-full px-6 py-3 text-sm font-semibold text-white btn-primary"
                >
                  Post an idea ✦
                </Link>
                <Link
                  to="/match"
                  className="rounded-full px-6 py-3 text-sm font-semibold btn-ghost"
                >
                  Find a co-founder →
                </Link>
              </div>
            </div>

            {/* Stats panel */}
            <div
              className="grid gap-3 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {[
                { label: 'Ideas live', value: loading ? '—' : ideas.length.toString(), icon: '💡' },
                { label: 'Active tag', value: activeTag, icon: '🏷️' },
                { label: 'Sort mode', value: sortMode === 'trending' ? 'Trending 🔥' : 'Newest ✨', icon: '📊' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>{stat.icon}</span> {stat.label}
                  </span>
                  <span className="text-lg font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section
          className="mt-6 rounded-[1.5rem] p-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  data-tag={tag}
                  onClick={handleFilterChange}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
                  style={
                    activeTag === tag
                      ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={activeStage}
                onChange={handleStageChange}
                className="input-dark rounded-full px-4 py-2 text-sm font-semibold"
              >
                <option value="all">All stages</option>
                <option value="idea">Idea</option>
                <option value="building">Building</option>
                <option value="launched">Launched</option>
              </select>

              <div
                className="inline-flex rounded-full p-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {['trending', 'newest'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    data-mode={mode}
                    onClick={handleSortChange}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
                    style={
                      sortMode === mode
                        ? { background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    {mode === 'trending' ? '🔥 Trending' : '✨ Newest'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ideas grid */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-white">Discover ideas</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Fresh startup concepts from builders shipping in public.'}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl px-5 py-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="grid gap-5 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <IdeaCardSkeleton key={i} />)}
            </div>
          )}

          {!loading && !error && ideas.length === 0 && (
            <EmptyState
              title="No ideas match this filter set yet."
              description="Try another tag, clear the search query, or switch the stage filter to widen the feed."
            />
          )}

          {!loading && !error && ideas.length > 0 && (
            <div className="grid gap-5 lg:grid-cols-2">
              {ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
