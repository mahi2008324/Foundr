import { Link } from 'react-router-dom'

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLabel,
}) {
  return (
    <div className="page-enter relative min-h-screen overflow-hidden" style={{ background: 'var(--surface)' }}>
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: '#6366f1', top: -180, left: -180 }} />
      <div className="orb" style={{ width: 400, height: 400, background: '#7c3aed', bottom: -100, right: -100 }} />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8 z-10">
        <div className="grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.1fr_0.9fr]"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}>

          {/* Left panel */}
          <section className="relative hidden overflow-hidden px-10 py-14 lg:block"
            style={{ background: 'linear-gradient(140deg, #0d0e1d 0%, #12132a 50%, #0b0c1a 100%)' }}>
            <div className="orb" style={{ width: 500, height: 500, background: '#6366f1', top: -100, left: -80, opacity: 0.22 }} />
            <div className="orb" style={{ width: 300, height: 300, background: '#a855f7', bottom: 0, right: -60, opacity: 0.18 }} />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
                  ✦ Foundr platform
                </div>
                <h1 className="mt-7 max-w-md text-5xl font-black leading-[1.04] tracking-tight text-white font-['Outfit',sans-serif]">
                  Student builders deserve a{' '}
                  <span className="gradient-text">sharper place</span> to launch.
                </h1>
                <p className="mt-5 max-w-md text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
                  Share startup ideas, collect honest feedback, find co-founders, and turn momentum into public proof.
                </p>
              </div>

              <div className="mt-10 grid gap-3">
                {[
                  { icon: '🚀', text: 'Launch ideas before they are polished.' },
                  { icon: '🤝', text: 'Meet collaborators who complement your skills.' },
                  { icon: '📈', text: 'Document traction, experiments, and build logs.' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                    <span className="text-xl">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right panel */}
          <section className="px-6 py-12 sm:px-10" style={{ background: 'var(--surface-2)' }}>
            <div className="mx-auto max-w-md">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black uppercase tracking-widest text-white btn-primary">
                  F
                </div>
                <div>
                  <p className="text-base font-black tracking-tight text-white">Foundr</p>
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Builder Community</p>
                </div>
              </Link>

              <div className="mt-10">
                <h2 className="text-3xl font-black tracking-tight text-white font-['Outfit',sans-serif]">{title}</h2>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
              </div>

              <div className="mt-8">{children}</div>

              <p className="mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                {footerText}{' '}
                <Link to={footerLink} className="font-semibold transition" style={{ color: '#818cf8' }}
                  onMouseEnter={(e) => e.target.style.color = '#a5b4fc'}
                  onMouseLeave={(e) => e.target.style.color = '#818cf8'}>
                  {footerLabel}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
