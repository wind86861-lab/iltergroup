import { useEffect, useState } from 'react'
import { Info, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ImageSpec {
  /** i18n key of the always-visible recommendation */
  hintKey: string
  /** expected width:height, e.g. [4, 3]; omitted = any */
  ratio?: [number, number]
  /** above this the site gets slow */
  maxKb: number
  /** below this width the image looks blurry */
  minWidth: number
}

/** Recommended upload sizes, derived from how the public site renders each image. */
export const IMAGE_SPECS = {
  // Catalog card is a 4:3 object-cover box (~400 px wide, 2× on retina).
  product: { hintKey: 'admin.images.product_hint', ratio: [4, 3], maxKb: 300, minWidth: 800 },
  // Partner strip shows the logo in a 40×40 coloured tile.
  partner: { hintKey: 'admin.images.partner_hint', ratio: [1, 1], maxKb: 100, minWidth: 128 },
} satisfies Record<string, ImageSpec>

/**
 * Shows the recommended size for an upload and, once a file is picked,
 * its real dimensions/weight with warnings when it will look bad or load slowly.
 */
export default function ImageAdvice({ spec, file }: { spec: ImageSpec; file?: File | null }) {
  const { t } = useTranslation()
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    setDims(null)
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const kb = file ? Math.round(file.size / 1024) : 0
  const warnings: string[] = []
  if (file && kb > spec.maxKb) warnings.push(t('admin.images.warn_heavy', { max: spec.maxKb }))
  if (dims && dims.w < spec.minWidth) warnings.push(t('admin.images.warn_small', { min: spec.minWidth }))
  if (dims && spec.ratio) {
    const want = spec.ratio[0] / spec.ratio[1]
    if (Math.abs(dims.w / dims.h - want) / want > 0.08) {
      warnings.push(t('admin.images.warn_ratio', { ratio: `${spec.ratio[0]}:${spec.ratio[1]}` }))
    }
  }

  return (
    <div className="mt-2 space-y-1.5 text-[11.5px] leading-snug">
      <p className="flex gap-1.5 text-slate-500">
        <Info className="w-3.5 h-3.5 mt-px flex-shrink-0 text-blue-500" />
        <span>{t(spec.hintKey)}</span>
      </p>
      {file && dims && (
        <p className={`pl-5 font-medium ${warnings.length ? 'text-amber-700' : 'text-green-600'}`}>
          {t('admin.images.selected', { w: dims.w, h: dims.h, kb })}
          {!warnings.length && ' ✓'}
        </p>
      )}
      {warnings.map(w => (
        <p key={w} className="flex gap-1.5 text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-px flex-shrink-0" />
          <span>{w}</span>
        </p>
      ))}
    </div>
  )
}
