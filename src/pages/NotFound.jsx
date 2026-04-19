import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  const handleGoHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <div className="page-enter flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-xl rounded-[2rem] border border-indigo-100 bg-white p-10 text-center shadow-[0_18px_60px_rgba(79,70,229,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600">404</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
          This page wandered off the map.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The link may be outdated, or the page has not been built yet. The community feed is still right where you left it.
        </p>
        <button
          type="button"
          onClick={handleGoHome}
          className="mt-8 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Go home
        </button>
      </div>
    </div>
  )
}
