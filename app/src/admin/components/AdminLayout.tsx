import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, MessageSquare, Layers, ListOrdered, Users, PanelBottom, Award, Type,
  LogOut, ExternalLink, Menu, X, Bell,
} from 'lucide-react'
import logoWhite from '../../img/ilter-logo-white.png'
import { logout, fetchMessages } from '../../lib/api'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS, type Lang } from '../../i18n'

const LANG_LABEL: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', tr: 'TR' }

function useNav(t: (k: string) => string) {
  return [
    { to: '/admin', label: t('admin.sidebar.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: t('admin.sidebar.products'), icon: Package, end: false },
    { to: '/admin/categories', label: t('admin.sidebar.categories'), icon: Layers, end: false },
    { to: '/admin/orders', label: t('admin.sidebar.orders'), icon: ShoppingBag, end: false },
    { to: '/admin/steps', label: t('admin.sidebar.steps'), icon: ListOrdered, end: false },
    { to: '/admin/partners', label: t('admin.sidebar.partners'), icon: Users, end: false },
    { to: '/admin/footer', label: t('admin.sidebar.footer'), icon: PanelBottom, end: false },
    { to: '/admin/benefits', label: t('admin.sidebar.benefits'), icon: Award, end: false },
    { to: '/admin/sections', label: t('admin.sidebar.sections'), icon: Type, end: false },
    { to: '/admin/messages', label: t('admin.sidebar.messages'), icon: MessageSquare, end: false },
  ]
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const { t, i18n } = useTranslation()
  const NAV = useNav(t)

  useEffect(() => {
    let alive = true
    const tick = () => {
      if (document.hidden) return
      fetchMessages()
        .then(list => { if (alive) setUnread(list.filter(m => !m.isRead).length) })
        .catch(() => { /* unauthenticated or offline — ignore */ })
    }
    // Pages (Dashboard, Messages) fetch their own data on mount.
    // We only poll here for the sidebar badge so we don't duplicate requests.
    const id = window.setInterval(tick, 60_000)
    return () => { alive = false; window.clearInterval(id) }
  }, [])
  const activeLang = ((SUPPORTED_LANGS as readonly string[]).includes(i18n.language) ? i18n.language : 'ru') as Lang
  const changeLang = (l: Lang) => { i18n.changeLanguage(l); localStorage.setItem('lang', l) }

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }) }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`} style={{ background: '#0f172a' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <img src={logoWhite} alt="Ilter Group" className="h-6 w-auto flex-shrink-0" />
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,79,241,0.22)', color: '#7FA6FF' }}>
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all ${isActive
                ? 'text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? { background: 'rgba(0,79,241,0.18)', color: '#004FF1', borderLeft: '3px solid #004FF1', paddingLeft: '13px' } : {}}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            {label}
            {label === t('admin.sidebar.messages') && unread > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#004FF1' }}>
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/8 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          {t('admin.common.open_site')}
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t('admin.common.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 shadow-xl">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 z-50 shadow-2xl lg:hidden">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-5 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
          <button
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-visible">
              {SUPPORTED_LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex-shrink-0 ${activeLang === l
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {LANG_LABEL[l]}
                </button>
              ))}
            </div>
            <div className="relative">
              <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <Bell className="w-4.5 h-4.5 text-slate-600" />
              </button>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: '#004FF1' }}>
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold" style={{ background: '#004FF1' }}>
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold text-slate-700 leading-none">Admin</p>
                <p className="text-[11px] text-slate-400 mt-0.5">admin@iltergroup.uz</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
