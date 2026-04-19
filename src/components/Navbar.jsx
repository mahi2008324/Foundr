import { useCallback, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useFeed } from '../context/FeedContext'

const navItems = [
  { to: '/', label: 'Feed', end: true },
  { to: '/post', label: 'Post' },
  { to: '/match', label: 'Match' },
  { to: '/messages', label: 'Messages' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useAuth()
  const { searchQuery, setSearchQuery } = useFeed()
  const [isOpen, setIsOpen] = useState(false)

  const displayName = userProfile?.name ?? currentUser?.displayName ?? 'Builder'
  const displayPhoto = userProfile?.photoURL ?? currentUser?.photoURL ?? ''
  const displayEmail = userProfile?.email ?? currentUser?.email ?? ''
  const initials = (displayName ?? 'F')
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      toast.success('Signed out.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not sign out.')
    }
  }, [logout, navigate])

  const handleSearch = useCallback((e) => setSearchQuery(e.target.value), [setSearchQuery])
  const handleToggle = useCallback(() => setIsOpen((o) => !o), [])
  const handleClose = useCallback(() => setIsOpen(false), [])

  const linkClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-white'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(14,15,26,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest text-white btn-primary">
            F
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-black tracking-tight text-white leading-none">Foundr</p>
            <p className="text-[9px] uppercase tracking-[0.35em] mt-0.5" style={{ color: '#6366f1' }}>Build in Public</p>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(124,58,237,0.2))' , border:'1px solid rgba(99,102,241,0.3)' }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden flex-1 max-w-xs md:block ml-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌕</span>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search ideas, founders..."
              className="input-dark w-full rounded-full pl-8 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="hidden items-center gap-2 md:flex ml-auto">
          {/* Notifications stub */}
          <button
            type="button"
            disabled
            aria-label="Notifications coming soon"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl transition"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-base text-slate-500">🔔</span>
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(99,102,241,0.3)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' }}
            >0</span>
          </button>

          {/* Profile link */}
          <NavLink
            to={`/profile/${currentUser?.uid ?? ''}`}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt={displayName} className="h-8 w-8 rounded-lg object-cover ring-2 ring-indigo-500/30" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
              >
                {initials}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <p className="text-sm font-semibold text-white leading-none">{displayName}</p>
              <p className="text-xs mt-0.5 truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>{displayEmail}</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition btn-ghost"
          >
            Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl md:hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className="space-y-1.5">
            <span className={`block h-0.5 w-5 rounded transition-all ${isOpen ? 'rotate-45 translate-y-2 bg-indigo-400' : 'bg-slate-300'}`} />
            <span className={`block h-0.5 w-5 rounded transition-all ${isOpen ? 'opacity-0' : 'bg-slate-300'}`} />
            <span className={`block h-0.5 w-5 rounded transition-all ${isOpen ? '-rotate-45 -translate-y-2 bg-indigo-400' : 'bg-slate-300'}`} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="border-t px-4 py-4 md:hidden"
          style={{ background: 'var(--surface-2)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="mb-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌕</span>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search ideas, founders..."
              className="input-dark w-full rounded-full pl-8 pr-4 py-2.5 text-sm"
            />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                onClick={handleClose}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to={`/profile/${currentUser?.uid ?? ''}`}
              className={linkClass}
              onClick={handleClose}
            >
              Profile
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 rounded-xl px-4 py-2 text-left text-sm font-semibold btn-ghost"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
