import { Routes, Route } from 'react-router-dom'
import MainSite from './MainSite'
import AdminApp from './admin/AdminApp'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<MainSite />} />
    </Routes>
  )
}
