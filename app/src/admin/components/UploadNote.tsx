import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ROWS = ['size', 'format', 'weight', 'tip'] as const

/** Always-visible note telling the admin exactly what file to upload. */
export default function UploadNote({ noteKey }: { noteKey: string }) {
  const { t, i18n } = useTranslation()
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-[12px] leading-snug">
      <p className="flex items-center gap-1.5 font-semibold text-blue-700 mb-1.5">
        <Info className="w-3.5 h-3.5" />
        {t('admin.images.note_title')}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-slate-600">
        {ROWS.filter(r => i18n.exists(`${noteKey}.${r}`)).map(r => (
          <div key={r} className="contents">
            <dt className="text-slate-400">{t(`admin.images.label_${r}`)}</dt>
            <dd className="font-medium text-slate-700">{t(`${noteKey}.${r}`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
