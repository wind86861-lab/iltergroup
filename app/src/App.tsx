import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainSite from './MainSite'

// Admin panel is loaded only when /admin is opened, keeping it out of the public bundle.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      <Route path="/*" element={<MainSite />} />
    </Routes>
  )
}
