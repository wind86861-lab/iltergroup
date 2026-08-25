import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'
import MessagesPage from './pages/MessagesPage'
import StepsPage from './pages/StepsPage'
import PartnersPage from './pages/PartnersPage'
import FooterPage from './pages/FooterPage'
import BenefitsPage from './pages/BenefitsPage'
import SectionsPage from './pages/SectionsPage'
import AdminLayout from './components/AdminLayout'
import { isAuthenticated, logout, API_BASE } from '../lib/api'

function ProtectedRoute() {
  const [checked, setChecked] = useState(false)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      setChecked(true)
      setValid(false)
      return
    }
    // Validate token with server
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ilter_admin_token')}` }
    })
      .then(r => {
        if (!r.ok) {
          logout()
          setValid(false)
        } else {
          setValid(true)
        }
        setChecked(true)
      })
      .catch(() => {
        logout()
        setValid(false)
        setChecked(true)
      })
  }, [])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Проверка сессии...</p>
        </div>
      </div>
    )
  }

  return valid ? <Outlet /> : <Navigate to="/admin/login" replace />
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="steps" element={<StepsPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="footer" element={<FooterPage />} />
          <Route path="benefits" element={<BenefitsPage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
