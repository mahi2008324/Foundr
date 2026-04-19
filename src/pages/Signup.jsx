import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import useRedirectIfAuthenticated from '../hooks/useRedirectIfAuthenticated'

const initialForm = { name: '', email: '', password: '', confirmPassword: '' }

export default function Signup() {
  useRedirectIfAuthenticated()
  const navigate = useNavigate()
  const { signup, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const validate = () => {
    const e = { name: '', email: '', password: '', confirmPassword: '' }
    if (!formData.name.trim()) e.name = 'Name is required.'
    else if (formData.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!formData.email.trim()) e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email.'
    if (!formData.password) e.password = 'Password is required.'
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters.'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password.'
    else if (formData.confirmPassword !== formData.password) e.confirmPassword = 'Passwords do not match.'
    setErrors(e)
    return Object.values(e).every((v) => !v)
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
      await signup(formData.email.trim(), formData.password, formData.name.trim())
      toast.success('Your Foundr account is ready! 🚀')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true)
      await loginWithGoogle()
      toast.success('Account created with Google.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-up failed.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const inputClass = 'input-dark w-full rounded-2xl px-4 py-3 text-sm transition'
  const errorClass = 'mt-1.5 text-xs text-red-400'

  return (
    <AuthShell
      title="Create your builder profile"
      subtitle="Join student founders sharing what they're building before anyone else sees it."
      footerText="Already part of the community?"
      footerLink="/login"
      footerLabel="Sign in →"
    >
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGoogleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-black" style={{ background: 'linear-gradient(135deg,#4285f4,#ea4335,#fbbc05,#34a853)', color: 'white' }}>G</span>
        )}
        {isGoogleLoading ? 'Connecting…' : 'Sign up with Google'}
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or</span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-white">Full name</label>
          <input
            id="name" name="name" type="text"
            value={formData.name} onChange={handleChange}
            className={inputClass} placeholder="Aarya Sharma"
            autoComplete="name"
          />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-white">Password</label>
            <input
              id="password" name="password" type="password"
              value={formData.password} onChange={handleChange}
              className={inputClass} placeholder="Min 6 chars"
              autoComplete="new-password"
            />
            {errors.password && <p className={errorClass}>{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-white">Confirm</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
              className={inputClass} placeholder="Repeat"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {isSubmitting ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
    </AuthShell>
  )
}
