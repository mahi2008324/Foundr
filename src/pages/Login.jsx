import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import useRedirectIfAuthenticated from '../hooks/useRedirectIfAuthenticated'

const initialForm = { email: '', password: '' }

export default function Login() {
  useRedirectIfAuthenticated()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    if (location.state?.message) toast.success(location.state.message)
  }, [location.state])

  const validate = () => {
    const e = { email: '', password: '' }
    if (!formData.email.trim()) e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email.'
    if (!formData.password) e.password = 'Password is required.'
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters.'
    setErrors(e)
    return !e.email && !e.password
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((c) => ({ ...c, [name]: value }))
    setErrors((c) => ({ ...c, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setIsSubmitting(true)
      await login(formData.email.trim(), formData.password)
      toast.success('Welcome back to Foundr! 👋')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Unable to log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await loginWithGoogle()
      toast.success('Signed in with Google.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const inputClass = 'input-dark w-full rounded-2xl px-4 py-3 text-sm transition'
  const errorClass = 'mt-1.5 text-xs text-red-400'

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep sharing ideas, collecting feedback, and meeting future co-founders."
      footerText="New to Foundr?"
      footerLink="/signup"
      footerLabel="Create an account →"
    >
      {/* Google button first */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGoogleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-black" style={{ background: 'linear-gradient(135deg,#4285f4,#ea4335,#fbbc05,#34a853)', color: 'white' }}>G</span>
        )}
        {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or</span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-white">Email</label>
          <input
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
            className={inputClass} placeholder="you@college.edu"
            autoComplete="email"
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-white">Password</label>
            <Link to="/signup" className="text-xs font-semibold" style={{ color: '#818cf8' }}>Need an account?</Link>
          </div>
          <input
            id="password" name="password" type="password"
            value={formData.password} onChange={handleChange}
            className={inputClass} placeholder="Your password"
            autoComplete="current-password"
          />
          {errors.password && <p className={errorClass}>{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {isSubmitting ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthShell>
  )
}
