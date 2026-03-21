import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './context/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import EntryViewPage from './pages/EntryViewPage'
import ProgressPage from './pages/ProgressPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return !token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="entry/new" element={<EditorPage />} />
        <Route path="entry/:id/edit" element={<EditorPage />} />
        <Route path="entry/:id" element={<EntryViewPage />} />
        <Route path="progress" element={<ProgressPage />} />
      </Route>
    </Routes>
  )
}