import { useState, FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import logoWhite from '../../img/ilter-logo-white.png'
import { login, isAuthenticated } from '../../lib/api'
import { SUPPORTED_LANGS, type Lang } from '../../i18n'

const LOGIN_LANG_LABEL: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', tr: 'TR' }

export default function LoginPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('admin@iltergroup.uz')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const activeLang = ((SUPPORTED_LANGS as readonly string[]).includes(i18n.language) ? i18n.language : 'ru') as Lang
  const changeLang = (l: Lang) => { i18n.changeLanguage(l); localStorage.setItem('lang', l) }

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.login.error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0b1226 0%, #16224a 50%, #0a1f5c 100%)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #004FF1, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center relative" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <div className="absolute top-4 right-4 flex items-center gap-1 p-1 bg-white/10 rounded-lg">
              {SUPPORTED_LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all flex-shrink-0 ${activeLang === l ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'}`}
                >
                  {LOGIN_LANG_LABEL[l]}
                </button>
              ))}
            </div>
            <img src={logoWhite} alt="Ilter Group" className="h-9 w-auto mx-auto mb-5" />
            <h1 className="text-xl font-bold text-white">{t('admin.login.title')}</h1>
            <p className="text-sm text-white/50 mt-1">{t('admin.login.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': '#004FF1' } as React.CSSProperties}
                placeholder="admin@iltergroup.uz"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">{t('admin.login.password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-60"
              style={{ background: loading ? '#5B7BC4' : '#004FF1' }}
            >
              {loading ? t('admin.login.loading') : t('admin.login.submit')}
            </button>

            <p className="text-center text-[12px] text-slate-400 pt-2">
              {t('admin.login.default')}: <span className="text-slate-600 font-mono">admin@iltergroup.uz</span> / <span className="text-slate-600 font-mono">admin123</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
