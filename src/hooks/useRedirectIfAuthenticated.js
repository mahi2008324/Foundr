import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function useRedirectIfAuthenticated() {
  const navigate = useNavigate()
  const { currentUser, loading } = useAuth()

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/', { replace: true })
    }
  }, [currentUser, loading, navigate])
}
