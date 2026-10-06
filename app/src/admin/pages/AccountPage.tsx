import { useState } from 'react'
import { KeyRound, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { changePassword } from '../../lib/api'

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400'

export default function AccountPage() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDone(false)
    if (next !== confirm) return setError(t('admin.account.mismatch'))
    setSaving(true)
    try {
      await changePassword(current, next)
      setDone(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <KeyRound className="w-6 h-6 text-blue-600" />
        {t('admin.account.title')}
      </h1>
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('admin.account.current')}</label>
          <input type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('admin.account.new')}</label>
          <input type="password" autoComplete="new-password" required minLength={10} value={next} onChange={e => setNext(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('admin.account.confirm')}</label>
          <input type="password" autoComplete="new-password" required minLength={10} value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> {t('admin.account.saved')}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: '#004FF1' }}
        >
          {t('admin.account.save')}
        </button>
      </form>
    </div>
  )
}
