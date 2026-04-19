import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import PageSpinner from './components/PageSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const IdeaDetail = lazy(() => import('./pages/IdeaDetail'))
const PostIdea = lazy(() => import('./pages/PostIdea'))
const Profile = lazy(() => import('./pages/Profile'))
const CofounderMatch = lazy(() => import('./pages/CofounderMatch'))
const Messages = lazy(() => import('./pages/Messages'))
const Analytics = lazy(() => import('./pages/Analytics'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const renderLazyPage = (element) => (
    <Suspense fallback={<PageSpinner />}>{element}</Suspense>
  )

  return (
    <>
      <Routes>
        <Route path="/" element={renderLazyPage(<ProtectedRoute><Home /></ProtectedRoute>)} />
        <Route path="/login" element={renderLazyPage(<PublicOnlyRoute><Login /></PublicOnlyRoute>)} />
        <Route path="/signup" element={renderLazyPage(<PublicOnlyRoute><Signup /></PublicOnlyRoute>)} />
        <Route path="/idea/:id" element={renderLazyPage(<ProtectedRoute><IdeaDetail /></ProtectedRoute>)} />
        <Route path="/post" element={renderLazyPage(<ProtectedRoute><PostIdea /></ProtectedRoute>)} />
        <Route path="/profile/:uid" element={renderLazyPage(<ProtectedRoute><Profile /></ProtectedRoute>)} />
        <Route path="/match" element={renderLazyPage(<ProtectedRoute><CofounderMatch /></ProtectedRoute>)} />
        <Route path="/messages" element={renderLazyPage(<ProtectedRoute><Messages /></ProtectedRoute>)} />
        <Route path="/analytics/:id" element={renderLazyPage(<ProtectedRoute><Analytics /></ProtectedRoute>)} />
        <Route path="/404" element={renderLazyPage(<NotFound />)} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!rounded-2xl !bg-slate-950 !text-white !shadow-xl',
        }}
      />
    </>
  )
}

export default App
