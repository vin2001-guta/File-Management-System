import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './hooks/useStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DrivePage from './pages/DrivePage'
import LandingPage from './pages/LandingPage'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Landing page — shown to everyone, redirects logged-in users to drive */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/drive" replace /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/drive" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/drive" replace /> : <RegisterPage />} />
      <Route path="/drive/*" element={<PrivateRoute><DrivePage /></PrivateRoute>} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
