import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { Toaster } from './components/ui/Toast'
import { PageSpinner } from './components/ui/Spinner'

// Auth pages
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'

// App pages
import { Feed } from './pages/Feed'
import { Profile } from './pages/Profile'
import { Collection } from './pages/Collection'
import { Search } from './pages/Search'
import { Messages } from './pages/Messages'
import { StickerForm } from './pages/StickerForm'
import { StickerDetail } from './pages/StickerDetail'
import { NewPost } from './pages/NewPost'
import { NotFound } from './pages/NotFound'

function AuthGuard({ children }) {
  const { user } = useStore()
  if (user === undefined) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestGuard({ children }) {
  const { user } = useStore()
  if (user) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const { initDarkMode } = useStore()
  useAuth()

  useEffect(() => { initDarkMode() }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />
        <Route path="/" element={<Navigate to="/feed" replace />} />

        {/* Protected routes */}
        <Route path="/feed" element={<AuthGuard><Layout><Feed /></Layout></AuthGuard>} />
        <Route path="/search" element={<AuthGuard><Layout><Search /></Layout></AuthGuard>} />
        <Route path="/collection" element={<AuthGuard><Layout><Collection /></Layout></AuthGuard>} />
        <Route path="/messages" element={<AuthGuard><Layout><Messages /></Layout></AuthGuard>} />
        <Route path="/profile/:id" element={<AuthGuard><Layout><Profile /></Layout></AuthGuard>} />
        <Route path="/sticker/new" element={<AuthGuard><Layout><StickerForm /></Layout></AuthGuard>} />
        <Route path="/sticker/edit/:id" element={<AuthGuard><Layout><StickerForm /></Layout></AuthGuard>} />
        <Route path="/sticker/:id" element={<AuthGuard><Layout><StickerDetail /></Layout></AuthGuard>} />
        <Route path="/post/new" element={<AuthGuard><Layout><NewPost /></Layout></AuthGuard>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
