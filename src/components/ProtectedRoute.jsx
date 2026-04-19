import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageSpinner from './PageSpinner'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <PageSpinner />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}
